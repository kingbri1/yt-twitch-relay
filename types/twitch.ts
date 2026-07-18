import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";

export interface TwitchCtx {
    channelName: string;
    chat: ChatClient;
    api: ApiClient;
}
