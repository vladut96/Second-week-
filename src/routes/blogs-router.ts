import {Request, Response, Router} from "express";
import {blogsRepository} from "../Repository/blogsRepository";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {handleValidationErrors, validateBlogIdInput, validateBlogInput} from "../validation/express-validator";
export const blogsRouter = Router();


blogsRouter.get('/', async (req: Request, res: Response) => {
        const blogs = await blogsRepository.getBlogs();
        return res.status(200).json(blogs);
});
blogsRouter.get('/:id', validateBlogIdInput, handleValidationErrors, async (req: Request, res: Response) => {

        const blogId = req.params.id;
        const foundBlog = await blogsRepository.getBlogById(blogId);
        if (!foundBlog) {
            return res.sendStatus(404);
        }
        return res.status(200).json(foundBlog);
});
blogsRouter.post('/', basicAuthMiddleware, validateBlogInput, handleValidationErrors, async (req: Request, res: Response) => {
        const { name, description, websiteUrl } = req.body;
            const newBlog = await blogsRepository.createBlog({ name, description, websiteUrl });
            return res.status(201).json(newBlog);
});
blogsRouter.put('/:id', basicAuthMiddleware, validateBlogInput, handleValidationErrors, async (req: Request, res: Response) => {
            const { id } = req.params;
            const { name, description, websiteUrl } = req.body;

            const isUpdated = await blogsRepository.updateBlog(id, {name, description, websiteUrl});

            if (!isUpdated) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            return res.sendStatus(204);
    });
blogsRouter.delete("/:id", basicAuthMiddleware, async (req: Request, res: Response) => {
            const blogId = req.params.id;
            const isDeleted = await blogsRepository.deleteBlogById(blogId);
            if (!isDeleted) {
                return res.sendStatus(404);
            }
            return res.sendStatus(204);

    });