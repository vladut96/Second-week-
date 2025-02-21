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

    it('should get empty array', async () => {
        const res = await req
            .get('/blogs')
            .expect(200);

        expect(res.body.length).toBe(0);
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

    it('should return 401 Unauthorized if invalid credentials are provided', async () => {
        const invalidCredentials = Buffer.from('wronguser:wrongpassword').toString('base64');

        const newPost = {
            name: 'Test',
            description: 'Short description for test!!!!!!!!!!!!!',
            websiteUrl: 'https://chatgpt.com/c/67af9a91-2630-8006-ad26-f2fe4735a9e6',
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${invalidCredentials}`)
            .send(newPost)
            .expect(401);

        expect(res.body).toEqual({});
    });

    it('should create a new blog if valid credentials are provided', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newPost = {
            name: 'Test',
            description: 'Short description for test!!!!!!!!!!!!!',
            websiteUrl: 'https://chatgpt.com/c/67af9a91-2630-8006-ad26-f2fe4735a9e6',
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newPost)
            .expect(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(newPost.name);
        expect(res.body.description).toBe(newPost.description);
        expect(res.body.websiteUrl).toBe(newPost.websiteUrl);
    });

    it('should return 400 if required fields are missing', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send({ name: 'Vladksjdbglkjsbhgxzvsdvsvdslkjasbnlkjs' })
            .expect(400);

        expect(res.body);
    });
});