import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { getRecipes } from "../../world/api/recipes";

const router = Router();

router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const recipes = getRecipes();

    return res.json({ recipes });
  }),
);

export default router;
