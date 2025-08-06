import { PostsQueryService, PostsService} from "../src/domain/posts-service";
import {Request, Response} from "express";
import {CommentsService} from "../src/domain/comments-service";
import {injectable, inject} from "inversify";

@injectable()
export class PostsController {
    constructor(
        @inject(PostsService) protected postsService: PostsService,
        @inject(PostsQueryService) protected postsQueryService: PostsQueryService,
        @inject(CommentsService) protected commentsService: CommentsService
    ) {
    }
    async getPostsComments (req: Request, res: Response) {
    const { postId } = req.params;
const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
const sortBy = (req.query.sortBy as string) || "createdAt";
const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

const postExists = await this.postsQueryService.getPostById(postId);
if (!postExists) {
    return res.sendStatus(404);
}
const comments = await this.commentsService.getCommentsByPostId({
    postId,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection
});
return res.status(200).json(comments);
}
    async createPostsComments (req: Request, res: Response) {
    const { postId } = req.params;
const { content } = req.body;
const userId = req.user!.userId;
const userLogin = req.user!.login;

const postExists = await this.postsQueryService.getPostById(postId);
if (!postExists) {
    return res.sendStatus(404);
}
if (!userLogin) {
            throw new Error('userLogin is required');
        }
const newComment = await this.commentsService.createComment({
    postId,
    content,
    userId,
    userLogin
});
return res.status(201).json(newComment);
}
    async getPosts (req: Request, res: Response) {
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const posts = await this.postsQueryService.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    res.status(200).json(posts);
}
    async getPostsById (req: Request , res: Response) {
    const postId = req.params.id;
    const foundPost = await this.postsQueryService.getPostById(postId);

    if (!foundPost) {
    return res.sendStatus(404);
}
return res.status(200).json(foundPost);
}
    async createPost (req: Request, res: Response) {
    try {
    const { title, shortDescription, content, blogId } = req.body;
const newPost = await this.postsService.createPost(title, shortDescription, content, blogId);
return res.status(201).json(newPost);
} catch (error) {
    const err = error as Error; // Type assertion
    if (err.message === 'Blog not found') {
        return res.status(404).json({ message: 'Blog not found' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
}
}
    async updatePost (req: Request, res: Response)  {
    const { id } = req.params;
const { title, shortDescription, content, blogId } = req.body;
const isUpdated = await this.postsService.updatePost(id, {
    title,
    shortDescription,
    content,
    blogId
});
if (!isUpdated) {
    return res.sendStatus(404);
}
return res.sendStatus(204);
}
    async deletePostById (req: Request, res: Response) {
    const postId = req.params.id;
    const isDeleted = await this.postsService.deletePostById(postId);
    if (!isDeleted) {
    return res.sendStatus(404);
}
return res.sendStatus(204);
}
}