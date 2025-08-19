import {BlogInputModel, BlogPersistence} from "../types/types";

export class BlogsEntity {
    constructor(
        public readonly id: string | null,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public readonly createdAt: string,
        public readonly isMembership: boolean,
    ) {
    }

    static fromPersistence(persisted: BlogPersistence): BlogsEntity {
        return new BlogsEntity(
            persisted._id.toString(),
            persisted.name,
            persisted.description,
            persisted.websiteUrl,
            persisted.createdAt || new Date().toISOString(),
            persisted.isMembership || false,
        );
    }

    static async create(dto: {
        name: string;
        description: string;
        websiteUrl: string;
    }): Promise<BlogsEntity> {
        return new BlogsEntity(
            null,
            dto.name,
            dto.description,
            dto.websiteUrl,
            new Date().toISOString(),
            false
        );
    }

    toViewModel() {
        if (!this.id) {
            throw new Error('BlogsEntity.toViewModel called without persisted id');
        }
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            websiteUrl: this.websiteUrl,
            createdAt: this.createdAt,
            isMembership: this.isMembership,
        };
    }

    update(dto: BlogInputModel): void {
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl;
    }

    toPersistence(): any {
        return  {
            name: this.name,
            description: this.description,
            websiteUrl: this.websiteUrl,
            createdAt: this.createdAt,
            isMembership: this.isMembership,
        }
    }
}