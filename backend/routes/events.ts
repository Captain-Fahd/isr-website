import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  likeEvent,
  unlikeEvent,
} from "../controllers/eventsController";
import { checkAuth } from "../middleware/checkAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
// Likes are public — visitors are anonymous and identify themselves with a `clientId`.
router.post("/:id/like", likeEvent);
router.delete("/:id/like", unlikeEvent);
router.post("/", checkAuth, upload.single("image"), createEvent);
router.put("/:id", checkAuth, upload.single("image"), updateEvent);
router.delete("/:id", checkAuth, deleteEvent);

export default router;
