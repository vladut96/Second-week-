import {
    BlogsQueryRepository,
    BlogsRepository,

} from "../Repository/blogsRepository";
import { BlogInputModel, BlogViewModel, Paginator } from "../types/types";
import {inject, injectable} from "inversify";
@injectable()
export class BlogQueryService {
    constructor(@inject(BlogsQueryRepository) private blogQueryRepository: BlogsQueryRepository) {
    }
    async getBlogs({ searchNameTerm, sortBy, sortDirection, pageNumber, pageSize}: { searchNameTerm: string | null; sortBy: string; sortDirection: 1 | -1; pageNumber: number; pageSize: number; }): Promise<Paginator<BlogViewModel>> {
        const skip = (pageNumber - 1) * pageSize;
        const limit = pageSize;

        const blogs = await this.blogQueryRepository.getBlogs({
            searchNameTerm,
            sortBy,
            sortDirection,
            skip,
            limit,
        });

        const totalCount = await this.blogQueryRepository.getTotalBlogsCount(searchNameTerm);
        const pagesCount = Math.ceil(totalCount / pageSize);

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: blogs,
        };
    }
    async getBlogById(id: string): Promise<BlogViewModel | null> {
        return await this.blogQueryRepository.getBlogById(id);
    }

}
@injectable()
export class BlogService {
    constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {
    }
    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<BlogViewModel> {
        return await this.blogsRepository.createBlog({ name, description, websiteUrl });
    }
    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        return await this.blogsRepository.updateBlog(id, updateData);
    }
    async deleteBlogById(id: string): Promise<boolean> {
        return await this.blogsRepository.deleteBlogById(id);
    }

}
