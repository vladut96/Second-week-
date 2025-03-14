import { getUsersCollection } from '../db/mongoDB';
import {UserAuthModel} from '../types/types';


export const authRepository = {
    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserAuthModel | null> {
        return await getUsersCollection().findOne<UserAuthModel>(
            { $or: [{ login: loginOrEmail }, { email: loginOrEmail }] },
            { projection: { _id: 1, login: 1, email: 1, passwordHash: 1 } }
        );
    }
};
