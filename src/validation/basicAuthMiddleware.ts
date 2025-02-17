import { Request, Response, NextFunction } from 'express';

const BASIC_AUTH_USERNAME = 'admin';
const BASIC_AUTH_PASSWORD = 'qwerty';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract Base64 credentials
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Invalid Authorization format' });
    }
    const base64Credentials = parts[1];

    // Decode Base64
    let credentials: string;
    try {
        credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } catch (error) {
        return res.status(401).json({ message: 'Invalid Authorization format' });
    }

    // Ensure credentials are properly formatted
    const credentialsArray = credentials.split(':');
    if (credentialsArray.length !== 2) {
        return res.status(401).json({ message: 'Invalid Authorization format' });
    }
    const [username, password] = credentialsArray;

    // Validate credentials
    if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
        return res.sendStatus(401);
    }

    return next();
};
