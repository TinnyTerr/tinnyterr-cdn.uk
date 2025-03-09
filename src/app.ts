import path from "node:path";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import apiRoutes from "./api/routes";
import { Errors, isAPIError } from "./api/common/utils/errors";
import { colorizer } from "./api/common/utils/logger";

const app = express();

// Middleware setup
app.use(morgan(colorizer));
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
	// CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*"); // or specify a domain
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	// Security headers
	res.setHeader(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains",
	);
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");

	// Handle preflight OPTIONS request
	if (req.method === "OPTIONS") {
		res.sendStatus(200); // Respond with 200 OK for OPTIONS requests
	} else {
		next();
	}
});

app.use("/api", apiRoutes);
app.all("/*", express.static(path.join(__dirname, "../public")));

// @ts-ignore
app.use((err, _req: Request, res: Response, _next: NextFunction) => {
	if (!isAPIError(err)) {
		res.status(500).send({
			data: err.message,
			code: Errors.GenericError,
		});
		return;
	}

	const { code, sanitaryOutput, httpCode } = err;

	res.status(httpCode ?? 500).send({
		data: sanitaryOutput,
		code,
	});
	return;
});

export default app;
