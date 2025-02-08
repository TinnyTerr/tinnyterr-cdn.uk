import express from "express";
import morgan from "morgan";
import { colorizer } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

// Middleware setup
app.use(morgan(colorizer));
app.use(express.json());

app.use((req, res, next) => {
	if (req.path.includes("wp") || req.path.includes("wordpress")) {
		res.status(405).send("fuck off cunts");
	}
	next();
});

// Route setup
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/users", userRoutes);

export default app;
