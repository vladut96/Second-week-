import {config} from 'dotenv'
config()

export const SETTINGS = {
    PORT: process.env.PORT || 3003,
    PATH: {
        TESTING: '/testing',
        AUTH: '/auth',
        POSTS: '/posts',
        BLOGS: '/blogs',
        USERS: '/users',
        COMMENTS: '/comments',
        SECURITY: '/security',
    },
    }