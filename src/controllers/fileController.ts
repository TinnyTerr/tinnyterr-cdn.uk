import type { Request, Response } from "express";
import { db } from "../utils/database";
import { generateThumbnail } from "../utils/fileUtils";
import path from "node:path";
import fs from "node:fs";

// Upload a file
export const uploadFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const file = req.file;
	// @ts-ignore
	const username = req.username as string;

	if (!file) {
		res.status(400).json({ message: "No file uploaded" });
		return;
	}

	const shortUrl = Math.random().toString(36).slice(2, 10);
	const fileSize = file.size;

	try {
		await db.collection("files").insertOne({
			originalFilename: file.originalname,
			uuidFilename: file.filename,
			shortUrl,
			fileSize,
			uploadedBy: username,
			uploadDate: new Date(),
		});

		res.json({
			url: `https://tinnyterr-cdn.uk/files/downloads/${shortUrl}`,
			fileUrl: `https://tinnyterr-cdn.uk/files/${shortUrl}`,
			thumbnailUrl: `https://tinnyterr-cdn.uk/downloads/${shortUrl}/thumbnail`,
			deleteUrl: `https://tinnyterr-cdn.uk/delete/${shortUrl}/`,
		});
	} catch (error) {
		res.status(500).json({ message: "Error saving file metadata" });
		return;
	}

	return;
};

// Fetch file metadata
export const getFileMetadata = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { shortUrl } = req.params;
	try {
		const fileRecord = await db.collection("files").findOne({ shortUrl });
		if (!fileRecord) {
			res.status(404).json({ message: "File not found" });
			return;
		}
		res.json(fileRecord);
		return;
	} catch (error) {
		res
			.status(500)
			.json({ message: "Server error while fetching file metadata" });
		return;
	}
};

// Download file
export const downloadFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { shortUrl } = req.params;
	const fileRecord = await db.collection("files").findOne({ shortUrl });

	if (!fileRecord) {
		res.status(404).json({ message: "File not found" });
		return;
	}

	const filePath = path.join(
		__dirname,
		"../../uploads",
		fileRecord.uuidFilename,
	);
	if (!fs.existsSync(filePath)) {
		res.status(404).json({ message: "File not found on disk" });
		return;
	}

	res.sendFile(filePath);

	return;
};

// Generate and serve thumbnail
export const getThumbnail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { shortUrl } = req.params;

	try {
		const fileRecord = await db.collection("files").findOne({ shortUrl });
		if (!fileRecord) {
			res.status(404).json({ message: "File not found" });
			return;
		}

		const filePath = path.join("uploads", fileRecord.uuidFilename);
		const thumbnailPath = await generateThumbnail(
			filePath,
			fileRecord.originalFilename,
		);

		if (typeof thumbnailPath === "string") res.sendFile(thumbnailPath);
		else throw new Error("Did not get string for path");
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		res.status(500).json({ message: "Error generating thumbnail" });
		console.log(`------ ERROR -----\n${error.stack}`);
		res.end();
		return;
	}

	return;
};

// Delete file
export const deleteFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { shortUrl } = req.params;

	try {
		const fileRecord = await db.collection("files").findOne({ shortUrl });

		if (!fileRecord) {
			res.status(404).json({ message: "File not found" });
			return;
		}

		const filePath = path.join("uploads", fileRecord.uuidFilename);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}

		await db.collection("files").deleteOne({ shortUrl });

		res.status(200).json({ message: "File deleted successfully" });
		return;
	} catch (error) {
		res.status(500).json({ message: "Error deleting file" });
		return;
	}
};
