import jwt from 'jsonwebtoken';
import { authRepository } from '../Repository/authRepository';
import {comparePasswords, hashPassword} from '../utils/passwordUtils';
import {EmailConfirmation, MeViewModel, RegisterUserDB, UserInputModel} from "../types/types";
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
    async registerUser(userData: UserInputModel): Promise<RegisterUserDB<EmailConfirmation> | null> {
        const {login, password, email} = userData;
        const user = await usersRepository.getUserByLoginOrEmail(login, email);
        if (user) return null;
        //проверить существует ли уже юзер с таким логином или почтой и если да - не регистрировать

        const passwordHash = await hashPassword(password);


        const newUser: RegisterUserDB<EmailConfirmation> = { // сформировать dto юзера
            login,
            email,
            passwordHash,
            emailConfirmation: {    // доп поля необходимые для подтверждения
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }),
                isConfirmed: false
            }
        };
        await usersRepository.createUser(newUser); // сохранить юзера в базе данных

//отправку сообщения лучше обернуть в try-catch, чтобы при ошибке(например отвалиться отправка) приложение не падало
        try {
             nodemailerService.sendEmail(//отправить сообщение на почту юзера с кодом подтверждения
                newUser.email,
                newUser.emailConfirmation!.confirmationCode,
                nodemailerService.emailTemplates.registrationEmail);

        } catch (e: unknown) {
            console.error('Send email error', e); //залогировать ошибку при отправке сообщения
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
    async resendConfirmationEmail(email: string): Promise<boolean> {
        const user = await authRepository.findByEmail(email);

        if (!user || user.emailConfirmation.isConfirmed) {
            return false;
        }

        const newCode: string = randomUUID();
        const expirationDate = add(new Date(), { hours: 1 });

        const updated = await authRepository.updateConfirmationCode(
            email,
            newCode,
            expirationDate
        );

        if (!updated) return false;

        try {
            await nodemailerService.sendEmail(
                email,
                newCode,
                nodemailerService.emailTemplates.registrationEmail
            );
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }

};
