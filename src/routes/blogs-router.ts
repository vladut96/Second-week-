import {Router} from "express";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {
    handleValidationErrors,
    paginationValidationRules,
    validateBlogInput,
    validatePostInput
} from "../validation/express-validator";

import {blogsController} from "../composition-root";
import {authenticateTokenToGetID} from "../validation/authTokenMiddleware";

export const blogsRouter = Router();

blogsRouter.get('/', paginationValidationRules, blogsController.getBlogs.bind(blogsController) );
blogsRouter.get('/:id', paginationValidationRules, authenticateTokenToGetID, blogsController.getBlogsById.bind(blogsController));
blogsRouter.get('/:blogId/posts', paginationValidationRules, authenticateTokenToGetID, blogsController.getPostsByBlogId.bind(blogsController));
blogsRouter.post('/', basicAuthMiddleware, validateBlogInput, handleValidationErrors, blogsController.createBlog.bind(blogsController) );
blogsRouter.post('/:blogId/posts', basicAuthMiddleware, validatePostInput, handleValidationErrors, blogsController.createPostByBlogId.bind(blogsController));
blogsRouter.put('/:id', basicAuthMiddleware, validateBlogInput, handleValidationErrors, blogsController.updateBlog.bind(blogsController));
blogsRouter.delete("/:id", basicAuthMiddleware, blogsController.deleteBlogById.bind(blogsController) );