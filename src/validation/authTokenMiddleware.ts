import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface JwtPayload {
    userId: string;
    email: string;
    login: string;
}

const JWT_SECRET = 'your-secret-key'; // Same key used for signing tokens

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err , decoded ) => {
        if (err) return res.sendStatus(403);

        const payload = decoded as JwtPayload;

        req.user = {
            email: payload.email,
            login: payload.login,
            userId: payload.userId,
        };

        return next();
    });
    return;
};