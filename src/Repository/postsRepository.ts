import {PostModel, PostReactionModel} from "../db/models";
import { PaginationQuery, PostPersistence, NewestLike, LikeStatus} from "../types/types";
import { SortOrder, Types} from "mongoose";
import { injectable } from "inversify";
import {PostEntity} from "../entities/post.entity";


@injectable()
export class PostsRepository {
    async getById(id: string): Promise<PostEntity | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        const persisted = await PostModel.findById(id).lean<PostPersistence | null>().exec();
        return persisted ? PostEntity.fromPersistence(persisted) : null;
    }

    async save(entity: PostEntity): Promise<PostEntity> {
        const payload = entity.toPersistence();

        if (entity.id) {
            const updated = await PostModel.findOneAndUpdate(
                { _id: entity.id },
                { $set: payload },
                { new: true }
            ).lean<PostPersistence | null>().exec();

            if (!updated) throw new Error("Post not found after update");
            return PostEntity.fromPersistence(updated);
        } else {

            if (payload.likesCount === undefined) payload.likesCount = 0;
            if (payload.dislikesCount === undefined) payload.dislikesCount = 0;

            const created = await PostModel.create(payload);
            return PostEntity.fromPersistence(created.toObject());
        }
    }

    async deletePostById(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;
        const res = await PostModel.deleteOne({ _id: id }).exec();
        return res.deletedCount > 0;
    }
}

@injectable()
export class PostsQueryRepository {
    async getPostById(id: string): Promise<PostPersistence | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        return PostModel.findById(id).lean<PostPersistence | null>().exec();
    }
    async getPosts(params: PaginationQuery): Promise<{ items: PostPersistence[]; totalCount: number;}> {
        const { sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter = {};
        const totalCount = await PostModel.countDocuments(filter).exec();
        const skip = (pageNumber - 1) * pageSize;

        const items = await PostModel.find(filter)
            .sort({ [sortBy]: sortDirection as SortOrder })
            .skip(skip)
            .limit(pageSize)
            .lean<PostPersistence[]>()
            .exec();

        return { items, totalCount };
    }
    async getPostsByBlogId(blogId: string, params: PaginationQuery): Promise<{items: PostPersistence[];totalCount: number;}> {
        const { sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter = { blogId };
        const totalCount = await PostModel.countDocuments(filter).exec();
        const skip = (pageNumber - 1) * pageSize;

        const items = await PostModel.find(filter)
            .sort({ [sortBy]: sortDirection as SortOrder })
            .skip(skip)
            .limit(pageSize)
            .lean<PostPersistence[]>()
            .exec();

        return { items, totalCount };
    }

    async listNewestLikes(postIds: string[], limit = 3): Promise<Map<string, NewestLike[]>> {
        if (postIds.length === 0) return new Map();

        const rows = await PostReactionModel
            .find({ postId: { $in: postIds.map(id => new Types.ObjectId(id)) }, status: "Like" })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const grouped = new Map<string, NewestLike[]>();
        for (const r of rows) {
            const key = r.postId.toString();
            if (!grouped.has(key)) grouped.set(key, []);
            const arr = grouped.get(key)!;
            if (arr.length < limit) {
                arr.push({
                    addedAt: r.createdAt.toISOString?.() ?? new Date(r.createdAt).toISOString(),
                    userId: r.userId.toString(),
                    login: r.userLogin,
                });
            }
        }
        return grouped;
    }

    async listMyStatuses(postIds: string[], userId?: string): Promise<Map<string, LikeStatus>> {
        const map = new Map<string, LikeStatus>();
        if (!userId || postIds.length === 0) return map;

        const rows = await PostReactionModel
            .find({ userId: new Types.ObjectId(userId), postId: { $in: postIds.map(id => new Types.ObjectId(id)) } })
            .lean()
            .exec();

        for (const r of rows) {
            map.set(r.postId.toString(), r.status as LikeStatus);
        }
        return map;
    }
}