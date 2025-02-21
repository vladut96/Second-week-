import {req} from './test-helpers'
import { runDb, postsCollection, blogsCollection } from "../src/db/mongoDB";
import { v4 as uuidv4 } from 'uuid';
import {SETTINGS} from "../src/settings";

const BASIC_AUTH = 'Basic YWRtaW46cXdlcnR5'; // Base64 encoded 'admin:qwerty'

describe('/posts', () => {
    beforeAll(async () => {
        const isConnected = await runDb(SETTINGS.MONGO_URL!);
        if (!isConnected) {
            throw new Error("Failed to connect to MongoDB in tests.");
        }
        await postsCollection.deleteMany({});
    });

    describe('GET /posts', () => {
        it('should return empty array when no posts exist', async () => {
            const res = await req
                .get('/posts')
                .expect(200);

            expect(res.body).toEqual([]);
        });

        it('should return all posts', async () => {
            // Create test blog first
            const blog = await blogsCollection.insertOne({
                name: 'Test Blog',
                description: 'Test Description',
                websiteUrl: 'https://test.com'
            });

            // Create test posts

            await postsCollection.insertMany([
                {   title: 'Post 1',
                    shortDescription: 'Desc 1',
                    content: 'Content 1',
                    // @ts-ignore
                    blogId: blog.insertedId,
                    blogName: 'Test Blog',
                    createdAt: new Date().toISOString()
                },
                {
                    id: uuidv4(),
                    title: 'Post 2',
                    shortDescription: 'Desc 2',
                    content: 'Content 2',
                    // @ts-ignore
                    blogId: blog.insertedId,
                    blogName: 'Test Blog',
                    createdAt: new Date().toISOString()
                }
            ]);

            const res = await req
                .get('/posts')
                .expect(200);

            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('shortDescription');
        });
    });

    describe('GET /posts/:id', () => {
        it('should return 404 for non-existent post', async () => {
            const res = await req
                .get(`/posts/${uuidv4()}`)
                .expect(404);
        });

        it('should return post by id', async () => {
            const blog = await blogsCollection.insertOne({
                name: 'Test Blog',
                description: 'Test Description',
                websiteUrl: 'https://test.com'
            });

            const post = await postsCollection.insertOne({
                title: 'Test Post',
                shortDescription: 'Test Description',
                content: 'Test Content',
                blogId: '',
                blogName: 'Test Blog',
                createdAt: ''
            });

            const res = await req
                .get(`/posts/${post.insertedId}`)
                .expect(200);

            expect(res.body).toHaveProperty('title', 'Test Post');
        });
    });

    describe('POST /posts', () => {
        it('should return 401 Unauthorized if no credentials are provided', async () => {
            const newPost = {
                title: 'Test Post',
                shortDescription: 'Test Description',
                content: 'Test Content',
                blogId: uuidv4()
            };

            const res = await req
                .post('/posts')
                .send(newPost)
                .expect(401);
        });

        it('should create new post with valid data', async () => {
            const blog = await blogsCollection.insertOne({
                name: 'Test Blog',
                description: 'Test Description',
                websiteUrl: 'https://test.com'
            });

            const newPost = {
                title: 'Test Post',
                shortDescription: 'Test Description',
                content: 'Test Content',
                blogId: blog.insertedId
            };

            const res = await req
                .post('/posts')
                .set('Authorization', BASIC_AUTH)
                .send(newPost)
                .expect(201);

            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('Test Post');
        });
    });

    describe('PUT /posts/:id', () => {
        it('should return 401 Unauthorized if no credentials are provided', async () => {
            const res = await req
                .put(`/posts/${uuidv4()}`)
                .send({})
                .expect(401);
        });

        it('should update existing post', async () => {
            const blog = await blogsCollection.insertOne({
                name: 'Test Blog',
                description: 'Test Description',
                websiteUrl: 'https://test.com'
            });

            const post = await postsCollection.insertOne({
                id: uuidv4(),
                title: 'Old Title',
                shortDescription: 'Old Description',
                content: 'Old Content',
                // @ts-ignore
                blogId: blog.insertedId,
                blogName: 'Test Blog',
                createdAt: new Date().toISOString()
            });

            const updatedData = {
                title: 'New Title',
                shortDescription: 'New Description',
                content: 'New Content',
                blogId: blog.insertedId
            };

            const res = await req
                .put(`/posts/${post.insertedId}`)
                .set('Authorization', BASIC_AUTH)
                .send(updatedData)
                .expect(204);

            const updatedPost = await postsCollection.findOne({ _id: post.insertedId });
            expect(updatedPost?.title).toBe('New Title');
        });
    });

    describe('DELETE /posts/:id', () => {
        it('should return 401 Unauthorized if no credentials are provided', async () => {
            const res = await req
                .delete(`/posts/${uuidv4()}`)
                .expect(401);
        });

        it('should delete existing post', async () => {
            const blog = await blogsCollection.insertOne({
                name: 'Test Blog',
                description: 'Test Description',
                websiteUrl: 'https://test.com'
            });

            const post = await postsCollection.insertOne({
                id: uuidv4(),
                title: 'Test Post',
                shortDescription: 'Test Description',
                content: 'Test Content',
                // @ts-ignore
                blogId: blog.insertedId,
                blogName: 'Test Blog',
                createdAt: new Date().toISOString()
            });

            const res = await req
                .delete(`/posts/${post.insertedId}`)
                .set('Authorization', BASIC_AUTH)
                .expect(204);

            const deletedPost = await postsCollection.findOne({ _id: post.insertedId });
            expect(deletedPost).toBeNull();
        });
    });
});


