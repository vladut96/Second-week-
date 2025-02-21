import { MongoClient, Db, Collection } from 'mongodb';
import { SETTINGS } from "../settings";
import * as dotenv from 'dotenv';
import { BlogInputModel, PostInputModel } from "../types/types";

dotenv.config();

let client: MongoClient;
let db: Db;

export async function runDb(url: string): Promise<boolean> {
    try {
        client = new MongoClient(url);
        await client.connect();
        db = client.db('my-database');

        await db.command({ ping: 1 });
        console.log("✅ Connected to MongoDB successfully!");

        return true;
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e);
        await client?.close();
        return false;
    }
}

export function getDb(): Db {
    if (!db) {
        throw new Error("Database not initialized. Call runDb first.");
    }
    return db;
}

export function getBlogsCollection(): Collection<BlogInputModel> {
    return getDb().collection(SETTINGS.PATH.BLOGS);
}

export function getPostsCollection(): Collection<PostInputModel> {
    return getDb().collection(SETTINGS.PATH.POSTS);
}

console.log("🔍 MONGO_URL:", process.env.MONGO_URL);
if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGO_URL is undefined. Check your .env file.");
}