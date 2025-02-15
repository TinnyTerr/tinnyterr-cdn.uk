import type { UUID } from "node:crypto";

export default interface fileData {
	/**
	 * Used to fill mongodb's unhappiness for a primary key anywhere else
	 */
	_id: UUID;
	/**
	 * The name of the file uploaded
	 */
	originalFilename: string;
	/**
	 * The exact name of the file in ../../uploads
	 */
	uuidFilename: `${UUID}${string}`;
	/**
	 * The endpoint that the file can be accessed
	 */
	shortUrl: string;
	/**
	 * The size of the file in bytes
	 */
	fileSize: number;
	/**
	 * The UUID of the user that uploaded the file
	 */
	uploadedBy: UUID;
	/**
	 * Proprietary data type not in typescript
	 */
	uploadDate: string;
}
