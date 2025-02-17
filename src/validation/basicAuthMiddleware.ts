import { Request, Response, NextFunction } from 'express';

const BASIC_AUTH_USERNAME = 'admin';
const BASIC_AUTH_PASSWORD = 'qwerty';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Validate credentials
    if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
        return res.sendStatus(401);
    }

    return next();
};
