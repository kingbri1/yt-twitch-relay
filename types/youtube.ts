import { Innertube } from "youtubei.js";

export type YouTubeLiveChat = ReturnType<
    Awaited<ReturnType<Innertube["getInfo"]>>["getLiveChat"]
>;

export interface YoutubeCtx {
    channelName: string;
    client: Innertube;
    liveChat?: YouTubeLiveChat | undefined;
    pollAbortController?: AbortController | undefined;
}

export type YTMessageCallback = (message: string) => Promise<void>;
