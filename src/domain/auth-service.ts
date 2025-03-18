import jwt from 'jsonwebtoken';
import { authRepository } from '../Repository/authRepository';
import { comparePasswords } from '../utils/passwordUtils';
import {MeViewModel} from "../types/types";

const JWT_SECRET = 'your-secret-key'; // Replace with a secure key in production

export const generateAccessToken = (user: MeViewModel) => {
    return jwt.sign(
        {
            email: user.email,
            login: user.login,
            userId: user.userId,
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );
};

export const authService = {
    async authenticateUser(loginOrEmail: string, password: string): Promise<{ accessToken: string } | null> {
        const user = await authRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user) return null; // User not found

        const isPasswordValid = await comparePasswords(password, user.passwordHash);
        if (!isPasswordValid) return null; // Invalid password

        // Create a MeViewModel object
        const meViewModel: MeViewModel = {
            email: user.email,
            login: user.login,
            userId: user._id.toString(), // Convert ObjectId to string
        };

        // Generate JWT token using the reusable function
        const accessToken = generateAccessToken(meViewModel);

        return { accessToken };
    }
};
