import {Request, Response, Router} from "express";
import {SETTINGS} from "../settings";
import app from "express";
import videos from "../db/db";
import {videoRouter} from "./video-router";
import {Video} from "../types/types";
export const testingRouter = Router({});

testingRouter.delete('/all-data', (req: Request, res: Response) => {
    videos.length = 0;
    return res.status(204).json({
        "description": "All data is deleted"
    });
});