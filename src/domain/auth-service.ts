import { injectable, inject } from 'inversify';
import {AuthRepository} from '../Repository/authRepository';
import { comparePasswords, hashPassword } from '../utils/passwordUtils';
import {UsersRepository} from "../Repository/usersRepository";
import { nodemailerService } from "../utils/nodemailerService";
import { generateTokens } from '../utils/authUtils';
import {FieldError, RegisterUserDB, UserInputModel} from "../types/types";
import {randomUUID} from "crypto";
import jwt, {JwtPayload} from "jsonwebtoken";
import {EmailConfirmation, EmailConfirmationFactory} from "../../service/email-confirmation-code-generator";

@injectable()
export class AuthService {
    constructor(
        @inject(AuthRepository) protected authRepository: AuthRepository,
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {
    }
    async authenticateUser(loginOrEmail: string, password: string, deviceName: string, ip: string) {
        const user = await this.authRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user || !await comparePasswords(password, user.passwordHash)) {return null;}

        const deviceId = randomUUID();
        const { accessToken, refreshToken } = generateTokens(user, deviceId);
        const refreshDecode = jwt.decode(refreshToken) as JwtPayload

        await this.authRepository.createDeviceSession({
            userId: user._id.toString(),
            deviceId,
            lastActiveDate: new Date(refreshDecode.iat! * 1000).toISOString(),
            title: deviceName,
            ip,
            exp: new Date(refreshDecode.exp! * 1000).toISOString()
        });

        return { accessToken, refreshToken };
    }
    async registerUser(userData: UserInputModel) {
        const { login, password, email } = userData;
        const existingUser = await this.usersRepository.getUserByLoginOrEmail(login, email);

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
            emailConfirmation: EmailConfirmationFactory.create(),
            passwordRecovery: {
                recoveryCode:  null,
                expirationDate:  null
            }
        };

        await this.usersRepository.createUser(newUser);

        if (!newUser.emailConfirmation.confirmationCode) {
            throw new Error('Confirmation code is missing.');
        }

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
    }
    async confirmEmail(code: string) {
        const user = await this.authRepository.findByConfirmationCode(code);
        if (!user || user.emailConfirmation.isConfirmed || new Date() > user.emailConfirmation.expirationDate!) {
            console.log(`Confirmation failed for code ${code}`);
            return false;
        }
        return this.authRepository.updateConfirmationStatus(user.email, true);
    }
    async resendConfirmationEmail(email: string) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) return { success: false, reason: "email" };
        if (user.emailConfirmation.isConfirmed) return { success: false, reason: "confirmed" };

        const newConfirmation = EmailConfirmationFactory.create();

        const updated = await this.authRepository.updateConfirmationCode(
            email,
            newConfirmation.confirmationCode!,
            newConfirmation.expirationDate!
        );

        if (!updated) return { success: false, reason: "update_failed" };

        try {
            await nodemailerService.sendEmail(
                email,
                newConfirmation.confirmationCode!,
                nodemailerService.emailTemplates.registrationEmail
            );
            return { success: true };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, reason: "email_send_failed" };
        }
    }
    async requestPasswordRecovery(email: string): Promise<boolean> {
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) return true; // Return true even if email doesn't exist for security

        const recoveryCode = randomUUID();
        const expirationDate = new Date(Date.now() + 3600000); // 1 hour expiration

        const updated = await this.authRepository.setPasswordRecoveryCode(
            email,
            recoveryCode,
            expirationDate
        );

        if (updated) {
            try {
                await nodemailerService.sendEmail(
                    email,
                    recoveryCode,
                    nodemailerService.emailTemplates.passwordRecoveryEmail
                );
                return true;
            } catch (error) {
                console.error('Password recovery email sending failed:', error);
                return false;
            }
        }
        return false;
    }
    async confirmPasswordRecovery(recoveryCode: string, newPassword: string): Promise<boolean> {
        const user = await this.authRepository.findUserByRecoveryCode(recoveryCode);
        if (!user || !user.passwordRecovery || new Date() > user.passwordRecovery.expirationDate!) {
            return false;
        }

        const passwordHash = await hashPassword(newPassword);
        return this.authRepository.updateUserPassword(user.email, passwordHash);
    }
    async refreshTokenPair(userId: string, deviceId: string) {
        try {
            const user = await this.authRepository.getUserById(userId);
            if (!user) return null;

            // Generate new tokens with fresh timestamps
            const { accessToken, refreshToken } = generateTokens(user, deviceId);
            const decoded = jwt.decode(refreshToken) as JwtPayload;
            if (!decoded.iat || !decoded.exp) {
                console.error('Invalid refresh token payload');
                return null;
            }
            // Update session with new timestamps
            await this.authRepository.updateDeviceSession({
                deviceId,
                lastActiveDate: new Date(decoded.iat * 1000).toISOString(),
                exp: new Date(decoded.exp * 1000).toISOString()
            });

            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Refresh token error:', error);
            return null;
        }
    }
    async logout( userId: string, deviceId: string): Promise<boolean> {
        try {
            return await this.authRepository.deleteDeviceSession(userId, deviceId);
        } catch (error) {
            console.error('Logout service error:', error);
            return false;
        }
    }
}
