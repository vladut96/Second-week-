import {PostInputModel, PostViewModel} from "../types/types";
import {postsQueryRepository, postsRepository} from "../Repository/postsRepository";
import {blogsQueryRepository} from "../Repository/blogsRepository";

interface IPostsQueryRepository {
    getPosts(params: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: PostViewModel[];
    }>;
    getPostById(postId: string): Promise<PostViewModel | null>;
    getPostsByBlogId(
        blogId: string,
        sortBy: string,
        sortDirection: 1 | -1,
        skip: number,
        limit: number
    ): Promise<PostViewModel[]>;
    getTotalPostsCountByBlogId(blogId: string): Promise<number>;
}
interface IPostsRepository {
    createPost(postData: {
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
    }): Promise<PostViewModel>;

    updatePost(id: string, updateData: PostInputModel): Promise<boolean>;

    deletePostById(postId: string): Promise<boolean>;
}

export const postsQueryService: IPostsQueryRepository = {
    async getPosts({ sortBy, sortDirection, pageNumber, pageSize }) {
        return await postsQueryRepository.getPosts({ sortBy, sortDirection, pageNumber, pageSize });
    },

    async getPostById(postId: string) {
        return await postsQueryRepository.getPostById(postId);
    },

    async getPostsByBlogId(blogId: string, sortBy: string, sortDirection: 1 | -1, skip: number, limit: number) {
        return await postsQueryRepository.getPostsByBlogId(blogId, sortBy, sortDirection, skip, limit);
    },

    async getTotalPostsCountByBlogId(blogId: string) {
        return await postsQueryRepository.getTotalPostsCountByBlogId(blogId);
    },
};
export const postsService: IPostsRepository = {
    async createPost(postData) {
        const { title, shortDescription, content, blogId } = postData;

        const blog = await blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            throw new Error('Blog not found');
        }
        return await postsRepository.createPost({ title, shortDescription, content, blogId });
    },
    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        return await postsRepository.updatePost(id, updateData);
    },
    async deletePostById(postId: string): Promise<boolean> {
        return await postsRepository.deletePostById(postId);
    },
};
