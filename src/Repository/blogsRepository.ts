import { injectable } from 'inversify';
import { BlogModel } from "../db/models";
import {BlogInputModel, BlogsQuery, BlogViewModel, Paginator} from "../types/types";
import {FilterQuery, SortOrder, Types} from "mongoose";
import {BlogsEntity} from "../entities/blogs.entity";

@injectable()
export class BlogsQueryRepository {
    async getBlogs(params: BlogsQuery): Promise<Paginator<BlogViewModel>> {
        const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter: FilterQuery<any> = {};
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: "i" };
        }

        const sort: Record<string, SortOrder> = {
            [sortBy]: sortDirection,
        };

        const skip = (pageNumber - 1) * pageSize;

        const [items, totalCount] = await Promise.all([
            BlogModel.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
            BlogModel.countDocuments(filter),
        ]);

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: items.map((raw) =>
                BlogsEntity.fromPersistence(raw).toViewModel(),
            ),
        };
    }
    async getBlogById(id: string): Promise<BlogViewModel | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        const blog = await BlogModel.findById(id).lean();
        return blog ? BlogsEntity.fromPersistence(blog).toViewModel() : null;
    }
}

@injectable()
export class BlogsRepository {
    async getById(id: string): Promise<BlogsEntity | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        const doc = await BlogModel.findById(id).lean().exec();
        return doc ? BlogsEntity.fromPersistence(doc as any) : null;
    }

    async save(entity: BlogsEntity): Promise<BlogsEntity> {
        const payload = entity.toPersistence();

        if (entity.id) {
            // UPDATE
            await BlogModel.updateOne(
                { _id: new Types.ObjectId(entity.id) },
                { $set: payload }
            ).exec();

            const updated = await BlogModel.findById(entity.id).lean().exec();
            if (!updated) throw new Error("Blog not found after update");
            return BlogsEntity.fromPersistence(updated as any);
        } else {
            // CREATE
            const created = await BlogModel.create(payload);
            return BlogsEntity.fromPersistence(created.toObject());
        }
    }

    async deleteBlogById(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;
        const res = await BlogModel.deleteOne({ _id: id }).exec();
        return res.deletedCount > 0;
    }
}