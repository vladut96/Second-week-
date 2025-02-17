import {Request, Response, Router} from "express";
import {validatePostInput} from "../validation/express-validator";
import {db} from "../db/db";
import {ValidationError, validationResult} from 'express-validator';
import {postsRepository} from "../Repository/postsRepository";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
export const postsRouter = Router();

postsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).json(db.posts);
})
postsRouter.get('/:id', (req: Request , res: Response) => {
        const postId = (req.params.id);
        const foundPost = postsRepository.getPostById(postId);
        if (!foundPost) {
            return res.sendStatus(404);
        }

    return  res.status(200).json(foundPost);

    });
postsRouter.post('/', basicAuthMiddleware, validatePostInput, (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors.array().map((error) => ({
            message: error.msg,
            field: (error as ValidationError & { path: string }).path
        }));
        return res.status(400).json({ errorsMessages });
    }
    const { title, shortDescription, content, blogId } = req.body;
    try {
        const newPost = postsRepository.createPost({ title, shortDescription, content, blogId });
        return res.status(201).json(newPost);
    } catch (error) {
        return res.status(404).json({ message: 'Post not found' });
    }
});
postsRouter.put('/:id', basicAuthMiddleware, validatePostInput, (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json({ error: firstError });
    }
    const { id } = req.params;
    const { title, shortDescription, content, blogId } = req.body;

    const isUpdated = postsRepository.updatePost(id, {title, shortDescription, content, blogId});

    if (!isUpdated) {
        return res.status(404).json({ message: 'Blog not found' });
    }
    return res.sendStatus(204);
});
postsRouter.delete("/:id", basicAuthMiddleware, (req: Request, res: Response) => {
    const postId = req.params.id;
    const isDeleted = postsRepository.deletePostById(postId);
    if (!isDeleted) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
});
