import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  spotlight: process.env.NODE_ENV === "development",
  enabled: process.env.NODE_ENV === "production",
  // debug: process.env.NODE_ENV === "development",
  release: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.75,
  profilesSampleRate: 0.5,
});
