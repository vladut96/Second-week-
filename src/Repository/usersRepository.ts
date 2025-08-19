import {UserModel, UserSchemaType} from '../db/models';
import {RegisterUserDB, UsersQuery, UserViewModel} from '../types/types';
import { EmailConfirmation } from "../service/email-confirmation-code-generator";
import {injectable} from "inversify";
import {FilterQuery, HydratedDocument, SortOrder} from "mongoose";

@injectable()
export class UsersRepository {
    async getUsers(params: UsersQuery): Promise<{users: HydratedDocument<UserSchemaType>[]; totalCount: number; }> {
        const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter: FilterQuery<UserSchemaType> = {};
        if (searchLoginTerm || searchEmailTerm) {
            filter.$or = [];
            if (searchLoginTerm) filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
            if (searchEmailTerm) filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
            if (filter.$or.length === 0) delete filter.$or;
        }

        const totalCount = await UserModel.countDocuments(filter);

        const users = await UserModel
            .find(filter)
            .sort({ [sortBy]: sortDirection as SortOrder })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return { users, totalCount };
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
    async save(newUser: UserSchemaType): Promise<HydratedDocument<UserSchemaType>> {
        return await UserModel.create(newUser);
    }
    async deleteUserById(userId: string): Promise<boolean> {
        const result = await UserModel.deleteOne({ _id: userId });
        return result.deletedCount > 0;
    }
}