import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { validateTwitchSession } from "../../utils/twitchUtils";
import { getFullInventory } from "../../world/api/inventory";

const router = Router();

router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const validSession: any = await validateTwitchSession(
      req.headers.token as string,
    );

    if (validSession.user_id) {
      const inventory = await getFullInventory(validSession.user_id);

      return res.json({ inventory });
    } else {
      return res.status(401).send();
    }
  }),
);

export default router;
