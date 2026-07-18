export interface AppConfig {
    twitch: {
        channelName: string;
    };
    youtube: {
        channelName: string;
    };
    bridge: {
        pollLimitMs: number;
        pollIntervalMs: number;
    };
}
