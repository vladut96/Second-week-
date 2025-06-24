import { Router } from 'express';
import {authController} from "../composition-root";
import {
    validateAuthInput, handleValidationErrors, validateUserInput,
    validateRegistrationCode, validateEmail, validatePassword
} from '../validation/express-validator';
import {authenticateToken, validateRefreshToken} from "../validation/authTokenMiddleware";
import { requestLoggerMiddleware} from "../validation/requestLoggerMiddleware";


export const authRouter = Router();

authRouter.post('/login', requestLoggerMiddleware,  validateAuthInput, handleValidationErrors, authController.login.bind(authController)  );
authRouter.post('/password-recovery', requestLoggerMiddleware, validateEmail, handleValidationErrors, authController.getRecoveryPassword.bind(authController) );
authRouter.post('/new-password', requestLoggerMiddleware, validatePassword, handleValidationErrors, authController.getNewPassword.bind(authController) );
authRouter.post('/registration', requestLoggerMiddleware, validateUserInput, handleValidationErrors, authController.register.bind(authController) );
authRouter.post('/registration-confirmation', requestLoggerMiddleware, validateRegistrationCode, handleValidationErrors, authController.getRegistrationConfirmation.bind(authController) );
authRouter.post('/registration-email-resending', requestLoggerMiddleware, validateEmail, handleValidationErrors, authController.resendConfirmationEmail.bind(authController) );
authRouter.get('/me', authenticateToken, authController.getMyInfo.bind(authController) );
authRouter.post('/refresh-token', validateRefreshToken, authController.getRefreshToken.bind(authController) );
authRouter.post('/logout',validateRefreshToken, authController.logout.bind(authController) );

