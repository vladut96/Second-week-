import { Request, Response, Router } from 'express';
import { authService } from '../domain/auth-service';
import { validateAuthInput, handleValidationErrors } from '../validation/express-validator';

export const authRouter = Router();

authRouter.post('/login',validateAuthInput, handleValidationErrors, async (req: Request, res: Response) => {
        const { loginOrEmail, password } = req.body;

        // Step 3: Attempt authentication if validation passed
        const isAuthenticated = await authService.authenticateUser(loginOrEmail, password);

        if (isAuthenticated) {
            return res.sendStatus(204); // Login successful
        }

        return res.status(401).json({ message: 'Invalid login or password' });
    }
);
