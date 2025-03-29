import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

interface EmailConfig {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const nodemailerService = {
    // Initialize transporter with your email service config
    transporter: nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'grishchenko.vladislav.work@gmail.com',
            pass: 'xtfx rmty yisa cjeh',
        },
    } as EmailConfig),

    // Main email sending function
    async sendEmail(
        to: string,
        confirmationCode: string,
        emailTemplate: { subject: string; html: string; text?: string }
    ): Promise<SentMessageInfo> {
        const mailOptions: EmailOptions = {
            from: 'Vladislav <grishchenko.vladislav.work@gmail.com>',
            to,
            subject: emailTemplate.subject,
            html: emailTemplate.html.replace('{{code}}', confirmationCode),
            text: emailTemplate.text?.replace('{{code}}', confirmationCode),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    },
    emailTemplates: {
        registrationEmail: {
            subject: 'Confirm Your Registration',
            html: `
            <h1 style="font-size: 20px; font-family: Arial, sans-serif; margin-bottom: 20px;">Thank you for your registration!</h1>
            <p style="font-size: 16px; font-family: Arial, sans-serif; margin-bottom: 15px;">To complete your registration, please click the link below:</p>
            <a href="https://somesite.com/confirm-email?code={{code}}"
               style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 15px;">
                Complete Registration
            </a>
            <p style="font-size: 14px; font-family: Arial, sans-serif; margin-bottom: 10px; color: #555;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif; margin-bottom: 15px; color: #333; word-break: break-all;">https://somesite.com/confirm-email?code={{code}}</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif; color: #777;">This link will expire in 1 hour.</p>
        `,
            text: `Thank you for your registration!\n\nTo complete your registration, please visit:\nhttps://somesite.com/confirm-email?code={{code}}\n\nThis link will expire in 1 hour.`
        },
        passwordResetEmail: {
            subject: 'Password Reset Request',
            html: `
            <h1 style="font-size: 20px; font-family: Arial, sans-serif; margin-bottom: 20px;">Password Reset</h1>
            <p style="font-size: 16px; font-family: Arial, sans-serif; margin-bottom: 15px;">Click the link below to reset your password:</p>
            <a href="https://somesite.com/password-reset?code={{code}}"
               style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 15px;">
                Reset Password
            </a>
            <p style="font-size: 14px; font-family: Arial, sans-serif; margin-bottom: 10px; color: #555;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif; margin-bottom: 15px; color: #333; word-break: break-all;">https://somesite.com/password-reset?code={{code}}</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif; color: #777;">This link will expire in 1 hour.</p>
        `,
            text: `Password Reset Request\n\nTo reset your password, visit:\nhttps://somesite.com/password-reset?code={{code}}\n\nThis link expires in 1 hour.`
        }
    }
};