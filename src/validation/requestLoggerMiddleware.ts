import { Request, Response, NextFunction } from 'express';
import { getRequestLogsCollection } from '../db/mongoDB';
import { subSeconds } from 'date-fns';

export const requestLoggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestLogsCollection = getRequestLogsCollection();
        const ip = req.ip || req.socket.remoteAddress;

        // Log the request
        await requestLogsCollection.insertOne({
            IP: ip,
            URL: req.originalUrl,
            method: req.method,
            date: new Date()
        });

        // Check request count in last 10 seconds
        const tenSecondsAgo = subSeconds(new Date(), 10);
        const requestCount = await requestLogsCollection.countDocuments({
            IP: ip,
            date: { $gte: tenSecondsAgo }
        });

        // Apply rate limiting
        if (requestCount > 5) {
            // Set Retry-After header
            res.set('Retry-After', '10');
            return res.status(429).json({
                errorsMessages: [{
                    message: 'Too many requests, please try again later',
                    field: 'rate limit'
                }]
            });
        }

        return next();
    } catch (error) {
        console.error('Request logging error:', error);
        // Continue processing even if logging fails
        return next();
    }
};