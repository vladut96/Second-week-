import { req } from "./test-helpers";
import { runDb } from "../src/db/mongoDB";
import { config } from 'dotenv'
config()
import {BlogViewModel, PostInputModel, PostViewModel, UserViewModel} from "../src/types/types";
import * as cookieParser from 'set-cookie-parser';
// @ts-ignore
import jwt from "jsonwebtoken";

let createdBlog: BlogViewModel; /// first one
let createdBlogForTestingDelete: BlogViewModel; /// from 3rd
let createdPost: PostViewModel; /// first one
let createdPostForTestingDelete: PostViewModel; //from second
let createdUser:UserViewModel; /// first one
let createdUserForTestingDelete:UserViewModel; //from second
let accessToken:string;
let refreshToken :string;
let newAccessToken: string;
let newRefreshToken: string;

describe('/blogs', () => {
    beforeAll(async () => {
        await runDb(process.env.MONGO_URL!);
        ///const blogsCollection = getBlogsCollection();
        ///await blogsCollection.deleteMany({});
        await req.delete('/testing/all-data');
    });

    ///BLOGS
    it('POST should create a new blog with valid data 1', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newBlog = {
            name: 'Test Blog',
            description: 'This is a correct test blog description.',
            websiteUrl: 'https://testblog.com',
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newBlog)
            .expect(201);

        createdBlog = res.body; //to be saved for other tests

        expect(res.body).toMatchObject({
            id: expect.any(String),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
        });
    });
    it('POST should create a new blog with valid data 2', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newBlog = {
            name: 'Test Blog 2',
            description: 'This is a correct test blog description.',
            websiteUrl: 'https://testblog2.com',
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newBlog)
            .expect(201);

        expect(res.body).toMatchObject({
            id: expect.any(String),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
        });
    });
    it('POST should create a new blog with valid data 3', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newBlog = {
            name: 'Test Blog 3',
            description: 'This is a correct test blog description.',
            websiteUrl: 'https://testblog3.com',
        };

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newBlog)
            .expect(201);

        createdBlogForTestingDelete = res.body;

        expect(res.body).toMatchObject({
            id: expect.any(String),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
        });
    });
    it('POST should NOT create a new blog with invalid credentials', async () => {
        const notValidCredentials = Buffer.from('wrongLogin:wrongPassword').toString('base64');

        const newBlog = {
            name: 'Test with wrong login and password',
            description: 'This is a not correct test blog description.',
            websiteUrl: 'https://testblog.com',
        };

         await req
            .post('/blogs')
            .set('Authorization', `Basic ${notValidCredentials}`)
            .send(newBlog)
            .expect(401);
    });
    it('POST should NOT create a new blog with invalid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const res = await req
            .post('/blogs')
            .set('Authorization', `Basic ${validCredentials}`)
            .send({
                name: 'Vladyslav',
                description: '',
                websiteUrl: '',
            })
            .expect(400);
        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: 'description',
                },
                {
                    message: expect.any(String),
                    field: 'websiteUrl',
                },
            ],
        });
    });
    it('GET should return blogs with paging, sorting, and filtering', async () => {
        const searchNameTerm = 'Test'; // Search term for blog name
        const sortBy = 'createdAt'; // Sort by createdAt
        const sortDirection = 'asc'; // Sort direction
        const pageNumber = 2; // Page number
        const pageSize = 2; // Page size

        const res = await req
            .get('/blogs')
            .query({
                searchNameTerm,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
            })
            .expect(200);

        expect(res.body).toMatchObject({
            pagesCount: 2, // Ожидаемое количество страниц
            page: 2, // Ожидаемая текущая страница
            pageSize: 2, // Ожидаемый размер страницы
            totalCount: 3, // Ожидаемое общее количество блогов
            items: expect.any(Array), // Массив блогов (проверяем только тип)
        });

        // Verify the structure of each blog item
        if (res.body.items.length > 0) {
            const blog = res.body.items[0];
            expect(blog).toMatchObject({
                id: expect.any(String),
                name: 'Test Blog 3',
                description: 'This is a correct test blog description.',
                websiteUrl: 'https://testblog3.com',
                createdAt: expect.any(String),
                isMembership: false,
            });

            // Verify that the blog name contains the search term
            expect(blog.name).toContain(searchNameTerm);
        }

        // Verify paging
        expect(res.body.page).toBe(pageNumber);
        expect(res.body.pageSize).toBe(pageSize);
    });
    it('GET should return blogs with default parameters if no query parameters are provided', async () => {
        const res = await req
            .get('/blogs')
            .expect(200);

        // Verify the response structure
        expect(res.body).toMatchObject({
            pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            totalCount: expect.any(Number),
            items: expect.any(Array),
        });

        // Verify default paging
        expect(res.body.page).toBe(1); // Default pageNumber
        expect(res.body.totalCount).toBe(3);
        expect(res.body.pageSize).toBe(10); // Default pageSize
    });
    it('GET should return a blog by id', async () => {
        const getResponse = await req
            .get(`/blogs/${createdBlog.id}`)
            .expect(200);

        expect(getResponse.body).toEqual(createdBlog);
    });
    it('GET should return 404 if blog does not exist', async () => {
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        // Шаг 1: Делаем GET-запрос с несуществующим ID
        await req
            .get(`/blogs/${nonExistentId}`)
            .expect(404);
    });
    it('PUT should update a blog with valid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const updatedBlog = {
            name: 'Updated Name',
            description: 'This is an updated description.',
            websiteUrl: 'https://updatedblog.com',
        };

        await req
            .put(`/blogs/${createdBlog.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(updatedBlog)
            .expect(204);

        // Проверяем, что блог действительно обновлен
        const getResponse = await req
            .get(`/blogs/${createdBlog.id}`)
            .expect(200);

        expect(getResponse.body).toMatchObject({
            id: createdBlog.id,
            name: updatedBlog.name,
            description: updatedBlog.description,
            websiteUrl: updatedBlog.websiteUrl,
            createdAt: createdBlog.createdAt,
            isMembership: createdBlog.isMembership,
        });
    });
    it('PUT should return 400 if input data is invalid', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const invalidBlog = {
            name: '', // Пустое имя
            description: '', // Пустое описание
            websiteUrl: 'invalid-url', // Невалидный URL
        };

        const res = await req
            .put(`/blogs/${createdBlog.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(invalidBlog)
            .expect(400);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: 'name',
                },
                {
                    message: expect.any(String),
                    field: 'description',
                },
                {
                    message: expect.any(String),
                    field: 'websiteUrl',
                },
            ],
        });
    });
    it('PUT should return 404 if blog does not exist', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        const updatedBlog = {
            name: 'Updated Name',
            description: 'This is an updated description.',
            websiteUrl: 'https://updatedblog.com',
        };

        await req
            .put(`/blogs/${nonExistentId}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(updatedBlog)
            .expect(404);
    });
    it('PUT should return 401 if unauthorized', async () => {
        const updatedBlog = {
            name: 'Updated Name',
            description: 'This is an updated description.',
            websiteUrl: 'https://updatedblog.com',
        };

        await req
            .put(`/blogs/${createdBlog.id}`)
            .send(updatedBlog)
            .expect(401);
    });
    it('DELETE should delete a blog by id', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        // Удаляем блог
        await req
            .delete(`/blogs/${createdBlogForTestingDelete.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(204);

        // Проверяем, что блог действительно удален
        await req
            .get(`/blogs/${createdBlogForTestingDelete.id}`)
            .expect(404);
    });
    it('DELETE should return 404 if blog does not exist', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        // Пытаемся удалить несуществующий блог
        await req
            .delete(`/blogs/${nonExistentId}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(404);
    });
    it('DELETE should return 401 if unauthorized', async () => {
        // Пытаемся удалить блог без авторизации
        await req
            .delete(`/blogs/${createdBlogForTestingDelete.id}`)
            .expect(401);
    });
   ///POSTS
    it('POST Should create a post with valid data', async () => {
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
    it('POST Should create a post with valid data 2 post', async () => {
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
        createdPostForTestingDelete = res.body;
    })
    it('POST should NOT create a new post with invalid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newBlog = {
            title: 'Too Long Name!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            shortDescription: '',
            content: '',
            blogId: createdBlog.id
        };

        const res = await req
            .post('/posts')
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
    it('GET should return posts with paging, sorting, and filtering', async () => {
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
            pagesCount: 2, // Ожидаемое количество страниц
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
    it('GET should return a post by id', async () => {
        // Предположим, что `createdPost` — это объект, созданный ранее (например, через POST-запрос)
        const getResponse = await req
            .get(`/posts/${createdPost.id}`) // Используем ID существующего поста
            .expect(200);

        // Проверяем, что ответ соответствует ожидаемому посту
        expect(getResponse.body).toEqual(createdPost);
    });
    it('GET should return 404 if post does not exist', async () => {
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        // Делаем GET-запрос с несуществующим ID
        await req
            .get(`/posts/${nonExistentId}`)
            .expect(404);
    });
    it('PUT should update a post with valid data', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const updatedPost = {
            title: 'Updated Title',
            shortDescription: 'This is an updated short description.',
            content: 'This is updated content.',
            blogId: createdBlog.id
        };

        await req
            .put(`/posts/${createdPost.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(updatedPost)
            .expect(204);

        // Проверяем, что пост действительно обновлен
        const getResponse = await req
            .get(`/posts/${createdPost.id}`)
            .expect(200);

        expect(getResponse.body).toMatchObject({
            id: createdPost.id,
            title: updatedPost.title,
            shortDescription: updatedPost.shortDescription,
            content: updatedPost.content,
            blogId: updatedPost.blogId,
            blogName: createdPost.blogName,
            createdAt: createdPost.createdAt,
        });
    });
    it('PUT should return 400 if input data is invalid', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const invalidPost = {
            title: '', // Пустой заголовок
            shortDescription: '', // Пустое краткое описание
            content: '', // Пустое содержание
            blogId: '', // Пустой blogId
        };

        const res = await req
            .put(`/posts/${createdPost.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(invalidPost)
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
                {
                    message: expect.any(String),
                    field: 'blogId',
                },
            ],
        });
    });
    it('PUT should return 404 if post does not exist', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        const updatedPost = {
            title: 'Updated Title',
            shortDescription: 'This is an updated short description.',
            content: 'This is updated content.',
            blogId: 'someBlogId', // Укажите существующий blogId
        };

        await req
            .put(`/posts/${nonExistentId}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .send(updatedPost)
            .expect(404);
    });
    it('PUT should return 401 if unauthorized', async () => {
        const updatedPost = {
            title: 'Updated Title',
            shortDescription: 'This is an updated short description.',
            content: 'This is updated content.',
            blogId: 'someBlogId', // Укажите существующий blogId
        };

        await req
            .put(`/posts/${createdPost.id}`)
            .send(updatedPost)
            .expect(401);
    });
    it('DELETE should delete a post by id', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        // Удаляем пост
        await req
            .delete(`/posts/${createdPostForTestingDelete.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(204);

        // Проверяем, что пост действительно удален
        await req
            .get(`/posts/${createdPostForTestingDelete.id}`)
            .expect(404);
    });
    it('DELETE should return 404 if post does not exist', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        // Пытаемся удалить несуществующий пост
        await req
            .delete(`/posts/${nonExistentId}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(404);
    });
    it('DELETE should return 401 if unauthorized', async () => {
        // Пытаемся удалить пост без авторизации
        await req
            .delete(`/posts/${createdPostForTestingDelete.id}`)
            .expect(401);
    });
    ///USERS
    it('POST should create a new user with valid data 1', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newUser = {
            login: 'User',
            password: 'Password',
            email: 'user@example.com',
        };

        const res = await req
            .post('/users')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newUser)
            .expect(201);

        createdUser = res.body;

        expect(res.body).toMatchObject({
            id: expect.any(String),
            login: newUser.login,
            email: newUser.email,
            createdAt: expect.any(String),
        });
    });
    it('POST should create a new user with valid data 2', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const newUser = {
            login: 'User_2',
            password: 'OtherPassword',
            email: 'newuser@example.com',
        };

        const res = await req
            .post('/users')
            .set('Authorization', `Basic ${validCredentials}`)
            .send(newUser)
            .expect(201);

        createdUserForTestingDelete = res.body;
    });
    it('POST should return 401 with wrong credentials', async () => {
        const notValidCredentials = Buffer.from('wronglogin:wrongpassword').toString('base64');

        const newUser = {
            login: 'User Wrong Authorization Login and Password',
            password: 'Password',
            email: 'newuser@example.com',
        };

        await req
            .post('/users')
            .set('Authorization', `Basic ${notValidCredentials}`)
            .send(newUser)
            .expect(401);

    });
    it('POST should return 400 if input data is invalid', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        // Создаем пользователя с валидными данными, чтобы проверить уникальность
        const userForTest = {
            login: 'на русском',
            password: '123',
            email: createdUser.id,
        };

            const res = await req
                .post('/users')
                .set('Authorization', `Basic ${validCredentials}`)
                .send(userForTest)
                .expect(400);

            expect(res.body).toEqual({
                errorsMessages: expect.arrayContaining([
                    {
                        message: expect.any(String),
                        field: 'login',
                    },
                    {
                        message: expect.any(String),
                        field: 'password',
                    },
                    {
                        message: expect.any(String),
                        field: 'email',
                    },
                ]),
            });

    });
    it('GET should return users with paging, sorting, and filtering', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        const searchLoginTerm = 'User'; // Поиск по логину
        const searchEmailTerm = 'example'; // Поиск по email
        const sortBy = 'createdAt'; // Сортировка по createdAt
        const sortDirection = 'asc'; // Направление сортировки
        const pageNumber = 1; // Номер страницы
        const pageSize = 1; // Размер страницы

        const res = await req
            .get('/users')
            .set('Authorization', `Basic ${validCredentials}`)
            .query({
                searchLoginTerm,
                searchEmailTerm,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
            })
            .expect(200);

        expect(res.body).toMatchObject({
            pagesCount: 2, // Ожидаемое количество страниц
            page: pageNumber, // Ожидаемая текущая страница
            pageSize: pageSize, // Ожидаемый размер страницы
            totalCount: 2, // Ожидаемое общее количество пользователей
            items: expect.any(Array), // Массив пользователей (проверяем только тип)
        });

        if (res.body.items.length > 0) {
            const user = res.body.items[0];
            expect(user).toMatchObject({
                id: createdUser.id,
                login: createdUser.login,
                email: createdUser.email,
                createdAt: createdUser.createdAt,
            });

            // Проверяем, что логин и email содержат поисковые термины
            expect(user.login).toContain(searchLoginTerm);
            expect(user.email).toContain(searchEmailTerm);
        }
    });
    it('GET should return 401 with wrong credentials', async () => {
        const notValidCredentials = Buffer.from('wronglogin:wrongpassword').toString('base64');

        await req
            .get('/users')
            .set('Authorization', `Basic ${notValidCredentials}`)
            .expect(401);
    });
    it('DELETE should delete a user by id', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');

        // Удаляем пользователя
        await req
            .delete(`/users/${createdUserForTestingDelete.id}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(204);

        // Проверяем, что пользователь действительно удален
        await req
            .get(`/users/${createdUserForTestingDelete.id}`)
            .expect(404);
    });
    it('DELETE should return 404 if user does not exist', async () => {
        const validCredentials = Buffer.from('admin:qwerty').toString('base64');
        const nonExistentId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        // Пытаемся удалить несуществующего пользователя
        await req
            .delete(`/hometask_06/api/users/${nonExistentId}`)
            .set('Authorization', `Basic ${validCredentials}`)
            .expect(404);
    });
    it('DELETE should return 401 if unauthorized', async () => {
        await req
            .delete(`/users/${createdUserForTestingDelete.id}`)
            .expect(401);
    });
    ///AUTH
    it('POST /auth/login should return JWT-token for valid credentials', async () => {
        const loginData = {
            loginOrEmail: 'user@example.com', // Можно использовать login или email
            password: 'Password',
        };

        const res = await req
            .post('/auth/login')
            .send(loginData)
            .expect(200);

        expect(res.body).toMatchObject({
            accessToken: expect.any(String), // Проверяем, что токен возвращается
        });

        accessToken = res.body.accessToken;
    });
    it('POST /auth/login should return 400 if input data is invalid', async () => {
        const invalidLoginData = {
            loginOrEmail: '', // Пустое поле
            password: '', // Пустое поле
        };

        const res = await req
            .post('/auth/login')
            .send(invalidLoginData)
            .expect(400);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: 'loginOrEmail',
                },
                {
                    message: expect.any(String),
                    field: 'password',
                },
            ],
        });
    });
    it('POST /auth/login should return 401 if login or password is wrong', async () => {
        const wrongLoginData = {
            loginOrEmail: 'User',
            password: 'WrongPassword', // Неправильный пароль
        };

        await req
            .post('/auth/login')
            .send(wrongLoginData)
            .expect(401);
    });
    it('GET /auth/me should return current user info', async () => {
        const res = await req
            .get('/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body).toMatchObject({
            email: createdUser.email,
            login: createdUser.login,
            userId: createdUser.id,
        });
    });
    it('GET /auth/me should return 401 if unauthorized', async () => {
        await req
            .get('/auth/me')
            .expect(401);
    });
    ///COMMENTS
    it('GET /posts/{postId}/comments should return comments for specified post', async () => {
        const res = await req
            .get(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body).toMatchObject({
            pagesCount: expect.any(Number), // Ожидаемое количество страниц
            page: 1, // Ожидаемая текущая страница
            pageSize: 10, // Ожидаемый размер страницы
            totalCount: expect.any(Number), // Ожидаемое общее количество комментариев
            items: expect.any(Array), // Массив комментариев (проверяем только тип)
        });
        // Проверяем структуру каждого комментария
        if (res.body.items.length > 0) {
            const comment = res.body.items[0];
            expect(comment).toMatchObject({
                id: expect.any(String),
                content: expect.any(String),
                commentatorInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String),
                },
                createdAt: expect.any(String),
            });
        }
    });
    it('GET /posts/{postId}/comments should return 404 if post does not exist', async () => {
        const nonExistentPostId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        await req
            .get(`/posts/${nonExistentPostId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
    });
    it('POST /posts/{postId}/comments should create a new comment', async () => {
        const newComment = {
            content: 'This is a new valid comment with more than 20 characters.',
        };

        const res = await req
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newComment)
            .expect(201);

        expect(res.body).toMatchObject({
            id: expect.any(String),
            content: newComment.content,
            commentatorInfo: {
                userId: expect.any(String),
                userLogin: expect.any(String),
            },
            createdAt: expect.any(String),
        });
    });
    it('POST /posts/{postId}/comments should return 400 if input data is invalid', async () => {
        const invalidComment = {
            content: 'Short', // Меньше 20 символов
        };

        const res = await req
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment)
            .expect(400);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: 'content',
                },
            ],
        });
    });
    it('POST /posts/{postId}/comments should return 404 if post does not exist', async () => {
        const nonExistentPostId = '65daefff8a010632444e3d0d'; // Несуществующий ID

        const newComment = {
            content: 'This is a new valid comment with more than 20 characters.',
        };

        await req
            .post(`/posts/${nonExistentPostId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newComment)
            .expect(404);
    });
    it('POST /posts/{postId}/comments should return 401 if unauthorized', async () => {
        const newComment = {
            content: 'This is a new valid comment with more than 20 characters.',
        };

        await req
            .post(`/posts/${createdPost.id}/comments`)
            .send(newComment)
            .expect(401);
    });
    ///AUTH
        it('POST /auth/login should return 200 and JWT tokens for valid credentials', async () => {

            const res = await req
                .post('/auth/login')
                .send({
                    loginOrEmail: createdUser.email,
                    password: 'Password'})
                .expect(200);

            const cookies = cookieParser.parse(res.headers['set-cookie']);

            // Находим refreshToken
            const refreshTokenCookie = cookies.find(c => c.name === 'refreshToken');
            expect(refreshTokenCookie).toBeDefined();

            // Сохраняем токен
            refreshToken = refreshTokenCookie!.value;
            expect(refreshToken).toBeDefined();
        });
        it('POST /auth/login  should return 400 for invalid input data', async () => {
            const invalidCredentials = {
                loginOrEmail: createdUser.email,
                password: 'short' // Слишком короткий пароль
            };

            const res = await req
                .post('/auth/login')
                .send(invalidCredentials)
                .expect(400);

            expect(res.body).toEqual({
                errorsMessages: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.any(String),
                        field: expect.stringMatching(/password/)
                    })
                ])
            });
        });
       /* it('POST /auth/login should return 401 for incorrect credentials', async () => {
            const wrongCredentials = {
                loginOrEmail: 'testuser',
                password: 'wrongpassword'
            };

            await req
                .post('/auth/login')
                .send(wrongCredentials)
                .expect(401);
        }); */

    it('should return 200 and new tokens with valid refresh token', async () => {
        const res = await req
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(200);

        // Verify new access token in response body
        expect(res.body).toHaveProperty('accessToken');
        newAccessToken = res.body.accessToken;

        // Verify new refresh token in cookies
        const cookies = cookieParser.parse(res.headers['set-cookie']);
        const refreshTokenCookie = cookies.find(c => c.name === 'refreshToken');
        expect(refreshTokenCookie).toBeDefined();
        newRefreshToken = refreshTokenCookie!.value;
        console.log(refreshToken);
        console.log(newRefreshToken);
        // Verify tokens are different from initial ones
        expect(newAccessToken).not.toBe(refreshToken);
        expect(newRefreshToken).not.toBe(refreshToken);

    });
    it('should return 401 when using old refresh token (should be revoked)', async () => {
        await req
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(401);
    });
    it('should return 401 when using invalid refresh token', async () => {
        await req
            .post('/auth/refresh-token')
            .set('Cookie', ['refreshToken=invalidtoken123'])
            .expect(401);
    });
    it('should return 401 when no refresh token provided', async () => {
        await req
            .post('/auth/refresh-token')
            .expect(401);
    });
    it('should return new tokens with proper expiration', async () => {
        const res = await req
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${newRefreshToken}`])
            .expect(200);

        // Verify access token expires in 10 seconds
        const accessTokenPayload = jwt.decode(res.body.accessToken) as { exp: number };
        const accessTokenExpiresIn = accessTokenPayload.exp - Math.floor(Date.now() / 1000);
        expect(accessTokenExpiresIn).toBeLessThanOrEqual(10);

        // Verify refresh token expires in 20 seconds
        const cookies = cookieParser.parse(res.headers['set-cookie']);
        const refreshTokenCookie = cookies.find(c => c.name === 'refreshToken')!;
        expect(refreshTokenCookie.maxAge).toBeLessThanOrEqual(20000);
    });
});




