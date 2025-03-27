import { MongoClient } from 'mongodb';

// MongoDB connection
const mongoUri = process.env?.MONGODB_URI || 'mongodb://localhost:27017';

export let client: MongoClient;

let isInitialized = false;
export async function getMongoClient() {
	if (!client && !isInitialized) {
		try {
			client = new MongoClient(mongoUri);
			await client.connect();
			isInitialized = true;
		} catch (error) {
			console.error('Error connecting to MongoDB:', error);
			isInitialized = false;
		}
	}

	return client;
}

export function getDatabase(dbName: string) {
	return client.db(dbName);
}
