import { Router } from "express";
import { id, root } from "../controllers/quoteController";

const router = Router();

router.get("/", root);
router.get("/:id", id);

export default router;