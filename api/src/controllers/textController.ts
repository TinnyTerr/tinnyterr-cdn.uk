import type { Request, Response } from "express";
import type { Text, User } from "~types";
import { db } from "../utils/database";

export const get = async (req: Request, res: Response) => {
	//@ts-ignore
	const username = req.username;

	const { uuid } = (await db
		.collection<User>("users")
		.findOne({ username })) as User;

	let text = (await db
		.collection<Text>("text")
		.findOne({ uploader: uuid })) as Text;

	if (text === null) {
		text = {
			_id: crypto.randomUUID(),
			data: "",
			lastUpdated: new Date().toISOString(),
			uploader: uuid,
		};
	}

	res.status(200).send(text);
};

export const set = async (req: Request, res: Response) => {
	//@ts-ignore
	const username = req.username;

	const { uuid } = (await db
		.collection<User>("users")
		.findOne({ username })) as User;

	const text = (await db
		.collection<Text>("text")
		.findOne({ uploader: uuid })) as Text;

	const data = req.body;

	text?.data === data;

	await db.collection<Text>("text").updateOne({ uploader: uuid }, text);

	res.status(200).send(text);
};
