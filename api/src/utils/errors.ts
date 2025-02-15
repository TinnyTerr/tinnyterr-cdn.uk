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
    GenericError = "500",
    FileNotFound = "404",
    FileTooLarge = "422",
    InvalidFileType = "415",
    UploadFailed = "500",
    PermissionDenied = "403",
    QuotaExceeded = "400",
    NetworkError = "500",
    UnauthorizedAccess = "401",
    ServiceUnavailable = "503",
    PackageError = "424",
}

export const isAPIError = (err: any): err is APIError => {
    if (err.code) return true;
    return false
}


class APIError extends Error {
    constructor(
        public code: Errors,
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

        // It works, trust me.
        // @ts-ignore
        this.httpCode = ErrorsHttpResponse[Errors[code]]
    }
    httpCode: string
    sanitaryOutput: string;

    /**
     * This is here incase we want to do something special with a certain function. 
     * Currently, there's no use.
     * TODO: Make it into one function using keyof
     */
    assertions = {
        notFound: (): this is APIError & { code: Errors.FileNotFound; data: string } => this.code === Errors.FileNotFound,
        uploadFailed: (): this is APIError & { code: Errors.FileTooLarge; data: string } => this.code === Errors.FileTooLarge,
        permissionDenied: (): this is APIError & { code: Errors.PermissionDenied; data: string } => this.code === Errors.PermissionDenied,
        quotaExceeded: (): this is APIError & { code: Errors.QuotaExceeded; data: string } => this.code === Errors.QuotaExceeded,
        networkError: (): this is APIError & { code: Errors.NetworkError; data: string } => this.code === Errors.NetworkError,
        unauthorizedAccess: (): this is APIError & { code: Errors.UnauthorizedAccess; data: string } => this.code === Errors.UnauthorizedAccess,
        serviceUnavailable: (): this is APIError & { code: Errors.ServiceUnavailable; data: string } => this.code === Errors.ServiceUnavailable,
    };
}

interface APIError extends Error {
    (code: Errors, data: any, message: string): this;

    code: Errors;
    data: any;
    sanitaryOutput: string;
}

export const errors = {
    notFound: (file: string) =>
        new APIError(
            Errors.FileNotFound,
            file,
            `File ${file} could not be found!`,
        ) as APIError & { code: Errors.FileNotFound; data: string },
    uploadFailed: (file: string) =>
        new APIError(
            Errors.UploadFailed,
            file,
            `File ${file} failed to upload!`,
        ) as APIError & { code: Errors.FileTooLarge; data: string },
    permissionDenied: (file: string) =>
        new APIError(
            Errors.PermissionDenied,
            file,
            `You do not have permission to access file ${file}!`,
        ) as APIError & { code: Errors.PermissionDenied; data: string },
    quotaExceeded: (quota: number) =>
        new APIError(
            Errors.QuotaExceeded,
            quota,
            `User quota of ${quota} bytes exceeded!`,
        ) as APIError & { code: Errors.QuotaExceeded; data: number },
    networkError: () =>
        new APIError(
            Errors.NetworkError,
            null,
            "Network error occurred while processing the file operation!",
        ) as APIError & { code: Errors.NetworkError; data: "" },
    unauthorizedAccess: () =>
        new APIError(
            Errors.UnauthorizedAccess,
            null,
            "Unauthorized access! Please login to continue.",
        ) as APIError & { code: Errors.UnauthorizedAccess; data: "" },
    serviceUnavailable: () =>
        new APIError(
            Errors.ServiceUnavailable,
            null,
            "The file hosting service is currently unavailable. Please try again later.",
        ) as APIError & { code: Errors.ServiceUnavailable; data: "" },
};
