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
                <h1>Thank you for your registration!</h1>
                <p>To complete your registration, please enter this confirmation code:</p>
                <p style="font-size: 24px; font-weight: bold;">{{code}}</p>
                <p>Or click the button below:</p>
                <a href="https://somesite.com/confirm-registration?code={{code}}" 
                   style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
                    Confirm Email
                </a>
                <p>This code will expire in 1 hour.</p>
            `,
            text: `Thank you for registration!\n\nYour confirmation code: {{code}}\n\nEnter this code on our website to complete registration.\nCode expires in 1 hour.`
        },
        passwordResetEmail: {
            subject: 'Password Reset Request',
            html: `
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <p>
      <a href='https://somesite.com/confirm-registration?code={{code}}'>
        Reset password
      </a>
    </p>
    <p>This link will expire in 1 hour.</p>
    <p>If the button doesn't work, copy and paste this URL:</p>
    <p>https://somesite.com/password-reset?code={{code}}</p>
  `,
            text: `Password Reset Request\n\nTo reset your password, visit:\nhttps://somesite.com/password-reset?code={{code}}\n\nThis link expires in 30 minutes.`
        }
    }
};