const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const { MongoClient } = require("mongodb");

// MongoDB connection URL and database name
const mongoUrl = "mongodb://localhost:27017";
const dbName = "file_hoster_new";

// Create and hash the user's password
const createUser = async (username, password) => {
	try {
		const hashedPassword = bcrypt.hashSync(password, 8);

		// Connect to MongoDB
		const client = new MongoClient(mongoUrl);
		await client.connect();

		// Insert user into the 'users' collection
		const db = client.db(dbName);
		await db
			.collection("users")
			.insertOne({ username, password: hashedPassword, uuid: randomUUID() });

		console.log(`User ${username} created successfully.`);
		client.close();
	} catch (err) {
		console.error("Error creating user:", err);
	}
};

createUser("tinnyterr", "O4y8pqQeE6IzSI7h7Kpr");
