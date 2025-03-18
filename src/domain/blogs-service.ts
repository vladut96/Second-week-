import {blogsQueryRepository, blogsRepository} from "../Repository/blogsRepository";
import {BlogInputModel, BlogViewModel, Paginator} from "../types/types";

interface IBlogsQueryService {
    getBlogs(params: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<BlogViewModel>>;

    getBlogById(id: string): Promise<BlogViewModel | null>;
}
interface IBlogsService {
    createBlog(blogData: BlogInputModel): Promise<BlogViewModel>;
    updateBlog(id: string, updateData: BlogInputModel): Promise<boolean>;
    deleteBlogById(id: string): Promise<boolean>;
}

export const blogsQueryService: IBlogsQueryService = {
    async getBlogs({ searchNameTerm, sortBy, sortDirection, pageNumber, pageSize }) {
        const skip = (pageNumber - 1) * pageSize;
        const limit = pageSize;

        const blogs = await blogsQueryRepository.getBlogs({
            searchNameTerm,
            sortBy,
            sortDirection,
            skip,
            limit,
        });

        const totalCount = await blogsQueryRepository.getTotalBlogsCount(searchNameTerm);
        const pagesCount = Math.ceil(totalCount / pageSize);

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: blogs,
        };
    },
    async getBlogById(id: string): Promise<BlogViewModel | null> {
        return await blogsQueryRepository.getBlogById(id);
    },
};

export const blogsService: IBlogsService = {
    async createBlog({ name, description, websiteUrl }: { name: string; description: string; websiteUrl: string }): Promise<BlogViewModel> {
        return await blogsRepository.createBlog({ name, description, websiteUrl });
    },
    async updateBlog(id: string, updateData: { name: string; description: string; websiteUrl: string }): Promise<boolean> {
        return await blogsRepository.updateBlog(id, updateData);
    },
    async deleteBlogById(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlogById(id);
    }
};