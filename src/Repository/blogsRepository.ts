import { ObjectId } from "mongodb";
import { getBlogsCollection } from "../db/mongoDB";
import { BlogInputModel, BlogViewModel } from "../types/types";

export function mapToBlogViewModel(blog: any): BlogViewModel {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership || false
    };
}
interface IBlogsQueryRepository {
    getBlogs(params: {
        searchNameTerm: string | null;
        sortBy: string;
        sortDirection: 1 | -1;
        skip: number;
        limit: number;
    }): Promise<BlogViewModel[]>;
    getBlogById(id: string): Promise<BlogViewModel | null>;
    getTotalBlogsCount(searchNameTerm: string | null): Promise<number>;
}
interface IBlogsRepository {
    createBlog(blogData: BlogInputModel): Promise<BlogViewModel>;
    updateBlog(id: string, updateData: BlogInputModel): Promise<boolean>;
    deleteBlogById(id: string): Promise<boolean>;
}
export const blogsQueryRepository: IBlogsQueryRepository = {
    async getBlogs({ searchNameTerm, sortBy, sortDirection, skip, limit }) {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: "i" } }
            : {};

        const blogs = await getBlogsCollection()
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        return blogs.map(mapToBlogViewModel);
    },

    async getTotalBlogsCount(searchNameTerm: string | null): Promise<number> {
        const filter = searchNameTerm
            ? { name: { $regex: searchNameTerm, $options: "i" } }
            : {};

        return await getBlogsCollection().countDocuments(filter);
    },

    async getBlogById(id: string): Promise<BlogViewModel | null> {
        const blog = await getBlogsCollection().findOne({ _id: new ObjectId(id) });
        return blog ? mapToBlogViewModel(blog) : null;
    }
};

export const blogsRepository: IBlogsRepository = {
    async createBlog({ name, description, websiteUrl }): Promise<BlogViewModel> {
        const newBlog = {
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

        const result = await getBlogsCollection().insertOne(newBlog);

        return {
            id: result.insertedId.toString(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership
        };
    },
    async updateBlog(id: string, updateData: BlogInputModel): Promise<boolean> {
        const result = await getBlogsCollection().updateOne(
            { _id: new ObjectId(id)  },
            { $set: updateData }
        );
        return result.matchedCount > 0;
    },
    async deleteBlogById(id: string): Promise<boolean> {
        const result = await getBlogsCollection().deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
};

