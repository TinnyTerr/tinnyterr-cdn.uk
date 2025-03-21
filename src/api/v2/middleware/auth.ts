import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { APIError, Errors, ErrorsHttpResponse } from "api/common/utils/errors";
import { db } from "api/common/utils/database";
import type { Users } from "@v2/types/user";

export const authorize = (isAuthRequired: boolean) => {
	return async (
		req: Request & { user?: string },
		res: Response,
		next: NextFunction,
	) => {
		const authorizationHeader = req.headers.authorization;

		// If authorization is required and the token is missing, throw an error
		if (isAuthRequired && !authorizationHeader) {
			return next(
				new APIError(
					Errors.PermissionDenied,
					ErrorsHttpResponse.PermissionDenied,
					null,
					"Authorization required",
				),
			);
		}

		// If authorization is not required and token is missing, proceed without checking
		if (!isAuthRequired && !authorizationHeader) {
			return next();
		}

		try {
			// Extract the token from the "Authorization" header
			const token = authorizationHeader?.split(" ")[1];

			// Verify the token using the JWT secret
			const decodedToken = jwt.verify(
				token as string,
				process.env.JWTsecret as string,
			);

			// Assume `decodedToken` contains the user's unique hint (as per your previous logic)
			const userHint = typeof decodedToken === "string" ? decodedToken : "";

			// Fetch the user from the database using the hint
			const user = await db
				.collection<Users.User>("users")
				.findOne({ hint: userHint });

			if (!user) {
				return next(
					new APIError(
						Errors.PermissionDenied,
						ErrorsHttpResponse.PermissionDenied,
						null,
						"User not found",
					),
				);
			}

			// Attach the username to req.user for further use in the request
			req.user = user.username;

			// Call the next middleware function
			next();
		} catch (error) {
			// If token verification fails, or any error occurs, handle it here
			return next(
				new APIError(
					Errors.PermissionDenied,
					ErrorsHttpResponse.PermissionDenied,
					error,
					"Invalid or expired token",
				),
			);
		}
	};
};
