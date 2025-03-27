import jwt from 'jsonwebtoken';
import { authRepository } from '../Repository/authRepository';
import {comparePasswords, hashPassword} from '../utils/passwordUtils';
import {EmailConfirmation, FieldError, MeViewModel, RegisterUserDB, UserInputModel} from "../types/types";
import {randomUUID} from "crypto";
import { add } from 'date-fns';
import dotenv from 'dotenv';
import {usersRepository} from "../Repository/usersRepository";
import {nodemailerService} from "../utils/nodemailerService";
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

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
        const confirmedUser: MeViewModel = {
            email: user.email,
            login: user.login,
            userId: user._id.toString(),
        };

        // Generate JWT token using the reusable function
        const accessToken = generateAccessToken(confirmedUser);

        return { accessToken };
    },
    async registerUser(
        userData: UserInputModel
    ): Promise<RegisterUserDB<EmailConfirmation> | { errorsMessages: FieldError[] }> {
        const { login, password, email } = userData;

        // Check for existing user
        const existingUser = await usersRepository.getUserByLoginOrEmail(login, email);

        if (existingUser) {
            const errorsMessages: FieldError[] = [];

            // Check which field already exists
            if (existingUser.login === login) {
                errorsMessages.push({
                    message: 'User with this login already exists',
                    field: 'login'
                });
            }

            if (existingUser.email === email) {
                errorsMessages.push({
                    message: 'User with this email already exists',
                    field: 'email'
                });
            }

            return { errorsMessages };
        }

        const passwordHash = await hashPassword(password);
        const confirmationCode = randomUUID();
        const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

        const newUser: RegisterUserDB<EmailConfirmation> = {
            login,
            email,
            passwordHash,
            emailConfirmation: {
                confirmationCode,
                expirationDate,
                isConfirmed: false
            }
        };

        await usersRepository.createUser(newUser);

        try {
            await nodemailerService.sendEmail(
                email,
                confirmationCode,
                nodemailerService.emailTemplates.registrationEmail
            );
        } catch (e) {
            console.error('Send email error', e);
        }

        return newUser;
    },
    async confirmEmail(code: string): Promise<boolean> {
        const user = await authRepository.findByConfirmationCode(code);

        if (!user) {
            return false;
        }

        // Проверка на уже подтверждённый email
        if (user.emailConfirmation.isConfirmed) {
            return false;
        }

        if (new Date() > user.emailConfirmation.expirationDate) {
             console.log(`Confirmation code expired for user ${user.email}`);
             return false;
        }

        // Обновляем статус подтверждения
        return authRepository.updateConfirmationStatus(user.email, true);
    },
    async resendConfirmationEmail(email: string): Promise<{success: boolean, reason?: string}> {
        // First check if user exists (regardless of confirmation status)
        const userExists = await authRepository.userExists(email);
        if (!userExists) {
            return { success: false, reason: "email" };
        }

        // Then check if already confirmed
        const user = await authRepository.findByEmail(email);
        if (!user) { // This now means user exists but is already confirmed
            return { success: false, reason: "confirmed" };
        }

        const newCode: string = randomUUID();
        const expirationDate = add(new Date(), { hours: 1 });

        const updated = await authRepository.updateConfirmationCode(
            email,
            newCode,
            expirationDate
        );

        if (!updated) return { success: false, reason: "update_failed" };

        try {
            await nodemailerService.sendEmail(
                email,
                newCode,
                nodemailerService.emailTemplates.registrationEmail
            );
            return { success: true };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, reason: "email_send_failed" };
        }
    }

};
