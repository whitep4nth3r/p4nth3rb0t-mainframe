import { Router } from "express";
import authCode from "./authcode";

const router = Router();

router.use("/authcode", authCode);

export default router;
