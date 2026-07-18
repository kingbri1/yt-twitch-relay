import { setTimeout as sleep } from "node:timers/promises";
import { YTNodes } from "youtubei.js";

import { config } from "#/common/config.js";
import { defer } from "#/common/utils.js";
import { YoutubeCtx, YTMessageCallback } from "#/types/youtube.js";
import { YTAbortedError, YTAttachError } from "../errors.js";

// Aborts any polling and ends the attached liveChat
export function stopYtStream(youtube: YoutubeCtx) {
    youtube.pollAbortController?.abort();
    youtube.pollAbortController = undefined;

    youtube.liveChat?.stop();
}

export async function attachYtStream(
    youtube: YoutubeCtx,
    onMessage: YTMessageCallback,
) {
    if (youtube.liveChat) {
        throw new YTAttachError("YT livestream already attached.");
    }

    const resolvedStream = await youtube.client.resolveURL(
        `https://youtube.com/@${youtube.channelName}/live`,
    );
    const streamId = resolvedStream.payload.videoId;

    if (!streamId) {
        throw new YTAttachError("No YT livestreams currently running.");
    }

    const info = await youtube.client.getInfo(streamId);
    if (!info.basic_info.is_live) {
        throw new YTAttachError(
            "The current YT livestream isn't marked as live!",
        );
    }

    const liveChat = info.getLiveChat();
    liveChat.on("start", () => {
        console.log("Connected to YouTube live chat");
    });

    liveChat.on("chat-update", async (action) => {
        if (!action.is(YTNodes.AddChatItemAction)) {
            return;
        }

        const item = action.item;

        if (!item?.is(YTNodes.LiveChatTextMessage)) {
            return;
        }

        const username = item.author.name.replace(/^@/, "");
        const message = item.message;
        const formattedMessage = `[YT] ${username} - ${message}`;

        // Run callback for message
        await onMessage(formattedMessage);
    });

    liveChat.on("error", (error) => {
        console.error("Youtube Live chat error:", error);
    });

    liveChat.on("end", () => {
        console.log("YouTube live chat ended.");
        youtube.liveChat = undefined;
    });

    youtube.liveChat = liveChat;
    liveChat.start();
}

export async function pollAttachYtStream(
    youtube: YoutubeCtx,
    onMessage: YTMessageCallback,
) {
    if (youtube.liveChat) {
        throw new YTAttachError("YT livestream already attached.");
    }

    if (youtube.pollAbortController) {
        throw new YTAttachError("Already polling for YT stream.");
    }

    const abortController = new AbortController();
    youtube.pollAbortController = abortController;

    defer(() => {
        if (youtube.pollAbortController === abortController) {
            youtube.pollAbortController = undefined;
        }
    });

    const signal = abortController.signal;
    const startedAt = Date.now();

    while (true) {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= config.bridge.pollLimitMs) {
            console.log("Stopped polling for YT stream.");
            break;
        }

        try {
            await attachYtStream(youtube, onMessage);

            console.log("YT livestream found and attached.");
            break;
        } catch (error) {
            if (signal.aborted) {
                throw new YTAbortedError("YT stream polling aborted.");
            }

            console.log("Unable to find public YouTube livestream, retrying.");
            await sleep(config.bridge.pollIntervalMs);
        }
    }
}
