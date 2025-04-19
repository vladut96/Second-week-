import {getDevicesCollection, getUsersCollection} from '../db/mongoDB';
import {DeviceAuthSession, EmailConfirmation, RegisterUserDB, UserAuthModel} from '../types/types';
import {ObjectId} from "mongodb";


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
    async createDeviceSession(sessionData: {
        userId: string;
        deviceId: string;
        lastActiveDate?: number;
        title: string;
        ip: string;
        exp?: number;
    }): Promise<boolean> {
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
    async deleteDeviceSession(deviceId: string, userId: string): Promise<boolean> {
        const result = await getDevicesCollection().deleteOne({
            deviceId,
            userId
        });
        return result.deletedCount === 1;
    },
    async updateDeviceSession(sessionData: {
        deviceId: string;
        lastActiveDate: number;  // Unix timestamp (секунды)
        exp: number;  // Unix timestamp (секунды)
    }): Promise<boolean> {
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
};
