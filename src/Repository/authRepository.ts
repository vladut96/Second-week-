import {getDevicesCollection, getUsersCollection} from '../db/mongoDB';
import {DeviceAuthSession, RegisterUserDB, UserAuthModel} from '../types/types';
import {ObjectId} from "mongodb";
import {EmailConfirmation} from "../../service/email-confirmation-code-generator";


export const authRepository = {
    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserAuthModel | null> {
        return await getUsersCollection().findOne<UserAuthModel>(
            { $or: [{ login: loginOrEmail }, { email: loginOrEmail }] },
            { projection: { _id: 1, login: 1, email: 1, passwordHash: 1 } }
        );
    },
    async getUserById(userId: string): Promise<UserAuthModel | null> {
        return await getUsersCollection().findOne<UserAuthModel>(
            { _id: new ObjectId(userId) },
            { projection: { _id: 1, login: 1, email: 1} }
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
    async createDeviceSession(sessionData: DeviceAuthSession): Promise<boolean> {
        try {
            const result = await getDevicesCollection().insertOne(sessionData);
            return !!result.insertedId;
        } catch (error) {
            console.error('Session creation error:', error);
            return false;
        }
    },
    async findSessionByDeviceId(deviceId: string): Promise<DeviceAuthSession | null> {
        return getDevicesCollection().findOne({ deviceId });
    },
    async deleteDeviceSession(userId: string, deviceId: string): Promise<boolean> {
        const result = await getDevicesCollection().deleteOne({
            deviceId,
            userId
        });
        return result.deletedCount === 1;
    },
    async updateDeviceSession(sessionData: { deviceId: string; lastActiveDate: string; exp: string; }): Promise<boolean> {
        try {
            const updateFields: any = {
                $set: {
                    lastActiveDate: sessionData.lastActiveDate,
                    exp: sessionData.exp,
                }
            };

            const result = await getDevicesCollection().updateOne(
                { deviceId: sessionData.deviceId },
                updateFields
            );
            return result.matchedCount === 1;
        } catch (error) {
            console.error('Failed to update device session:', error);
            return false;
        }
    },
    async updateConfirmationCode( email: string, newCode: string, expirationDate: Date ): Promise<boolean> {
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
    async findUserByEmail(email: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return getUsersCollection().findOne({ email });
    },

    async setPasswordRecoveryCode(email: string, recoveryCode: string, expirationDate: Date): Promise<boolean> {
        const result = await getUsersCollection().updateOne(
            { email },
            {
                $set: {
                    'passwordRecovery.recoveryCode': recoveryCode,
                    'passwordRecovery.expirationDate': expirationDate
                }
            }
        );
        return result.modifiedCount === 1;
    },

    async findUserByRecoveryCode(recoveryCode: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return getUsersCollection().findOne({
            'passwordRecovery.recoveryCode': recoveryCode
        });
    },

    async updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
        const result = await getUsersCollection().updateOne(
            { email },
            {
                $set: {
                    passwordHash: newPasswordHash,
                }
            }
        );
        return result.modifiedCount === 1;
    }
};
