import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../common/utils/database";

export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const user = await db.collection("users").findOne({ username });
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		res.status(401).json({ token: null, message: "Invalid password" });
		return;
	}

	const token = jwt.sign(
		{ uuid: user.uuid },
		process.env.JWTsecret || "secretkey",
		{
			// No time limit until we implement a special media token for uploading
			algorithm: "HS512",
		},
	);

	res.cookie("token", token, {
		secure: true,
		sameSite: true,
		maxAge: 86400,
	});

	res.status(200).send(token);
	return;
};
