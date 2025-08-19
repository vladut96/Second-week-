import {Schema, model, InferSchemaType, Types} from 'mongoose';
import {
    EmailConfirmation,
    CommentatorInfo,
    DeviceAuthSession,
    PostInputModel,
    RefreshTokenModel,
    RegisterUserDB,
    RequestLog, LikeStatus, CommentDBModel, BlogViewModel
} from "../types/types";

const emailConfirmationSchema = new Schema<EmailConfirmation>(    {
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
    }, { _id: false });
 const userSchema = new Schema<RegisterUserDB<EmailConfirmation>>({
    login: { type: String, unique: true },
    email: { type: String, unique: true },
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
const blogSchema = new Schema<BlogViewModel>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true }
});
const postSchema = new Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: { type: String, index: true },
    blogName: String,
    createdAt: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
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
});
const postReactionSchema = new Schema(
    {
        postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
        userId: { type: Types.ObjectId, ref: "User", required: true },
        userLogin: { type: String, required: true },
        status: { type: String, enum: ["Like", "Dislike"], required: true },
    },
    { timestamps: true }
);
postReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });
postReactionSchema.index({ postId: 1, status: 1, createdAt: -1 });
const commentSchema = new Schema<CommentDBModel<CommentatorInfo>>({
    postId: { type: String, required: true },
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

export type UserSchemaType = InferSchemaType<typeof userSchema>;

export const PostReactionModel = model('PostReaction', postReactionSchema, 'PostReaction');
export const UserModel = model('Users', userSchema, 'Users');
export const BlogModel = model('Blogs', blogSchema, 'Blogs');
export const PostModel = model('Posts', postSchema, 'Posts');
export const CommentModel = model('Comments', commentSchema, 'Comments');
export const RefreshTokenModelM = model('RefreshTokens', refreshTokenSchema, 'RefreshTokens');
export const RequestLogModel = model('RequestLogs', requestLogSchema, 'RequestLogs');
export const DeviceAuthSessionModel = model('DeviceAuthSessions', deviceAuthSessionSchema, 'DeviceAuthSessions');