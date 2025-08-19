import {LikeStatus, NewestLike, PostData, PostInputModel, PostViewModel} from "../types/types";

export class PostEntity {
    constructor(
        public readonly id: string | null,
        public  title: string,
        public  shortDescription: string,
        public  content: string,
        public  blogId: string,
        public  blogName: string ,
        public readonly createdAt: string,
        public likesCount: number = 0,
        public dislikesCount: number = 0

    ) {}

    static fromPersistence(persisted: any): PostEntity {
        return new PostEntity(
            persisted._id.toString(),
            persisted.title,
            persisted.shortDescription,
            persisted.content,
            persisted.blogId,
            persisted.blogName,
            persisted.createdAt || new Date().toISOString(),
            persisted.likesCount ?? 0,
            persisted.dislikesCount ?? 0
        );
    }

    static create(dto: PostData): PostEntity {
        return new PostEntity(
            null,
            dto.title,
            dto.shortDescription,
            dto.content,
            dto.blogId,
            dto.blogName,
            new Date().toISOString(),
            0,
            0
        );
    }
    update(updateData: PostInputModel, blogName?: string) {
        this.title = updateData.title;
        this.shortDescription = updateData.shortDescription;
        this.content = updateData.content;
        this.blogId = updateData.blogId;
        if (blogName) this.blogName = blogName;
    }

    toViewModel(myStatus: LikeStatus = "None",
                newestLikes: NewestLike[] = []): PostViewModel {
        if (!this.id) {
            throw new Error('UserEntity.toViewModel called without persisted id');
        }
        return {
            id: this.id,
            title: this.title,
            shortDescription: this.shortDescription,
            content: this.content,
            blogId: this.blogId,
            blogName: this.blogName,
            createdAt: this.createdAt,
            extendedLikesInfo: {
                likesCount: this.likesCount,
                dislikesCount: this.dislikesCount,
                myStatus,
                newestLikes,
            },
        };
    }
    toPersistence(): any {
        return {
            title: this.title,
            shortDescription: this.shortDescription,
            content: this.content,
            blogId: this.blogId,
            blogName: this.blogName,
            createdAt: this.createdAt,
            likesCount: this.likesCount,
            dislikesCount: this.dislikesCount,
        };
    }

}