import { Request, Response, Router } from 'express';
import {getDevicesCollection} from "../db/mongoDB";
import { validateRefreshToken} from "../validation/authTokenMiddleware";
export const securityRouter = Router();

securityRouter.get('/hometask_09/api/security/devices', validateRefreshToken, async (req: Request, res: Response) => {
    const { userId } = req.context!;

    try {
        const sessions = await getDevicesCollection()
            .find({ userId })
            .project({
                _id: 0,
                ip: 1,
                title: 1,
                lastActiveDate: 1,
                deviceId: 1
            })
            .toArray();

        return res.status(200).json(sessions);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
securityRouter.delete('/', validateRefreshToken, async (req: Request, res: Response) => {
    const { userId, deviceId } = req.context!;

    try {
        const result = await getDevicesCollection().deleteMany({
            userId,
            deviceId: { $ne: deviceId }
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No sessions found" });
        }

        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
securityRouter.delete('/:deviceId', validateRefreshToken, async (req: Request, res: Response) => {
    const { userId } = req.context!;
    const deviceId = req.params.deviceId;

    try {
        // Проверяем существование сессии
        const session = await getDevicesCollection().findOne({
            deviceId,
            userId
        });

        if (!session) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Проверяем принадлежность пользователю
        if (session.userId !== userId) {
            return res.sendStatus(403);
        }

        // Удаляем сессию
        await getDevicesCollection().deleteOne({ deviceId });
        return res.sendStatus(204);

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
