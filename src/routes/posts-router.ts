import {Request, Response, Router} from "express";
import {handleValidationErrors, validateComment, validatePostInput} from "../validation/express-validator";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {postsQueryService, postsService} from "../domain/posts-service";
import {commentsService} from "../domain/comments-service";
import {authenticateToken} from "../validation/authTokenMiddleware";
export const postsRouter = Router();

postsRouter.get("/:postId/comments",authenticateToken, async (req, res) => {
    const { postId } = req.params;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    const postExists = await postsQueryService.getPostById(postId);
    if (!postExists) {
        return res.sendStatus(404);
    }
    const comments = await commentsService.getCommentsByPostId({
        postId,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection
    });
    return res.status(200).json(comments);

});
postsRouter.post("/:postId/comments", authenticateToken, validateComment, handleValidationErrors, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;
    const userLogin = req.user!.login;

    const postExists = await postsQueryService.getPostById(postId);
    if (!postExists) {
        return res.sendStatus(404);
    }
    const newComment = await commentsService.createComment({
        postId,
        content,
        userId,
        userLogin
    });
    return res.status(201).json(newComment);
});
postsRouter.get('/', async (req: Request, res: Response) => {
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const posts = await postsQueryService.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    res.status(200).json(posts);
});
postsRouter.get('/:id', async (req: Request , res: Response) => {
    const postId = req.params.id;
    const foundPost = await postsQueryService.getPostById(postId);

    if (!foundPost) {
        return res.sendStatus(404);
    }
    return res.status(200).json(foundPost);
});
postsRouter.post('/:id', basicAuthMiddleware, validatePostInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;
    const newPost = await postsService.createPost(
        { title, shortDescription, content, blogId });
        return res.status(201).json(newPost);
});
postsRouter.put('/:id', basicAuthMiddleware, validatePostInput, handleValidationErrors, async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, shortDescription, content, blogId } = req.body;
        const isUpdated = await postsService.updatePost(id, {
            title,
            shortDescription,
            content,
            blogId
        });
        if (!isUpdated) {
            return res.status(404).json({ message: 'Blog not found' }); // Preserve original message
        }
        return res.sendStatus(204);
    });
postsRouter.delete("/:id", basicAuthMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.id;
    const isDeleted = await postsService.deletePostById(postId);
    if (!isDeleted) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
});
