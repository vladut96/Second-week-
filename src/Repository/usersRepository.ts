import { getUsersCollection } from '../db/mongoDB';
import { ObjectId } from 'mongodb';
import { Paginator, RegisterUserDB, UserViewModel} from '../types/types';
import {EmailConfirmation} from "../../service/email-confirmation-code-generator";

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
            items: users.map((user: any): UserViewModel => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
            })),
        };
    },

    async getUserByLoginOrEmail(login: string, email: string): Promise<UserViewModel | null> {
        const user: any = await getUsersCollection().findOne({ $or: [{ login }, { email }] });

        if (!user) return null;

        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt // Convert Date to string if needed
        };
    },

    async createUser(user: RegisterUserDB<EmailConfirmation>): Promise<UserViewModel> {

        const newUser = {
            login: user.login,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmation: user.emailConfirmation,
            passwordRecovery: {
                recoveryCode:  null,
                expirationDate:  null
            }
        };
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
