import { Router } from "express";
import teamRoutes from "./team";
import hypeRoutes from "./hype";
import followRoutes from "./follow";

const router = Router();

router.use("/subscribe/team", teamRoutes);
router.use("/subscribe/hype", hypeRoutes);
router.use("/subscribe/broadcaster/follow", followRoutes);

export default router;
