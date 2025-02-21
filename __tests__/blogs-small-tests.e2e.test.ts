import {req} from './test-helpers'
import {blogsCollection, runDb} from "../src/db/mongoDB";
import {SETTINGS} from "../src/settings";


describe('/blogs', () => {
    beforeAll(async () => {
        const isConnected = await runDb(SETTINGS.MONGO_URL!);
        if (!isConnected) {
            throw new Error("Failed to connect to MongoDB in tests.");
        }
       await runDb(SETTINGS.MONGO_URL);
       await blogsCollection.deleteMany();
   });
    it('should return 401 Unauthorized if no credentials are provided', async () => {
        const newPost = {
            name: 'Test',
            description: 'Short description for test!!!!!!!!!!!!!',
            websiteUrl: 'https://chatgpt.com/c/67af9a91-2630-8006-ad26-f2fe4735a9e6',
        };

        const res = await req
            .post('/blogs')
            .send(newPost)
            .expect(401);

        expect(res.body).toEqual({ message: 'Unauthorized' });
    });
    });