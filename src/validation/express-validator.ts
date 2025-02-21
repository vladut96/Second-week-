import {NextFunction, Request, Response } from "express";
import {body, check, ValidationError, validationResult} from "express-validator";
import {blogsRepository} from "../Repository/blogsRepository";


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
            const blog = blogsRepository.getBlogById(blogId);
            if (!blog) {
                throw new Error('Blog not found');
            }
            return true;
        })
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
        .notEmpty()
        .isString()
        .isLength({ max: 100 }).withMessage("Website URL must not exceed 100 characters")
        .isURL({ protocols: ["https"], require_protocol: true }).withMessage("Website URL must be a valid HTTPS URL")
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors
            .array({ onlyFirstError: true }) // Return only the first error per field
            .map((error) => ({
                message: error.msg,
                field: (error as ValidationError & { path: string }).path,
            }));

        return res.status(400).json({ errorsMessages });
    }
    return next();
};