import { app } from './app';
import { SETTINGS } from './settings';
import { runDb } from "./db/mongoDB";
import mongoose from "mongoose";

const startApp = async () => {
    const MONGO_URL = process.env.MONGO_URL;

    if (!MONGO_URL) {
        console.error("❌ MONGO_URL is not defined in environment variables. Exiting...");
        process.exit(1);
    }

    // Подключение к MongoDB через Mongoose
    const isConnected = await runDb(MONGO_URL);
    if (!isConnected) {
        console.error("❌ Failed to connect to MongoDB. Exiting...");
        process.exit(1);
    }

    // Обработка событий подключения/ошибок Mongoose
    mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });

    // Start the server only after the database connection is established
    app.listen(SETTINGS.PORT, () => {
        console.log(`🚀 Server started on port ${SETTINGS.PORT}`);
    });
};

startApp();

