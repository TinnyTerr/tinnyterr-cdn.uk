import dotenv from "dotenv";
import {
	type CollectionOptions,
	type Db,
	MongoClient,
	type WithId,
	type WithoutId,
} from "mongodb";

dotenv.config();

const client = new MongoClient(
	process.env.MONGODB_URI ?? "mongodb://localhost:27017",
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

// Capitalised to allow for backporting to previous use
export class DB {
	private connection: Db;
	private connectionUri: string;
	constructor() {
		this.connectionUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
		this.connection = new MongoClient(this.connectionUri).db("file_hoster_new");
	}

	public collection(name: string, options?: CollectionOptions) {
		return this.connection.collection(name, options);
	}

	// biome-ignore lint/suspicious/noExplicitAny: idk
	public removeId<T extends WithId<{ [key: string]: any }>>(
		object: T,
	): WithoutId<T> {
		const { _id, ...rest } = object;
		return { ...rest } as WithoutId<T>;
	}
}
