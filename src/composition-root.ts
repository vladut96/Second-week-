import { Container} from 'inversify';
import 'reflect-metadata';

import { UsersRepository } from "./Repository/usersRepository";
import { AuthRepository } from "./Repository/authRepository";
import { BlogsRepository, BlogsQueryRepository } from "./Repository/blogsRepository";
import { PostsRepository, PostsQueryRepository } from "./Repository/postsRepository";
import { CommentsRepository } from "./Repository/commentsRepository";

import { UsersService } from "./domain/users-service";
import { AuthService } from "./domain/auth-service";
import { BlogService, BlogQueryService } from "./domain/blogs-service";
import { PostsService, PostsQueryService } from "./domain/posts-service";
import { CommentsService } from "./domain/comments-service";

import { UserController } from "./controllers/user-controller";
import { AuthController } from "./controllers/auth-controller";
import { BlogsController } from "./controllers/blogs-controller";
import { PostsController } from "./controllers/posts-controller";
import { CommentsController } from "./controllers/comments-controller";

const container = new Container();

// Регистрируем репозитории
container.bind<UsersRepository>(UsersRepository).toSelf().inSingletonScope();
container.bind<AuthRepository>(AuthRepository).toSelf().inSingletonScope();
container.bind<BlogsRepository>(BlogsRepository).toSelf().inSingletonScope();
container.bind<BlogsQueryRepository>(BlogsQueryRepository).toSelf().inSingletonScope();
container.bind<PostsRepository>(PostsRepository).toSelf().inSingletonScope();
container.bind<PostsQueryRepository>(PostsQueryRepository).toSelf().inSingletonScope();
container.bind<CommentsRepository>(CommentsRepository).toSelf().inSingletonScope();

// Регистрируем сервисы
container.bind<UsersService>(UsersService).to(UsersService).inSingletonScope();
container.bind<AuthService>(AuthService).toSelf().inSingletonScope();
container.bind<BlogService>(BlogService).toSelf().inSingletonScope();
container.bind<BlogQueryService>(BlogQueryService).toSelf().inSingletonScope();
container.bind<PostsService>(PostsService).toSelf().inSingletonScope();
container.bind<PostsQueryService>(PostsQueryService).toSelf().inSingletonScope();
container.bind<CommentsService>(CommentsService).toSelf().inSingletonScope();

// Регистрируем контроллеры
container.bind<UserController>(UserController).toSelf().inSingletonScope();
container.bind<AuthController>(AuthController).toSelf().inSingletonScope();
container.bind<BlogsController>(BlogsController).toSelf().inSingletonScope();
container.bind<PostsController>(PostsController).toSelf().inSingletonScope();
container.bind<CommentsController>(CommentsController).toSelf().inSingletonScope();

// Экспортируем контейнер и необходимые зависимости
export { container };

// Для обратной совместимости экспортируем контроллеры
export const userController = container.get<UserController>(UserController);
export const authController = container.get<AuthController>(AuthController);
export const postsController = container.get<PostsController>(PostsController);
export const blogsController = container.get<BlogsController>(BlogsController);
export const commentsController = container.get<CommentsController>(CommentsController);

// Экспортируем репозитории, если они нужны напрямую
export const authRepository = container.get<AuthRepository>(AuthRepository);


// export const blogsRepository = container.get<BlogsRepository>(BlogsRepository);
// export const blogsQueryRepository = container.get<BlogsQueryRepository>(BlogsQueryRepository);
// export const commentsRepository = container.get<CommentsRepository>(CommentsRepository);

