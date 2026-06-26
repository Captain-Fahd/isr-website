import { Router } from "express";
import { signIn } from "../controllers/authController";

const router = Router();

router.post('/signin', signIn);

export default router;