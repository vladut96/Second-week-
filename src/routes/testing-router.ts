import { Request, Response, Router } from "express";
import { getBlogsCollection, getPostsCollection } from "../db/mongoDB";

export const testingRouter = Router();

testingRouter.delete("/all-data", async (req: Request, res: Response) => {
        try {
                const blogsCollection = getBlogsCollection();
                const postsCollection = getPostsCollection();

                await blogsCollection.deleteMany({});
                await postsCollection.deleteMany({});
                res.sendStatus(204);
        } catch (error) {
                console.error("Error deleting all data:", error);
                res.status(500).json({ message: "Internal server error" });
        }
});