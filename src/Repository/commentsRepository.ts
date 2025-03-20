import { getCommentsCollection } from "../db/mongoDB";
import { ObjectId } from "mongodb";
import {CommentatorInfo, CommentViewModel} from "../types/types";

export const commentsRepository = {
    async getCommentById(commentId: string): Promise<CommentViewModel<CommentatorInfo> | null> {
        const comment = await getCommentsCollection().findOne({ _id: new ObjectId(commentId) });

        if (!comment) return null;

        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
        };
    },
    async updateComment(commentId: string, content: string): Promise<boolean> {
        const result = await getCommentsCollection().updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { content } }
        );

        return result.matchedCount > 0;
    },
    async deleteComment(commentId: string): Promise<boolean> {
        const result = await getCommentsCollection().deleteOne({ _id: new ObjectId(commentId) });
        return result.deletedCount > 0;
    },
    async getCommentsByPostId({ postId, pageNumber, pageSize, sortBy, sortDirection }: {
        postId: string;
        pageNumber: number;
        pageSize: number;
        sortBy: string;
        sortDirection: 1 | -1;
    }) {
        const filter = { postId };
        const totalCount = await getCommentsCollection().countDocuments(filter);

        const comments = await getCommentsCollection()
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: comments.map(comment => ({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt
            }))
        };
    },
    async createComment({ postId, content, userId, userLogin }: {
        postId: string;
        content: string;
        userId: string;
        userLogin: string;
    }) {
        const newComment : CommentViewModel<CommentatorInfo>  = {
            id : postId,
            content,
            commentatorInfo: {
                userId,
                userLogin
            },
            createdAt: new Date().toISOString()
        };
        const result = await getCommentsCollection().insertOne(newComment);
        return {
            id: result.insertedId.toString(),
            content: newComment.content,
            commentatorInfo: newComment.commentatorInfo,
            createdAt: newComment.createdAt
        };
    }
};
