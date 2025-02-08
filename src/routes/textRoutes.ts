import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/send", authenticate);
router.get("/get", authenticate);
router.delete("/clear", authenticate);

export default router;
