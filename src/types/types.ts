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
export type UserViewModel = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};
export type UserInputModel = {
    login: string;
    password: string;
    email: string;
};
export type UserAuthModel = {
    _id: ObjectId;
    login: string;
    email: string;
    passwordHash: string; //
};
export type Paginator<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
};




