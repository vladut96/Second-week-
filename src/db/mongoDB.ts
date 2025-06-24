import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

export async function runDb(url: string): Promise<boolean> {
    try {
        await mongoose.connect(url, { dbName: 'my-database' });
        console.log("✅ Connected to MongoDB successfully with Mongoose!");
        return true;
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e);
        return false;
    }
}
/*
export function getDb() {
    return mongoose.connection.db;
}
*/
console.log("🔍 MONGO_URL:", process.env.MONGO_URL);
if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGO_URL is undefined. Check your .env file.");
}