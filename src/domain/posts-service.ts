import {PostInputModel, Paginator, PostViewModel, PaginationQuery, LikeStatus} from "../types/types";
import { PostsQueryRepository, PostsRepository } from "../Repository/postsRepository";
import { BlogsQueryRepository } from "../Repository/blogsRepository";
import { injectable, inject } from "inversify";
import {PostEntity} from "../entities/post.entity";
import {buildPaginator} from "../utils/pagination";
import {PostModel, PostReactionModel} from "../db/models";
import mongoose, {Types} from "mongoose";

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository
    ) {}
    async createPost(postPayload: PostInputModel): Promise<PostViewModel> {
        const { title, shortDescription, content, blogId } = postPayload;

        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            throw new Error('BLOG_NOT_FOUND');
        }

        const entity = PostEntity.create({ title, shortDescription, content, blogId, blogName: blog.name });
        const saved = await this.postsRepository.save(entity);

        return saved.toViewModel('None', []);
    }
    async updatePost(id: string, updateData: PostInputModel): Promise<boolean> {
        const entity = await this.postsRepository.getById(id);
        if (!entity) return false;

        const blog = await this.blogsQueryRepository.getBlogById(updateData.blogId);
        if (!blog) return false;

        entity.update(updateData, blog.name);
        await this.postsRepository.save(entity);
        return true;
    }
    async deletePostById(postId: string): Promise<boolean> {
        return this.postsRepository.deletePostById(postId);
    }
    async setLikeStatus( postId: string, userId: string, userLogin: string, likeStatus: LikeStatus): Promise<'OK' | 'NOT_FOUND'> {
        const session = await mongoose.startSession();
        try {
            let outcome: 'OK' | 'NOT_FOUND' = 'OK';

            await session.withTransaction(async () => {
                if (!Types.ObjectId.isValid(postId)) { outcome = 'NOT_FOUND'; return; }
                const post = await PostModel.findById(postId).session(session);
                if (!post) { outcome = 'NOT_FOUND'; return; }
                const existing = await PostReactionModel
                    .findOne({ postId, userId })
                    .session(session);

                const prev: LikeStatus = existing ? (existing.status as LikeStatus) : 'None';
                const next: LikeStatus = likeStatus;

                if (prev === next) return;

                if (next === 'None') {
                    if (existing) await existing.deleteOne({ session });
                } else {
                    await PostReactionModel.updateOne(
                        { postId, userId },
                        { $set: { status: next, userLogin } }, // денорм login для newestLikes
                        { upsert: true, session }
                    );
                }
                const inc = { likesCount: 0, dislikesCount: 0 };
                if (prev === 'Like') inc.likesCount--;
                if (prev === 'Dislike') inc.dislikesCount--;
                if (next === 'Like') inc.likesCount++;
                if (next === 'Dislike') inc.dislikesCount++;

                if (inc.likesCount !== 0 || inc.dislikesCount !== 0) {
                    await PostModel.updateOne({ _id: postId }, { $inc: inc }).session(session);
                }
            });

            return outcome;
        } finally {
           await session.endSession();
        }
    }
}

@injectable()
export class PostsQueryService {
    constructor(
        @inject(PostsQueryRepository) private readonly postsQueryRepository: PostsQueryRepository,
    ) {}

    async getPosts(query: PaginationQuery, currentUserId?: string): Promise<Paginator<PostViewModel>> {
        const { items, totalCount } = await this.postsQueryRepository.getPosts(query);
        const postIds = items.map(p => p._id.toString());

        const [newestMap, myMap] = await Promise.all([
            this.postsQueryRepository.listNewestLikes(postIds, 3),
            this.postsQueryRepository.listMyStatuses(postIds, currentUserId),
        ]);

        const view = items.map(p => {
            const entity = PostEntity.fromPersistence(p);
            const myStatus = myMap.get(p._id.toString()) ?? "None";
            const newestLikes = newestMap.get(p._id.toString()) ?? [];
            return entity.toViewModel(myStatus, newestLikes);
        });

        return buildPaginator(query, totalCount, view);
    }

    async getPostById(id: string, currentUserId?: string): Promise<PostViewModel | null> {
        const p = await this.postsQueryRepository.getPostById(id);
        if (!p) return null;

        const [my, newest] = await Promise.all([
            this.postsQueryRepository.listMyStatuses([p._id.toString()], currentUserId),
            this.postsQueryRepository.listNewestLikes([p._id.toString()], 3),
        ]);

        const entity = PostEntity.fromPersistence(p);
        return entity.toViewModel(my.get(p._id.toString()) ?? "None", newest.get(p._id.toString()) ?? []);
    }
    async getPostsByBlogId(
        blogId: string,
        query: PaginationQuery,
        currentUserId?: string
    ): Promise<Paginator<PostViewModel>> {
        const { items, totalCount } = await this.postsQueryRepository.getPostsByBlogId(blogId, query);
        const postIds = items.map(p => p._id.toString());

        const [newestMap, myMap] = await Promise.all([
            this.postsQueryRepository.listNewestLikes(postIds, 3),
            this.postsQueryRepository.listMyStatuses(postIds, currentUserId),
        ]);

        const view = items.map(p => {
            const entity = PostEntity.fromPersistence(p);
            const myStatus = myMap.get(p._id.toString()) ?? "None";
            const newestLikes = newestMap.get(p._id.toString()) ?? [];
            return entity.toViewModel(myStatus, newestLikes);
        });

        return buildPaginator(query, totalCount, view);
    }
}