/**
 * For information, this file is to manage all the
 * different routes, per api. The routes.ts within
 * the root (src), is to manage the entire server,
 * including frontend and cdn
 */

import { Router } from "express";

import v1authRoutes from "./v1/routes/authRoutes";
import v1fileRoutes from "./v1/routes/fileRoutes";
import v1quoteRoutes from "./v1/routes/quotesRoutes";
import v1textRoutes from "./v1/routes/textRoutes";
import v1userRoutes from "./v1/routes/userRoutes";

import v2authRoutes from "@v2/routes/auth";
import v2fileRoutes from "@v2/routes/files";
import v2userRoutes from "@v2/routes/user";

const router = Router();

router.all("/", (_req, res) => {
	res.sendStatus(204);
});

router.all("/v1", (_req, res) => {
	res.sendStatus(204);
});

// Set whatever version to default here
router.use("/auth", v1authRoutes);
router.use("/files", v1fileRoutes);
router.use("/users", v1userRoutes);
router.use("/quotes", v1quoteRoutes);
router.use("/text", v1textRoutes);

router.use("/v1/auth", v1authRoutes);
router.use("/v1/files", v1fileRoutes);
router.use("/v1/users", v1userRoutes);
router.use("/v1/quotes", v1quoteRoutes);
router.use("/v1/text", v1textRoutes);

router.use("/v2/auth", v2authRoutes);
router.use("/v2/files", v2fileRoutes);
router.use("/v2/users", v2userRoutes);

export default router;
