import { Request, Response, Router } from 'express';
import {getDevicesCollection} from "../db/mongoDB";
import { validateRefreshToken} from "../validation/authTokenMiddleware";
export const securityRouter = Router();

securityRouter.get('/devices', validateRefreshToken, async (req: Request, res: Response) => {
    console.log(req.context);
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
securityRouter.delete('/devices', validateRefreshToken, async (req: Request, res: Response) => {
    try {
        if (!req.context || !req.context.userId || !req.context.deviceId) {
            return res.sendStatus(401);
        }

        const { userId, deviceId } = req.context;


        await getDevicesCollection().deleteMany({
            userId,
            deviceId: { $ne: deviceId }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting devices:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
securityRouter.delete('/devices/:deviceId', validateRefreshToken, async (req: Request, res: Response) => {
    const { userId } = req.context!;
    const { deviceId } = req.params;

    try {
        const session = await getDevicesCollection().findOne({ deviceId });

        if (!session) {
            return res.status(404).json({
                errorsMessages: [{ message: "Device not found", field: "deviceId" }]
            });
        }

        // Strict ownership check
        if (session.userId !== userId) {
            return res.status(403).json({
                errorsMessages: [{ message: "Forbidden", field: "userId" }]
            });
        }

        await getDevicesCollection().deleteOne({ deviceId });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({
            errorsMessages: [{ message: "Internal server error", field: "server" }]
        });
    }
});
