import { Request, Response, Router } from 'express';
import { UAParser } from 'ua-parser-js';
import {authService} from '../domain/auth-service';
import { validateAuthInput, handleValidationErrors, validateUserInput,
    validateRegistrationCode, registrationEmailResendingValidator
} from '../validation/express-validator';
import {authenticateToken, validateRefreshToken} from "../validation/authTokenMiddleware";
import { MeViewModel, UserInputModel } from "../types/types";
import { requestLoggerMiddleware} from "../validation/requestLoggerMiddleware";

export const authRouter = Router();


authRouter.post('/login', requestLoggerMiddleware,  validateAuthInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body ;
    const ip: string = req.ip || 'Undefined';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type || 'desktop'; // mobile, tablet, desktop
    const browser = parser.getBrowser().name || 'Unknown Browser';
    const os = parser.getOS().name || 'Unknown OS';

    const deviceName = `${browser} on ${os} (${deviceType})`;

    const authResult = await authService.authenticateUser(loginOrEmail, password, deviceName, ip);

    if (!authResult) {
        return res.status(401).json({
            errorsMessages: [{
                message: 'Invalid login or password',
                field: 'loginOrEmail'
            }]
        });
    }
    res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
    return res.status(200).json({ accessToken: authResult.accessToken });
});
authRouter.post('/registration', requestLoggerMiddleware, validateUserInput, handleValidationErrors, async (req: Request, res: Response) => {
        const userData: UserInputModel = req.body;
        const result = await authService.registerUser(userData);

        if ('errorsMessages' in result) {
            return res.status(400).json(result);
        }

        return res.sendStatus(204);
    });
authRouter.post('/registration-confirmation', requestLoggerMiddleware, validateRegistrationCode, handleValidationErrors, async (req: Request, res: Response) => {
        const { code } = req.body;

        try {
            const isConfirmed = await authService.confirmEmail(code);

            if (isConfirmed) {
                return res.sendStatus(204);
            } else {
                return res.status(400).json({
                    errorsMessages: [{
                        message: "Confirmation code is incorrect or expired",
                        field: "code"
                    }]
                });
            }
        } catch (error) {
            console.error('Confirmation error:', error);
            return res.status(500).json({
                errorsMessages: [{
                    message: "Internal server error",
                    field: "server"
                }]
            });
        }
    });
authRouter.post('/registration-email-resending', requestLoggerMiddleware, registrationEmailResendingValidator, handleValidationErrors,async (req: Request, res: Response) => {
        const { email } = req.body;

    const result = await authService.resendConfirmationEmail(email);

    if (!result.success) {
        let message = "Email is already confirmed or doesn't exist";
        if (result.reason === "email") {
            message = "User with this email doesn't exist";
        } else if (result.reason === "confirmed") {
            message = "Email is already confirmed";
        }
        return res.status(400).json({
            errorsMessages: [{
                message,
                field: "email"
            }]
        });
    }

        return res.sendStatus(204);
    });
authRouter.get('/me', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.sendStatus(401);
    }
    const meViewModel: MeViewModel = {
        email: user.email,
        login: user.login,
        userId: user.userId,
    };

    return res.status(200).json(meViewModel);
});
authRouter.post('/refresh-token', validateRefreshToken, async (req: Request, res: Response) => {
        try {
            console.log(req.context);
            const {userId, deviceId} = req.context!;

            const tokens = await authService.refreshTokenPair(userId, deviceId);
            if (!tokens) {
                return res.sendStatus(401);
            }

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            return res.status(200).json({ accessToken: tokens.accessToken });
        } catch (error) {
            console.error('Refresh token endpoint error:', error);
            return res.sendStatus(500);
        }
    });
authRouter.post('/logout',validateRefreshToken, async (req: Request, res: Response) => {
        try {
            console.log(req.context);
             const {  userId, deviceId } = req.context!;

            const logoutResult = await authService.logout( userId, deviceId);

            if (!logoutResult) {
                return res.sendStatus(401);
            }
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return res.sendStatus(204);
        } catch (error) {
            console.error('Logout error:', error);
            return res.sendStatus(500);
        }
    });

