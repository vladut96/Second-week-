import { v4 as uuidv4 } from 'uuid';
import {blogs, posts} from "../db/db";
import { PostInputModel, PostViewModel} from "../types/types";

export const postsRepository = {
    getPosts() {
        return posts
    },
        getPostById(postId: string) {
            return posts.find(p => p.id === postId) || null;
    },
    createPost({ title, shortDescription, content, blogId } : PostInputModel){
        const blogger = blogs.find(blogger => blogger.id === blogId);

        const newPost = {
            id: uuidv4(),
            title,
            shortDescription,
            content,
            blogId ,
            // @ts-ignore
            blogName : blogger.name,
        };
        posts.push(newPost);
        return newPost;
    }, updatePost(id: string, updateData: PostInputModel): boolean {
        const postIndex = blogs.findIndex(b => b.id === id);

        if (postIndex === -1) {
            return false;
        }

        blogs[postIndex] = {
            ...blogs[postIndex],
            ...updateData
        };
        return true;
    },
    deletePostById(postId: string): boolean {
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex === -1) {
            return false;
        }

        posts.splice(postIndex, 1);
        return true;
    }
};
