# Glimesh live updates

The Glimesh API supports using Graphql subscriptions to receive live updates over websockets.
The mainframe connects to Glimesh as a websocket client and subscribes to the following events:

### Stream team stream changes

When a member of the stream team (configured as `glimeshChannels` in config.ts) goes live or offline, a websocket message is received by `GlimeshClient` which subsequently calls the Discord API to post a message in the configured Discord announcements channel.