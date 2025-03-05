import { randomInt } from "node:crypto";
import { type Request, type Response, Router } from "express";
import { APIError, Errors, ErrorsHttpResponse } from "../utils/errors";
import { quotes } from "../utils/quotes";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
	// Ensure there are quotes available
	if (quotes.length === 0) {
		throw new APIError(Errors.ServiceUnavailable, ErrorsHttpResponse.ServiceUnavailable, null, "No quotes found");
	}

	// Get a random quote using randomInt
	const randomIndex = randomInt(quotes.length);
	const quote = quotes[randomIndex];

	res.send(quote);
});

router.get("/*", (_req: Request, res: Response) => {
	// Ensure there are quotes available
	if (quotes.length === 0) {
		throw new APIError(Errors.ServiceUnavailable, ErrorsHttpResponse.ServiceUnavailable, null, "No quotes found");
	}

	// Get a random quote using randomInt
	const randomIndex = randomInt(quotes.length);
	const quote = quotes[randomIndex];

	res.send(quote);
});

export default router;
