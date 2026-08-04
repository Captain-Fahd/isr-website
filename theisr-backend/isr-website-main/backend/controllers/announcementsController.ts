import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  uploadAnnouncementImage,
  deleteAnnouncementImage,
} from "../lib/storage";

// GET /api/announcements  (public) — pinned first, then newest
export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return res.status(200).json({ data: announcements });
  } catch (err) {
    console.error("getAnnouncements failed:", err);
    return res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

// GET /api/announcements/:id  (public)
export const getAnnouncementById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid announcement id" });
  }

  try {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    return res.status(200).json({ data: announcement });
  } catch (err) {
    console.error("getAnnouncementById failed:", err);
    return res.status(500).json({ error: "Failed to fetch announcement" });
  }
};

// POST /api/announcements  (admin, multipart) — image optional
export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, body, pinned } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  try {
    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadAnnouncementImage(req.file);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        pinned: pinned === "true" || pinned === true,
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });
    return res.status(201).json({ data: announcement });
  } catch (err) {
    console.error("createAnnouncement failed:", err);
    return res.status(500).json({ error: "Failed to create announcement" });
  }
};

// PUT /api/announcements/:id  (admin, multipart) — all fields optional
export const updateAnnouncement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid announcement id" });
  }

  const { title, body, pinned } = req.body;

  try {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = await uploadAnnouncementImage(req.file);
      if (existing.imageUrl) {
        await deleteAnnouncementImage(existing.imageUrl);
      }
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(pinned !== undefined && { pinned: pinned === "true" || pinned === true }),
        imageUrl,
      },
    });
    return res.status(200).json({ data: announcement });
  } catch (err) {
    console.error("updateAnnouncement failed:", err);
    return res.status(500).json({ error: "Failed to update announcement" });
  }
};

// DELETE /api/announcements/:id  (admin)
export const deleteAnnouncement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid announcement id" });
  }

  try {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await prisma.announcement.delete({ where: { id } });
    if (existing.imageUrl) {
      await deleteAnnouncementImage(existing.imageUrl);
    }
    return res.status(200).json({ data: { id } });
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
    return res.status(500).json({ error: "Failed to delete announcement" });
  }
};
