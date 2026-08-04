import { Router } from "express";
import { signIn, getMe } from "../controllers/authController";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.post("/signin", signIn);
router.get("/me", checkAuth, getMe);

export default router;
