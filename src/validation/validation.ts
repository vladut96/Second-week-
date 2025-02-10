import {Request} from "express";

export const allowedResolutions = ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"];

export const validateVideoInput = (req: Request) => {
    const { title, author, availableResolutions, canBeDownloaded } = req.body;
    let errors: { message: string; field: string }[] = [];

    if (!title || typeof title !== "string" || title.trim().length === 0 || title.length > 40) {
        errors.push({ message: "Title must be a non-empty string with max 40 characters", field: "title" });
    }

    if (!author || typeof author !== "string" || author.trim().length === 0 || author.length > 20) {
        errors.push({ message: "Author must be a non-empty string with max 20 characters", field: "author" });
    }
    if (canBeDownloaded !== undefined && typeof canBeDownloaded !== "boolean") {
        errors.push({ message: "canBeDownloaded must be a boolean", field: "canBeDownloaded" });
    }

    if (availableResolutions !== undefined) {
        if (!Array.isArray(availableResolutions)) {
            errors.push({ message: "Available resolutions must be an array", field: "availableResolutions" });
        } else if (availableResolutions.length > 0 &&
            !availableResolutions.every(res => allowedResolutions.includes(res))) {
            errors.push({ message: "Invalid resolution value(s)", field: "availableResolutions" });
        }
    }

    return errors;
};
