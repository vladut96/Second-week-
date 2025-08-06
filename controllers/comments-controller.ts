import {CommentsService} from "../src/domain/comments-service";
import {Request, Response} from "express";
import { injectable, inject } from 'inversify';

@injectable()
export class CommentsController {
    constructor(@inject(CommentsService) private commentsService: CommentsService) {
    }
    async getCommentById(req: Request, res: Response) {
        const comment = await this.commentsService.getCommentById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({message: "Comment not found"});
        }

        return res.status(200).json(comment);

    }
    async updateComment  (req: Request, res: Response) {
    const { commentId } = req.params;
const { content } = req.body;
const userId = req.user!.userId;

const result = await this.commentsService.updateComment(commentId, content, userId);

if (!result.success) {
    if (result.error === "Comment not found") return res.sendStatus(404);
    if (result.error === "Access denied") return res.sendStatus(403);
}

return res.sendStatus(204);
}
    async deleteComment  (req: Request, res: Response) {
    const { commentId } = req.params;
const userId = req.user!.userId;

const result = await this.commentsService.deleteComment(commentId, userId);

if (!result.success) {
    if (result.error === "Comment not found") return res.sendStatus(404);
    if (result.error === "Access denied") return res.sendStatus(403);
}
return res.sendStatus(204);
}
    async updateLikeStatus(req: Request, res: Response) {
        const  { commentId } = req.params;
        const  likeStatus  = req.body;
        const userId = req.user!.userId;

        const result = await this.commentsService.updateLikeStatus(
            commentId,
            userId,
            likeStatus
        );

        if (!result.success) {
           return res.sendStatus(404);
        }

        return res.sendStatus(204);
    }


}