import { PostModel } from "../db/models";
import { PostData, PostInputModel, PostViewModel, Paginator } from "../types/types";
import { Types } from "mongoose";
import { injectable } from "inversify";

const mapToViewModel = (post: any): PostViewModel => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
    };
};

@injectable()
export class PostsRepository {
    async createPost(postData: PostData): Promise<PostViewModel> {
        const { title, shortDescription, content, blogId, blogName } = postData;

        const newPost = new PostModel({
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt: new Date().toISOString(),
        });

        await newPost.save();
        return mapToViewModel(newPost.toObject());
    }

    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;

        const result = await PostModel.updateOne(
            { _id: id },
            { $set: updateData }
        ).exec();

        return result.matchedCount > 0;
    }

    async deletePostById(postId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(postId)) return false;

        const result = await PostModel.deleteOne({ _id: postId }).exec();
        return result.deletedCount > 0;
    }
}

@injectable()
export class PostsQueryRepository {
    async getPosts({
                       sortBy,
                       sortDirection,
                       pageNumber,
                       pageSize
                   }: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<PostViewModel>> {
        const skip = (pageNumber - 1) * pageSize;
        const totalCount = await PostModel.countDocuments({});

        const posts = await PostModel
            .find({})
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .lean();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: posts.map(mapToViewModel),
        };
    }

    async getPostById(postId: string): Promise<PostViewModel | null> {
        if (!Types.ObjectId.isValid(postId)) return null;

        const post = await PostModel.findById(postId).lean();
        return post ? mapToViewModel(post) : null;
    }

    async getPostsByBlogId(
        blogId: string,
        sortBy: string,
        sortDirection: 1 | -1,
        skip: number,
        limit: number
    ): Promise<PostViewModel[]> {
        const posts = await PostModel
            .find({ blogId })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

        return posts.map(mapToViewModel);
    }

    async getTotalPostsCountByBlogId(blogId: string): Promise<number> {
        return PostModel.countDocuments({ blogId });
    }
}