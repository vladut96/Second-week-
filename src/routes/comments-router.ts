import { Router, Request, Response } from "express";
import { commentsService } from "../domain/comments-service";
import {validateComment, handleValidationErrors, validateAuthInput} from "../validation/express-validator";
import {authenticateToken} from "../validation/authTokenMiddleware";

export const commentsRouter = Router();

commentsRouter.get("/:commentId", async (req: Request, res: Response) => {
    const comment = await commentsService.getCommentById(req.params.commentId);

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    return res.status(200).json(comment);
});
commentsRouter.put("/:commentId", authenticateToken, validateComment, handleValidationErrors, async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const result = await commentsService.updateComment(commentId, content, userId);

    if (!result.success) {
        if (result.error) return res.sendStatus(404);
        if (result.error) return res.sendStatus(403);
    }

    return res.sendStatus(204);
});
commentsRouter.delete("/:commentId", authenticateToken, async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    const result = await commentsService.deleteComment(commentId, userId);

    if (!result.success) {
        if (result.error) return res.sendStatus(404);
        if (result.error) return res.sendStatus(403);
    }
    return res.sendStatus(204);
});
