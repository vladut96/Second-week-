import { Request } from "express";
import { body, check  } from "express-validator";

export const validatePostInput = [
    check("title")
        .isString().isLength({ max: 30 })
        .withMessage("Title must be maximum 30 characters long"),

    check("shortDescription")
        .isString().isLength({ max: 100})
        .withMessage("Short description must be maximum 100 characters long"),

    check("content")
        .isString().isLength({ max: 1000})
        .withMessage("Content is required"),

    check("blogId")
        .isString().notEmpty()
        .withMessage("Blog ID is required"),
];
export const validateBlogInput = [
    check("name")
        .isString().isLength({ max: 15 })
        .withMessage("Name must be maximum 15 characters long"),
    check("description").isString().isLength({ max: 500 })
        .withMessage("Description is too long. Maximum allowed is 500 characters"),
    check("websiteUrl")
        .isString().withMessage("Website URL must be a string")
        .isLength({ max: 100 }).withMessage("Website URL must not exceed 100 characters")
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage("Website URL must be a valid HTTPS URL")
]