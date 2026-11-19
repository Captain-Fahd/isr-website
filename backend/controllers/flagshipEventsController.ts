import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  uploadFlagshipImage as uploadFlagshipImageFile,
  deleteFlagshipImages,
  collectFlagshipImageUrls,
} from "../lib/storage";

const PHASES = ["save-the-date", "booking"];
const SPEAKER_LAYOUTS = ["rows", "carousel"];

// The page sections an admin can reorder; the hero stays first and booking last.
const SECTIONS = ["about", "speakers", "programme", "venue", "faqs"];
// The blocks inside the about section, which can be reordered too.
const ABOUT_BLOCKS = ["description", "highlights"];

// An order must list every id exactly once.
function isPermutationOf(ids: string[], value: unknown): boolean {
  return Array.isArray(value) && value.length === ids.length && ids.every((id) => value.includes(id));
}

// Validates the fields with a fixed set of values; returns an error message or null.
function invalidFieldError(body: Record<string, unknown>, partial: boolean): string | null {
  if ((!partial || body.phase !== undefined) && !PHASES.includes(body.phase as string)) {
    return `phase must be one of: ${PHASES.join(", ")}`;
  }
  if (body.speakerLayout !== undefined && !SPEAKER_LAYOUTS.includes(body.speakerLayout as string)) {
    return `speakerLayout must be one of: ${SPEAKER_LAYOUTS.join(", ")}`;
  }
  if (body.sectionOrder !== undefined && !isPermutationOf(SECTIONS, body.sectionOrder)) {
    return `sectionOrder must list each of: ${SECTIONS.join(", ")}`;
  }
  if (body.aboutOrder !== undefined && !isPermutationOf(ABOUT_BLOCKS, body.aboutOrder)) {
    return `aboutOrder must list each of: ${ABOUT_BLOCKS.join(", ")}`;
  }
  return null;
}

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

// Every field an admin can edit — the shape stored in `draft` and the only keys
// `buildUpdateData` reads.
const EDITABLE_FIELDS = [
  "slug",
  "name",
  "tagline",
  "description",
  "phase",
  "featuredOnHome",
  "released",
  "ticketUrl",
  "ticketEventId",
  "ticketsOnSale",
  "priceLabel",
  "start",
  "end",
  "dateLabel",
  "timeLabel",
  "venue",
  "banner",
  "ogImage",
  "theme",
  "highlights",
  "showSpeakers",
  "speakers",
  "speakerLayout",
  "speakerPlaceholderCount",
  "programme",
  "faqs",
  "sectionOrder",
  "aboutOrder",
] as const;

// Public reads never expose unpublished drafts.
const PUBLIC_OMIT = { draft: true } as const;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickEditable(body: Record<string, unknown>): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) picked[field] = body[field];
  }
  return picked;
}

// Maps a (partial) payload onto Prisma update data — only the keys present are set.
function buildUpdateData(body: Record<string, unknown>): Prisma.FlagshipEventUpdateInput {
  const json = (value: unknown) => value as Prisma.InputJsonValue;
  return {
    ...(body.slug !== undefined && { slug: String(body.slug) }),
    ...(body.name !== undefined && { name: String(body.name) }),
    ...(body.tagline !== undefined && { tagline: String(body.tagline) }),
    ...(body.description !== undefined && { description: String(body.description) }),
    ...(body.phase !== undefined && { phase: String(body.phase) }),
    ...(body.featuredOnHome !== undefined && { featuredOnHome: Boolean(body.featuredOnHome) }),
    ...(body.released !== undefined && { released: Boolean(body.released) }),
    ...(body.ticketUrl !== undefined && { ticketUrl: String(body.ticketUrl) }),
    ...(body.ticketEventId !== undefined && { ticketEventId: String(body.ticketEventId) }),
    ...(body.ticketsOnSale !== undefined && { ticketsOnSale: Boolean(body.ticketsOnSale) }),
    ...(body.priceLabel !== undefined && { priceLabel: String(body.priceLabel) }),
    ...(body.start !== undefined && { start: new Date(body.start as string) }),
    ...(body.end !== undefined && { end: new Date(body.end as string) }),
    ...(body.dateLabel !== undefined && { dateLabel: String(body.dateLabel) }),
    ...(body.timeLabel !== undefined && { timeLabel: String(body.timeLabel) }),
    ...(body.venue !== undefined && { venue: json(body.venue) }),
    ...(body.banner !== undefined && { banner: json(body.banner) }),
    ...(body.ogImage !== undefined && { ogImage: String(body.ogImage) }),
    ...(body.theme !== undefined && { theme: json(body.theme) }),
    ...(body.highlights !== undefined && { highlights: json(body.highlights) }),
    ...(body.showSpeakers !== undefined && { showSpeakers: Boolean(body.showSpeakers) }),
    ...(body.speakers !== undefined && { speakers: json(body.speakers) }),
    ...(body.speakerLayout !== undefined && { speakerLayout: String(body.speakerLayout) }),
    ...(body.speakerPlaceholderCount !== undefined && {
      speakerPlaceholderCount: Number(body.speakerPlaceholderCount),
    }),
    ...(body.programme !== undefined && { programme: json(body.programme) }),
    ...(body.faqs !== undefined && { faqs: json(body.faqs) }),
    ...(body.sectionOrder !== undefined && { sectionOrder: json(body.sectionOrder) }),
    ...(body.aboutOrder !== undefined && { aboutOrder: json(body.aboutOrder) }),
  };
}

// Image URLs referenced by an event row, including any pending draft.
type ImageFields = Parameters<typeof collectFlagshipImageUrls>[0];

function referencedImageUrls(event: object): Set<string> {
  const urls = collectFlagshipImageUrls(event as ImageFields);
  const draft = (event as { draft?: unknown }).draft;
  if (draft) urls.push(...collectFlagshipImageUrls(asRecord(draft) as ImageFields));
  return new Set(urls);
}

// Deletes uploads referenced by `before` (live or draft) but not by `after`.
async function cleanUpOrphanedImages(before: object, after: object): Promise<void> {
  const next = referencedImageUrls(after);
  const orphaned = [...referencedImageUrls(before)].filter((url) => !next.has(url));
  if (orphaned.length > 0) {
    await deleteFlagshipImages(orphaned);
  }
}

function parseId(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

// GET /api/flagship-events  (public) — every row, released or not; the frontend
// decides what to show live (see FlagshipReleaseGate / useFlagshipEvents).
export const listFlagshipEvents = async (_req: Request, res: Response) => {
  try {
    const events = await prisma.flagshipEvent.findMany({
      orderBy: { start: "asc" },
      omit: PUBLIC_OMIT,
    });
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
      omit: PUBLIC_OMIT,
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
  const invalid = invalidFieldError(body, false);
  if (invalid) {
    return res.status(400).json({ error: invalid });
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
        priceLabel: body.priceLabel ?? "",
        start: new Date(body.start),
        end: new Date(body.end),
        dateLabel: body.dateLabel,
        timeLabel: body.timeLabel,
        venue: body.venue,
        banner: body.banner,
        ogImage: body.ogImage,
        theme: body.theme,
        highlights: body.highlights ?? [],
        showSpeakers: Boolean(body.showSpeakers),
        speakers: body.speakers ?? [],
        speakerLayout: body.speakerLayout ?? "rows",
        speakerPlaceholderCount: body.speakerPlaceholderCount ?? 0,
        programme: body.programme ?? [],
        faqs: body.faqs ?? [],
        sectionOrder: body.sectionOrder ?? SECTIONS,
        aboutOrder: body.aboutOrder ?? ABOUT_BLOCKS,
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
  const invalid = invalidFieldError(body, true);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }

    // Saving straight to live supersedes any pending draft.
    const event = await prisma.flagshipEvent.update({
      where: { id },
      data: { ...buildUpdateData(body), draft: Prisma.DbNull },
    });

    // The admin form uploads each image independently before submitting the rest of
    // the form, so by the time we get here any image slot that changed already points
    // at a new URL — anything referenced by `existing` (live or its draft) but not by
    // the saved `event` is an orphaned upload that can be cleaned up now.
    await cleanUpOrphanedImages(existing, event);

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
    await deleteFlagshipImages([...referencedImageUrls(existing)]);
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

// GET /api/flagship-events/admin  (admin) — every row including its pending draft.
export const listFlagshipEventsAdmin = async (_req: Request, res: Response) => {
  try {
    const events = await prisma.flagshipEvent.findMany({ orderBy: { start: "asc" } });
    return res.status(200).json({ data: events });
  } catch (err) {
    console.error("listFlagshipEventsAdmin failed:", err);
    return res.status(500).json({ error: "Failed to fetch flagship events" });
  }
};

// PUT /api/flagship-events/:id/draft  (admin, JSON) — saves the full form as a draft
// for preview; the live event is untouched until it's published.
export const saveFlagshipEventDraft = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid flagship event id" });
  }

  const body = req.body ?? {};
  const missing = missingRequiredField(body);
  if (missing) {
    return res.status(400).json({ error: `${missing} is required` });
  }
  const invalid = invalidFieldError(body, false);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }

    // Catch a slug clash now rather than at publish time.
    if (body.slug !== existing.slug) {
      const clash = await prisma.flagshipEvent.findUnique({ where: { slug: String(body.slug) } });
      if (clash) {
        return res.status(400).json({ error: "A flagship event with that slug already exists" });
      }
    }

    const draft = pickEditable(body) as Prisma.InputJsonValue;
    const event = await prisma.flagshipEvent.update({ where: { id }, data: { draft } });

    // Images uploaded for a previous draft and since replaced are no longer needed.
    await cleanUpOrphanedImages(existing, event);

    return res.status(200).json({ data: event });
  } catch (err) {
    console.error("saveFlagshipEventDraft failed:", err);
    return res.status(500).json({ error: "Failed to save draft" });
  }
};

// DELETE /api/flagship-events/:id/draft  (admin) — throws the pending draft away.
export const discardFlagshipEventDraft = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid flagship event id" });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }

    const event = await prisma.flagshipEvent.update({
      where: { id },
      data: { draft: Prisma.DbNull },
    });
    await cleanUpOrphanedImages(existing, event);

    return res.status(200).json({ data: event });
  } catch (err) {
    console.error("discardFlagshipEventDraft failed:", err);
    return res.status(500).json({ error: "Failed to discard draft" });
  }
};

// POST /api/flagship-events/:id/publish  (admin) — makes the pending draft live.
export const publishFlagshipEventDraft = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid flagship event id" });
  }

  try {
    const existing = await prisma.flagshipEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flagship event not found" });
    }
    if (!existing.draft) {
      return res.status(400).json({ error: "There are no draft changes to publish" });
    }

    const event = await prisma.flagshipEvent.update({
      where: { id },
      data: { ...buildUpdateData(asRecord(existing.draft)), draft: Prisma.DbNull },
    });
    await cleanUpOrphanedImages(existing, event);

    return res.status(200).json({ data: event });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(400).json({ error: "A flagship event with that slug already exists" });
    }
    console.error("publishFlagshipEventDraft failed:", err);
    return res.status(500).json({ error: "Failed to publish draft" });
  }
};
