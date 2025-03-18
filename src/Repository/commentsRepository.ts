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
    }
};
