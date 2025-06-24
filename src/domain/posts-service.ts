import { PostInputModel, Paginator, PostViewModel } from "../types/types";
import { PostsQueryRepository, PostsRepository } from "../Repository/postsRepository";
import { BlogsQueryRepository } from "../Repository/blogsRepository";
import { injectable, inject } from "inversify";

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository
    ) {}

    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostViewModel> {
        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            throw new Error('Blog not found');
        }
        const blogName: string = blog.name;

        return await this.postsRepository.createPost({ title, shortDescription, content, blogId, blogName });
    }

    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        return await this.postsRepository.updatePost(id, updateData);
    }

    async deletePostById(postId: string): Promise<boolean> {
        return await this.postsRepository.deletePostById(postId);
    }
}

@injectable()
export class PostsQueryService {
    constructor(
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository
    ) {}

    async getPosts({ sortBy, sortDirection, pageNumber, pageSize }: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<PostViewModel>> {
        return await this.postsQueryRepository.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    }

    async getPostById(postId: string): Promise<PostViewModel | null> {
        return await this.postsQueryRepository.getPostById(postId);
    }

    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 1 | -1
    ): Promise<Paginator<PostViewModel> | null> {
        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog) return null;

        const skip = (pageNumber - 1) * pageSize;
        const limit = pageSize;

        const posts = await this.postsQueryRepository.getPostsByBlogId(blogId, sortBy, sortDirection, skip, limit);
        const totalCount = await this.postsQueryRepository.getTotalPostsCountByBlogId(blogId);
        const pagesCount = Math.ceil(totalCount / pageSize);

        const items: PostViewModel[] = posts.map(post => ({
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: blog.name,
            createdAt: post.createdAt,
        }));

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items,
        };
    }
}