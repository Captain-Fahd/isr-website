import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadEventImage, deleteEventImage } from "../lib/storage";
import { parseSchedule, withSchedule } from "../lib/recurrence";

function normalizeTicketUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

// Likes come back from Prisma as an aggregate (`_count`) plus, when the caller identified
// itself, the caller's own like row. Both are flattened into scalars for the client.
function serializeEvent(event: any) {
  const { _count, likes, ...rest } = event;
  return {
    ...rest,
    likeCount: _count?.likes ?? 0,
    ...(likes !== undefined && { likedByMe: likes.length > 0 }),
  };
}

// Visitors are anonymous, so the browser supplies its own persistent random id. Accepted in
// the body or the query string, since a DELETE body is awkward for some clients.
function readClientId(req: Request): string | null {
  const raw = req.body?.clientId ?? req.query?.clientId;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

// Ask for the like count, and for the caller's own like only when they identified themselves.
function likeSelection(clientId: string | null) {
  return {
    _count: { select: { likes: true } },
    ...(clientId && { likes: { where: { clientId }, select: { id: true } } }),
  };
}

// GET /api/events  (public)  — optional ?filter=upcoming|past, optional ?clientId
export const getEvents = async (req: Request, res: Response) => {
  const filter = req.query.filter;
  const clientId = readClientId(req);
  const now = new Date();

  try {
    // Multi-day and recurring events cannot be split by `date` alone — an event that
    // started yesterday may still be running, and a recurring one may be due again — so
    // the split is done on the next occurrence instead of in the query.
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: likeSelection(clientId),
    });
    const scheduled = events.map((e) => withSchedule(e, now));

    // Soonest occurrence first for anything still to come.
    const upcoming = scheduled
      .filter((e) => e.nextOccurrence !== null)
      .sort(
        (a, b) => a.nextOccurrence!.start.getTime() - b.nextOccurrence!.start.getTime(),
      );
    // Most recently finished first for anything that is over.
    const past = scheduled
      .filter((e) => e.nextOccurrence === null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (filter === "upcoming") {
      return res.status(200).json({ data: upcoming.map(serializeEvent) });
    }
    if (filter === "past") {
      return res.status(200).json({ data: past.map(serializeEvent) });
    }
    return res
      .status(200)
      .json({ data: [...upcoming, ...past].map(serializeEvent) });
  } catch (err) {
    console.error("getEvents failed:", err);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
};

// GET /api/events/:id  (public)  — optional ?clientId
export const getEventById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: likeSelection(readClientId(req)),
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(200).json({ data: serializeEvent(withSchedule(event)) });
  } catch (err) {
    console.error("getEventById failed:", err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
};

// POST /api/events  (admin, multipart) — image required
export const createEvent = async (req: Request, res: Response) => {
  const {
    name,
    date,
    description,
    ticketUrl,
    endDate,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceEndDate,
  } = req.body;

  if (!name || !date || !description) {
    return res
      .status(400)
      .json({ error: "name, date and description are required" });
  }

  const schedule = parseSchedule({
    date,
    endDate,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceEndDate,
  });
  if (!schedule.ok) {
    return res.status(400).json({ error: schedule.error });
  }
  if (!req.file) {
    return res.status(400).json({ error: "An image file is required" });
  }

  try {
    const imageUrl = await uploadEventImage(req.file);
    const event = await prisma.event.create({
      data: {
        name,
        description,
        ticketUrl: normalizeTicketUrl(ticketUrl),
        imageUrl,
        date: schedule.values.date!,
        endDate: schedule.values.endDate ?? null,
        recurrenceFrequency: schedule.values.recurrenceFrequency ?? null,
        recurrenceInterval: schedule.values.recurrenceInterval ?? null,
        recurrenceEndDate: schedule.values.recurrenceEndDate ?? null,
      },
    });
    // A brand new event has no likes, so serializing is enough to get `likeCount: 0`.
    return res.status(201).json({ data: serializeEvent(withSchedule(event)) });
  } catch (err) {
    console.error("createEvent failed:", err);
    return res.status(500).json({ error: "Failed to create event" });
  }
};

// PUT /api/events/:id  (admin, multipart) — image optional
export const updateEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const {
    name,
    date,
    description,
    ticketUrl,
    endDate,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceEndDate,
  } = req.body;
  // Cheap format check up front so an obviously bad date never costs a db round trip;
  // the cross-field rules need the stored event, so they run after the fetch below.
  if (date !== undefined && isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "date must be a valid date" });
  }

  const scheduleInput = {
    ...(date !== undefined && { date }),
    ...(endDate !== undefined && { endDate }),
    ...(recurrenceFrequency !== undefined && { recurrenceFrequency }),
    ...(recurrenceInterval !== undefined && { recurrenceInterval }),
    ...(recurrenceEndDate !== undefined && { recurrenceEndDate }),
  };

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    const schedule = parseSchedule(scheduleInput, existing);
    if (!schedule.ok) {
      return res.status(400).json({ error: schedule.error });
    }

    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = await uploadEventImage(req.file);
      await deleteEventImage(existing.imageUrl);
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(ticketUrl !== undefined && {
          ticketUrl: normalizeTicketUrl(ticketUrl),
        }),
        ...schedule.values,
        imageUrl,
      },
      include: { _count: { select: { likes: true } } },
    });
    return res.status(200).json({ data: serializeEvent(withSchedule(event)) });
  } catch (err) {
    console.error("updateEvent failed:", err);
    return res.status(500).json({ error: "Failed to update event" });
  }
};

// POST /api/events/:id/like  (public) — body/query: { clientId }
export const likeEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const clientId = readClientId(req);
  if (!clientId) {
    return res.status(400).json({ error: "clientId is required" });
  }

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Liking twice is a no-op rather than an error, so a retried request is harmless.
    await prisma.eventLike.upsert({
      where: { eventId_clientId: { eventId: id, clientId } },
      create: { eventId: id, clientId },
      update: {},
    });

    const likeCount = await prisma.eventLike.count({ where: { eventId: id } });
    return res.status(200).json({ data: { id, likeCount, likedByMe: true } });
  } catch (err) {
    console.error("likeEvent failed:", err);
    return res.status(500).json({ error: "Failed to like event" });
  }
};

// DELETE /api/events/:id/like  (public) — body/query: { clientId }
export const unlikeEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const clientId = readClientId(req);
  if (!clientId) {
    return res.status(400).json({ error: "clientId is required" });
  }

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    // deleteMany so removing a like that was never there succeeds quietly.
    await prisma.eventLike.deleteMany({ where: { eventId: id, clientId } });

    const likeCount = await prisma.eventLike.count({ where: { eventId: id } });
    return res.status(200).json({ data: { id, likeCount, likedByMe: false } });
  } catch (err) {
    console.error("unlikeEvent failed:", err);
    return res.status(500).json({ error: "Failed to unlike event" });
  }
};

// DELETE /api/events/:id  (admin)
export const deleteEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    await prisma.event.delete({ where: { id } });
    await deleteEventImage(existing.imageUrl);
    return res.status(200).json({ data: { id } });
  } catch (err) {
    console.error("deleteEvent failed:", err);
    return res.status(500).json({ error: "Failed to delete event" });
  }
};
