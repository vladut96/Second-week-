
import { getRefreshTokensCollection } from '../db/mongoDB';
import { RefreshTokenModel } from '../types/types';

export const refreshTokensRepository = {
    async addToken(tokenData: Omit<RefreshTokenModel, '_id'>): Promise<boolean> {
        try {
            const result = await getRefreshTokensCollection().insertOne(tokenData);
            return result.acknowledged;
        } catch (e) {
            console.error('Error saving refresh token:', e);
            return false;
        }
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
    }
};