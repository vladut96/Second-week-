import { MongoClient, Collection } from 'mongodb';
import { SETTINGS } from "../settings";
import * as dotenv from 'dotenv';
import {BlogInputModel, BlogViewModel, PostInputModel} from "../types/types";
dotenv.config();

export let postsCollection: Collection<PostInputModel>;
export let blogsCollection: Collection<BlogInputModel>;

export async function runDb(url: string): Promise<boolean> {
    let client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('test');

        blogsCollection = db.collection(SETTINGS.PATH.BLOGS);
        postsCollection = db.collection(SETTINGS.PATH.POSTS);

        await db.command({ ping: 1 });
        console.log("✅ Connected to MongoDB successfully!");

        return true;
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e);
        await client.close();
        return false;
    }
}
console.log("🔍 MONGO_URL:", SETTINGS.MONGO_URL);
if (!SETTINGS.MONGO_URL) {
    throw new Error("❌ MONGO_URL is undefined. Check your .env file.");
}
