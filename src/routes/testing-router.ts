import { Request, Response, Router } from "express";
import {
        BlogModel,
        PostModel,
        UserModel,
        CommentModel,
        RefreshTokenModelM,
        RequestLogModel,
        DeviceAuthSessionModel
} from "../db/models";

export const testingRouter = Router();

testingRouter.delete("/all-data", async (req: Request, res: Response) => {
        try {
                // Удаляем все данные из всех коллекций параллельно
                await Promise.all([
                        BlogModel.deleteMany({}),
                        PostModel.deleteMany({}),
                        UserModel.deleteMany({}),
                        CommentModel.deleteMany({}),
                        RefreshTokenModelM.deleteMany({}),
                        RequestLogModel.deleteMany({}),
                        DeviceAuthSessionModel.deleteMany({})
                ]);

                res.sendStatus(204);
        } catch (error) {
                console.error("Error deleting all data:", error);
                res.status(500).json({ message: "Internal server error" });
        }
});