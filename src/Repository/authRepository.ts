import { injectable } from 'inversify';
import { DeviceAuthSessionModel, UserModel } from '../db/models';
import { DeviceAuthSession, RegisterUserDB, UserAuthModel } from '../types/types';
import { EmailConfirmation } from "../service/email-confirmation-code-generator";

@injectable()
export class AuthRepository {
    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserAuthModel | null> {
        return UserModel.findOne(
            { $or: [{ login: loginOrEmail }, { email: loginOrEmail }] },
            { _id: 1, login: 1, email: 1, passwordHash: 1 }
        ).lean();
    }
    async getUserById(userId: string): Promise<UserAuthModel | null> {
        return UserModel.findById(
            userId,
            { _id: 1, login: 1, email: 1 }
        ).lean();
    }
    async findByConfirmationCode(code: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return UserModel.findOne({
            'emailConfirmation.confirmationCode': code
        }).lean();
    }
    async updateConfirmationStatus(email: string, status: boolean): Promise<boolean> {
        try {
            const result = await UserModel.updateOne(
                { email },
                { $set: { 'emailConfirmation.isConfirmed': status } }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error('Error updating confirmation status:', error);
            return false;
        }
    }
    async findByEmail(email: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return UserModel.findOne({
            email,
            'emailConfirmation.isConfirmed': false
        }).lean();
    }
    async createDeviceSession(sessionData: DeviceAuthSession): Promise<boolean> {
        try {
            const session = new DeviceAuthSessionModel(sessionData);
            await session.save();
            return true;
        } catch (error) {
            console.error('Session creation error:', error);
            return false;
        }
    }
    async findSessionByDeviceId(deviceId: string): Promise<DeviceAuthSession | null> {
        return DeviceAuthSessionModel.findOne({ deviceId }).lean();
    }
    async deleteDeviceSession(userId: string, deviceId: string): Promise<boolean> {
        const result = await DeviceAuthSessionModel.deleteOne({
            deviceId,
            userId
        });
        return result.deletedCount === 1;
    }
    async updateDeviceSession(sessionData: { deviceId: string; lastActiveDate: string; exp: string; }): Promise<boolean> {
        try {
            const result = await DeviceAuthSessionModel.updateOne(
                { deviceId: sessionData.deviceId },
                {
                    $set: {
                        lastActiveDate: sessionData.lastActiveDate,
                        exp: sessionData.exp
                    }
                }
            );
            return result.matchedCount === 1;
        } catch (error) {
            console.error('Failed to update device session:', error);
            return false;
        }
    }
    async updateConfirmationCode(email: string, newCode: string, expirationDate: Date): Promise<boolean> {
        const result = await UserModel.updateOne(
            { email },
            {
                $set: {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': expirationDate
                }
            }
        );
        return result.modifiedCount === 1;
    }
    async findUserByEmail(email: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return UserModel.findOne({ email }).lean();
    }
    async setPasswordRecoveryCode(email: string, recoveryCode: string, expirationDate: Date): Promise<boolean> {
        const result = await UserModel.updateOne(
            { email },
            {
                $set: {
                    'passwordRecovery.recoveryCode': recoveryCode,
                    'passwordRecovery.expirationDate': expirationDate
                }
            }
        );
        return result.modifiedCount === 1;
    }
    async findUserByRecoveryCode(recoveryCode: string): Promise<RegisterUserDB<EmailConfirmation> | null> {
        return UserModel.findOne({
            'passwordRecovery.recoveryCode': recoveryCode
        }).lean();
    }
    async updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
        const result = await UserModel.updateOne(
            { email },
            { $set: { passwordHash: newPasswordHash } }
        );
        return result.modifiedCount === 1;
    }
}