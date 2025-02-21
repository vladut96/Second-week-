import { Request, Response, Router } from "express";
import { blogsCollection, postsCollection } from "../db/mongoDB"; // Import MongoDB collections

export const testingRouter = Router();

testingRouter.delete("/all-data", async (req: Request, res: Response) => {
        try {
                await blogsCollection.deleteMany({});
                await postsCollection.deleteMany({});
                return res.sendStatus(204);
        } catch (error) {
                console.error("Error deleting all data:", error);
                return res.status(500).send({ error: { message: "Failed to delete all data" } });
        }
});
