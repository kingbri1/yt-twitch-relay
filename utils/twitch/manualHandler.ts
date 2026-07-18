import { TwitchCtx } from "#/types/twitch.js";
import { YoutubeCtx } from "#/types/youtube.js";
import { attachYtStream } from "../youtube/stream.js";

const prefix = "!";

async function attachCommand(twitch: TwitchCtx, youtube: YoutubeCtx) {
    try {
        youtube.pollAbortController?.abort();

        await attachYtStream(youtube, async (formattedMessage) => {
            await twitch.chat.say(twitch.channelName, formattedMessage);
        });

        await twitch.chat.say(
            twitch.channelName,
            "Successfully linked chat with YouTube!",
        );

        console.log("[Manual] Successfully linked chat with YouTube!");
    } catch (error) {
        await twitch.chat.say(
            twitch.channelName,
            "Error linking YT chat, check the console for errors.",
        );

        console.log("[Manual] Error:");
        console.log(error);
    }
}

async function detachCommand(twitch: TwitchCtx, youtube: YoutubeCtx) {
    if (youtube.liveChat) {
        youtube.liveChat.stop();
        youtube.liveChat = undefined;
    }

    await twitch.chat.say(twitch.channelName, "YouTube chat unlinked.");
    console.log("[Manual] YouTube chat unlinked.");
}

async function handleRelay(
    twitch: TwitchCtx,
    youtube: YoutubeCtx,
    params: string[],
) {
    const subcommand = params[0];
    switch (subcommand) {
        case "attach":
            await attachCommand(twitch, youtube);
            break;
        case "detach":
            await detachCommand(twitch, youtube);
            break;
        default:
            break;
    }
}

export async function setupCommands(twitch: TwitchCtx, youtube: YoutubeCtx) {
    twitch.chat.onMessage(async (_channel, _user, text, msg) => {
        if (!text.startsWith(prefix)) {
            return;
        }

        if (!msg.userInfo.isMod && !msg.userInfo.isBroadcaster) {
            return;
        }

        const command = text.trim().split(" ");
        if (command.length === 0 || !command[0]) {
            return;
        }

        const cmdName = command[0].slice(prefix.length);
        const cmdParams = command.slice(1);
        if (cmdName !== "relay") {
            return;
        }

        await handleRelay(twitch, youtube, cmdParams);
    });
}
