import { v4 as uuidv4 } from 'uuid';
import {blogs, posts} from "../db/db";
import {BlogInputModel, BlogViewModel, PostInputModel} from "../types/types";

export const blogsRepository = {
    getBlogs() {
        return blogs
    },
    getBlogById(blogId: string) {
    return blogs.find(b => b.id === blogId) || null;
},
createBlog({ name, description, websiteUrl} : BlogInputModel)
{
    const newBlog = {
        id: uuidv4(),
        name,
        description,
        websiteUrl
    };
    blogs.push(newBlog);
    return newBlog;
},
    updateBlog(id: string, updateData: BlogInputModel): boolean {
        const blogIndex = blogs.findIndex(b => b.id === id);

        if (blogIndex === -1) {
            return false;
        }

        blogs[blogIndex] = {
            ...blogs[blogIndex],
            ...updateData
        };
        return true;
    },
    deleteBlogById(postId: string): boolean {
        const blogIndex = blogs.findIndex(p => p.id === postId);

        if (blogIndex === -1) {
            return false;
        }

        posts.splice(blogIndex, 1);
        return true;
    }
};