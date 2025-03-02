import { v4 as uuidv4 } from 'uuid';
import { getBlogsCollection } from "../db/mongoDB";
import { BlogInputModel, BlogViewModel } from "../types/types";

interface IBlogsRepository {
    getBlogs(params: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        skip: number;
        limit: number;
    }): Promise<BlogViewModel[]>;

    getBlogById(id: string): Promise<BlogViewModel | null>;

    createBlog(blogData: BlogInputModel): Promise<BlogViewModel>;

    updateBlog(id: string, updateData: BlogInputModel): Promise<boolean>;

    deleteBlogById(id: string): Promise<boolean>;

    getTotalBlogsCount(searchNameTerm: string | null): Promise<number>;
}

export function mapToBlogViewModel(blog: any): BlogViewModel {
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership || false
    };
}

export const blogsRepository: IBlogsRepository = {
    async getBlogs({searchNameTerm, sortBy, sortDirection, skip, limit,}: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        skip: number;
        limit: number;
    }): Promise<BlogViewModel[]> {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: 'i' } }
            : {};

        const blogs = await getBlogsCollection()
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        return blogs.map(mapToBlogViewModel);
    },

    async getBlogById(id: string): Promise<BlogViewModel | null> {
        const blog = await getBlogsCollection().findOne({ id });
        return blog ? mapToBlogViewModel(blog) : null;
    },

    async createBlog({ name, description, websiteUrl }): Promise<BlogViewModel> {
        const newBlog = {
            id: uuidv4(),
            name,
            description,
            websiteUrl,
            createdAt: new Date(),
            isMembership: false
        };

        await getBlogsCollection().insertOne(newBlog);
        return mapToBlogViewModel(newBlog); // Return mapped BlogViewModel
    },

    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        const result = await getBlogsCollection().updateOne(
            { id },
            { $set: updateData }
        );
        return result.matchedCount > 0;
    },

    async deleteBlogById(id: string): Promise<boolean> {
        const result = await getBlogsCollection().deleteOne({ id });
        return result.deletedCount > 0;
    },
    async getTotalBlogsCount(searchNameTerm: string | null): Promise<number> {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: 'i' } } // Поиск без учёта регистра
            : {};

        return await getBlogsCollection().countDocuments(filter);
    }
};