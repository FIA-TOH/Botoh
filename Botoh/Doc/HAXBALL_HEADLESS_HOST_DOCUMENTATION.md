# Haxball Headless Host Documentation

## Overview
The headless room host is useful if you want to run an unmanned haxball host on a VPS. It doesn't draw or play any sounds which makes it a lot more lightweight. It is only controllable through a JavaScript API.

## Connectivity Warning
If you are hosting on a VPS using Chrome version 78 or greater, it is required to disable the Local IP WebRTC Anonymization feature for the host to work.

Run chrome with command flag: `--disable-features=WebRtcHideLocalIpsWithMdns` to disable this feature.

## API
When haxball headless host is done loading, it will set `window.HBInit` and call function `window.onHBLoaded`.

**Note**: All API functions that modify the game's state will execute asynchronously. This means that if you move a player using `roomObject.setPlayerTeam` method and immediately after you call `roomObject.getPlayerList`, the player list obtained will show the player's original team and not the modified one.

### HBInit(roomConfig: RoomConfigObject): RoomObject
Use this function to initialize the room. It returns the room object used to control the room.

After calling this function, a recaptcha challenge will appear. After passing the recaptcha, the room link will appear on the page.

**Example:**
```javascript
var room = HBInit({
    roomName: "My room",
    maxPlayers: 16,
    noPlayer: true // Remove host player (recommended!)
});
room.setDefaultStadium("Big");
room.setScoreLimit(5);
room.setTimeLimit(0);

// If there are no admins left in the room give admin to one of the remaining players.
function updateAdmins() { 
    // Get all players
    var players = room.getPlayerList();
    if ( players.length == 0 ) return; // No players left, do nothing.
    if ( players.find((player) => player.admin) != null ) return; // There's an admin left so do nothing.
    room.setPlayerAdmin(players[0].id, true); // Give admin to first non admin player in the list
}

room.onPlayerJoin = function(player) {
    updateAdmins();
}

room.onPlayerLeave = function(player) {
    updateAdmins();
}
```

### RoomConfigObject
RoomConfig is passed to HBInit to configure the room. All values are optional.

- `roomName: string` - The name for the room.
- `playerName: string` - The name for the host player.
- `password: string` - The password for the room (no password if omitted).
- `maxPlayers: int` - Max number of players room accepts.
- `public: bool` - If true, room will appear in the room list.
- `geo: {"code": string, "lat": float, "lon": float}` - GeoLocation override for the room.
- `token: String` - Can be used to skip recaptcha by setting it to a token that can be obtained [here](https://www.haxball.com/headless)
  - These tokens will expire after a few minutes.
- `noPlayer: Bool` - If set to true, the room player list will be empty, `playerName` setting will be ignored.
  - Default value is false for backwards compatibility reasons but it's recommended to set this to true.

**Warning!** Events will have `null` as the `byPlayer` argument when the event is caused by the host, so make sure to check for null values!

### RoomObject
RoomObject is the main interface which lets you control the room and listen to its events.

#### Methods
- `sendChat(message: string, targetId?: Int): void`
  - Sends a chat message using the host player.
  - If `targetId` is null or undefined, message is sent to all players.
  - If `targetId` is defined, message is sent only to the player with a matching id.

- `setPlayerAdmin(playerID: int, admin: bool): void`
  - Changes the admin status of the specified player.

- `setPlayerTeam(playerID: int, team: int): void`
  - Moves the specified player to a team.

- `kickPlayer(playerID: int, reason: string, ban: bool): void`
  - Kicks the specified player from the room.

- `clearBan(playerId: int): void`
  - Clears the ban for a `playerId` that belonged to a player that was previously banned.

- `clearBans(): void`
  - Clears the list of banned players.

- `setScoreLimit(limit: int): void`
  - Sets the score limit of the room.
  - If a game is in progress, this method does nothing.

- `setTimeLimit(limitInMinutes: int): void`
  - Sets the time limit of the room. The limit must be specified in number of minutes.
  - If a game is in progress, this method does nothing.

- `setCustomStadium(stadiumFileContents: string): void`
  - Parses `stadiumFileContents` as a .hbs stadium file and sets it as the selected stadium.
  - There must not be a game in progress. If a game is in progress, this method does nothing.

- `setDefaultStadium(stadiumName: string): void`
  - Sets the selected stadium to one of the default stadiums. The name must match exactly (case sensitive).
  - There must not be a game in progress. If a game is in progress, this method does nothing.

- `setTeamsLock(locked: bool): void`
  - Sets the teams lock. When teams are locked, players are not able to change team unless they are moved by an admin.

- `setTeamColors(team: TeamID, angle: float, textColor: int, colors: []int): void`
  - Sets the colors of a team.
  - Colors are represented as an integer (e.g., pure red color is 0xFF0000).

- `startGame(): void`
  - Starts the game. If a game is already in progress, this method does nothing.

- `stopGame(): void`
  - Stops the game. If no game is in progress, this method does nothing.

- `pauseGame(pauseState: bool)`
  - Sets the pause state of the game. `true` = paused, `false` = unpaused.

- `getPlayer(playerId: Int): PlayerObject`
  - Returns the player with the specified id. Returns null if the player doesn't exist.

- `getPlayerList(): PlayerObject[]`
  - Returns the current list of players.

- `getScores(): ScoresObject`
  - **IMPORTANT**: If a game is in progress, it returns the current score information. Otherwise, it returns null.
  - **CRITICAL FOR TIME**: Use `getScores().time` for accurate game time instead of `setInterval` or `Date.now()`.

- `getBallPosition(): {"x": float, "y": float}`
  - Returns the ball's position in the field or null if no game is in progress.

- `startRecording(): void`
  - Starts recording of a haxball replay.
  - Don't forget to call stop recording or it will cause a memory leak.

- `stopRecording(): Uint8Array`
  - Stops the recording previously started with `startRecording` and returns the replay file contents as a `Uint8Array`.
  - Returns null if recording was not started or had already been stopped.

- `setPassword(pass: string): void`
  - Changes the password of the room. If `pass` is null, the password will be cleared.

- `setRequireRecaptcha(required: bool): void`
  - Activates or deactivates recaptcha requirement to join the room.

- `reorderPlayers(playerIdList: Array<Int>, moveToTop: Bool): void`
  - First, all players listed are removed, then they are reinserted in the same order they appear in `playerIdList`.
  - If `moveToTop` is true, players are inserted at the top of the list, otherwise they are inserted at the bottom of the list.

- `sendAnnouncement(msg: String, targetId?: Int, color?: Int, style?: String, sound?: Int)`
  - Sends a host announcement with `msg` as contents. Unlike `sendChat`, announcements will work without a host player and have a larger limit on the number of characters.
  - If `targetId` is null or undefined, the message is sent to all players, otherwise it's sent only to the player with matching `targetId`.
  - `color` will set the color of the announcement text (encoded as an integer: 0xFF0000 is red, 0x00FF00 is green, 0x0000FF is blue).
  - If `color` is null or undefined, text will use the default chat color.
  - `style` will set the style of the announcement text (must be one of: "normal", "bold", "italic", "small", "small-bold", "small-italic").
  - If `style` is null or undefined, "normal" style will be used.
  - If `sound` is set to 0, announcement will produce no sound. If set to 1, it will produce a normal chat sound. If set to 2, it will produce a notification sound.

- `setKickRateLimit(min: Int = 2, rate: Int = 0, burst: Int = 0)`
  - Sets the room's kick rate limits.
  - `min` is the minimum number of logic-frames between two kicks. It is impossible to kick faster than this.
  - `rate` works like `min` but lets players save up extra kicks to use them later depending on the value of `burst`.
  - `burst` determines how many extra kicks the player is able to save up.

- `setPlayerAvatar(playerId: Int, avatar: String)`
  - Overrides the avatar of the target player.
  - If `avatar` is set to null, the override is cleared and the player will be able to use their own avatar again.

- `setDiscProperties(discIndex: Int, properties: DiscPropertiesObject)`
  - Sets properties of the target disc.
  - Properties that are null or undefined will not be set and therefore will preserve whatever value the disc already had.

- `getDiscProperties(discIndex: Int): DiscPropertiesObject`
  - Gets the properties of the disc at `discIndex`. Returns null if `discIndex` is out of bounds.

- `setPlayerDiscProperties(playerId: Int, properties: DiscPropertiesObject)`
  - Same as `setDiscProperties` but targets the disc belonging to a player with the given Id.

- `getPlayerDiscProperties(playerId: Int): DiscPropertiesObject`
  - Same as `getDiscProperties` but targets the disc belonging to a player with the given Id.

- `getDiscCount()`
  - Gets the number of discs in the game including the ball and player discs.

### CollisionFlags
`CollisionFlags` is an object filled with collision flag constants that compose the `cMask` and `cGroup` disc properties.

**Example usage:**
```javascript
// Check if disc 4 belongs to collision group "ball":
var discProps = room.getDiscProperties(4);
var hasBallFlag = (discProps.cGroup & room.CollisionFlags.ball) != 0;

// Add "wall" to the collision mask of disc 5 without changing any other of its flags:
var discProps = room.getDiscProperties(5);
room.setDiscProperties(5, {cMask: discProps.cMask | room.CollisionFlags.wall});
```

## Events

### onPlayerJoin
`onPlayerJoin(player: PlayerObject): void`
- Event called when a new player joins the room.

### onPlayerLeave
`onPlayerLeave(player: PlayerObject): void`
- Event called when a player leaves the room.

### onTeamVictory
`onTeamVictory(scores: ScoresObject): void`
- Event called when a team wins.

### onPlayerChat
`onPlayerChat(player: PlayerObject, message: String): bool`
- Event called when a player sends a chat message.
- The event function can return `false` to filter the chat message. This prevents the chat message from reaching other players in the room.

### onPlayerBallKick
`onPlayerBallKick(player: PlayerObject): void`
- Event called when a player kicks the ball.

### onTeamGoal
`onTeamGoal(team: TeamID): void`
- Event called when a team scores a goal.

### onGameStart
`onGameStart(byPlayer: PlayerObject): void`
- Event called when a game starts.
- `byPlayer` is the player which caused the event (can be `null` if the event wasn't caused by a player).

### onGameStop
`onGameStop(byPlayer: PlayerObject): void`
- Event called when a game stops.
- `byPlayer` is the player which caused the event (can be `null` if the event wasn't caused by a player).

### onPlayerAdminChange
`onPlayerAdminChange(changedPlayer: PlayerObject, byPlayer: PlayerObject): void`
- Event called when a player's admin rights are changed.
- `byPlayer` is the player which caused the event (can be `null` if the event wasn't caused by a player).

### onPlayerTeamChange
`onPlayerTeamChange(changedPlayer: PlayerObject, byPlayer: PlayerObject): void`
- Event called when a player team is changed.
- `byPlayer` is the player which caused the event (can be `null` if the event wasn't caused by a player).

### onPlayerKicked
`onPlayerKicked(kickedPlayer: PlayerObject, reason: string, ban: bool, byPlayer: PlayerObject): void`
- Event called when a player has been kicked from the room. This is always called after the `onPlayerLeave` event.
- `byPlayer` is the player which caused the event (can be `null` if the event wasn't caused by a player).

### onGameTick
`onGameTick(): void`
- Event called once for every game tick (happens 60 times per second). This is useful if you want to monitor player and ball positions without missing any ticks.
- This event is not called if the game is paused or stopped.

### onGamePause
`onGamePause(byPlayer: PlayerObject): void`
- Event called when the game is paused.

### onGameUnpause
`onGameUnpause(byPlayer: PlayerObject): void`
- Event called when the game is unpaused.
- After this event, there's a timer before the game is fully unpaused. To detect when the game has really resumed, you can listen for the first `onGameTick` event after this event is called.

### onPositionsReset
`onPositionsReset(): void`
- Event called when players and ball positions are reset after a goal happens.

### onPlayerActivity
`onPlayerActivity(player: PlayerObject): void`
- Event called when a player gives signs of activity, such as pressing a key. This is useful for detecting inactive players.

### onStadiumChange
`onStadiumChange(newStadiumName: string, byPlayer: PlayerObject): void`
- Event called when the stadium is changed.

### onRoomLink
`onRoomLink(url: string): void`
- Event called when the room link is obtained.

### onKickRateLimitSet
`onKickRateLimitSet(min: Int, rate: Int, burst: Int, byPlayer: PlayerObject): void`
- Event called when the kick rate is set.

### onTeamsLockChange
`onTeamsLockChange(locked: bool, byPlayer: PlayerObject): void`
- Event called when the teams lock setting is changed.

## Object Types

### PlayerObject
PlayerObject holds information about a player.

- `id: int` - The id of the player. Each player that joins the room gets a unique id that will never change.
- `name: string` - The name of the player.
- `team: TeamID` - The team of the player.
- `admin: bool` - Whether the player has admin rights.
- `position: {"x": float, "y": float}` - The player's position in the field. If the player is not in the field, value will be `null`.
- `auth: String | null` - The player's public ID. Players can view their own ID's here: https://www.haxball.com/playerauth
  - The public ID is useful to validate that a player is who they claim to be, but can't be used to verify that a player isn't someone else. This means it's useful for implementing user accounts, but not useful for implementing a banning system.
  - Can be `null` if ID validation fails.
  - This property is only set in the `RoomObject.onPlayerJoin` event.
- `conn: String` - A string that uniquely identifies the player's connection. If two players join using the same network, this string will be equal.
  - This property is only set in the `RoomObject.onPlayerJoin` event.

### ScoresObject
ScoresObject holds information relevant to the current game scores.

- `red: int` - The number of goals scored by the red team.
- `blue: int` - The number of goals scored by the blue team.
- `time: float` - **The number of seconds elapsed (seconds don't advance while the game is paused)**
- `scoreLimit: int` - The score limit for the game.
- `timeLimit: float` - The time limit for the game.

### TeamID
TeamID are int values:
- Spectators: 0
- Red Team: 1
- Blue Team: 2

### DiscPropertiesObject
DiscPropertiesObject holds information about a game physics disc.

- `x: Float` - The x coordinate of the disc's position
- `y: Float` - The y coordinate of the disc's position
- `xspeed: Float` - The x coordinate of the disc's speed vector
- `yspeed: Float` - The y coordinate of the disc's speed vector
- `xgravity: Float` - The x coordinate of the disc's gravity vector
- `ygravity: Float` - The y coordinate of the disc's gravity vector
- `radius: Float` - The disc's radius
- `bCoeff: Float` - The disc's bouncing coefficient
- `invMass: Float` - The inverse of the disc's mass
- `damping: Float` - The disc's damping factor
- `color: Int` - The disc's color expressed as an integer (0xFF0000 is red, 0x00FF00 is green, 0x0000FF is blue, -1 is transparent)
- `cMask: Int` - The disc's collision mask (Represents what groups the disc can collide with)
- `cGroup: Int` - The disc's collision groups

### CollisionFlagsObject
CollisionFlagsObject contains flag constants that are used as helpers for reading and writing collision flags.

The flags are: `ball`, `red`, `blue`, `redKO`, `blueKO`, `wall`, `all`, `kick`, `score`, `c0`, `c1`, `c2` and `c3`.

**Example usage:**
```javascript
var cf = room.CollisionFlags;

// Check if disc 4 belongs to collision group "ball":
var discProps = room.getDiscProperties(4);
var hasBallFlag = (discProps.cGroup & cf.ball) != 0;

// Add "wall" to the collision mask of disc 5 without changing any other of its flags:
var discProps = room.getDiscProperties(5);
room.setDiscProperties(5, {cMask: discProps.cMask | cf.wall});
```

## CRITICAL DEVELOPMENT GUIDELINES

### ⚠️ TIME MANAGEMENT - EXTREMELY IMPORTANT
**ALWAYS use `room.getScores().time` for accurate game time tracking.**
- **NEVER** use `setInterval` or `Date.now()` for game-related timing
- **NEVER** rely on real-time clocks for game mechanics
- **ALWAYS** check if `getScores()` returns null before accessing `.time`

### ⚠️ ASYNCHRONOUS OPERATIONS
All API functions that modify the game's state execute asynchronously. This means:
```javascript
room.setPlayerTeam(playerId, 2);  // Move player to blue team
const players = room.getPlayerList();  // This might still show the player in the old team!
```

### ⚠️ NULL CHECKS
Always check for null values in event handlers, especially:
- `byPlayer` parameter in events (can be null when caused by host)
- `player.position` (can be null when player is not in field)
- `getScores()` return value (can be null when no game is in progress)

### ⚠️ PLAYER LIFECYCLE
- Player properties like `auth` and `conn` are only available in `onPlayerJoin` event
- Always store important player data immediately when they join if you need it later
