import jwt from 'jsonwebtoken';
import { authRepository } from '../Repository/authRepository';
import {comparePasswords, hashPassword} from '../utils/passwordUtils';
import {EmailConfirmation, FieldError, MeViewModel, RegisterUserDB, UserInputModel} from "../types/types";
import {randomUUID} from "crypto";
import { add } from 'date-fns';
import dotenv from 'dotenv';
import {usersRepository} from "../Repository/usersRepository";
import {nodemailerService} from "../utils/nodemailerService";
import {refreshTokensRepository} from "../Repository/refreshTokensRepository";
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

export const authService = {
    async authenticateUser(loginOrEmail: string, password: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        const user = await authRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user) return null;

        const isPasswordValid = await comparePasswords(password, user.passwordHash);
        if (!isPasswordValid) return null;

        //  accessToken с коротким сроком жизни (10 секунд)
        const accessToken = jwt.sign(
            {
                email: user.email,
                login: user.login,
                userId: user._id.toString(),
            },
            JWT_SECRET,
            { expiresIn: '10s' } // 10 секунд
        );

        // Генерируем refreshToken с коротким сроком жизни (20 секунд)
        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            JWT_SECRET,
            { expiresIn: '20s' } // 20 секунд
        );

        // Сохраняем refreshToken в базу
        await refreshTokensRepository.addToken({
            token: refreshToken,
            userId: user._id.toString(),
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 20000), // +20 секунд
            isValid: true
        });

        return { accessToken, refreshToken };
    },
    async registerUser( userData: UserInputModel ): Promise<RegisterUserDB<EmailConfirmation> | { errorsMessages: FieldError[] }> {
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
        // First check if user exists
        const user = await authRepository.findByEmail(email);
        if (!user) {
            return { success: false, reason: "email" };
        }

        // Then check if already confirmed
        if (user.emailConfirmation.isConfirmed) {
            return { success: false, reason: "confirmed" };
        }

        const newCode: string = randomUUID();
        const expirationDate = add(new Date(), { hours: 1 });

        const updated = await authRepository.updateConfirmationCode(
            email,
            newCode,
            expirationDate
        );
        console.log(newCode);

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
    },
    async refreshTokenPair(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        // 1. Проверяем валидность старого токена
        const tokenData = await refreshTokensRepository.findToken(oldRefreshToken);
        if (!tokenData || !tokenData.isValid || new Date() > tokenData.expiresAt) {
            return null;
        }

        // 2. Инвалидируем старый токен
        await refreshTokensRepository.invalidateToken(oldRefreshToken);

        // 3. Получаем данные пользователя
        const user = await authRepository.getUserById(tokenData.userId);
        if (!user) return null;

        // 4. Генерируем новую пару токенов
        const accessToken = jwt.sign(
            {
                email: user.email,
                login: user.login,
                userId: user._id.toString(),
            },
            JWT_SECRET,
            { expiresIn: '10s' } // 10 секунд
        );

        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            JWT_SECRET,
            { expiresIn: '20s' } // 20 секунд
        );

        // 5. Сохраняем новый refreshToken
        await refreshTokensRepository.addToken({
            token: refreshToken,
            userId: user._id.toString(),
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 20000), // +20 секунд
            isValid: true
        });

        return { accessToken, refreshToken };
    },
    async logout(refreshToken: string): Promise<boolean> {
        // Проверяем существование токена
        const tokenData = await refreshTokensRepository.findToken(refreshToken);
        if (!tokenData || !tokenData.isValid) {
            return false;
        }

        // Инвалидируем токен
        return refreshTokensRepository.invalidateToken(refreshToken);
    }
};
