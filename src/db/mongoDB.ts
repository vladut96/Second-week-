import { MongoClient, Db, Collection } from 'mongodb';
import * as dotenv from 'dotenv';
import {
    BlogInputModel,
    CommentatorInfo,
    CommentViewModel, DeviceAuthSession,
    PostInputModel, RefreshTokenModel,
    RegisterUserDB, RequestLog
} from "../types/types";
import {EmailConfirmation} from "../../service/email-confirmation-code-generator";

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
    return getDb().collection("Blogs");
}
export function getPostsCollection(): Collection<PostInputModel> {
    return getDb().collection('Posts');
}
export function getUsersCollection(): Collection<RegisterUserDB<EmailConfirmation>> {
    return getDb().collection('Users');
}
export function getCommentsCollection(): Collection<CommentViewModel<CommentatorInfo>> {
    return getDb().collection('Comments');
}
export function getRefreshTokensCollection (): Collection<RefreshTokenModel> {
    return getDb().collection('Refresh Tokens');
}
export function getRequestLogsCollection(): Collection<RequestLog> {
    return getDb().collection('RequestLogs');
}
export function getDevicesCollection(): Collection<DeviceAuthSession> {
    return getDb().collection('Devices');
}

console.log("🔍 MONGO_URL:", process.env.MONGO_URL);
if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGO_URL is undefined. Check your .env file.");
}