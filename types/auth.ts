export interface TwitchCreds {
    clientId: string;
    clientSecret: string;
}

export interface TwitchTokenStore {
    bot: TwitchTokens;
    broadcaster?: TwitchTokens;
}

export interface TwitchTokens {
    accessToken: string;
    refreshToken: string;
}

export type AuthMode = keyof TwitchTokenStore;
