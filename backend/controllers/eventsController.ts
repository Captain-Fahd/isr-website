import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadEventImage, deleteEventImage } from "../lib/storage";

// GET /api/events  (public)  — optional ?filter=upcoming|past
export const getEvents = async (req: Request, res: Response) => {
  const filter = req.query.filter;
  const now = new Date();

  const where =
    filter === "upcoming"
      ? { date: { gte: now } }
      : filter === "past"
        ? { date: { lt: now } }
        : undefined;

  try {
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: filter === "past" ? "desc" : "asc" },
    });

    // For the unfiltered list: upcoming events first (soonest at the top),
    // then past events counting back to the oldest.
    if (!where) {
      const upcoming = events.filter((e) => e.date >= now);
      const past = events
        .filter((e) => e.date < now)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      return res.status(200).json({ data: [...upcoming, ...past] });
    }

    return res.status(200).json({ data: events });
  } catch (err) {
    console.error("getEvents failed:", err);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
};

// GET /api/events/:id  (public)
export const getEventById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(200).json({ data: event });
  } catch (err) {
    console.error("getEventById failed:", err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
};

// POST /api/events  (admin, multipart) — image required
export const createEvent = async (req: Request, res: Response) => {
  const { name, date, description, ticketUrl } = req.body;

  if (!name || !date || !description || !ticketUrl) {
    return res
      .status(400)
      .json({ error: "name, date, description and ticketUrl are required" });
  }
  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "date must be a valid date" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "An image file is required" });
  }

  try {
    const imageUrl = await uploadEventImage(req.file);
    const event = await prisma.event.create({
      data: { name, date: new Date(date), description, ticketUrl, imageUrl },
    });
    return res.status(201).json({ data: event });
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

  const { name, date, description, ticketUrl } = req.body;
  if (date !== undefined && isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "date must be a valid date" });
  }

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
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
        ...(date !== undefined && { date: new Date(date) }),
        ...(description !== undefined && { description }),
        ...(ticketUrl !== undefined && { ticketUrl }),
        imageUrl,
      },
    });
    return res.status(200).json({ data: event });
  } catch (err) {
    console.error("updateEvent failed:", err);
    return res.status(500).json({ error: "Failed to update event" });
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
