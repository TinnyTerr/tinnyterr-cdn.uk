import { Router } from "express";
import authRoutes from "./authRoutes";

import fileRoutes from "./fileRoutes";
import quoteRoutes from "./quotesRoutes";
import textRoutes from "./textRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth/", authRoutes);
router.use("/files/", fileRoutes);
router.use("/users/", userRoutes);
router.use("/quotes/", quoteRoutes);
router.use("/text/", textRoutes);

export default router;
