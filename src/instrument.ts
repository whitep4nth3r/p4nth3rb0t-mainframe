import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  release: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  sampleRate: 0.5,
  maxBreadcrumbs: 100,
  sendClientReports: true,
  integrations: (integrations) => {
    integrations.push(nodeProfilingIntegration());
    return integrations.filter(function (integration) {
      return integration.name !== "Mongoose";
    });
  },
  tracesSampleRate: 0.75,
  profilesSampleRate: 0.5,
});
