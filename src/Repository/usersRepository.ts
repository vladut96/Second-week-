import { UserModel } from '../db/models';
import { Paginator, RegisterUserDB, UserViewModel } from '../types/types';
import { EmailConfirmation } from "../../service/email-confirmation-code-generator";
import {injectable} from "inversify";

@injectable()
export class UsersRepository {
    async getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize }:
                   { searchLoginTerm?: string; searchEmailTerm?: string; sortBy: string; sortDirection: 1 | -1; pageNumber: number; pageSize: number; }
    ): Promise<Paginator<UserViewModel>> {
        const filter: any = {};

        if (searchLoginTerm || searchEmailTerm) {
            filter.$or = [];

            if (searchLoginTerm) {
                filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
            }
            if (searchEmailTerm) {
                filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
            }
        }

        const totalCount = await UserModel.countDocuments(filter);

        const users = await UserModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: users.map((user): UserViewModel => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt|| 'unknown',
            })),
        };
    }

    async getUserByLoginOrEmail(login: string, email: string): Promise<UserViewModel | null> {
        const user = await UserModel.findOne({ $or: [{ login }, { email }] }).lean();

        if (!user) return null;

        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt || 'unknown'
        };
    }

    async createUser(user: RegisterUserDB<EmailConfirmation>): Promise<UserViewModel> {
        const newUser = new UserModel({
            login: user.login,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmation: user.emailConfirmation,
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null
            }
        });

        await newUser.save();

        return {
            id: newUser._id.toString(),
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt || 'unknown',
        };
    }

    async deleteUserById(userId: string): Promise<boolean> {
        const result = await UserModel.deleteOne({ _id: userId });
        return result.deletedCount > 0;
    }
}