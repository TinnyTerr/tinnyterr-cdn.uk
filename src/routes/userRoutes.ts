import { Router } from "express";
import { getUserUploads, getAllUploads } from "../controllers/userController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/me", authenticate, getUserUploads);
router.get("/", authenticate, getAllUploads);

export default router;
