import { Request, Response, Router } from "express";
import { blogs, posts } from "../db/db"; // Import the data arrays

export const testingRouter = Router();

testingRouter.delete("/all-data", (req: Request, res: Response) => {
    blogs.length = 0;
    posts.length = 0;

    return res.sendStatus(204);
});