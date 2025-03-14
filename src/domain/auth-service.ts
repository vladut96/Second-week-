import { authRepository } from '../Repository/authRepository';
import { comparePasswords } from '../utils/passwordUtils';

export const authService = {
    async authenticateUser(loginOrEmail: string, password: string): Promise<boolean> {
        // Fetch user by login or email
        const user   = await authRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user) return false; // User not found

        // ✅ Compare stored password hash with provided password
        return await comparePasswords(password, user.passwordHash);
    }
};
