import { Router } from "express";
import authRoutes from "./authRoutes";

import fileRoutes from "./fileRoutes";
import userRoutes from "./userRoutes";
import quoteRoutes from "./quotesRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/users", userRoutes);
router.get("/quote", quoteRoutes);

export default router