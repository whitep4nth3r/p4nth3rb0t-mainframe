import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import * as Sentry from "@sentry/node";
import AccessToken from "../../classes/AccessToken";

const accessTokenUtil = new AccessToken();
const router = Router();

router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const { code, scope } = req.query;

    if (code) {
      try {
        await accessTokenUtil.setAuthCode({
          code: code as string,
          scope: scope as string,
        });

        console.log("Auth Code saved!");
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    return res.status(200).send();
  }),
);

export default router;
