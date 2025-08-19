import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authRepository } from "../composition-root";
dotenv.config();

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
    login: string;
    email: string;
}

export function isAccessTokenPayload(x: unknown): x is AccessTokenPayload {
    return !!x
        && typeof x === "object"
        && typeof (x as any).userId === "string"
        && typeof (x as any).login === "string"
        && typeof (x as any).email === "string";
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const header = req.header("authorization");
    if (!header) return res.sendStatus(401);

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!isAccessTokenPayload(decoded)) {
            return res.sendStatus(403);
        }

        const { userId, login, email } = decoded;
        req.user = { userId, login, email };
        req.userId = userId;
        return next();
    } catch (e) {
        return res.sendStatus(401);
    }
}
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
export const authenticateTokenToGetID = (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header("authorization");
    if (!header) return next();

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return next();

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!isAccessTokenPayload(decoded)) return next();

        const { userId, login, email } = decoded;
        req.user = { userId, login, email }; // строго соответствует MeViewModel
        req.userId = userId;
    } catch {
    } finally {
         next();
    }
};