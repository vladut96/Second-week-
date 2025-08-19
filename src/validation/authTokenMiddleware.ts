import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authRepository } from "../composition-root";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // 401 Unauthorized (отсутствует токен)
    }

    // @ts-ignore
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err.message); // Логирование для отладки
            return res.sendStatus(401); // 401 Unauthorized (недействительный токен)
        }

        // Проверяем, что payload содержит userId
        const payload = decoded as JwtPayload;
        if (!payload?.userId) {
            return res.sendStatus(403); // 403 Forbidden (невалидный payload)
        }

        req.user = {
            email: payload.email,
            login: payload.login,
            userId: payload.userId,
        };

        next();
    });
    return
};
export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
            userId: string;
            deviceId: string;
            iat: number;
            exp: number;
        };

        const activeSession = await authRepository.findSessionByDeviceId(decoded.deviceId);
        if (!activeSession || !activeSession.lastActiveDate) return res.sendStatus(401);

        const sessionIat = Math.floor(new Date(activeSession.lastActiveDate).getTime() / 1000);
        if (sessionIat !== decoded.iat) return res.sendStatus(401);

        req.context = {
            userId: decoded.userId,
            deviceId: decoded.deviceId,
        };

        return next();
    } catch (error) {
        return res.sendStatus(401);
    }
};
export const authenticateTokenToGetID = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const userPayload: any = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = { userId: userPayload.userId };
        } catch (err) {
        }
    }

    next();
};