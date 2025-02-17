import {req} from './test-helpers'
import {SETTINGS} from '../src/settings'

import posts from "../src/routes/posts-router";

describe('/posts', () => {
     beforeAll(async () => {

     })
    it('should get empty array', async () => {

        const res = await req
            .get('/posts')
            .expect(200)
        expect(res.body.length).toBe(0);;
    })
    it('should create a new post', async () => {
        const newPost = {
            title: 'Test Post',
            shortDescription: 'Short description for test post',
            content: 'This is a test content',
            blogId: '123' // Replace with an actual blog ID if needed
        };

        const res = await req
            .post('/posts')
            .send(newPost)
            .expect(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(newPost.title);
        expect(res.body.shortDescription).toBe(newPost.shortDescription);
        expect(res.body.content).toBe(newPost.content);
        expect(res.body.blogId).toBe(newPost.blogId);
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await req
            .post('/posts')
            .send({}) // Sending an empty object
            .expect(400);

        expect(res.body).toHaveProperty('error');
    });
})


