import {Request, Response, Router} from "express";
import {handleValidationErrors, validatePostInput} from "../validation/express-validator";
import {postsRepository} from "../Repository/postsRepository";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
export const postsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const posts = await postsRepository.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    res.status(200).json(posts);
});
postsRouter.get('/:id', async (req: Request , res: Response) => {
    const postId = req.params.id;
    const foundPost = await postsRepository.getPostById(postId);

    if (!foundPost) {
        return res.sendStatus(404);
    }
    return res.status(200).json(foundPost);
});
postsRouter.post('/', basicAuthMiddleware, validatePostInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;
    const newPost = await postsRepository.createPost(
        { title, shortDescription, content, blogId });
        return res.status(201).json(newPost);
});
postsRouter.put('/:id', basicAuthMiddleware, validatePostInput, handleValidationErrors, async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, shortDescription, content, blogId } = req.body;
        const isUpdated = await postsRepository.updatePost(id, {
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
    const isDeleted = await postsRepository.deletePostById(postId);
    if (!isDeleted) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
});
