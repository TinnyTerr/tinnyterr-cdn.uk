import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { colorizer } from "./utils/logger";
import apiRoutes from "./routes";
import { Errors, isAPIError } from "./utils/errors";

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

app.use("/api", apiRoutes)

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
	if (!isAPIError(err)) {
		res.status(500).send({
			data: err.message,
			code: Errors.GenericError
		})
		return
	}

	const { code, sanitaryOutput, httpCode } = err

	res.status(Number.parseInt(httpCode)).send({
		data: sanitaryOutput,
		code
	})
	return;

})

export default app;
