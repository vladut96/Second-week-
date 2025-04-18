import bcrypt from 'bcryptjs';

export const comparePasswords = async (plainPassword: string, hashedPassword: string ): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
};