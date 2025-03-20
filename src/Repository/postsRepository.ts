import {IPostsQueryRepository, PostData, PostInputModel, PostViewModel} from "../types/types";
import { getPostsCollection } from "../db/mongoDB";
import {ObjectId} from "mongodb";

const mapToViewModel = (post: any): PostViewModel => {
    return {
        id: post._id.toString(), // ✅ Convert `_id` to string
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
    };
};
interface IPostsRepository {
    createPost(data: {
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
    }): Promise<PostViewModel>;

    updatePost(id: string, data: PostInputModel): Promise<boolean>;

    deletePostById(id: string): Promise<boolean>;
}

export const postsRepository: IPostsRepository = {
    async createPost(postData: PostData): Promise<PostViewModel> {
        const { title, shortDescription, content, blogId, blogName } = postData;

        const newPost = {
            title,
            shortDescription,
            content,
            blogId: blogId,
            blogName: blogName!,
            createdAt: new Date().toString(),
        };

        const result = await getPostsCollection().insertOne(newPost);
        return mapToViewModel({ ...newPost, _id: result.insertedId });
    },

    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        const result = await getPostsCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result.matchedCount > 0;
    },

    async deletePostById(postId: string): Promise<boolean> {
        const result = await getPostsCollection().deleteOne({ _id: new ObjectId(postId) });
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
        const post = await getPostsCollection().findOne({ _id: new ObjectId(postId) });
        return post ? mapToViewModel(post) : null;
    },

    async getPostsByBlogId(blogId: string, sortBy: string, sortDirection: 1 | -1, skip: number, limit: number) {
        const posts = await getPostsCollection()
            .find({ _id: new ObjectId(blogId) })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        return posts.map(mapToViewModel);
    },

    async getTotalPostsCountByBlogId(blogId: string) {
        return await getPostsCollection().countDocuments({ _id: new ObjectId(blogId) });
    },
};