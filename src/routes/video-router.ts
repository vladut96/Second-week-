import {Request, Response, Router} from "express";
import {SETTINGS} from "../settings";
import app from "express";
import {ICreateVideoResponseSuccess, Video} from "../types/types";
import {validateVideoInput} from "../validation/validation";
import {videos} from "../db/db";
export const videoRouter = Router({});

let nextId = 1;

videoRouter.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        description: "Success",
        data: videos
    });
});
videoRouter.get('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id); // Convert id to number
    const foundVideo = videos.find(v => v.id === videoId);
    if (!foundVideo) {
        return res.status(404).json({ error: "Video not found" });
    }

    res.status(200).json({
        description: "Success",
        data: foundVideo
    });




});
videoRouter.post('/', (req: Request, res: Response<ICreateVideoResponseSuccess | {errorsMessages: { message: string; field: string }[]}>) => {
    const errors = validateVideoInput(req);
    if (errors.length > 0) {
        return res.status(400).json({
            errorsMessages: errors
        });
    }

    const { title, author, availableResolutions } = req.body;

    const newVideo: Video = {
        id: nextId++,
        title: title,
        author: author,
        canBeDownloaded: false, // Default value
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date().toISOString(),
        availableResolutions: availableResolutions || [] // Default empty array if null
    };

    videos = [...videos, newVideo];

    return res.status(201).json({
        description: "Returns the newly created video",
        data: newVideo
    });
});
videoRouter.put('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id);
    const video = videos.find(v => v.id === videoId);

    if (!video) {
        return res.sendStatus(404);
    }

    // 🔹 Step 2: Validate input fields using the existing validation function
    const errors = validateVideoInput(req);
    if (errors.length > 0) {
        return res.status(400).json({ errorsMessages: errors });
    }

    const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;

    if (title !== undefined) video.title = title;
    if (author !== undefined) video.author = author;
    if (availableResolutions !== undefined) video.availableResolutions = availableResolutions;
    if (canBeDownloaded !== undefined) video.canBeDownloaded = canBeDownloaded;
    if (minAgeRestriction !== undefined) video.minAgeRestriction = minAgeRestriction;
    if (publicationDate !== undefined) video.publicationDate = publicationDate;

    return res.status(204).json();
});
videoRouter.delete('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id); // Convert id to number
    const foundVideo = videos.find(v => v.id === videoId);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (!foundVideo) {
        return res.sendStatus(404);
    }
    videos.splice(videoIndex, 1);
    res.status(204).json();
});



