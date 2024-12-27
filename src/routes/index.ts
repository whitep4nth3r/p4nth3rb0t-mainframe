import { Router } from "express";
import { config } from "../config";
import authRoutes from "./auth";
import worldRoutes from "./world";
import webhookRoutes from "./webhooks";

const router = Router();

router.get("/", (req, res) => {
  res.send(`🤖 ${config.bot.user_name} is online!`);
});

router.use("/auth", authRoutes);
router.use("/world", worldRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
