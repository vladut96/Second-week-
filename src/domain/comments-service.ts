import {CommentsRepository} from "../Repository/commentsRepository";
import {CommentViewModel, LikeStatus} from "../types/types";
import { injectable, inject } from 'inversify';

@injectable()
export class CommentsService{
    constructor(@inject(CommentsRepository) private commentsRepository: CommentsRepository) {
    }
    async getCommentById(commentId: string, currentUserId?: string): Promise<CommentViewModel | null> {
        return await this.commentsRepository.getCommentById(commentId, currentUserId);
    }
    async updateComment(commentId: string, content: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const comment = await this.commentsRepository.getCommentById(commentId, userId);
        if (!comment) {
            return { success: false, error: "Comment not found" };
        }
        if (comment.commentatorInfo.userId !== userId) {
            return { success: false, error: "Access denied" };
        }

        const updated = await this.commentsRepository.updateComment(commentId, content);
        if (!updated) {
            return { success: false, error: "Error updating comment" };
        }

        return { success: true };
    }
    async deleteComment(commentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const comment = await this.commentsRepository.getCommentById(commentId);
        if (!comment) {
            return { success: false, error: "Comment not found" };
        }
        if (comment.commentatorInfo.userId !== userId) {
            return { success: false, error: "Access denied" };
        }
        const deleted = await this.commentsRepository.deleteComment(commentId);
        if (!deleted) {
            return { success: false, error: "Error deleting comment" };
        }
        return { success: true };
    }
    async getCommentsByPostId({ postId, pageNumber, pageSize, sortBy,  sortDirection, currentUserId}: { postId: string; pageNumber: number; pageSize: number; sortBy: string; sortDirection: 1 | -1; currentUserId?: string }) {
        return await this.commentsRepository.getCommentsByPostId({
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            currentUserId
        });
    }
    async createComment( postId: string, content: string, userId: string, userLogin: string ) {
        return await this.commentsRepository.createComment(
            postId,
            content,
            userId,
            userLogin
        );
    }
    async updateLikeStatus( commentId: string, userId: string, likeStatus: LikeStatus ): Promise<{ success: boolean;}> {

        const updated = await this.commentsRepository.updateLikeStatus( commentId, userId, likeStatus );

        if (!updated) {
            return { success: false };
        }

        return { success: true };
    }
}

