import express from 'express'
import cors from 'cors'
import {SETTINGS} from "./settings";
import {postsRouter} from "./routes/posts-router";
import {blogsRouter} from "./routes/blogs-router";
import {testingRouter} from "./routes/testing-router";

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body и query во всех реквестах
app.use(cors()) // разрешить любым фронтам делать запросы на наш бэк

app.get('/', (req, res) => {
    res.status(200).json({version: '1.0'})
})

app.use(SETTINGS.PATH.TESTING, testingRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);


