import express from "express";
import morgan from "morgan";
import { colorizer } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import userRoutes from "./routes/userRoutes";
import { quotes } from "./utils/quotes";
import { randomInt } from "node:crypto";

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
app.get("/quote", (_req, res) => {
	let quote: string | undefined = undefined;

	while (typeof quote === "undefined") {
		quote = quotes[randomInt(quotes.length)];
	}

	res.send(quote);
});

app.get("/quote/:id", (req, res) => {
	const quote = quotes[Number.parseInt(req.params.id)];

	if (quote === undefined) {
		res.status(404).send(`Quote ${req.params.id} does not exist`);
	}
});

export default app;
