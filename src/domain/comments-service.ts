import { commentsRepository } from "../Repository/commentsRepository";
import {CommentatorInfo, CommentViewModel} from "../types/types";

export const commentsService = {
    async getCommentById(commentId: string): Promise<CommentViewModel<CommentatorInfo> | null> {
        return await commentsRepository.getCommentById(commentId);
    },

    async updateComment(commentId: string, content: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const comment = await commentsRepository.getCommentById(commentId);
        if (!comment) {
            return { success: false, error: "Comment not found" };
        }
        if (comment.commentatorInfo.userId !== userId) {
            return { success: false, error: "Access denied" };
        }

        const updated = await commentsRepository.updateComment(commentId, content);
        if (!updated) {
            return { success: false, error: "Error updating comment" };
        }

        return { success: true };
    },
    async deleteComment(commentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const comment = await commentsRepository.getCommentById(commentId);
        if (!comment) {
            return { success: false, error: "Comment not found" };
        }
        if (comment.commentatorInfo.userId !== userId) {
            return { success: false, error: "Access denied" };
        }
        const deleted = await commentsRepository.deleteComment(commentId);
        if (!deleted) {
            return { success: false, error: "Error deleting comment" };
        }
        return { success: true };
    },
    async getCommentsByPostId({ postId, pageNumber, pageSize, sortBy,  sortDirection }: {
        postId: string;
        pageNumber: number;
        pageSize: number;
        sortBy: string;
        sortDirection: 1 | -1;
    }) {
        return await commentsRepository.getCommentsByPostId({
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        });
    },

    async createComment({ postId, content, userId, userLogin }: {
        postId: string;
        content: string;
        userId: string;
        userLogin: string;
    }) {
        return await commentsRepository.createComment({
            postId,
            content,
            userId,
            userLogin
        });
    }

};
