import { db } from "api/common/utils/database";
import type { NextFunction, Request, Response } from "express";
import { Users } from "../types/user";
import crypto from "node:crypto";
import axios from "axios";
import { APIError, Errors, ErrorsHttpResponse } from "api/common/utils/errors";
import jwt from "jsonwebtoken";

export const register = async (
	req: Request & { user?: string },
	res: Response,
	next: NextFunction,
) => {
	const { code } = req.body ?? req.query;

	const regCode = await db
		.collection<Users.RegistrationCode>("codes")
		.findOne({ code });

	if (regCode === null) {
		return next(
			new APIError(
				Errors.PermissionDenied,
				ErrorsHttpResponse.PermissionDenied,
				null,
				"Code invalid or used",
			),
		);
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

export const registerCallback = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { code, state } = req.query;

	const codeState = await db
		.collection<Users.RegistrationCode>("codes")
		.findOne({ code: state });

	if (codeState === null || codeState.triggered === false) {
		return next(
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
		hint: getRandomString(64),
	});

	res.sendStatus(204);
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

export const loginCallback = async (
	req: Request & { user?: string },
	res: Response,
	next: NextFunction,
) => {
	const { code, state } = req.query;

	const userState = await db
		.collection<Users.User>("users")
		.findOne({ username: state });

	if (userState === null) {
		return next(
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
		return next(
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

	if (userData.status !== 200) {
		return next(
			new APIError(
				Errors.NetworkError,
				ErrorsHttpResponse.NetworkError,
				null,
				"Invalid discord data received",
			),
		);
	}

	const token = jwt.sign(userState.hint, process.env.JWTsecret as string);

	res.send(token);

	const api = `https://api.ipbase.com/v2/info?ip=${req.ip}`;

	const data = await axios.get<LocationAPI>(api);

	db.collection<Users.Session>("sessions").insertOne({
		createdAt: new Date(),
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		geoLocation: `${data.data.data.location.city}, ${data.data.data.location.country} `,
		id: crypto.randomBytes(12).toString("hex"),
		ipAddress: req.ip?.toString() ?? "",
		status: "active",
		userAgent: req.headers["user-agent"] ?? "",
		userId: userState.id,
	});
};

const getRandomString = (size: number) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890";
	const charactersLength = characters.length;
	let password = "";
	for (let i = 0; i < size; ++i) {
		password += characters[Math.floor(Math.random() * charactersLength)];
	}
	return password;
};

// For geolocation when sessions setup: https://aether.epias.ltd/ip2country/${ip}/?full=true

interface LocationAPI {
	data: {
		ip: string;
		hostname: string | null;
		type: string;
		range_type: {
			type: string;
			description: string;
		};
		connection: {
			asn: number;
			organization: string;
			isp: string;
			range: string;
		};
		location: {
			geonames_id: number;
			latitude: number;
			longitude: number;
			zip: string;
			continent: {
				code: string;
				name: string;
				name_translated: string;
				geonames_id: number;
				wikidata_id: string;
			};
			country: {
				alpha2: string;
				alpha3: string;
				calling_codes: string[];
				currencies: {
					symbol: string;
					name: string;
					symbol_native: string;
					decimal_digits: number;
					rounding: number;
					code: string;
					name_plural: string;
					type: string;
				}[];
				emoji: string;
				ioc: string;
				languages: {
					name: string;
					name_native: string;
				}[];
				name: string;
				name_translated: string;
				timezones: string[];
				is_in_european_union: boolean;
				fips: string;
				geonames_id: number;
				hasc_id: string;
				wikidata_id: string;
			};
			city: {
				fips: string | null;
				alpha2: string | null;
				geonames_id: number;
				hasc_id: string | null;
				wikidata_id: string | null;
				name: string;
				name_translated: string;
			};
			region: {
				fips: string | null;
				alpha2: string | null;
				geonames_id: number;
				hasc_id: string | null;
				wikidata_id: string | null;
				name: string;
				name_translated: string;
			};
		};
		tlds: string[];
		timezone: {
			id: string;
			current_time: string;
			code: string;
			is_daylight_saving: boolean;
			gmt_offset: number;
		};
		security: {
			is_anonymous: boolean | null;
			is_datacenter: boolean | null;
			is_vpn: boolean | null;
			is_bot: boolean | null;
			is_abuser: boolean | null;
			is_known_attacker: boolean | null;
			is_proxy: boolean | null;
			is_spam: boolean | null;
			is_tor: boolean | null;
			proxy_type: boolean | null;
			is_icloud_relay: boolean | null;
			threat_score: boolean | null;
		};
		domains: {
			count: number | null;
			domains: string[];
		};
	};
}
