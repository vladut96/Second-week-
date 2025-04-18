import { authRepository } from '../Repository/authRepository';
import { comparePasswords, hashPassword } from '../utils/passwordUtils';
import { usersRepository } from "../Repository/usersRepository";
import { nodemailerService } from "../utils/nodemailerService";
import { generateTokens, createEmailConfirmation } from '../utils/authUtils';
import {EmailConfirmation, FieldError, RegisterUserDB, UserInputModel, UserPublicModel} from "../types/types";
import {randomUUID} from "crypto";
import jwt, {JwtPayload} from "jsonwebtoken";

export const authService = {
    async authenticateUser(loginOrEmail: string, password: string, deviceName: string, ip: string) {
        const user = await authRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user || !await comparePasswords(password, user.passwordHash)) {
            return null;
        }

        const deviceId = randomUUID();
        const { accessToken, refreshToken } = generateTokens(user, deviceId);
        const refreshDecode = jwt.decode(refreshToken) as JwtPayload

        await authRepository.createDeviceSession({
            userId: user._id.toString(),
            deviceId,
            iat: refreshDecode.iat,
            deviceName,
            ip,
            exp: refreshDecode.exp
        });

        return { accessToken, refreshToken };
    },
    async registerUser(userData: UserInputModel) {
        const { login, password, email } = userData;
        const existingUser = await usersRepository.getUserByLoginOrEmail(login, email);

        if (existingUser) {
            const errorsMessages: FieldError[] = [];
            if (existingUser.login === login) errorsMessages.push({ message: 'User with this login already exists', field: 'login' });
            if (existingUser.email === email) errorsMessages.push({ message: 'User with this email already exists', field: 'email' });
            return { errorsMessages };
        }

        const newUser: RegisterUserDB<EmailConfirmation> = {
            login,
            email,
            passwordHash: await hashPassword(password),
            emailConfirmation: createEmailConfirmation()
        };

        await usersRepository.createUser(newUser);

        try {
            await nodemailerService.sendEmail(
                email,
                newUser.emailConfirmation.confirmationCode,
                nodemailerService.emailTemplates.registrationEmail
            );
        } catch (e) {
            console.error('Send email error', e);
        }

        return newUser;
    },
    async confirmEmail(code: string) {
        const user = await authRepository.findByConfirmationCode(code);
        if (!user || user.emailConfirmation.isConfirmed || new Date() > user.emailConfirmation.expirationDate) {
            console.log(`Confirmation failed for code ${code}`);
            return false;
        }
        return authRepository.updateConfirmationStatus(user.email, true);
    },
    async resendConfirmationEmail(email: string) {
        const user = await authRepository.findByEmail(email);
        if (!user) return { success: false, reason: "email" };
        if (user.emailConfirmation.isConfirmed) return { success: false, reason: "confirmed" };

        const newConfirmation = createEmailConfirmation();
        const updated = await authRepository.updateConfirmationCode(
            email,
            newConfirmation.confirmationCode,
            newConfirmation.expirationDate
        );

        if (!updated) return { success: false, reason: "update_failed" };

        try {
            await nodemailerService.sendEmail(
                email,
                newConfirmation.confirmationCode,
                nodemailerService.emailTemplates.registrationEmail
            );
            return { success: true };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, reason: "email_send_failed" };
        }
    },
    async refreshTokenPair(userId: string, deviceId: string) {
        try {
            const user = await authRepository.getUserById(userId);

            if (!user) {
                return null;
            }
            const { _id, email, login } = user;

            const { accessToken, refreshToken } = generateTokens({ _id, email, login }, deviceId);
            const newRefreshDecoded = jwt.decode(refreshToken) as JwtPayload;

            await authRepository.updateDeviceSession({
                deviceId,
                iat: newRefreshDecoded.iat!,
                exp: newRefreshDecoded.exp!,
            });

            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Refresh token error:', error);
            return null;
        }
    },
    async logout( userId: string, deviceId: string): Promise<boolean> {
        try {
            return await authRepository.deleteDeviceSession(userId, deviceId);
        } catch (error) {
            console.error('Logout service error:', error);
            return false;
        }
    }
};