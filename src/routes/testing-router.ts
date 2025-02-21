import { Request, Response, Router } from "express";
import { blogsCollection, postsCollection } from "../db/mongoDB"; // Import MongoDB collections

export const testingRouter = Router();

testingRouter.delete("/all-data", async (req: Request, res: Response) => {
        await blogsCollection.deleteMany({});
        await postsCollection.deleteMany({});
        return res.sendStatus(204);
});