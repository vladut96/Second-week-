import {BlogQueryService, BlogService} from "../domain/blogs-service";
import {Request, Response} from "express";
import {PostsQueryService, PostsService} from "../domain/posts-service";
import {inject, injectable} from "inversify";
import {matchedData} from "express-validator";
import {PaginationQuery, PostInputModel} from "../types/types";


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
        const { pageNumber, pageSize, sortBy, sortDirection } = matchedData(req, {
            locations: ['query'],
            includeOptionals: true }) as PaginationQuery;

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

        const blog = await this.blogsQueryService.getBlogById(blogId);
        if (!blog) return res.sendStatus(404);

        const query = matchedData(req, {
            locations: ['query'],
            includeOptionals: true,
        }) as PaginationQuery;

        const currentUserId = req.userId;

        const response = await this.postsQueryService.getPostsByBlogId(
            blogId,
            query,
            currentUserId
        );

        return res.status(200).json(response);
    }
    async createBlog (req: Request, res: Response) {
    const { name, description, websiteUrl } = req.body;
const newBlog = await this.blogsService.createBlog({ name, description, websiteUrl });
return res.status(201).json(newBlog);
}
    async createPostByBlogId(req: Request, res: Response) {
        const blogId = req.params.blogId;
        const { title, shortDescription, content } = req.body;

        const blog = await this.blogsQueryService.getBlogById(blogId);
        if (!blog) return res.sendStatus(404);

        const input: PostInputModel = { title, shortDescription, content, blogId };

        try {
            const newPost = await this.postsService.createPost(input);
            return res.status(201).json(newPost);
        } catch (e: any) {
            if (e?.message === 'BLOG_NOT_FOUND') {
                return res.status(400).json({
                    errorsMessages: [{ message: 'Blog not found', field: 'blogId' }],
                });
            }
            throw e;
        }
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