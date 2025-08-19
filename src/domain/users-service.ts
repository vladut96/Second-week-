import { injectable, inject } from 'inversify';
import { UsersRepository } from '../Repository/usersRepository';
import {UserViewModel, Paginator, UserInputModel, UsersQuery } from '../types/types';
import {UserEntity} from "../entities/user.entity";

@injectable()
export class UsersService {
    constructor(
        @inject(UsersRepository) protected usersRepository: UsersRepository // Add @inject
    ) {}

    async getUsers(params: UsersQuery ): Promise<Paginator<UserViewModel>> {
        const { users, totalCount } = await this.usersRepository.getUsers(params);

        const items: UserViewModel[] = users.map((user) =>
            UserEntity.fromPersistence(user).toViewModel()
        );

        return {
            pagesCount: Math.ceil(totalCount / params.pageSize),
            page: params.pageNumber,
            pageSize: params.pageSize,
            totalCount,
            items,
        };
    }
    async createUser(userDTO: UserInputModel) {
        const userEntity = await UserEntity.create(userDTO);
        const createdUser = await this.usersRepository.save(userEntity.toPersistence());
        return UserEntity.fromPersistence(createdUser).toViewModel();
    }
    async deleteUserById(userId: string): Promise<boolean> {
        return await this.usersRepository.deleteUserById(userId);
    }
}