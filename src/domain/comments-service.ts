import { commentsRepository } from "../Repository/commentsRepository";
import {CommentatorInfo, CommentViewModel} from "../types/types";

export const commentsService = {
    async getCommentById(commentId: string): Promise<CommentViewModel<CommentatorInfo> | null> {
        return await commentsRepository.getCommentById(commentId);
    },

    async updateComment(commentId: string, content: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const comment = await commentsRepository.getCommentById(commentId);
        if (!comment) {
            return { success: false };
        }

        if (comment.commentatorInfo.userId !== userId) {
            return { success: false };
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
            return { success: false };
        }

        if (comment.commentatorInfo.userId ) {
            return { success: false, error: "You can only delete your own comment" };
        }

        const deleted = await commentsRepository.deleteComment(commentId);
        if (!deleted) {
            return { success: false };
        }

        return { success: true };
    }
};
