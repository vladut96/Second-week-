import { getUsersCollection } from '../db/mongoDB';
import {EmailConfirmation, RegisterUserDB, UserAuthModel, UserViewModel} from '../types/types';


export const authRepository = {
    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserAuthModel | null> {
        return await getUsersCollection().findOne<UserAuthModel>(
            { $or: [{ login: loginOrEmail }, { email: loginOrEmail }] },
            { projection: { _id: 1, login: 1, email: 1, passwordHash: 1 } }
        );
    },
    async findByConfirmationCode(code: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return getUsersCollection().findOne({
            'emailConfirmation.confirmationCode': code
        });
    },
    async updateConfirmationStatus(email: string, status: boolean): Promise<boolean> {
        try {
            const result = await getUsersCollection().updateOne(
                { email: email },
                {
                    $set: {
                        'emailConfirmation.isConfirmed': status
                    }
                }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error('Error updating confirmation status:', error);
            return false;
        }
    },
    async findByEmail(email: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return getUsersCollection().findOne({
            email,
            'emailConfirmation.isConfirmed': false
        });
    },

    async updateConfirmationCode(
        email: string,
        newCode: string,
        expirationDate: Date
    ): Promise<boolean> {
        const result = await getUsersCollection().updateOne(
            { email: email },
            {
                $set: {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': expirationDate
                }
            }
        );
        return result.modifiedCount === 1;
    },
    async userExists(email: string): Promise<boolean> {
        const count = await getUsersCollection().countDocuments({ email });
        return count > 0;
    }
};
