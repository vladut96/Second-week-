import express from 'express'
import cors from 'cors'
import {SETTINGS} from "./settings";
import postsRouter from "./routes/posts-router";
import blogsRouter from "./routes/blogs-router";

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body и query во всех реквестах
app.use(cors()) // разрешить любым фронтам делать запросы на наш бэк

app.get('/', (req, res) => {
    res.status(200).json({version: '1.0'})
})

app.use('/posts', postsRouter);
app.use('/blogs', blogsRouter);

