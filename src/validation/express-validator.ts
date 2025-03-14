import {NextFunction, Request, Response } from "express";
import {check, ValidationError, validationResult} from "express-validator";
import {blogsQueryRepository, blogsRepository} from "../Repository/blogsRepository";


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
        .notEmpty().withMessage('Content cannot be empty') //
        .bail()
        .isLength({ max: 1000 }).withMessage('Content must be ≤1000 characters'),

    check('blogId')
        .exists().withMessage('Blog ID is required')
        .bail()
        .isString().withMessage('Blog ID must be a string')
        .bail()
        .custom(async (blogId) => {
            const blog = await blogsQueryRepository.getBlogById(blogId);
            if (!blog) {
                throw new Error('Blog not found');
            }
            return true;
        })
];
export const validatePostInputWithoutId = [
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
        .notEmpty().withMessage('Content cannot be empty') //
        .bail()
        .isLength({ max: 1000 }).withMessage('Content must be ≤1000 characters')
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
        .isString().withMessage('Login or email must be a string'),

    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateUserInput = [
    check('login')
        .trim()
        .notEmpty().withMessage('Login is required')
        .isLength({ min: 3, max: 10 }).withMessage('Login must be between 3 and 10 characters')
        .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login can only contain letters, numbers, underscores, and hyphens'),
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Invalid email format'),
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters'),
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