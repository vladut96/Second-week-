

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

export type Paginator<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
};




