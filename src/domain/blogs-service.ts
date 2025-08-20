import { BlogsQueryRepository, BlogsRepository } from "../Repository/blogsRepository";
import {BlogInputModel, BlogsQuery, BlogViewModel, Paginator} from "../types/types";
import { inject, injectable } from "inversify";
import {BlogsEntity} from "../entities/blogs.entity";

@injectable()
export class BlogQueryService {
    constructor(
        @inject(BlogsQueryRepository) private blogQueryRepository: BlogsQueryRepository
    ) {}

    async getBlogs(query: BlogsQuery): Promise<Paginator<BlogViewModel>> {
        return this.blogQueryRepository.getBlogs(query);
    }
    async getBlogById(blogID :string): Promise<BlogViewModel | null> {
        return await this.blogQueryRepository.getBlogById(blogID);
    }
}

@injectable()
export class BlogService {
    constructor(
        @inject(BlogsRepository) private readonly blogsRepository: BlogsRepository
    ) {}

    async createBlog(dto: BlogInputModel): Promise<BlogViewModel> {
        const entity = await BlogsEntity.create(dto);
        const saved = await this.blogsRepository.save(entity);
        return saved.toViewModel();
    }

    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        const entity = await this.blogsRepository.getById(id);
        if (!entity) return false;

        entity.update(updateData);
        await this.blogsRepository.save(entity);
        return true;
    }

    async deleteBlogById(id: string): Promise<boolean> {
        return this.blogsRepository.deleteBlogById(id);
    }
}