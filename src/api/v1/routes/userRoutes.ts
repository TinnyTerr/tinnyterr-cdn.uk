import { Router } from "express";
import { getAllUploads, getUserUploads } from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/me", authenticate, getUserUploads);
router.get("/", authenticate, getAllUploads);

export default router;
