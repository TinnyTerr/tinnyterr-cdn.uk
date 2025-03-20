import { db } from "api/common/utils/database";
import type { NextFunction, Request, Response } from "express";
import { Users } from "../types/user";
import crypto from "node:crypto";
import axios from "axios";
import { APIError, Errors, ErrorsHttpResponse } from "api/common/utils/errors";

export const register = async (req: Request, res: Response) => {
	const { code } = req.body ?? req.query;

	const regCode = await db
		.collection<Users.RegistrationCode>("codes")
		.findOne({ code });

	if (regCode === null) {
		res.status(400).send("Incorrect/Invalid registration code");
		return;
	}

	regCode.triggered = true;

	await db
		.collection<Users.RegistrationCode>("codes")
		.findOneAndReplace({ code }, regCode);

	res.redirect(
		302,
		`https://discord.com/login/oauth/authorize?client_id=${process.env.discordClientId}&redirect_uri=${process.env.discordRedirectUri}&scope=identify&response_type=code&state=${code}`,
	);
	return;
};

export const discordCallback = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { code, state } = req.query;

	// biome-ignore lint/suspicious/noExplicitAny: idfk stop complaining
	let codeState: any = await db
		.collection<Users.RegistrationCode>("codes")
		.findOne({ code: state });

	if (codeState === null) {
		codeState = await db
			.collection<Users.User>("users")
			.findOne({ username: state });
	}

	if (codeState === null || codeState.triggered === false) {
		next(
			new APIError(
				Errors.NetworkError,
				ErrorsHttpResponse.NetworkError,
				null,
				"Invalid code received",
			),
		);
	}

	const tokenResponse = await axios.post(
		"https://discord.com/api/oauth2/token",
		{
			client_id: process.env.discordClientId,
			client_secret: process.env.discordClientSecret,
			code,
			redirect_uri: process.env.discordRedirectUri,
		},
		{
			headers: {
				Accept: "application/json",
			},
		},
	);

	if (tokenResponse.status !== 200) {
		next(
			new APIError(
				Errors.NetworkError,
				ErrorsHttpResponse.NetworkError,
				null,
				"Invalid token received",
			),
		);
	}

	const tokenData = tokenResponse.data;

	const userData = await axios.get("https://discord.com/api/oauth2/@me", {
		headers: {
			Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
		},
	});

	db.collection<Users.User>("users").insertOne({
		id: crypto.randomBytes(12).toString("hex"),
		createdAt: new Date(),
		oauthTokens: {
			discord: tokenData,
		},
		permissions: Users.Permissions.user,
		status: "active",
		updatedAt: new Date(),
		username: userData.data.user.username as string,
	});
};

export const login = async (req: Request, res: Response) => {
	const { username } = req.body ?? req.query;

	const regCode = await db.collection<Users.User>("user").findOne({ username });

	if (regCode === null) {
		res.status(400).send("Incorrect/Invalid registration code");
		return;
	}

	res.redirect(
		302,
		`https://discord.com/login/oauth/authorize?client_id=${process.env.discordClientId}&redirect_uri=${process.env.discordRedirectUri}&scope=identify&response_type=code&state=${username}`,
	);
	return;
};
