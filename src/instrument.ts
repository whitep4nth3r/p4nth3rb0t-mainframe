import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  enabled: true, // might toggle this conditionally at some point
  dsn: process.env.NODE_ENV === "production" ? process.env.SENTRY_DSN : "",
  debug: process.env.NODE_ENV !== "production" ? true : false,
  release: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  sampleRate: 0.5,
  maxBreadcrumbs: 100,
  sendClientReports: true,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.5,
  profilesSampleRate: 0.5,
});
