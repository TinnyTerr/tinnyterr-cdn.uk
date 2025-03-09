import type { Request, Response } from "express";

import { db } from "../../common/utils/database";

export const getUserUploads = async (
	req: Request,
	res: Response,
): Promise<void> => {
	// @ts-ignore
	const username = req.username;

	try {
		const files = await db
			.collection("files")
			.find({ uploadedBy: username })
			.toArray();
		res.json(files);
		return;
	} catch (error) {
		res.status(500).json({ message: "Error fetching user uploads" });
		return;
	}
};

export const getAllUploads = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const files = await db.collection("files").find({}).toArray();
		res.json(files);
		return;
	} catch (error) {
		res.status(500).json({ message: "Error fetching uploads" });
		return;
	}
};
