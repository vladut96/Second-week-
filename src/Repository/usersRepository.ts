import { getUsersCollection } from '../db/mongoDB';
import { ObjectId } from 'mongodb';
import {Paginator, UserViewModel} from '../types/types';

export const usersRepository = {
    async getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize }:
                   { searchLoginTerm?: string; searchEmailTerm?: string; sortBy: string; sortDirection: 1 | -1; pageNumber: number; pageSize: number; }
    ): Promise<Paginator<UserViewModel>> {
        const filter: any = {};

        if (searchLoginTerm || searchEmailTerm) {
            filter.$or = []; // Создаём массив условий

            if (searchLoginTerm) {
                filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
            }
            if (searchEmailTerm) {
                filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
            }
        }

        console.log('📌 MongoDB Filter:', JSON.stringify(filter)); // ✅ Для отладки

        // ✅ Подсчёт количества записей для пагинации
        const totalCount = await getUsersCollection().countDocuments(filter);

        // ✅ Поиск пользователей с сортировкой и пагинацией
        const users = await getUsersCollection()
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: users.map(user => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
            })),
        };
    },

    async getUserByLoginOrEmail(login: string, email: string): Promise<UserViewModel | null> {
        return await getUsersCollection().findOne({ $or: [{ login }, { email }] });
    },

    async createUser(user: { login: string; email: string; passwordHash: string }): Promise<UserViewModel> {
        const newUser = {
            login: user.login,
            email: user.email,
            passwordHash: user.passwordHash, // ✅ Now passwordHash exists in this object
            createdAt: new Date().toISOString(),
        };

        // @ts-ignore
        const result = await getUsersCollection().insertOne(newUser);
        return {
            id: result.insertedId.toString(),
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt,
        };
    },

    async deleteUserById(userId: string): Promise<boolean> {
        if (!ObjectId.isValid(userId)) return false;
        const result = await getUsersCollection().deleteOne({ _id: new ObjectId(userId) });
        return result.deletedCount > 0;
    }
};
