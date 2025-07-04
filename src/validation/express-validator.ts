import {NextFunction, Request, Response } from "express";
import {body, check, ValidationError, validationResult} from "express-validator";

export const validatePostInput = [
    check('title')
        .exists().withMessage('Title is required')
        .bail()
        .isString().withMessage('Title must be a string')
        .bail()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .bail()
        .isLength({ max: 30 }).withMessage('Title must be ≤30 characters'),

    check('shortDescription')
        .exists().withMessage('Short description is required')
        .bail()
        .isString().withMessage('Short description must be a string')
        .bail()
        .trim()
        .notEmpty().withMessage('Short description cannot be empty')
        .bail()
        .isLength({ max: 100 }).withMessage('Short description must be ≤100 characters'),

    check('content')
        .exists().withMessage('Content is required')
        .bail()
        .isString().withMessage('Content must be a string')
        .bail()
        .trim()
        .notEmpty().withMessage('Content cannot be empty')
        .bail()
        .isLength({ max: 1000 }).withMessage('Content must be ≤1000 characters'),

    check('blogId')
        .exists()
        .bail()
        .isString()
        .bail()
        .trim()
        .notEmpty().withMessage('BlogId is required')
];
export const validateBlogInput = [
    check("name")
        .exists().withMessage('Name is required')
        .bail()
        .trim()
        .notEmpty().withMessage("Name is required")
        .isString()
        .isLength({ max: 15 }).withMessage("Name must be maximum 15 characters long"),

    check("description")
        .exists().withMessage('Description is required')
        .bail()
        .trim()
        .notEmpty().withMessage("Description is required")
        .isString()
        .isLength({ max: 500 }).withMessage("Description must be maximum 500 characters long"),

    check("websiteUrl")
        .exists().withMessage('Website URL is required')
        .bail()
        .trim()
        .notEmpty().withMessage('Website URL must not be empty')
        .bail()
        .isLength({ max: 100 }).withMessage('Website URL must be ≤100 characters')
        .bail()
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage('Website URL must be a valid HTTPS URL')
];
export const validateAuthInput = [
    check('loginOrEmail')
        .trim()
        .notEmpty().withMessage('Login or email is required')
        .bail()
        .isString().withMessage('Login or email must be a string'),

    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .bail()
        .isString().withMessage('Password must be a string')
        .bail()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
export const validateUserInput = [
    check('login')
        .trim()
        .notEmpty().withMessage('Login is required')
        .bail()
        .isLength({ min: 3, max: 10 }).withMessage('Login must be between 3 and 10 characters')
        .bail()
        .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login can only contain letters, numbers, underscores, and hyphens'),
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .bail()
        .matches(/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Invalid email format'),
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .bail()
        .isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters'),
];
export const validateComment = [
    body("content")
        .trim()
        .isLength({ min: 20, max: 300 })
        .withMessage("Content must be between 20 and 300 characters"),
];
export const validateRegistrationCode = [
    check("code")
        .trim()
        .notEmpty().withMessage('Registration code is required')
        .bail()
        .isString().withMessage('Registration code must be a string'),
];
export const validateEmail = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .bail()
        .isEmail().withMessage('Must be a valid email')
        .bail()
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .bail()
        .withMessage('Email format is invalid'),
];
export const validatePassword = [
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .bail()
        .isLength({ min : 6, max: 20 }).withMessage('Short description must be ≤100 characters')
        .withMessage('Email format is invalid'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors
            .array()
            .map((error) => ({
                message: error.msg,
                field: (error as ValidationError & { path: string }).path,
            }));

        return res.status(400).json({ errorsMessages });
    }
    return next();
};