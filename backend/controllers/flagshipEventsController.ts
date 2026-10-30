import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  uploadFlagshipImage as uploadFlagshipImageFile,
  deleteFlagshipImages,
  collectFlagshipImageUrls,
} from "../lib/storage";

const PHASES = ["save-the-date", "booking"];

const REQUIRED_FIELDS = [
  "slug",
  "name",
  "tagline",
  "description",
  "phase",
  "start",
  "end",
  "dateLabel",
  "timeLabel",
  "venue",
  "banner",
  "ogImage",
  "theme",
] as const;

function missingRequiredField(body: Record<string, unknown>): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return field;
    }
  }
  return null;
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

// GET /api/flagship-events  (public) — every row, released or not; the frontend
// decides what to show live (see FlagshipReleaseGate / useFlagshipEvents).
export const listFlagshipEvents = async (_req: Request, res: Response) => {
  try {
    const events = await prisma.flagshipEvent.findMany({ orderBy: { start: "asc" } });
    return res.status(200).json({ data: events });
  } catch (err) {
    console.error("listFlagshipEvents failed:", err);
    return res.status(500).json({ error: "Failed to fetch flagship events" });
  }
};

// GET /api/flagship-events/:slug  (public)
export const getFlagshipEventBySlug = async (req: Request, res: Response) => {
  try {
    const event = await prisma.flagshipEvent.findUnique({
      where: { slug: String(req.params.slug) },
    });
    if (!event) {
      return res.status(404).json({ error: "Flagship event not found" });
    }
    return res.status(200).json({ data: event });
  } catch (err) {
    console.error("getFlagshipEventBySlug failed:", err);
    return res.status(500).json({ error: "Failed to fetch flagship event" });
  }
};

// POST /api/flagship-events  (admin, JSON)
export const createFlagshipEvent = async (req: Request, res: Response) => {
  const body = req.body ?? {};

  const missing = missingRequiredField(body);
  if (missing) {
    return res.status(400).json({ error: `${missing} is required` });
  }
  if (!PHASES.includes(body.phase)) {
    return res.status(400).json({ error: `phase must be one of: ${PHASES.join(", ")}` });
  }

  try {
    const event = await prisma.flagshipEvent.create({
      data: {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        phase: body.phase,
        featuredOnHome: Boolean(body.featuredOnHome),
        released: Boolean(body.released),
        ticketUrl: body.ticketUrl ?? "",
        ticketEventId: body.ticketEventId ?? "",
        ticketsOnSale: Boolean(body.ticketsOnSale),
        start: new Date(body.start),
        end: new Date(body.end),
        dateLabel: body.dateLabel,
        timeLabel: body.timeLabel,
        venue: body.venue,
        banner: body.banner,
        ogImage: body.ogImage,
        theme: body.theme,
        highlights: body.highlights ?? [],
        speakers: body.speakers ?? [],
        speakerPlaceholderCount: body.speakerPlaceholderCount ?? 0,
        programme: body.programme ?? [],
        faqs: body.faqs ?? [],
      },
    });
    return res.status(201).json({ data: event });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(400).json({ error: "A flagship event with that slug already exists" });
    }
    console.error("createFlagshipEvent failed:", err);
    return res.status(500).json({ error: "Failed to create flagship event" });
  }
};

// PUT /api/flagship-events/:id  (admin, JSON) — all fields optional
export const updateFlagshipEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid flagship event id" });
  }

  const body = req.body ?? {};
  if (body.phase !== undefined && !PHASES.includes(body.phase)) {
    return res.status(400).json({ error: `phase must be one of: ${PHASES.join(", ")}` });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }

    const event = await prisma.flagshipEvent.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.phase !== undefined && { phase: body.phase }),
        ...(body.featuredOnHome !== undefined && { featuredOnHome: Boolean(body.featuredOnHome) }),
        ...(body.released !== undefined && { released: Boolean(body.released) }),
        ...(body.ticketUrl !== undefined && { ticketUrl: body.ticketUrl }),
        ...(body.ticketEventId !== undefined && { ticketEventId: body.ticketEventId }),
        ...(body.ticketsOnSale !== undefined && { ticketsOnSale: Boolean(body.ticketsOnSale) }),
        ...(body.start !== undefined && { start: new Date(body.start) }),
        ...(body.end !== undefined && { end: new Date(body.end) }),
        ...(body.dateLabel !== undefined && { dateLabel: body.dateLabel }),
        ...(body.timeLabel !== undefined && { timeLabel: body.timeLabel }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.banner !== undefined && { banner: body.banner }),
        ...(body.ogImage !== undefined && { ogImage: body.ogImage }),
        ...(body.theme !== undefined && { theme: body.theme }),
        ...(body.highlights !== undefined && { highlights: body.highlights }),
        ...(body.speakers !== undefined && { speakers: body.speakers }),
        ...(body.speakerPlaceholderCount !== undefined && {
          speakerPlaceholderCount: body.speakerPlaceholderCount,
        }),
        ...(body.programme !== undefined && { programme: body.programme }),
        ...(body.faqs !== undefined && { faqs: body.faqs }),
      },
    });

    // The admin form uploads each image independently before submitting the rest of
    // the form, so by the time we get here any image slot that changed already points
    // at a new URL — anything referenced by `existing` but not by the saved `event` is
    // an orphaned upload that can be cleaned up now.
    const previousUrls = new Set(collectFlagshipImageUrls(existing));
    const nextUrls = new Set(collectFlagshipImageUrls(event));
    const orphaned = [...previousUrls].filter((url) => !nextUrls.has(url));
    if (orphaned.length > 0) {
      await deleteFlagshipImages(orphaned);
    }

    return res.status(200).json({ data: event });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(400).json({ error: "A flagship event with that slug already exists" });
    }
    console.error("updateFlagshipEvent failed:", err);
    return res.status(500).json({ error: "Failed to update flagship event" });
  }
};

// DELETE /api/flagship-events/:id  (admin)
export const deleteFlagshipEvent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid flagship event id" });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }

    await prisma.flagshipEvent.delete({ where: { id } });
    await deleteFlagshipImages(collectFlagshipImageUrls(existing));
    return res.status(200).json({ data: { id } });
  } catch (err) {
    console.error("deleteFlagshipEvent failed:", err);
    return res.status(500).json({ error: "Failed to delete flagship event" });
  }
};

// POST /api/flagship-events/upload-image  (admin, multipart) — image required
export const uploadFlagshipEventImage = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "An image file is required" });
  }

  try {
    const url = await uploadFlagshipImageFile(req.file);
    return res.status(201).json({ data: { url } });
  } catch (err) {
    console.error("uploadFlagshipEventImage failed:", err);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};
