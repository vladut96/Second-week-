import {Router} from "express";
import {
    handleValidationErrors,
    paginationValidationRules,
    validateComment,
    validatePostInput
} from "../validation/express-validator";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {authenticateToken, authenticateTokenToGetID} from "../validation/authTokenMiddleware";
import {postsController} from "../composition-root";

export const postsRouter = Router();

postsRouter.get('/', paginationValidationRules, authenticateTokenToGetID, postsController.getPosts.bind(postsController) );
postsRouter.get('/:id',authenticateTokenToGetID, postsController.getPostsById.bind(postsController) );
postsRouter.post('/', basicAuthMiddleware, validatePostInput, handleValidationErrors, postsController.createPost.bind(postsController) );
postsRouter.put('/:id', basicAuthMiddleware, validatePostInput, handleValidationErrors, postsController.updatePost.bind(postsController) );
postsRouter.delete("/:id", basicAuthMiddleware, postsController.deletePostById.bind(postsController));
postsRouter.get("/:postId/comments", paginationValidationRules, authenticateTokenToGetID, postsController.getPostsComments.bind(postsController) );
postsRouter.post("/:postId/comments", authenticateToken, validateComment, handleValidationErrors, postsController.createPostsComments.bind(postsController) );
