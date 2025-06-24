import {Router} from "express";
import {handleValidationErrors, validateComment, validatePostInput} from "../validation/express-validator";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {authenticateToken} from "../validation/authTokenMiddleware";
import {postsController} from "../composition-root";

export const postsRouter = Router();

postsRouter.get("/:postId/comments", postsController.getPostsComments.bind(postsController) );
postsRouter.post("/:postId/comments", authenticateToken, validateComment, handleValidationErrors, postsController.createPostsComments.bind(postsController) );
postsRouter.get('/', postsController.getPosts.bind(postsController) );
postsRouter.get('/:id', postsController.getPostsById.bind(postsController) );
postsRouter.post('/', basicAuthMiddleware, validatePostInput, handleValidationErrors, postsController.createPost.bind(postsController) );
postsRouter.put('/:id', basicAuthMiddleware, validatePostInput, handleValidationErrors, postsController.updatePost.bind(postsController) );
postsRouter.delete("/:id", basicAuthMiddleware, postsController.deletePostById.bind(postsController));
