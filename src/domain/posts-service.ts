import {PostInputModel, Paginator, PostViewModel, PostData } from "../types/types";
import {postsQueryRepository, postsRepository} from "../Repository/postsRepository";
import {blogsQueryRepository} from "../Repository/blogsRepository";

export const postsQueryService = {
    async getPosts({   sortBy,
                       sortDirection,
                       pageNumber,
                       pageSize
                   }: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<PostViewModel>> {
        return await postsQueryRepository.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    },

    async getPostById(postId: string): Promise<PostViewModel | null> {
        return await postsQueryRepository.getPostById(postId);
    },

    async getPostsByBlogId(
        blogId: string,
        sortBy: string,
        sortDirection: 1 | -1,
        skip: number,
        limit: number
    ): Promise<PostViewModel[]> {
        return await postsQueryRepository.getPostsByBlogId(blogId, sortBy, sortDirection, skip, limit);
    },

    async getTotalPostsCountByBlogId(blogId: string): Promise<number> {
        return await postsQueryRepository.getTotalPostsCountByBlogId(blogId);
    },
};

export const postsService = {
    async createPost(postData: PostData): Promise<PostViewModel> {
        const { title, shortDescription, content, blogId } = postData;

        const blog = await blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            throw new Error('Blog not found');
        }
        const blogName: string = blog.name;

        return await postsRepository.createPost({ title, shortDescription, content, blogId, blogName });
    },

    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        return await postsRepository.updatePost(id, updateData);
    },

    async deletePostById(postId: string): Promise<boolean> {
        return await postsRepository.deletePostById(postId);
    },
};
