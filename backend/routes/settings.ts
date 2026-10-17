import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.get("/", getSettings);
router.put("/", checkAuth, updateSettings);

export default router;
