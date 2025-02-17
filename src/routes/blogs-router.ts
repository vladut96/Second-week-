import {Request, Response, Router} from "express";
import {SETTINGS} from "../settings";
import app from "express";
import {db} from "../db/db";
import {blogsRepository} from "../Repository/blogsRepository";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {handleValidationErrors, validateBlogInput} from "../validation/express-validator";
import {FieldValidationError, validationResult} from "express-validator";
export const blogsRouter = Router();


blogsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).json(db.blogs);
})
blogsRouter.get('/:id', (req: Request , res: Response) => {
        const blogId = (req.params.id);
        const foundBlog = blogsRepository.getBlogById(blogId);
        if (!foundBlog) {
            return res.sendStatus(404);
        }
        return res.status(200).json(foundBlog);
});
blogsRouter.post('/',basicAuthMiddleware, validateBlogInput, handleValidationErrors, (req: Request, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    try {
        const newBlog = blogsRepository.createBlog({ name, description, websiteUrl });
        return res.status(201).json(newBlog);
    } catch (error) {
        return res.status(404).json({ message: 'Blog not found' });
    }
});
blogsRouter.put('/:id', basicAuthMiddleware, validateBlogInput, handleValidationErrors, (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, websiteUrl } = req.body;

        const isUpdated = blogsRepository.updateBlog(id, { name, description, websiteUrl });

        if (!isUpdated) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        return res.sendStatus(204);
    });
blogsRouter.delete("/:id", basicAuthMiddleware, (req: Request, res: Response) => {
    const blogId = req.params.id;
    const isDeleted = blogsRepository.deleteBlogById(blogId);
    if (!isDeleted) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
});