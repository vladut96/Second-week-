import { MeViewModel } from "./types";

declare global {
    namespace Express {
        export interface Request {
            userId?: string;
            user?: MeViewModel;
        }
    }
}

declare global {
    namespace Express {
        interface Request {
            context?: {
                userId: string;
                deviceId: string;
            };
        }
    }
}