import { v4 as uuidv4 } from 'uuid';
import {db} from "../db/db";
import {BlogInputModel, BlogViewModel, PostInputModel} from "../types/types";

export const blogsRepository = {
    getBlogs() {
        return db.blogs
    },
    getBlogById(blogId: string) {
    return db.blogs.find(b => b.id === blogId) || null;
},
createBlog({ name, description, websiteUrl} : BlogInputModel)
{
    const newBlog = {
        id: uuidv4(),
        name,
        description,
        websiteUrl
    };
    db.blogs.push(newBlog);
    return newBlog;
},
    updateBlog(id: string, updateData: BlogInputModel): boolean {
        const blogIndex = db.blogs.findIndex(b => b.id === id);

        if (blogIndex === -1) {
            return false;
        }

        db.blogs[blogIndex] = {
            ...db.blogs[blogIndex],
            ...updateData
        };
        return true;
    },
    deleteBlogById(postId: string): boolean {
        const blogIndex = db.blogs.findIndex(p => p.id === postId);

        if (blogIndex === -1) {
            return false;
        }

        db.blogs.splice(blogIndex, 1);
        return true;
    }
};