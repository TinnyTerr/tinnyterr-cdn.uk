import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/database";

export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	try {
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
			process.env.JWT_SECRET || "secretkey",
			{
				expiresIn: 86400, // 24 hours

				algorithm: "HS512",
			},
		);

		res.status(200).json({ token });
		return;
	} catch (error) {
		res.status(500).json({ message: "Server error during login" });
		return;
	}
};
