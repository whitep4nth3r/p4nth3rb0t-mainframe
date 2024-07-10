import * as Sentry from "@sentry/node";
import AccessToken from "./classes/AccessToken";
import { config } from "./config";
import {
  TeamMembers,
  TwitchUser,
  EventSubscriptionResponse,
  EventSubDefinition,
  EventSubType,
} from "./data/types";
import Team from "./users/Team";

const accessTokenUtil = new AccessToken();

//TODO: do not run if process.env.TWITCH_API_CALLBACK_URL is unavailable

const eventSubApiUrl = "https://api.twitch.tv/helix/eventsub/subscriptions";

async function getAllSubscriptions(): Promise<
  EventSubscriptionResponse | undefined
> {
  const accessTokenData = await accessTokenUtil.get();

  if (accessTokenData) {
    try {
      const response = await fetch(`${eventSubApiUrl}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessTokenData.accessToken}`,
          "Client-Id": process.env.CLIENT_ID,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return (await response.json()) as EventSubscriptionResponse;
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  }
  return;
}

async function deleteSubscription(id: string) {
  const accessTokenData = await accessTokenUtil.get();
  if (accessTokenData) {
    try {
      await fetch(`${eventSubApiUrl}?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessTokenData.accessToken}`,
          "Client-Id": process.env.CLIENT_ID,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }
}

function generateEventData(definition: EventSubDefinition) {
  switch (definition.eventType) {
    case EventSubType.ChannelFollow:
      return {
        type: definition.eventType,
        version: "2",
        condition: {
          broadcaster_user_id: definition.userId,
          moderator_user_id: definition.userId,
        },
        transport: {
          method: "webhook",
          callback: definition.callbackUrl,
          secret: "sup3rs3cr3t",
        },
      };
    default:
      return {
        type: definition.eventType,
        version: "1",
        condition: {
          broadcaster_user_id: definition.userId,
        },
        transport: {
          method: "webhook",
          callback: definition.callbackUrl,
          secret: "sup3rs3cr3t",
        },
      };
  }
}

async function registerEventSub(definition: EventSubDefinition) {
  if (process.env.TWITCH_API_CALLBACK_URL) {
    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      const data = generateEventData(definition);

      try {
        await fetch(eventSubApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessTokenData.accessToken}`,
            "Client-Id": process.env.CLIENT_ID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        console.log(
          `Registered: ${definition.userId} ${definition.eventType} ${definition.callbackUrl}`,
        );
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }
}

function createDefinition(
  type: EventSubType,
  callbackUrl: string,
  userId: string,
  version: string,
): EventSubDefinition {
  return {
    eventType: type,
    userId: userId,
    callbackUrl: callbackUrl,
    version: version,
  };
}

function createStreamerOfflineDefinition(userId: string) {
  return createDefinition(
    EventSubType.StreamOffline,
    `${process.env.TWITCH_API_CALLBACK_URL}/team/${userId}`,
    userId,
    "1",
  );
}

function createStreamerOnlineDefinition(userId: string) {
  return createDefinition(
    EventSubType.StreamOnline,
    `${process.env.TWITCH_API_CALLBACK_URL}/team/${userId}`,
    userId,
    "1",
  );
}

function callbackUrlAllowed(url: string): boolean {
  const allowedUrls = (process.env.ALLOWED_CALLBACK_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  return allowedUrls.find((value) => url.startsWith(value)) !== undefined;
}

(async () => {
  // Get all existing subscriptions from Twitch and decide which to keep and which to delete
  const subscriptionResponse = await getAllSubscriptions();
  const existingSubs = new Set<string>();
  const deletableSubIds: string[] = [];
  const allowed: string[] = [];
  const myCallbackUrl = process.env.TWITCH_API_CALLBACK_URL ?? "";

  // Delete all subscriptions with callback urls not explicitly allowed
  existingSubs.forEach(async (id) => await deleteSubscription(id));

  if (subscriptionResponse) {
    subscriptionResponse.data.forEach(async (eventSub) => {
      //await deleteSubscription(eventSub.id);
      const def: EventSubDefinition = {
        eventType: eventSub.type as EventSubType,
        userId: eventSub.condition.broadcaster_user_id,
        callbackUrl: eventSub.transport.callback,
        version: eventSub.version,
      };
      if (eventSub.transport.callback.startsWith(myCallbackUrl)) {
        existingSubs.add(JSON.stringify(def));
      } else if (callbackUrlAllowed(eventSub.transport.callback)) {
        allowed.push(JSON.stringify(def));
      } else {
        deletableSubIds.push(eventSub.id);
      }
    });
  }

  // Delete all subscriptions with callback urls not explicitly allowed
  deletableSubIds.forEach(async (id) => await deleteSubscription(id));

  const hypeTrainBeginDefinition: EventSubDefinition = {
    eventType: EventSubType.HypeTrainBegin,
    userId: config.broadcaster.user_id,
    callbackUrl: `${myCallbackUrl}/hype/begin`,
    version: "1",
  };

  if (existingSubs.has(JSON.stringify(hypeTrainBeginDefinition))) {
    console.log("Already subscribed to hype train begin events");
  } else {
    await registerEventSub(hypeTrainBeginDefinition);
  }

  const hypeTrainProgressDefinition: EventSubDefinition = {
    eventType: EventSubType.HypeTrainProgress,
    userId: config.broadcaster.user_id,
    callbackUrl: `${myCallbackUrl}/hype/progress`,
    version: "1",
  };

  if (existingSubs.has(JSON.stringify(hypeTrainProgressDefinition))) {
    console.log("Already subscribed to hype train progress events");
  } else {
    await registerEventSub(hypeTrainProgressDefinition);
  }

  const hypeTrainEndDefinition: EventSubDefinition = {
    eventType: EventSubType.HypeTrainEnd,
    userId: config.broadcaster.user_id,
    callbackUrl: `${myCallbackUrl}/hype/end`,
    version: "1",
  };

  if (existingSubs.has(JSON.stringify(hypeTrainEndDefinition))) {
    console.log("Already subscribed to hype train end events");
  } else {
    await registerEventSub(hypeTrainEndDefinition);
  }

  // Register for new follower events
  const followDefinition: EventSubDefinition = {
    eventType: EventSubType.ChannelFollow,
    userId: config.broadcaster.user_id,
    callbackUrl: `${myCallbackUrl}/broadcaster/follow`,
    version: "2",
  };
  if (existingSubs.has(JSON.stringify(followDefinition))) {
    console.log("Already subscribed to follow events version 2");
  } else {
    await registerEventSub(followDefinition);
  }

  // Register any team member stream listeners that are not already registered
  const teamMembers: TeamMembers = await Team.getMembers();
  teamMembers.forEach(async (member: TwitchUser) => {
    const offlineDefinition = createStreamerOfflineDefinition(member.user_id);
    if (existingSubs.has(JSON.stringify(offlineDefinition))) {
      console.log(
        "Already subscribed to streamer offline for " + member.user_name,
      );
    } else {
      await registerEventSub(offlineDefinition);
    }
    const onlineDefinition = createStreamerOnlineDefinition(member.user_id);
    if (existingSubs.has(JSON.stringify(onlineDefinition))) {
      console.log(
        "Already subscribed to streamer online for " + member.user_name,
      );
    } else {
      await registerEventSub(onlineDefinition);
    }
  });

  console.log("Webhooks initialization complete");
})();
