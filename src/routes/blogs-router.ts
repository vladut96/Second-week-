import {Request, Response, Router} from "express";
import {basicAuthMiddleware} from "../validation/basicAuthMiddleware";
import {handleValidationErrors, validateBlogInput, validatePostInputWithoutId}from "../validation/express-validator";
import {BlogViewModel, Paginator, PostViewModel} from "../types/types"
import {postsRepository} from "../Repository/postsRepository";
import {blogsRepository} from "../Repository/blogsRepository";
export const blogsRouter = Router();

blogsRouter.get('/', async (req: Request, res: Response) => {
    const searchNameTerm = req.query.searchNameTerm as string || null;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    const blogs = await blogsRepository.getBlogs({
        searchNameTerm,
        sortBy,
        sortDirection,
        skip,
        limit,
    });
    const totalCount = await blogsRepository.getTotalBlogsCount(searchNameTerm);

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = blogs.map(blog => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership || false,
    }));
    const response: Paginator<BlogViewModel> = {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items,
    };
    return res.status(200).json(response);
});
blogsRouter.get('/:id', async (req: Request, res: Response) => {

        const blogId = req.params.id;
        const foundBlog = await blogsRepository.getBlogById(blogId);
        if (!foundBlog) {
            return res.sendStatus(404);
        }
        return res.status(200).json(foundBlog);
});
blogsRouter.get('/:blogId/posts', async (req: Request, res: Response) => {
    const blogId = req.params.blogId;

    const foundBlog = await blogsRepository.getBlogById(blogId);
    if (!foundBlog) {
        return res.sendStatus(404);
    }
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;

    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    const posts = await postsRepository.getPostsByBlogId(blogId, sortBy, sortDirection, skip, limit);
    const totalCount = await postsRepository.getTotalPostsCountByBlogId(blogId);

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items: PostViewModel[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: foundBlog.name, // Use the blog name from the found blog
        createdAt: post.createdAt,
    }));

    const response: Paginator<PostViewModel> = {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items,
    };
    return res.status(200).json(response);
});
blogsRouter.post('/', basicAuthMiddleware, validateBlogInput, handleValidationErrors, async (req: Request, res: Response) => {
        const { name, description, websiteUrl } = req.body;
            const newBlog = await blogsRepository.createBlog({ name, description, websiteUrl });
            return res.status(201).json(newBlog);
});
blogsRouter.post('/:blogId/posts', basicAuthMiddleware, validatePostInputWithoutId, handleValidationErrors, async (req: Request, res: Response) => {
        const blogId = req.params.blogId;
        const { title, shortDescription, content } = req.body;
        const foundBlog = await blogsRepository.getBlogById(blogId);
        if (!foundBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const newPost = await postsRepository.createPost({
            title,
            shortDescription,
            content,
            blogId,
        });
        return res.status(201).json(newPost);
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