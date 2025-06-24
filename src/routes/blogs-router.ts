import {Router} from "express";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {handleValidationErrors, validateBlogInput, validatePostInput} from "../validation/express-validator";

import {blogsController} from "../composition-root";

export const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController) );
blogsRouter.get('/:id', blogsController.getBlogsById.bind(blogsController));
blogsRouter.get('/:blogId/posts', blogsController.getPostsByBlogId.bind(blogsController));
blogsRouter.post('/', basicAuthMiddleware, validateBlogInput, handleValidationErrors, blogsController.createBlog.bind(blogsController) );
blogsRouter.post('/:blogId/posts', basicAuthMiddleware, validatePostInput, handleValidationErrors, blogsController.createPostByBlogId.bind(blogsController));
blogsRouter.put('/:id', basicAuthMiddleware, validateBlogInput, handleValidationErrors, blogsController.updateBlog.bind(blogsController));
blogsRouter.delete("/:id", basicAuthMiddleware, blogsController.deleteBlogById.bind(blogsController) );