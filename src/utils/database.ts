import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(
	process.env.MONGODB_URI || "mongodb://localhost:27017",
);
export const db = client.db("file_hoster_new");

(async () => {
	try {
		await client.connect();
		console.log("Connected to database");
	} catch (error) {
		console.error("Failed to connect to database", error);
	}
})();
