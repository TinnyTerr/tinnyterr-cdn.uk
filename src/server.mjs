import express from "express";
import path from "node:path";
import morgan from "morgan";
import chalk from "chalk";
import fs from "node:fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { promisify } from "node:util";

const app = express();
const port = 7777;
const __dirname = import.meta.dirname;
const uploadDirectory = path.join(__dirname, "../uploads");
const thumbnailDirectory = path.join(__dirname, "../tmp");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDirectory)) {
	fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Ensure the thumbnail directory exists
if (!fs.existsSync(thumbnailDirectory)) {
	fs.mkdirSync(thumbnailDirectory, { recursive: true });
}

// Utility function to check if a file is an image
function isImage(fileName) {
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
	return imageExtensions.includes(path.extname(fileName).toLowerCase());
}

// Utility function to check if a file is a video
function isVideo(fileName) {
	const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"];
	return videoExtensions.includes(path.extname(fileName).toLowerCase());
}

// Define the colorizer function using morgan's FormatFn type
const colorizer = (tokens, req, res) => {
	const statusString = tokens.status(req, res);
	if (!statusString) return;
	const status = Number.parseInt(statusString, 10); // Convert status to number
	const method = tokens.method(req, res);
	const url = tokens.url(req, res);
	const responseTime = tokens["response-time"](req, res);
	const ip = req.ip;

	const date = new Date().toISOString().replace("T", " ").replace("Z", "");

	// Define the padding length for equal spacing
	const datePadding = 30;
	const methodPadding = 10;
	const urlPadding = 30;
	const statusPadding = 6;
	const responseTimePadding = 10;
	const ipPadding = 10;

	// Color the logs based on the status code
	let color = chalk.gray;
	if (status >= 400 && status < 500) color = chalk.yellow;
	if (status >= 500) color = chalk.red;
	if (status < 400) color = chalk.green;

	// Return the formatted log with padded fields
	return color(
		`${date.padEnd(datePadding)} ` + // Add the date at the start
			`${ip.padEnd(methodPadding)} ` + // Pad method to ensure equal width
			`${method.padEnd(methodPadding)} ` + // Pad method to ensure equal width
			`${url.padEnd(urlPadding)} ` + // Pad URL for equal spacing
			`${status.toString().padStart(statusPadding)} ` + // Pad status
			`${responseTime.padStart(responseTimePadding)}ms`, // Pad response time
	);
};

app.use(morgan(colorizer));
app.use(express.json());
app.use((req, res, next) => {
	if (req.path.includes("wp") || req.path.includes("wordpress")) {
		res.sendStatus(500);
		res.end();
		return;
	}
	next();
});

// MongoDB setup
const mongoUrl = "mongodb://localhost:27017";
const dbName = "filehoster";
const client = new MongoClient(mongoUrl);
let db;

client.connect().then(() => {
	db = client.db(dbName);
	console.log("Connected to MongoDB");
});

// Directory to store files
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer setup for file upload handling
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const uuidFilename = `${uuidv4()}${path.extname(file.originalname)}`;
		cb(null, uuidFilename);
	},
});
const upload = multer({ storage });

const authenticate = async (req, res, next) => {
	try {
		// Check if token is provided either in the Authorization header or query string
		let token = req.headers.authorization ?? req.query.authorization;

		// If the token is in the header, remove the "Bearer " prefix if it exists
		if (token?.startsWith("Bearer ")) {
			token = token.split(" ")[1];
		}

		// Ensure token is provided (after possible "Bearer " prefix removal)
		if (!token) {
			return res.status(403).json({ message: "No token provided" });
		}

		// Verify the JWT token using a secret key, without checking for expiration
		const decoded = await promisify(jwt.verify)(
			token,
			process.env.JWT_SECRET || "secretkey",
			{
				ignoreExpiration: true, // Skip expiration check
			},
		);

		// Assuming the decoded object contains the user ID (uuid)
		const user = await db.collection("users").findOne({ uuid: decoded.uuid });

		// If no user is found, return a 404 error
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Attach user info to the request for downstream use
		req.userId = user._id;
		req.username = user.username;

		// Continue to the next middleware or route handler
		next();
	} catch (err) {
		console.error("Authentication error:", err);

		// Handle JWT verification errors (e.g., invalid token)
		if (err.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}

		// Catch-all for any other errors
		return res.status(500).json({ message: "Failed to authenticate" });
	}
};

// User Login Route
app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		// Find user by username
		const user = await db.collection("users").findOne({ username });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Validate password
		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ token: null, message: "Invalid password" });
		}

		// Create a token with the user's UUID
		const token = jwt.sign({ uuid: user.uuid }, "secretkey", {
			expiresIn: 86400,
		}); // 24 hours

		// Return the token
		res.status(200).json({ token });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ message: "Server error during login" });
	}
});

app.post("/upload", authenticate, upload.single("file"), async (req, res) => {
	const file = req.file;

	// Check if file exists
	if (!file) {
		return res
			.status(400)
			.json({ message: "No file uploaded or invalid file" });
	}

	// Generate short URL
	const shortUrl = Math.random().toString(36).substr(2, 8); // Short random string

	// Get file size in bytes
	const fileSize = file.size;

	// Save file metadata to MongoDB
	try {
		await db.collection("files").insertOne({
			originalFilename: file.originalname,
			uuidFilename: file.filename,
			shortUrl,
			fileSize,
			uploadedBy: req.username,
			uploadDate: new Date(),
		});

		res.json({
			url: `https://tinnyterr-cdn.uk/uploads/${shortUrl}`,
			fileUrl: `https://tinnyterr-cdn.uk/downloads/${shortUrl}`,
			thumbnailUrl: `https://tinnyterr-cdn.uk/downloads/${shortUrl}/thumbnail`,
			deleteUrl: `https://tinnyterr-cdn.uk/delete/${shortUrl}/`,
		});
	} catch (error) {
		console.error("Error saving file metadata:", error);
		res.status(500).json({ message: "Error saving file metadata" });
	}
});

app.use("/", express.static(path.join(__dirname, "../www")));

app.get("/uploads/me", authenticate, async (req, res) => {
	const arrayOfDocs = [];

	// biome-ignore lint/complexity/noForEach: <explanation>
	(await db.collection("files").find({}).toArray()).forEach((v) => {
		if (v.uploadedBy === req.username) {
			arrayOfDocs.push(v);
		}
	});

	return res.json(arrayOfDocs);
});

app.get("/uploads", authenticate, async (req, res) => {
	const arrayOfDocs = [];

	// biome-ignore lint/complexity/noForEach: <explanation>
	(await db.collection("files").find({}).toArray()).forEach((v) =>
		arrayOfDocs.push(v),
	);

	return res.json(arrayOfDocs);
});

app.get("/uploads/:shortUrl", async (req, res) => {
	const { shortUrl } = req.params;

	try {
		// Find the file by its short URL
		const fileRecord = await db.collection("files").findOne({ shortUrl });

		if (!fileRecord) {
			return res.status(404).json({ message: "File not found" });
		}

		const filePath = path.join(UPLOAD_DIR, fileRecord.uuidFilename);

		// Check if the file exists
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File not found on disk" });
		}

		// Get file size from the filesystem
		const fileStats = fs.statSync(filePath);
		const fileSize = fileStats.size; // Size in bytes

		// Return metadata and download link
		res.json({
			originalFilename: fileRecord.originalFilename,
			uploader: fileRecord.uploadedBy, // Assuming you want to return the user ID
			shortUrl: fileRecord.shortUrl,
			uploadDate: fileRecord.uploadDate,
			fileSize: `${(fileSize / 1024).toFixed(2)} KB`, // File size in KB
			downloadUrl: `${req.protocol}://${req.get("host")}/downloads/${shortUrl}`,
		});
	} catch (error) {
		console.error("Error fetching file metadata:", error);
		res
			.status(500)
			.json({ message: "Server error while fetching file metadata" });
	}
});

// Endpoint to generate and return a thumbnail
app.get("/downloads/:shortUrl/thumbnail", async (req, res) => {
	const { shortUrl } = req.params;

	try {
		// Find the file by shortUrl
		const fileRecord = await db.collection("files").findOne({ shortUrl });

		if (!fileRecord) {
			return res.status(404).json({ message: "File not found in database" });
		}

		const filePath = path.join(UPLOAD_DIR, fileRecord.uuidFilename);
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File not found on disk" });
		}

		const thumbnailPath = path.join(
			thumbnailDirectory,
			`${fileRecord.uuidFilename}-thumbnail.png`,
		);

		// If thumbnail already exists, serve it
		if (fs.existsSync(thumbnailPath)) {
			return res.sendFile(thumbnailPath);
		}

		// If it's an image, generate a thumbnail using sharp
		if (isImage(fileRecord.originalFilename)) {
			sharp(filePath)
				.resize({ width: 150 }) // Resize to 150px width, maintaining aspect ratio
				.toFile(thumbnailPath, (err) => {
					if (err) {
						console.error("Error generating image thumbnail:", err);
						return res
							.status(500)
							.json({ message: "Error generating thumbnail" });
					}
					res.sendFile(thumbnailPath); // Send the generated thumbnail
				});
		} else if (isVideo(fileRecord.originalFilename)) {
			// If it's a video, generate a thumbnail using FFmpeg
			ffmpeg(filePath)
				.on("error", (err) => {
					console.error("Error generating video thumbnail:", err.message);
					return res
						.status(500)
						.json({ message: "Error generating thumbnail" });
				})
				.screenshots({
					count: 1,
					folder: thumbnailDirectory,
					size: "150x?", // Maintain aspect ratio, width 150px
					filename: `${fileRecord.uuidFilename}-thumbnail.png`,
				})
				.on("end", () => {
					// Serve the generated thumbnail
					res.sendFile(thumbnailPath);
				});
		} else {
			return res
				.status(415)
				.json({ message: "Unsupported file type for thumbnails" });
		}
	} catch (error) {
		console.error("Error generating thumbnail:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// Endpoint to download the actual file (separate from metadata)
app.get("/downloads/:shortUrl", async (req, res) => {
	const { shortUrl } = req.params;

	try {
		const fileRecord = await db.collection("files").findOne({ shortUrl });

		if (!fileRecord) {
			return res.status(404).json({ message: "File not found" });
		}

		const filePath = path.join(UPLOAD_DIR, fileRecord.uuidFilename);
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File not found on disk" });
		}

		// Serve the file as a download
		res.sendFile(filePath);
	} catch (error) {
		console.error("Error fetching file:", error);
		res.status(500).json({ message: "Error downloading file" });
	}
});

// Endpoint to delete a file by shortUrl
app.get("/delete/:shortUrl", authenticate, async (req, res) => {
	const { shortUrl } = req.params;

	try {
		// Find the file by shortUrl in the database
		const fileRecord = await db.collection("files").findOne({ shortUrl });

		if (!fileRecord) {
			return res.status(404).json({ message: "File not found" });
		}

		const filePath = path.join(UPLOAD_DIR, fileRecord.uuidFilename);

		// Check if the file exists on the disk
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath); // Delete the file
		}

		// Optionally, delete the thumbnail if it exists
		const thumbnailPath = path.join(
			thumbnailDirectory,
			`${fileRecord.uuidFilename}-thumbnail.png`,
		);
		if (fs.existsSync(thumbnailPath)) {
			fs.unlinkSync(thumbnailPath); // Delete the thumbnail
		}

		// Remove the file metadata from the database
		await db.collection("files").deleteOne({ shortUrl });

		// Send success response
		res.status(200).json({ message: "File deleted successfully" });
	} catch (error) {
		console.error("Error deleting file:", error);
		res.status(500).json({ message: "Error deleting file" });
	}
});

app.get("/info", authenticate, async (req, res) => {
	const username = req.username;

	await db.collection("files").find({ username });
});

// Start the server
app.listen(port, () => {
	console.log(`File hoster listening at http://localhost:${port}`);
});
