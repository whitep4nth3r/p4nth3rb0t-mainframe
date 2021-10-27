import {Request, Response, NextFunction} from "express";

export default (f: any) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await f(req, res, next);
        } catch (e) {
            next(e);
        }
    };
};
