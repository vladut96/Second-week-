import { Router } from "express";
import {validateComment, handleValidationErrors, likeStatusValidation} from "../validation/express-validator";
import {authenticateToken, authenticateTokenToGetID} from "../validation/authTokenMiddleware";
import {commentsController} from "../composition-root";

export const commentsRouter = Router();

commentsRouter.get("/:commentId", authenticateTokenToGetID, commentsController.getCommentById.bind(commentsController) );
commentsRouter.put("/:commentId", authenticateToken, validateComment, handleValidationErrors, commentsController.updateComment.bind(commentsController) );
commentsRouter.put("/:commentId/like-status", authenticateToken, likeStatusValidation, handleValidationErrors, commentsController.updateLikeStatus.bind(commentsController));
commentsRouter.delete("/:commentId", authenticateToken, commentsController.deleteComment.bind(commentsController) );

