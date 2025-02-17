import {NextFunction, Request, RequestHandler} from "express";
import {body, check, ValidationError, validationResult} from "express-validator";


export const validatePostInput = [
    check("title")
        .isString()
        .isLength({ max: 30 })
        .withMessage("Title must be maximum 30 characters long"),

    check("shortDescription")
        .exists()
        .withMessage("Short description is required")
        .isString()
        .isLength({ max: 100 })
        .withMessage("Short description must be maximum 100 characters long"),

    check("content")
        .isString()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Content must be between 1 and 1000 characters long"),

    check("blogId")
        .isString()
        .notEmpty()
        .withMessage("Blog ID is required"),
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
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage("Website URL must be a valid HTTPS URL")
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors
            .array({ onlyFirstError: true }) // Return only the first error per field
            .map((err) => ({
                message: err.msg,
                field: (err as ValidationError & { path: string }).path,
            }));

        return res.status(400).json({ errorsMessages });
    }
    next();
};