# Twitch webhooks

The mainframe subscribes to the following webhooks, which POST to the mainframe webserver when changes are detected:

## Broadcaster follows

When a Twitch user follows the configured broadcaster, a POST request is sent to `/webhooks/subscribe/broadcaster/follow` which subsequently sends an event over the websocket connections.

### Stream team stream changes

When a member of the stream team goes live or offline, a POST request is sent to `/webhooks/subscribe/team/:member_id` which subsequently calls the Discord API to post a message in the configured Discord announcements channel.

## Subscribing to new Twitch webhooks

--- DEPRECATED ---

1. Configure the TWITCH_API_CALLBACK_URL in your .env file (e.g. https://yourserver/webhooks/subscribe). **For development you'll need to use a service such as ngrok to generate a callback url that is not `localhost`.**
2. Configure the webhook you want to subscribe to in `webhooks.ts`. You'll need the `topicUrl` and you may need to configure a new `WebhookType`.
3. Add a `GET` request to `webserver.ts` to handle the initial webhook subscription. It's important that you send the following as the response to the `GET` request in order for the subscription to be successful.

```javascript
res.status(200).send(req.query["hub.challenge"]);
```

4. Add a `POST` request to `webserver.ts` to handle the webhook changes (on the same path as the `GET` request you configured above).
