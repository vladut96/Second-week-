import { Request, Response, NextFunction } from 'express';
import { getRequestLogsCollection } from '../db/mongoDB';
import rateLimit from 'express-rate-limit';

export const requestLoggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestLogsCollection = getRequestLogsCollection();
        const ip = req.ip || req.socket.remoteAddress;

        // Просто логируем запрос
        await requestLogsCollection.insertOne({
            IP: ip,
            URL: req.originalUrl,
            method: req.method,
            date: new Date()
        });
    } catch (error) {
        console.error('Request logging error:', error);
    }

    next();
};

export const createRateLimiter = (windowMs: number, max: number) => rateLimit({
    windowMs,
    max,
    handler: (req, res) => {
        res.sendStatus(429); // Просто вернуть 429 без тела
    },
    keyGenerator: (req) => req.ip || 'unknown'
});