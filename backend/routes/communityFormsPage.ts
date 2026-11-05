import { Router } from "express";
import {
  getCommunityFormsPage,
  updateCommunityFormsPage,
} from "../controllers/communityFormsPageController";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.get("/", getCommunityFormsPage);
router.put("/", checkAuth, updateCommunityFormsPage);

export default router;
