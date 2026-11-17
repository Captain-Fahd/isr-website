import { Router } from "express";
import {
  listFlagshipEvents,
  getFlagshipEventBySlug,
  createFlagshipEvent,
  updateFlagshipEvent,
  deleteFlagshipEvent,
  uploadFlagshipEventImage,
  listFlagshipEventsAdmin,
  saveFlagshipEventDraft,
  discardFlagshipEventDraft,
  publishFlagshipEventDraft,
} from "../controllers/flagshipEventsController";
import { checkAuth } from "../middleware/checkAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", listFlagshipEvents);
// Must come before "/:slug" so "admin" isn't read as a slug.
router.get("/admin", checkAuth, listFlagshipEventsAdmin);
router.get("/:slug", getFlagshipEventBySlug);
router.post("/upload-image", checkAuth, upload.single("image"), uploadFlagshipEventImage);
router.post("/", checkAuth, createFlagshipEvent);
router.put("/:id", checkAuth, updateFlagshipEvent);
router.delete("/:id", checkAuth, deleteFlagshipEvent);
router.put("/:id/draft", checkAuth, saveFlagshipEventDraft);
router.delete("/:id/draft", checkAuth, discardFlagshipEventDraft);
router.post("/:id/publish", checkAuth, publishFlagshipEventDraft);

export default router;
