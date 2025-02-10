import {req} from './test-helpers'
import videos from "../src/routes/video-router"
// import {dataset1} from './datasets'
import {SETTINGS} from '../src/settings'

describe('/videos', () => {
     beforeAll(async () => {
    //     videos.length = 0;
     })

    it('should get empty array', async () => {

        const res = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(200)
        console.log(res.body) // можно посмотреть ответ эндпоинта
        //expect(res.body.length).toBe(0) // проверяем ответ эндпоинта
    })

})


