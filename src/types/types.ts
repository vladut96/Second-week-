import {ObjectId} from "mongodb";


export interface FieldError {
    message: string;
    field: string;
}
export interface PostInputModel {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}
export interface PostViewModel {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}
export interface PostData {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName?: string; // Optional if not always required
}
export interface BlogInputModel {
    name: string;
    description: string;
    websiteUrl: string;
}
export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
export interface UserViewModel  {
    id: string;
    login: string;
    email: string;
    createdAt: string;
}
export interface UserInputModel  {
    login: string;
    password: string;
    email: string;
}
export interface UserAuthModel  {
    _id: ObjectId;
    login: string;
    email: string;
    passwordHash: string;
}
export type UserPublicModel = Omit<UserAuthModel, 'passwordHash'>;

export interface RegisterUserDB<T> {
    login: string;
    email: string;
    passwordHash: string;
    emailConfirmation: T;
}
export interface EmailConfirmation {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
}
export interface CommentInputModel  {
    content: string;
}
export interface CommentViewModel<T>  {
    id: string;
    content: string;
    commentatorInfo: CommentatorInfo ;
    createdAt: string;
}
export interface CommentatorInfo {
    userId: string;
    userLogin: string;
}
export interface MeViewModel {
    email?: string;  // Делаем опциональным
    login?: string;  // Делаем опциональным
    userId: string;
    deviceId?: string;
}
export interface RequestLog {
    IP: string;
    URL: string;
    date: Date;
}
export interface DeviceAuthSession {
    userId: string;
    deviceId: string;
    iat?: number;
    title: string;
    ip: string;
    exp?: number;
}
export type RefreshTokenModel = {
    token: string;          // Сам refresh-токен
    userId: string;         // ID пользователя
    issuedAt: Date;         // Когда был выдан
    expiresAt: Date;        // Срок действия
    isValid: boolean;       // Активен ли токен
    invalidatedAt?: Date;   // Когда был инвалидирован (если применимо)
};

export interface Paginator<T>  {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
}



