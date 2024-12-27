import { Router } from "express";
import inventoryRoutes from "./inventory";
import recipesRoutes from "./recipes";
import leaderboardRoutes from "./leaderboard";
import metaRoutes from "./meta";

const router = Router();

router.use("/inventory", inventoryRoutes);
router.use("/recipes", recipesRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/meta", metaRoutes);

export default router;
