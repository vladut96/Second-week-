import {app} from './app'
import {SETTINGS} from './settings'
import {videoRouter} from "./routes/video-router";






app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT)
})