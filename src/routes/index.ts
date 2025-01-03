import { Router } from "express";
import { config } from "../config";
import authRoutes from "./auth";
import webhookRoutes from "./webhooks";

const router = Router();

router.get("/", (req, res) => {
  res.send(`🤖 ${config.bot.user_name} is online!`);
});

router.use("/", authRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
