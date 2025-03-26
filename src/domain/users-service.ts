import { usersRepository } from '../Repository/usersRepository';
import { hashPassword } from '../utils/passwordUtils';
import {UserViewModel, Paginator, UserInputModel} from '../types/types';

export const usersService = {
    async getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize }:
                   { searchLoginTerm?: string; searchEmailTerm?: string; sortBy: string; sortDirection: 1 | -1; pageNumber: number; pageSize: number; }
    ): Promise<Paginator<UserViewModel>> {
        return await usersRepository.getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize });
    },

    async createUser(userData: UserInputModel) {
        // Check for unique login & email
        const existingUser = await usersRepository.getUserByLoginOrEmail(userData.login, userData.email);
        if (existingUser) {
            return {
                errorsMessages: [{
                    field: existingUser.login === userData.login ? 'login' : 'email',
                    message: `${existingUser.login === userData.login ? 'Login' : 'Email'} should be unique`
                }]
            };
        }

        // ✅ Hash password before passing to repository
        const passwordHash = await hashPassword(userData.password);

        // ✅ Pass 'passwordHash' instead of 'password'
        return await usersRepository.createUser({
            login: userData.login,
            email: userData.email,
            passwordHash,
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            }
        });
    },

    async deleteUserById(userId: string): Promise<boolean> {
        return await usersRepository.deleteUserById(userId);
    }
};
