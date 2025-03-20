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
    passwordHash: string; //
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

export interface IPostsQueryRepository {
    getPosts(params: {
        sortBy: string;
        sortDirection: 1 | -1;
        pageNumber: number;
        pageSize: number;
    }): Promise<Paginator<PostViewModel>>;

    getPostById(postId: string): Promise<PostViewModel | null>;

    getPostsByBlogId(
        blogId: string,
        sortBy: string,
        sortDirection: 1 | -1,
        skip: number,
        limit: number
    ): Promise<PostViewModel[]>;

    getTotalPostsCountByBlogId(blogId: string): Promise<number>;
}
export interface IPostsRepository {
    createPost(postData: PostData): Promise<PostViewModel>;
    updatePost(id: string, updateData: PostInputModel): Promise<boolean>;
    deletePostById(postId: string): Promise<boolean>;
}


