import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { authenticate } from "../../middlewares/authenticate";
import { randomUUID } from "node:crypto";
import { db } from "../../utils/database";
import type { Text } from "../../types";
import { APIError, Errors, ErrorsHttpResponse } from "../../utils/errors";

const router = Router();

// POST route to set text data (this will overwrite the existing text for the user)
router.post(
	"/set",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		const { data } = req.body; // Assuming only data is passed (username is already on `req`)
		try {
			await db.collection<Text>("texts").deleteOne({
				// @ts-ignore
				uploader: req.username,
			});

			const newText = {
				_id: randomUUID(),
				// @ts-ignore
				uploader: req.username, // Using the modified `req.username` from the authenticate middleware
				data,
				lastUpdated: new Date().toISOString(),
			};

			// Use $set to update or insert text for the user
			await db.collection<Text>("texts").insertOne(newText);

			res.status(201).json(newText);
		} catch (error) {
			// Pass the error to the next middleware for handling
			next(error);
		}
	},
);

// GET route to get the single text data for the logged-in user
router.get(
	"/get",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Fetch the most recent text for the logged-in user
			// @ts-ignore
			let text = await db
				.collection<Text>("texts")
				// @ts-ignore
				.findOne({ uploader: req.username });

			if (text === null || text === undefined) {
				await db.collection<Text>("texts").insertOne({
					_id: randomUUID(),
					data: "",
					lastUpdated: new Date().toISOString(),
					// @ts-ignore
					uploader: req.username,
				});

				// @ts-ignore
				text = await db
					.collection<Text>("texts")
					// @ts-ignore
					.findOne({ uploader: req.username });
			}

			res.status(200).json(text);
		} catch (error) {
			// Pass the error to the next middleware for handling
			next(error);
		}
	},
);
router.delete(
	"/clear",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Delete the user's text entry
			// @ts-ignore
			await db.collection<Text>("texts").deleteOne({ uploader: req.username });

			res.status(204).send();
		} catch (error) {
			// Pass the error to the next middleware for handling
			next(error);
		}
	},
);

export default router;
