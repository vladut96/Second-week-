import { Request, Response, Router } from 'express';
import { authService } from '../domain/auth-service';
import { validateAuthInput, handleValidationErrors } from '../validation/express-validator';
import {authenticateToken} from "../validation/authTokenMiddleware";
import {MeViewModel} from "../types/types";

export const authRouter = Router();

authRouter.post('/login', validateAuthInput, handleValidationErrors, async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const authResult = await authService.authenticateUser(loginOrEmail, password);

    if (authResult) {
        return res.status(200).json({ accessToken: authResult.accessToken }); // Return JWT token
    }

    return res.status(401).json({ message: 'Invalid login or password' });
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