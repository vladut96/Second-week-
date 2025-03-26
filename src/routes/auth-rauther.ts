import { Request, Response, Router } from 'express';
import { authService } from '../domain/auth-service';
import {
    validateAuthInput,
    handleValidationErrors,
    validateUserInput,
    validateRegistrationCode, registrationEmailResendingValidator
} from '../validation/express-validator';
import {authenticateToken} from "../validation/authTokenMiddleware";
import {
    EmailConfirmation,
    MeViewModel,
    RegisterUserDB,
    RegistrationEmailResending,
    UserInputModel
} from "../types/types";
import {usersService} from "../domain/users-service";

export const authRouter = Router();

authRouter.post('/login', validateAuthInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const authResult = await authService.authenticateUser(loginOrEmail, password);

    if (authResult) {
        return res.status(200).json({ accessToken: authResult.accessToken }); // Return JWT token
    }

    return res.status(401).json({ message: 'Invalid login or password' });
});
authRouter.post('/registration', validateUserInput, handleValidationErrors, async (req: Request, res: Response) => {
    const userData: UserInputModel = req.body;

    const newUser:RegisterUserDB<EmailConfirmation> | null = await authService.registerUser(userData);

    if (!newUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    return res.status(204);
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

        const success = await authService.resendConfirmationEmail(email);
        if (!success) {
            return res.status(400).json({
                errorsMessages: [{
                    message: "Email is already confirmed or doesn't exist",
                    field: "email"
                }]
            });
        }

        return res.sendStatus(204);
    }
);
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