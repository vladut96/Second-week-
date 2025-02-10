import {Request, Response, Router} from "express";
import {SETTINGS} from "../settings";
import app from "express";
import {Video} from "../types/types";
import {validateVideoInput} from "../validation/validation";
import videos from "../db/db";
export const videoRouter = Router({});

let nextId = 1;

videoRouter.get('/', (req: Request, res: Response) => {
    res.status(200).json(videos);
});
videoRouter.get('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id); // Convert id to number
    const foundVideo = videos.find(v => v.id === videoId);
    if (!foundVideo) {
        return res.sendStatus(404);
    }

    res.status(200).json(foundVideo);




});
videoRouter.post('/', (req: Request, res: Response) => {
    const errors = validateVideoInput(req);
    if (errors.length > 0) {
        return res.status(400).json({
            errorsMessages: errors
        });
    }

    const { title, author, availableResolutions } = req.body;
    const createdAt = new Date();
    const publicationDate = new Date(createdAt);
    publicationDate.setDate(publicationDate.getDate() + 1);

    const newVideo: Video = {
        id: nextId++,
        title,
        author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        availableResolutions: availableResolutions || []
    };

    videos = [...videos, newVideo];

        return res.status(201).json(newVideo);
    });
videoRouter.put('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id);
    const video = videos.find(v => v.id === videoId);

    if (!video) {
        return res.sendStatus(404);
    }
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

    return res.sendStatus(204);
});
videoRouter.delete('/:id', (req: Request, res: Response) => {
    const videoId = Number(req.params.id); // Convert id to number
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) {
        return res.sendStatus(404);
    }
    videos.splice(videoIndex, 1);
    res.sendStatus(204);
});



