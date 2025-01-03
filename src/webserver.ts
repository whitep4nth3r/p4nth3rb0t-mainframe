import "./instrument";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import http from "http";
import routes from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(routes);

Sentry.setupExpressErrorHandler(app);

export const webServer = http.createServer(app);
