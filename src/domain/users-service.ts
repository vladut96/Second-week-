import {UsersRepository} from '../Repository/usersRepository';
import { hashPassword } from '../utils/passwordUtils';
import {UserViewModel, Paginator, UserInputModel} from '../types/types';
import {EmailConfirmationFactory} from "../../service/email-confirmation-code-generator";

export class UsersService {
    constructor(protected usersRepository: UsersRepository) {
    }
    async getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize }: { searchLoginTerm?: string; searchEmailTerm?: string; sortBy: string; sortDirection: 1 | -1; pageNumber: number; pageSize: number; }): Promise<Paginator<UserViewModel>> {
        return await this.usersRepository.getUsers({ searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize });
    }
    async createUser(userData: UserInputModel) {
        const existingUser = await this.usersRepository.getUserByLoginOrEmail(userData.login, userData.email);
        if (existingUser) {
            return {
                errorsMessages: [{
                    field: existingUser.login === userData.login ? 'login' : 'email',
                    message: `${existingUser.login === userData.login ? 'Login' : 'Email'} should be unique`
                }]
            };
        }
        const passwordHash = await hashPassword(userData.password);

        return await this.usersRepository.createUser({
            login: userData.login,
            email: userData.email,
            passwordHash,
            emailConfirmation: EmailConfirmationFactory.createDefault(),
            passwordRecovery: {
                recoveryCode:  null,
                expirationDate:  null
            }
        });
    }
    async deleteUserById(userId: string): Promise<boolean> {
        return await this.usersRepository.deleteUserById(userId);
    }
}

