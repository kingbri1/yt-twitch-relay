import { setupTwitch } from "#/utils/twitch/setup.js";
import { setupEventListener } from "#/utils/twitch/eventListener.js";
import { setupCommands } from "#/utils/twitch/manualHandler.js";
import { setupYoutube } from "#/utils/youtube/setup.js";
import { config, loadConfig } from "#/utils/config.js";

await loadConfig();

// Populate platforms
const twitch = await setupTwitch(config.twitch.channelName);
const youtube = await setupYoutube(config.youtube.channelName);

// Setup listners and commands
await setupEventListener(twitch, youtube);
await setupCommands(twitch, youtube);

console.log(
    `Bridging chat from YouTube channel ${config.youtube.channelName} ` +
        `and Twitch channel ${config.twitch.channelName}`,
);
