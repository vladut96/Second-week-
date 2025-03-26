import {ObjectId} from "mongodb";


export interface FieldError {
    message: string;
    field: string;
}
export interface APIErrorResult {
    errorsMessages?: FieldError[] | null;
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
export interface RegistrationEmailResending {
    email: string;
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
export interface LoginSuccessViewModel {
    accessToken : string;
}
export interface MeViewModel {
    email: string;
    login: string;
    userId: string;
}

export interface Paginator<T>  {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
}



