import jwt from 'jsonwebtoken';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export const generateTokens = (user: { _id: any; email: string; login: string }, deviceId: string) => {
    const accessTokenExpiresIn = '10m'; // 10 минут
    const refreshTokenExpiresIn = '7d'; // 7 дней

    const accessToken = jwt.sign(
        {
            email: user.email,
            login: user.login,
            userId: user._id.toString(),
        },
        process.env.JWT_SECRET!,
        { expiresIn: accessTokenExpiresIn }
    );

    const refreshToken = jwt.sign(
        {
            userId: user._id.toString(),
            deviceId, // Используем переданный deviceId
        },
        process.env.JWT_SECRET!,
        { expiresIn: refreshTokenExpiresIn }
    );

    return {
        accessToken,
        refreshToken
    };
};

export const createEmailConfirmation = () => ({
    confirmationCode: randomUUID(),
    expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
    isConfirmed: false
});