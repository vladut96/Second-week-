import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    // все хардкодные значения должны быть здесь, для удобства их изменения
    PORT: process.env.PORT || 3003,
    PATH: {
        TESTING: '/testing',
        POSTS: '/posts',
        BLOGS: '/blogs',
    },
    MONGO_URL: 'mongodb+srv://admin:admin@learning.7fe0l.mongodb.net/my-database?retryWrites=true&w=majority&appName=Learning',

}