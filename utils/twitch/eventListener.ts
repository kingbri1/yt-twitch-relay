import { TwitchCtx } from "#/types/twitch.js";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { pollAttachYtStream } from "../youtube/stream.js";
import { YoutubeCtx } from "#/types/youtube.js";

export async function setupEventListener(
    twitch: TwitchCtx,
    youtube: YoutubeCtx,
) {
    const user = await twitch.api.users.getUserByName(twitch.channelName);
    if (!user) {
        throw new Error(`Unable to find twitch channel ${twitch.channelName}`);
    }

    const twitchEventListener = new EventSubWsListener({
        apiClient: twitch.api,
    });

    twitchEventListener.onSubscriptionCreateSuccess(async (subscription) => {
        console.log(`Twitch subscription created at ${subscription.id}`);
    });

    twitchEventListener.onStreamOnline(user, async (_) => {
        try {
            await pollAttachYtStream(youtube, async (formattedMessage) => {
                await twitch.chat.say(twitch.channelName, formattedMessage);
            });

            await twitch.chat.say(
                twitch.channelName,
                "Successfully linked chat with YouTube!",
            );

            console.log("[Event] Successfully linked chat with YouTube!");
        } catch (error) {
            console.log("[Event] Error:");
            console.log(error);

            await twitch.chat.say(
                twitch.channelName,
                "[Event] Error when linking chat with YouTube, " +
                    "see console for more details.",
            );
        }
    });

    twitchEventListener.onStreamOffline(user, async (_) => {
        if (youtube.liveChat) {
            youtube.liveChat.stop();
            youtube.liveChat = undefined;
        }

        await twitch.chat.say(twitch.channelName, "YouTube chat unlinked.");
        console.log("[Event] Twitch stream stopped. YouTube chat unlinked.");
    });

    twitchEventListener.start();
}
