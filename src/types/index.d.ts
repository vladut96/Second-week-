import { MeViewModel } from "./types";

declare global {
    namespace Express {
        interface Request {
            user?: MeViewModel;
            userId?: string;
            context?: { userId: string; deviceId: string };
        }
    }
}