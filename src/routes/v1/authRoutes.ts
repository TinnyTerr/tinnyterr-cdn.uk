import { Router } from "express";
import { login } from "../../controllers/v1/authController";

const router = Router();

router.post("/login", login);

export default router;
