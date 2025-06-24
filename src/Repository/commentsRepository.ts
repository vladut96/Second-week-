import { CommentModel } from "../db/models";
import { CommentatorInfo, CommentViewModel } from "../types/types";
import { Types } from "mongoose";
import {injectable} from "inversify";

@injectable()
export class CommentsRepository {
    async getCommentById(commentId: string): Promise<CommentViewModel<CommentatorInfo> | null> {
        if (!Types.ObjectId.isValid(commentId)) return null;

        const comment = await CommentModel.findById(commentId).lean();
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
    }

    async updateComment(commentId: string, content: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(commentId)) return false;

        const result = await CommentModel.updateOne(
            { _id: commentId },
            { $set: { content } }
        ).exec();

        return result.matchedCount > 0;
    }

    async deleteComment(commentId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(commentId)) return false;

        const result = await CommentModel.deleteOne({ _id: commentId }).exec();
        return result.deletedCount > 0;
    }

    async getCommentsByPostId({
                                  postId,
                                  pageNumber,
                                  pageSize,
                                  sortBy,
                                  sortDirection
                              }: {
        postId: string;
        pageNumber: number;
        pageSize: number;
        sortBy: string;
        sortDirection: 1 | -1;
    }) {
        const filter = { postId };
        const totalCount = await CommentModel.countDocuments(filter);

        const comments = await CommentModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

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
    }

    async createComment({
                            postId,
                            content,
                            userId,
                            userLogin
                        }: {
        postId: string;
        content: string;
        userId: string;
        userLogin: string;
    }) {
        const newComment = new CommentModel({
            postId,
            content,
            commentatorInfo: {
                userId,
                userLogin
            },
            createdAt: new Date().toISOString()
        });

        await newComment.save();

        return {
            id: newComment._id.toString(),
            content: newComment.content,
            commentatorInfo: newComment.commentatorInfo,
            createdAt: newComment.createdAt
        };
    }
}