import {app} from './app'
import {SETTINGS} from './settings'
import {runDb} from "./db/mongoDB";


const startApp = async () => {
    const res = await runDb(SETTINGS.MONGO_URL);
    if (!res) {
        console.error("❌ Failed to connect to MongoDB. Exiting...");
        process.exit(1);
    }
}

app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT)
})


startApp();