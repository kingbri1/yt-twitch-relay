import { AccessToken, RefreshingAuthProvider } from "@twurple/auth";
import type {
    AuthMode,
    TwitchCreds,
    TwitchTokens,
    TwitchTokenStore,
} from "#/types/auth.js";
import fs from "fs/promises";

const credsPath = "creds/creds.json";
const tokensPath = "creds/tokens.json";
const tokenOwners = new Map<string, AuthMode>();

async function loadCreds(): Promise<TwitchCreds> {
    const data = await fs.readFile(credsPath, "utf8");
    return JSON.parse(data) as TwitchCreds;
}

async function loadTokens(): Promise<TwitchTokenStore> {
    const data = await fs.readFile(tokensPath, "utf8");
    return JSON.parse(data) as TwitchTokenStore;
}

async function saveToken(
    authMode: AuthMode,
    newTokens: TwitchTokens,
): Promise<void> {
    const tokens = await loadTokens();
    tokens[authMode] = newTokens;

    await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
}

export async function getAuthProvider() {
    const creds = await loadCreds();
    const tokens = await loadTokens();

    const authProvider = new RefreshingAuthProvider({
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
    });

    authProvider.onRefresh(async (userId, rawTokenData) => {
        const authMode = tokenOwners.get(userId);
        if (!authMode) {
            return;
        }

        if (!rawTokenData.refreshToken) {
            throw new Error(
                `Refresh token for user ${userId} not found. Unable to save credentials`,
            );
        }

        const newTokenData = {
            accessToken: rawTokenData.accessToken,
            refreshToken: rawTokenData.refreshToken,
        };

        await saveToken(authMode, newTokenData);
    });

    const botId = await authProvider.addUserForToken(
        tokens.bot as AccessToken,
        ["chat"],
    );
    tokenOwners.set(botId, "bot");

    console.log(`Loaded user ${botId} as the bot user.`);

    if (tokens.broadcaster) {
        const broadcasterId = await authProvider.addUserForToken(
            tokens.broadcaster as AccessToken,
        );
        tokenOwners.set(broadcasterId, "broadcaster");

        console.log(
            `Loaded user ${broadcasterId} as broadcaster for EventSub.`,
        );
    } else {
        console.log(
            "No Twitch broadcaster token found. Broadcaster-scoped EventSub subscriptions may fail.",
        );
    }

    return authProvider;
}
