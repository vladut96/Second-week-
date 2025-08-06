import jwt from 'jsonwebtoken';

export const generateTokens = (user: { _id: any; email: string; login: string }, deviceId: string) => {
    const accessTokenExpiresIn = '1000000s';
    const refreshTokenExpiresIn = '200000s';

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
