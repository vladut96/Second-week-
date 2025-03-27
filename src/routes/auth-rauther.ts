import { Request, Response, Router } from 'express';
import { authService } from '../domain/auth-service';
import { validateAuthInput, handleValidationErrors, validateUserInput,
    validateRegistrationCode, registrationEmailResendingValidator
} from '../validation/express-validator';
import {authenticateToken} from "../validation/authTokenMiddleware";
import { MeViewModel, UserInputModel } from "../types/types";


export const authRouter = Router();

authRouter.post('/login', validateAuthInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const authResult = await authService.authenticateUser(loginOrEmail, password);

    if (authResult) {
        return res.status(200).json({ accessToken: authResult.accessToken }); // Return JWT token
    }

    return res.status(401).json({
        errorsMessages: [{
            message: 'Invalid login or password',
            field: 'loginOrEmail'
        }]
    });
});
authRouter.post('/registration', validateUserInput, handleValidationErrors, async (req: Request, res: Response) => {
        const userData: UserInputModel = req.body;
        const result = await authService.registerUser(userData);

        if ('errorsMessages' in result) {
            return res.status(400).json(result);
        }

        return res.sendStatus(204);
    });
authRouter.post('/registration-confirmation', validateRegistrationCode, handleValidationErrors, async (req: Request, res: Response) => {
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
authRouter.post('/registration-email-resending', registrationEmailResendingValidator, handleValidationErrors,async (req: Request, res: Response) => {
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