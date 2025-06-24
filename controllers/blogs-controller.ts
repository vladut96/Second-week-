import {BlogQueryService, BlogService} from "../src/domain/blogs-service";
import {Request, Response} from "express";
import {PostsQueryService, PostsService} from "../src/domain/posts-service";
import {inject, injectable} from "inversify";


@injectable()
export class BlogsController {
    constructor(
        @inject(BlogService) protected blogsService: BlogService,
        @inject(BlogQueryService) protected blogsQueryService: BlogQueryService,
        @inject(PostsService) protected postsService: PostsService,
        @inject(PostsQueryService) protected postsQueryService: PostsQueryService
    ) {
    }
    async getBlogs(req: Request, res: Response) {
    try {
    const searchNameTerm = req.query.searchNameTerm as string || null;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const response = await this.blogsQueryService.getBlogs({
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
    });

    return res.status(200).json(response);
} catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
}
}
    async getBlogsById(req: Request, res: Response) {

    const blogId = req.params.id;
    const foundBlog = await this.blogsQueryService.getBlogById(blogId);
    if (!foundBlog) {
    return res.sendStatus(404);
}
return res.status(200).json(foundBlog);
}
    async getPostsByBlogId(req: Request, res: Response) {
        const blogId = req.params.blogId;

        try {
            const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
            const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
            const sortBy = req.query.sortBy as string || 'createdAt';
            const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;

            const response = await this.postsQueryService.getPostsByBlogId(blogId, pageNumber, pageSize, sortBy, sortDirection);
            if (!response) {
                return res.sendStatus(404);
            }
            return res.status(200).json(response);
        } catch (e) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    async createBlog (req: Request, res: Response) {
    const { name, description, websiteUrl } = req.body;
const newBlog = await this.blogsService.createBlog({ name, description, websiteUrl });
return res.status(201).json(newBlog);
}
    async createPostByBlogId(req: Request, res: Response) {
        const blogId = req.params.blogId;
        const { title, shortDescription, content } = req.body;

        const newPost = await this.postsService.createPost(title, shortDescription, content, blogId)

        return res.status(201).json(newPost);
    }
    async updateBlog (req: Request, res: Response) {
    const { id } = req.params;
const { name, description, websiteUrl } = req.body;

const isUpdated = await this.blogsService.updateBlog(id, {name, description, websiteUrl});

if (!isUpdated) {
    return res.status(404).json({ message: 'Blog not found' });
}
return res.sendStatus(204);
}
    async deleteBlogById (req: Request, res: Response) {
    const blogId = req.params.id;
    const isDeleted = await this.blogsService.deleteBlogById(blogId);
    if (!isDeleted) {
    return res.sendStatus(404);
}
return res.sendStatus(204);

}
}