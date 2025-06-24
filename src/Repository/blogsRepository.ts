import { injectable } from 'inversify';
import { BlogModel } from "../db/models";
import { BlogInputModel, BlogViewModel } from "../types/types";
import { Types } from "mongoose";

export function mapToBlogViewModel(blog: any): BlogViewModel {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership || false
    };
}

@injectable()
export class BlogsQueryRepository {
    async getBlogs({
                       searchNameTerm,
                       sortBy,
                       sortDirection,
                       skip,
                       limit
                   }: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        skip: number;
        limit: number;
    }): Promise<BlogViewModel[]> {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: "i" } }
            : {};

        const blogs = await BlogModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

        return blogs.map(mapToBlogViewModel);
    }

    async getTotalBlogsCount(searchNameTerm: string | null): Promise<number> {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: "i" } }
            : {};

        return await BlogModel.countDocuments(filter);
    }

    async getBlogById(id: string): Promise<BlogViewModel | null> {
        if (!Types.ObjectId.isValid(id)) return null;

        const blog = await BlogModel.findById(id).lean();
        return blog ? mapToBlogViewModel(blog) : null;
    }
}

@injectable()
export class BlogsRepository {
    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<BlogViewModel> {
        const newBlog = new BlogModel({
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        });

        await newBlog.save();
        return mapToBlogViewModel(newBlog.toObject());
    }

    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;

        const result = await BlogModel.updateOne(
            { _id: id },
            { $set: updateData }
        ).exec();

        return result.matchedCount > 0;
    }

    async deleteBlogById(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;

        const result = await BlogModel.deleteOne({ _id: id }).exec();
        return result.deletedCount > 0;
    }
}