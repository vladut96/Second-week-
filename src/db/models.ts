import { Schema, model } from 'mongoose';
import {
    EmailConfirmation,
    BlogInputModel,
    CommentatorInfo,
    DeviceAuthSession,
    PostInputModel,
    RefreshTokenModel,
    RegisterUserDB,
    RequestLog, LikeStatus, CommentDBModel
} from "../types/types";

const emailConfirmationSchema = new Schema<EmailConfirmation>({
    confirmationCode: {
        type: String,
        default: null
    },
    expirationDate: {
        type: Date,
        default: null
    },
    isConfirmed: {
        type: Boolean,
        required: true
    }
});

const userSchema = new Schema<RegisterUserDB<EmailConfirmation>>({
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    emailConfirmation: {
        type: emailConfirmationSchema,
        required: true
    },
    passwordRecovery: {
        recoveryCode: { type: String, default: null },
        expirationDate: { type: Date, default: null }
    }
});

const blogSchema = new Schema<BlogInputModel>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true }
});

const postSchema = new Schema<PostInputModel>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true }
});

const likeSchema = new Schema({
    userId: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Like', 'Dislike'] as LikeStatus[],
        default: 'Like'
    },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const commentSchema = new Schema<CommentDBModel<CommentatorInfo>>({
    content: { type: String, required: true },
    commentatorInfo: {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true }
    },
    createdAt: { type: String, required: true },
    likes: {
        type: [likeSchema],
        default: []
    },
    likesCount: {
        type: Number,
        required: true,
        default: 0
    },
    dislikesCount: {
        type: Number,
        required: true,
        default: 0
    }
});

const refreshTokenSchema = new Schema<RefreshTokenModel>({
    token: { type: String, required: true },
    userId: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, required: true },
    invalidatedAt: { type: Date }
});

const requestLogSchema = new Schema<RequestLog>({
    IP: { type: String },
    URL: { type: String, required: true },
    date: { type: Date, required: true }
});

const deviceAuthSessionSchema = new Schema<DeviceAuthSession>({
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
    lastActiveDate: { type: String },
    title: { type: String, required: true },
    ip: { type: String, required: true },
    exp: { type: String }
});

// Добавляем индекс для быстрого поиска лайков пользователя
commentSchema.index({ 'likes.userId': 1 }, { unique: true, sparse: true });

export const UserModel = model('User', userSchema, 'User');
export const BlogModel = model('Blog', blogSchema, 'Blog');
export const PostModel = model('Post', postSchema, 'Post');
export const CommentModel = model('Comment', commentSchema, 'Comment');
export const RefreshTokenModelM = model('RefreshToken', refreshTokenSchema, 'RefreshToken');
export const RequestLogModel = model('RequestLog', requestLogSchema, 'RequestLog');
export const DeviceAuthSessionModel = model('DeviceAuthSession', deviceAuthSessionSchema, 'DeviceAuthSession');