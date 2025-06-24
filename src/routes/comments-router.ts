import { Router } from "express";
import {validateComment, handleValidationErrors} from "../validation/express-validator";
import {authenticateToken} from "../validation/authTokenMiddleware";
import {commentsController} from "../composition-root";

export const commentsRouter = Router();

commentsRouter.get("/:commentId", commentsController.getCommentById.bind(commentsController) );
commentsRouter.put("/:commentId", authenticateToken, validateComment, handleValidationErrors, commentsController.updateComment.bind(commentsController) );
commentsRouter.delete("/:commentId", authenticateToken, commentsController.deleteComment.bind(commentsController) );
