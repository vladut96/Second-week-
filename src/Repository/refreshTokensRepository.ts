
import { getRefreshTokensCollection } from '../db/mongoDB';
import { RefreshTokenModel } from '../types/types';

export const refreshTokensRepository = {
    async addToken(tokenData: Omit<RefreshTokenModel, '_id'>): Promise<boolean> {
        const result = await getRefreshTokensCollection().insertOne(tokenData);
        return result.acknowledged;
    },

    async invalidateToken(token: string): Promise<boolean> {
        const result = await getRefreshTokensCollection().updateOne(
            { token },
            { $set: { isValid: false, invalidatedAt: new Date() } }
        );
        return result.modifiedCount === 1;
    },

    async findToken(token: string): Promise<RefreshTokenModel | null> {
        return getRefreshTokensCollection().findOne({ token });
    },

    async isTokenValid(token: string): Promise<boolean> {
        const tokenData = await this.findToken(token);
        return !!tokenData && tokenData.isValid && new Date() < tokenData.expiresAt;
    },

    async removeExpiredTokens(): Promise<void> {
        await getRefreshTokensCollection().deleteMany({
            expiresAt: { $lt: new Date() }
        });
    }
};