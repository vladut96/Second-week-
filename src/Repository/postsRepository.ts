import { v4 as uuidv4 } from 'uuid';
import { PostInputModel, PostViewModel} from "../types/types";
import { getBlogsCollection, getPostsCollection } from "../db/mongoDB";

const mapToViewModel = (post: any): PostViewModel => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString()
    };
};
interface IPostsRepository {
    createPost(data: PostInputModel): Promise<PostViewModel>;
    updatePost(id: string, data: PostInputModel): Promise<boolean>;
    deletePostById(id: string): Promise<boolean>;
}
interface IPostsQueryRepository {
    getPosts(params: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: PostViewModel[];
    }>;
    getPostById(postId: string): Promise<PostViewModel | null>;
    getPostsByBlogId(
        blogId: string,
        sortBy: string,
        sortDirection: 1 | -1,
        skip: number,
        limit: number
    ): Promise<PostViewModel[]>;
    getTotalPostsCountByBlogId(blogId: string): Promise<number>;}


export const postsRepository: IPostsRepository = {
    async createPost({ title, shortDescription, content, blogId }) {
        const blog = await getBlogsCollection().findOne({ id: blogId });
        if (!blog) throw new Error('Not found');

        const newPost = {
            id: uuidv4(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: new Date()
        };

        await getPostsCollection().insertOne(newPost);
        return mapToViewModel(newPost);
    },
    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        const result = await getPostsCollection().updateOne(
            { id },
            { $set: updateData }
        );
        return result.matchedCount > 0;
    },
    async deletePostById(postId: string): Promise<boolean> {
        const result = await getPostsCollection().deleteOne({ id: postId });
        return result.deletedCount > 0;
    },
};
export const postsQueryRepository: IPostsQueryRepository = {
    async getPosts({ sortBy, sortDirection, pageNumber, pageSize }) {
        const skip = (pageNumber - 1) * pageSize;
        const limit = pageSize;

        const totalCount = await getPostsCollection().countDocuments({});

        const posts = await getPostsCollection()
            .find({})
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: posts.map(mapToViewModel),
        };
    },
    async getPostById(postId: string) {
        const post = await getPostsCollection().findOne({ id: postId });
        return post ? mapToViewModel(post) : null;
    },

    async getPostsByBlogId(blogId: string, sortBy: string, sortDirection: 1 | -1, skip: number, limit: number) {
        const posts = await getPostsCollection()
            .find({ blogId })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        return posts.map(mapToViewModel);
    },

    async getTotalPostsCountByBlogId(blogId: string) {
        return await getPostsCollection().countDocuments({ blogId });
    },
};