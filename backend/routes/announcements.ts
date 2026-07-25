import { Router } from "express";
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementsController";
import { checkAuth } from "../middleware/checkAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);
router.post("/", checkAuth, upload.single("image"), createAnnouncement);
router.put("/:id", checkAuth, upload.single("image"), updateAnnouncement);
router.delete("/:id", checkAuth, deleteAnnouncement);

export default router;
