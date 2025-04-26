import jwt from 'jsonwebtoken';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export const generateTokens = (user: { _id: any; email: string; login: string }, deviceId: string) => {
    const accessTokenExpiresIn = '10s';
    const refreshTokenExpiresIn = '20s';

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
