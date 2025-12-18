# Testing Twitch events with fdgt

Fdgt is an excellent tool that allows you to test your events without having to spend money on Twitch.

[See fdgt docs](https://fdgt-website.now.sh/docs/getting-started)

Find the file `testConfig.example.ts` in the root of the directory.

To test mainframe events with fdgt, change the file name to `testConfig.ts` and set the variables accordingly.

If `testConfig.connectToFdgt === true`, the following things will happen:

1. In `src/tmi.js`, the `connection.server` will be updated to `irc.fdgt.dev`.

2. In `src/app.js`, after 5 seconds, fdgt will send the test command that you specify as `testConfig.command`.

3. Userstate and other values that are sent from the Twitch API are not provided in full by fdgt. You will need to mock these. Use `testConfig` values to send test events accordingly, for example, sending user ids to subscription events, like so:

```javascript
  testConfig.connectToFdgt
      ? sendSubEvent(testConfig.userId, testConfig.userId)
      : sendSubEvent(userstate["user-id"] as string, userstate["id"] as string);

```
