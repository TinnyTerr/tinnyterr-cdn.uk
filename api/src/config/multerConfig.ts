import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, "uploads/");
	},
	filename: (_req, file, cb) => {
		const uuidFilename = crypto.randomUUID() + path.extname(file.originalname);
		cb(null, uuidFilename);
	},
});

export const upload = multer({ storage });
