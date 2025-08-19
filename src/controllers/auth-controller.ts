import { injectable, inject } from 'inversify';
import {AuthService} from "../domain/auth-service";
import {Request, Response} from "express";
import {UAParser} from "ua-parser-js";
import {MeViewModel, UserInputModel} from "../types/types";

@injectable()
export class AuthController {
    constructor(@inject(AuthService) protected authService: AuthService) {
    }
    async login(req: Request, res: Response) {
        const { loginOrEmail, password } = req.body ;
        const ip: string = req.ip || 'Undefined';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const parser = new UAParser(userAgent);
        const deviceType = parser.getDevice().type || 'desktop'; // mobile, tablet, desktop
        const browser = parser.getBrowser().name || 'Unknown Browser';
        const os = parser.getOS().name || 'Unknown OS';

        const deviceName = `${browser} on ${os} (${deviceType})`;

        const authResult = await this.authService.authenticateUser(loginOrEmail, password, deviceName, ip);

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
            secure: true,
        });
        return res.status(200).json({ accessToken: authResult.accessToken });
    }
    async getRecoveryPassword (req: Request, res: Response) {
    const { email } = req.body;

try {
    await this.authService.requestPasswordRecovery(email);
    return res.sendStatus(204);
} catch (error) {
    console.error('Password recovery error:', error);
    return res.sendStatus(500);
}
}
    async getNewPassword (req: Request, res: Response) {
    const { newPassword, recoveryCode } = req.body;

if (!recoveryCode) {
    return res.status(400).json({
        errorsMessages: [{
            message: "Recovery code is required",
            field: "recoveryCode"
        }]
    });
}

try {
    const success = await this.authService.confirmPasswordRecovery(recoveryCode, newPassword);
    if (success) {
        return res.sendStatus(204);
    } else {
        return res.status(400).json({
            errorsMessages: [{
                message: "Recovery code is incorrect or expired",
                field: "recoveryCode"
            }]
        });
    }
} catch (error) {
    console.error('Password recovery confirmation error:', error);
    return res.sendStatus(500);
}
}
    async register (req: Request, res: Response) {
    const userData: UserInputModel = req.body;
    const result = await this.authService.registerUser(userData);

    if ('errorsMessages' in result) {
    return res.status(400).json(result);
}

return res.sendStatus(204);
}
    async getRegistrationConfirmation (req: Request, res: Response) {
    const { code } = req.body;

try {
    const isConfirmed = await this.authService.confirmEmail(code);

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
}
    async resendConfirmationEmail (req: Request, res: Response) {
    const { email } = req.body;

const result = await this.authService.resendConfirmationEmail(email);

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
}
    async getMyInfo (req: Request, res: Response) {
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
}
    async getRefreshToken (req: Request, res: Response) {
    try {
    console.log(req.context);
    const {userId, deviceId} = req.context!;

const tokens = await this.authService.refreshTokenPair(userId, deviceId);
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
}
    async logout (req: Request, res: Response) {
    try {
    console.log(req.context);
    const {  userId, deviceId } = req.context!;

const logoutResult = await this.authService.logout( userId, deviceId);

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
}
}