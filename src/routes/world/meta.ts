import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { getMeta } from "../../world/api/meta";

const router = Router();

router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const meta = await getMeta();

    return res.json({ meta });
  }),
);

export default router;
