import { app } from './app';
import { SETTINGS } from './settings';
import { runDb } from "./db/mongoDB";

const startApp = async () => {
    const MONGO_URL = process.env.MONGO_URL;

    if (!MONGO_URL) {
        console.error("❌ MONGO_URL is not defined in environment variables. Exiting...");
        process.exit(1);
    }

    const res = await runDb(MONGO_URL);
    if (!res) {
        console.error("❌ Failed to connect to MongoDB. Exiting...");
        process.exit(1);
    }

    // Start the server only after the database connection is established
    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT);
    });
};

startApp();