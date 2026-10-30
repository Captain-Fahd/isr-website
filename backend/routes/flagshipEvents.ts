import { Router } from "express";
import {
  listFlagshipEvents,
  getFlagshipEventBySlug,
  createFlagshipEvent,
  updateFlagshipEvent,
  deleteFlagshipEvent,
  uploadFlagshipEventImage,
} from "../controllers/flagshipEventsController";
import { checkAuth } from "../middleware/checkAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", listFlagshipEvents);
router.get("/:slug", getFlagshipEventBySlug);
router.post("/upload-image", checkAuth, upload.single("image"), uploadFlagshipEventImage);
router.post("/", checkAuth, createFlagshipEvent);
router.put("/:id", checkAuth, updateFlagshipEvent);
router.delete("/:id", checkAuth, deleteFlagshipEvent);

export default router;
