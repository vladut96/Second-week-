import { req } from "./test-helpers";
import {runDb} from "../src/db/mongoDB";
import {config} from 'dotenv'
import {PostInputModel, PostViewModel} from "../src/types/types";
import {createdBlog} from "./blogs-small-tests.e2e.test";
config()


let createdPost: PostViewModel;

describe('/posts', () => {
    beforeAll(async () => {
        await runDb(process.env.MONGO_URL!);
        ///const blogsCollection = getBlogsCollection();
        ///await blogsCollection.deleteMany({});
       // await req.delete('/testing/all-data');
    });
    it('Should create a post with valid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newPost: PostInputModel = {
            title: 'Test Post',
            shortDescription: 'This is a correct test post description.',
            content: 'A valid post content.',
            blogId: createdBlog.id
        };

        const res = await req
            .post('/posts')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newPost)
            .expect(201)

        createdPost = res.body;
    })
    it('Should create a post with valid data 2 post', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newPost: PostInputModel = {
            title: 'Test Post2',
            shortDescription: 'This is a correct test post description 2.',
            content: 'A valid post content 2.',
            blogId: createdBlog.id
        };

        const res = await req
            .post('/posts')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newPost)
            .expect(201)
    })
    it('should NOT create a new post with invalid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newBlog = {
            title: 'Too Long Name!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            shortDescription: '',
            content: '',
            blogId: createdBlog.id
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newBlog)
            .expect(400);
        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: 'title',
                },
                {
                    message: expect.any(String),
                    field: 'shortDescription',
                },
                {
                    message: expect.any(String),
                    field: 'content',
                },
            ],
        });
    });
    it('should return blogs with paging, sorting, and filtering', async () => {
        const pageNumber = 1; // Page number
        const pageSize = 1; // Page size
        const sortBy = 'createdAt'; // Sort by createdAt
        const sortDirection = 'asc'; // Sort direction

        const res = await req
            .get('/posts')
            .query({
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
            })
            .expect(200);

        expect(res.body).toMatchObject({
            pagesCount: 1, // Ожидаемое количество страниц
            page: 1, // Ожидаемая текущая страница
            pageSize: 1, // Ожидаемый размер страницы
            totalCount: 2, // Ожидаемое общее количество блогов
            items: expect.any(Array), // Массив блогов (проверяем только тип)
        });

        if (res.body.items.length > 0) {
            const post = res.body.items[0];
            expect(post).toMatchObject({
                id: createdPost.id,
                title: createdPost.title,
                shortDescription: createdPost.shortDescription,
                content: createdPost.content,
                blogId: createdPost.blogId,
                blogName: createdPost.blogName,
                createdAt: createdPost.createdAt,
            });
        }
    });





});