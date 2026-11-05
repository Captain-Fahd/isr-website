import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const DEFAULTS = { id: 1, enabled: false, title: "Get in Touch", intro: "", buttons: [] };

// GET /api/community-forms-page  (public) — the row is seeded by migration, but
// upsert here too so a deleted row self-heals instead of 500ing.
export const getCommunityFormsPage = async (_req: Request, res: Response) => {
  try {
    const page = await prisma.communityFormsPage.upsert({
      where: { id: 1 },
      update: {},
      create: DEFAULTS,
    });
    return res.status(200).json({ data: page });
  } catch (err) {
    console.error("getCommunityFormsPage failed:", err);
    return res.status(500).json({ error: "Failed to fetch community forms page" });
  }
};

function isValidButtons(value: unknown): value is { label: string; url: string }[] {
  return (
    Array.isArray(value) &&
    value.every(
      (b) =>
        b &&
        typeof b === "object" &&
        typeof (b as Record<string, unknown>).label === "string" &&
        typeof (b as Record<string, unknown>).url === "string",
    )
  );
}

// PUT /api/community-forms-page  (admin, JSON) — all fields optional
export const updateCommunityFormsPage = async (req: Request, res: Response) => {
  const body = req.body ?? {};

  if (body.buttons !== undefined && !isValidButtons(body.buttons)) {
    return res.status(400).json({ error: "buttons must be an array of { label, url }" });
  }

  try {
    const page = await prisma.communityFormsPage.upsert({
      where: { id: 1 },
      update: {
        ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.intro !== undefined && { intro: body.intro }),
        ...(body.buttons !== undefined && { buttons: body.buttons }),
      },
      create: {
        ...DEFAULTS,
        ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.intro !== undefined && { intro: body.intro }),
        ...(body.buttons !== undefined && { buttons: body.buttons }),
      },
    });
    return res.status(200).json({ data: page });
  } catch (err) {
    console.error("updateCommunityFormsPage failed:", err);
    return res.status(500).json({ error: "Failed to update community forms page" });
  }
};
