import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { getFullLeaderboard } from "../../world/api/leaderboard";

const router = Router();

router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const leaderboard = await getFullLeaderboard();

    return res.json({ leaderboard });
  }),
);

export default router;
