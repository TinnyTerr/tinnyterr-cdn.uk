export namespace Files {
	export interface File {
		id: string;
		name: string;
		/**
		 * User ID who owns the file
		 */
		ownerId: string;
		/**
		 * Size in bytes
		 */
		size: number;
		mimeType: string;
		createdAt: Date;
		updatedAt: Date;
		status: FileStatus;
		/**
		 * Current version ID of the file
		 */
		defaultVersionId: string;
	}

	export interface FileVersion {
		id: string;
		/**
		 * ID of the file
		 */
		fileId: string;
		versionNumber: number;
		createdAt: Date;
		/**
		 * Size of this version in bytes
		 */
		size: number;
		/**
		 * Where the version is stored
		 * If a string path, base off /public
		 */
		storageLocation: string;
		/**
		 * Checksum for data integrity
		 */
		checksum: string;
	}

	export interface SharableLink {
		id: string;
		fileId: string;
		createdAt: Date;
		/**
		 * Optional expiration date
		 */
		expiresAt?: Date;
		/**
		 * Permissions granted by the link
		 * MUST `POST` TO SHARE LINK.
		 * Figure out `PUT` later...
		 */
		accessLevel: AccessLevel;
		/**
		 * ID of the user who created the link.
		 * For potential access sharing later.
		 * For now, is just owner id.
		 * @unused
		 */
		createdByUserId: string;
		/**
		 * The actual sharable link
		 * Must have base url setup
		 */
		linkUrl: string;
	}
}

enum FileStatus { }

enum AccessLevel {
	view = 0,
	/**
	 * Only on supported text files
	 */
	edit = 1,
	download = 2,
}
