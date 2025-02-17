import { v4 as uuidv4 } from 'uuid';
import {db} from "../db/db";
import { PostInputModel, PostViewModel} from "../types/types";

export const postsRepository = {
    getPostById(postId: string) {
            return db.posts.find(p => p.id === postId) || null;
    },
    createPost({ title, shortDescription, content, blogId } : PostInputModel){
        const blogger = db.blogs.find(blogger => blogger.id === blogId);

        const newPost = {
            id: uuidv4(),
            title,
            shortDescription,
            content,
            blogId ,
            // @ts-ignore
            blogName : blogger.name,
        };
        // @ts-ignore
        db.posts.push(newPost);
        return newPost;
    }, updatePost(id: string, updateData: PostInputModel): boolean {
        const postIndex = db.posts.findIndex(b => b.id === id);

        if (postIndex === -1) {
            return false;
        }


        db.posts[postIndex] = {
            ...db.posts[postIndex],
            ...updateData
        };
        return true;
    },
    deletePostById(postId: string): boolean {
        const postIndex = db.posts.findIndex(p => p.id === postId);

        if (postIndex === -1) {
            return false;
        }

        db.posts.splice(postIndex, 1);
        return true;
    }
};
