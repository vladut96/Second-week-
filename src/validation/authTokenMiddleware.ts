import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import {authRepository} from "../Repository/authRepository";
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

    // 1. Check if token exists
    if (!refreshToken) {
        return res.status(401).json({
            errorsMessages: [{
                message: "Refresh token missing",
                field: "refreshToken"
            }]
        });
    }

    try {
        // 2. Verify token signature and expiration
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
            userId: string;
            deviceId: string;
            iat: number;
            exp: number;
        };

        // 3. Check session in database
        const activeSession = await authRepository.findSessionByDeviceId(decoded.deviceId);

        // Convert iat to comparable format (ISO string or timestamp)
        const tokenIatISO = new Date(decoded.iat * 1000).toISOString();

        if (!activeSession || activeSession.lastActiveDate !== tokenIatISO) {
            return res.status(401).json({
                errorsMessages: [{
                    message: "Invalid session",
                    field: "refreshToken"
                }]
            });
        }

        // 4. Set context for downstream middleware
        req.context = {
            userId: decoded.userId,
            deviceId: decoded.deviceId,
        };

        return next();

    } catch (error) {
        // Handle different JWT error cases
        let errorMessage = "Invalid token";
        if (error instanceof jwt.TokenExpiredError) {
            errorMessage = "Token expired";
        } else if (error instanceof jwt.JsonWebTokenError) {
            errorMessage = "Malformed token";
        }

        return res.status(401).json({
            errorsMessages: [{
                message: errorMessage,
                field: "refreshToken"
            }]
        });
    }
};