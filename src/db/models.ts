import { Schema, model } from 'mongoose';
import {
    EmailConfirmation,
    BlogInputModel,
    CommentatorInfo,
    CommentViewModel,
    DeviceAuthSession,
    PostInputModel,
    RefreshTokenModel,
    RegisterUserDB,
    RequestLog
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

const commentSchema = new Schema<CommentViewModel<CommentatorInfo>>({
    content: { type: String, required: true },
    commentatorInfo: {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true }
    },
    createdAt: { type: String, required: true }
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

export const UserModel = model('User', userSchema);
export const BlogModel = model('Blog', blogSchema);
export const PostModel = model('Post', postSchema);
export const CommentModel = model('Comment', commentSchema);
export const RefreshTokenModelM = model('RefreshToken', refreshTokenSchema);
export const RequestLogModel = model('RequestLog', requestLogSchema);
export const DeviceAuthSessionModel = model('DeviceAuthSession', deviceAuthSessionSchema);