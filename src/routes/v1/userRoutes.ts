import { Router } from "express";
import {
	getAllUploads,
	getUserUploads,
} from "../../controllers/v1/userController";
import { authenticate } from "../../middlewares/v1/authenticate";

const router = Router();

router.get("/me", authenticate, getUserUploads);
router.get("/", authenticate, getAllUploads);

export default router;
