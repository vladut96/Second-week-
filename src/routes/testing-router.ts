import { Request, Response, Router } from "express";
import { db } from "../db/db"; // Import the data arrays

export const testingRouter = Router();

testingRouter.delete("/all-data", (req: Request, res: Response) => {
    db.blogs = [];
    db.posts = [];

    return res.sendStatus(204);
});