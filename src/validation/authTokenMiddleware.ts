import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    email: string;
    login: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Используем переменные окружения

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

        next(); // Передаем управление следующему middleware
    });
    return
};
