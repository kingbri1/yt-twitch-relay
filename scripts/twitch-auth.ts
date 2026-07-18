import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import fs from "fs/promises";
import type { TwitchCreds, TwitchTokens } from "#/types/auth.js";

type TwitchTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string[];
    token_type: "bearer";
};

// Indicate if bot or broadcaster is being used
type AuthMode = "bot" | "broadcaster";

// Saves a token JSON for the provided auth mode
async function saveTokenFile(authMode: AuthMode, accessTokens: TwitchTokens) {
    const tokensPath = "creds/tokens.json";
    let existingTokens = {};

    // Try to fetch the token JSON
    try {
        const existingData = await fs.readFile(tokensPath, "utf8");
        existingTokens = JSON.parse(existingData);
    } catch (error) {
        existingTokens = {};
    }

    const updatedTokens = {
        ...existingTokens,
        [authMode]: accessTokens,
    };

    await fs.writeFile(tokensPath, JSON.stringify(updatedTokens, null, 2));

    console.log(`Successfully wrote ${authMode} tokens to ${tokensPath}`);
}

// Determine auth mode
const authMode = process.argv[2] as AuthMode | undefined;

if (authMode !== "bot" && authMode !== "broadcaster") {
    throw new Error("Usage: tsx scripts/twitch-auth.ts <bot|broadcaster>");
}

// Load developer creds
const data = await fs.readFile("creds/creds.json", "utf8");
const { clientId, clientSecret } = JSON.parse(data) as TwitchCreds;

// Set to different redirect URL if needed
const redirectURL = "http://localhost:3000";
const scopes = authMode === "bot" ? ["chat:read", "chat:edit"] : [];

if (!clientId || !clientSecret) {
    throw new Error(
        "Cannot find credentials. Did you populate the creds.json file?",
    );
}

// Populate URL for OAuth flow
const state = crypto.randomBytes(32).toString("hex");
const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");

authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectURL);
authUrl.searchParams.set("scope", scopes.join(" "));
authUrl.searchParams.set("state", state);

console.log("\nOpen this URL in your browser (incognito window preferred):\n");
console.log(authUrl.toString(), "\n");

// Intercepting server for OAuth callback
const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url ?? "/", redirectURL);

        if (url.pathname !== "/") {
            res.writeHead(404).end("Not found");

            return;
        }

        const error = url.searchParams.get("error");

        if (error) {
            throw new Error(
                `${error}: ${url.searchParams.get("error_description")}`,
            );
        }

        const returnedState = url.searchParams.get("state");

        // Check if the returned state is from us
        if (returnedState !== state) {
            throw new Error(
                "Invalid CSRF/state token. Someone might be doing something nasty!",
            );
        }

        const code = url.searchParams.get("code");

        if (!code) {
            throw new Error("Missing authorization code");
        }

        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectURL,
        });

        const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        });

        if (!tokenRes.ok) {
            throw new Error(await tokenRes.text());
        }

        const tokens = (await tokenRes.json()) as TwitchTokenResponse;
        const accessTokens = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        };

        await saveTokenFile(authMode, accessTokens);

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Twitch auth complete. You can close this tab.");
        server.close();
    } catch (err) {
        console.error(err);
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end(String(err));
        server.close();
    }
});

server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
