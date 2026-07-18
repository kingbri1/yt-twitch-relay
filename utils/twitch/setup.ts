import { TwitchCtx } from "#/types/twitch.js";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { getAuthProvider } from "./auth.js";

export async function setupTwitch(channelName: string): Promise<TwitchCtx> {
    const authProvider = await getAuthProvider();
    const chatClient = new ChatClient({
        authProvider,
        channels: [channelName],
    });

    chatClient.onConnect(() => {
        console.log("Twitch chat connected");
    });

    const apiClient = new ApiClient({
        authProvider,
    });

    chatClient.connect();

    apiClient.users.getUserByName("kingbri1st");

    return {
        channelName,
        chat: chatClient,
        api: apiClient,
    };
}
