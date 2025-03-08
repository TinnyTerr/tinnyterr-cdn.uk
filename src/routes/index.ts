import { Router } from "express";

import v1authRoutes from "./v1/authRoutes";
import v1fileRoutes from "./v1/fileRoutes";
import v1quoteRoutes from "./v1/quotesRoutes";
import v1textRoutes from "./v1/textRoutes";
import v1userRoutes from "./v1/userRoutes";

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

export default router;
