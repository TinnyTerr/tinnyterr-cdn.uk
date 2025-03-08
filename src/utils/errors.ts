export enum Errors {
	GenericError = 0,
	FileNotFound = 1,
	FileTooLarge = 2,
	InvalidFileType = 3,
	UploadFailed = 4,
	PermissionDenied = 5,
	QuotaExceeded = 6,
	NetworkError = 7,
	UnauthorizedAccess = 8,
	ServiceUnavailable = 9,
	PackageError = 10,
}

export enum ErrorsHttpResponse {
	GenericError = 500,
	FileNotFound = 404,
	FileTooLarge = 422,
	InvalidFileType = 415,
	UploadFailed = 500,
	PermissionDenied = 401,
	PermissionDeniedAuthorised = 403,
	QuotaExceeded = 400,
	NetworkError = 500,
	UnauthorizedAccess = 401,
	ServiceUnavailable = 503,
	PackageError = 424,
}

// biome-ignore lint/suspicious/noExplicitAny:
export const isAPIError = (err: any): err is APIError => {
	if (err.code) return true;
	return false;
};

export class APIError extends Error {
	constructor(
		public code: Errors,
		public readonly httpCode: ErrorsHttpResponse,
		// biome-ignore lint/suspicious/noExplicitAny: literally any data into a string
		public data: any,
		message: string,
	) {
		super(message);

		this.sanitaryOutput =
			typeof data === "string"
				? data
				: typeof data === "object"
					? JSON.stringify(data)
					: String(data);
	}
	sanitaryOutput: string;
}
