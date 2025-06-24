import { Request, Response, NextFunction } from 'express';
import { RequestLogModel } from '../db/models';
import { subSeconds } from 'date-fns';

export const requestLoggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Логируем запрос
        await RequestLogModel.create({
            IP: req.ip,
            URL: req.originalUrl,
            date: new Date()
        });

        // Проверяем количество запросов за последние 10 секунд
        const tenSecondsAgo = subSeconds(new Date(), 10);
        const requestCount = await RequestLogModel.countDocuments({
            IP: req.ip,
            URL: req.originalUrl,
            date: { $gte: tenSecondsAgo }
        });

        // Если больше 5 запросов за 10 секунд - возвращаем ошибку
        if (requestCount > 5) {
            return res.status(429).json({
                errorsMessages: [{
                    message: 'Too many requests',
                    field: 'rate limit'
                }]
            });
        }

        return next();
    } catch (error) {
        console.error('Request logging error:', error);
        return next();
    }
};