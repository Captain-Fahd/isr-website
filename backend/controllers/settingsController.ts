import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const SETTINGS_ID = 1;

// Defaults served before an admin has ever saved settings.
const DEFAULT_SETTINGS = { flagshipReleased: false };

function toPublic(settings: { flagshipReleased: boolean; updatedAt: Date | null }) {
  return { flagshipReleased: settings.flagshipReleased, updatedAt: settings.updatedAt };
}

// GET /api/settings  (public)
export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return res
      .status(200)
      .json({ data: toPublic(settings ?? { ...DEFAULT_SETTINGS, updatedAt: null }) });
  } catch (err) {
    console.error("getSettings failed:", err);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// PUT /api/settings  (admin, JSON)
export const updateSettings = async (req: Request, res: Response) => {
  const { flagshipReleased } = req.body ?? {};

  if (typeof flagshipReleased !== "boolean") {
    return res.status(400).json({ error: "flagshipReleased must be a boolean" });
  }

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, flagshipReleased },
      update: { flagshipReleased },
    });
    return res.status(200).json({ data: toPublic(settings) });
  } catch (err) {
    console.error("updateSettings failed:", err);
    return res.status(500).json({ error: "Failed to update settings" });
  }
};
