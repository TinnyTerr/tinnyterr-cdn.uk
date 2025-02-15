import { exec } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

// Check if file is an image
export const isImage = (filename: string) => {
	const ext = path.extname(filename).toLowerCase();
	return [".jpg", ".jpeg", ".png", ".gif"].includes(ext);
};

// Check if file is a video
export const isVideo = (filename: string) => {
	const ext = path.extname(filename).toLowerCase();
	return [".mp4", ".mov", ".avi", ".wmv"].includes(ext);
};

// Generate thumbnail for image/video files
export const generateThumbnail = async (
	filePath: string,
	originalFilename: string,
) => {
	const thumbnailPath = path.join(
		__dirname,
		"../../thumbnails",
		`${originalFilename}.thumbnail.jpg`,
	);

	if (isImage(originalFilename)) {
		await sharp(filePath).resize(200).toFile(thumbnailPath);
		return thumbnailPath;
	}

	if (isVideo(originalFilename)) {
		const command = `ffmpeg -i ${filePath} -ss 00:00:02 -vframes 1 ${thumbnailPath}`;
		exec(command);
		return thumbnailPath;
	}

	throw new Error("Unsupported file type for thumbnail generation");
};
