import { blogsQueryRepository, blogsRepository } from "../Repository/blogsRepository";
import { BlogInputModel, BlogViewModel, Paginator } from "../types/types";

export const blogsQueryService = {
    async getBlogs({
                       searchNameTerm,
                       sortBy,
                       sortDirection,
                       pageNumber,
                       pageSize,
                   }: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<BlogViewModel>> {
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

export const blogsService = {
    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<BlogViewModel> {
        return await blogsRepository.createBlog({ name, description, websiteUrl });
    },
    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        return await blogsRepository.updateBlog(id, updateData);
    },
    async deleteBlogById(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlogById(id);
    },
};
