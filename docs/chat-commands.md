# Twitch chat commands

The mainframe uses tmi.js to listen to chat messages that fire events on particular string matches in `messages.ts`.

```text
- !rain
- !shower
- !snow
- !hail
- !blizzard
- !fire

- !drop me
- !drop {emotes}
- !bigdrop {emotes}
- !yeet me
- !yeet {user}

// broadcaster only
- !start-trail
- !end-trail
- !reset
```

Add new commands and callbacks easily to `ChatCommands` in `commands.ts` which will be parsed in `messages.ts`. 

Example:

```javascript
const ChatCommands: Commands = {
  ...
  "!newCommand": async (tags, message) => {
    //callback...
  }
}
```