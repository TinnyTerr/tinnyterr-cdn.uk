import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../common/utils/database";

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	let token = req.headers.authorization ?? req.query.authorization;

	if (!token || typeof token !== "string") {
		res.status(401).json({ message: "Unauthorized: No token provided" });
		return;
	}

	if (token.startsWith("Bearer")) {
		token = token.slice(7);
	}

	try {
		const decoded = jwt.verify(
			token as string,
			process.env.JWTsecret || "secretkey",
		) as unknown as { uuid: string };
		const user = await db.collection("users").findOne({ uuid: decoded.uuid });
		if (!user) {
			res.status(401).json({ message: "Unauthorized: Invalid token" });
			return;
		}

		// @ts-ignore
		req.username = user.username;
		next();
	} catch (error) {
		res.status(401).json({ message: "Unauthorized: Invalid token" });
		return;
	}

	return;
};
