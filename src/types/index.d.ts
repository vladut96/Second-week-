import {MeViewModel} from "./types";
declare global {
    namespace Express {
        export interface Request {
            userId?: string;
            user?: MeViewModel;
        }
    }
}
