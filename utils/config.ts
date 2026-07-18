import fs from "fs/promises";
import YAML from "yaml";
import { AppConfig } from "#/types/config.js";

export let config: Readonly<AppConfig>;

export async function loadConfig() {
    const data = await fs.readFile("config.yml", "utf8");
    const parsed = YAML.parse(data) as Partial<AppConfig>;

    if (!parsed.twitch?.channelName) {
        throw new Error("Missing config value: twitch.channelName");
    }

    if (!parsed.youtube?.channelName) {
        throw new Error("Missing config value: youtube.channelName");
    }

    // TODO: Maybe use zod?
    config = {
        twitch: {
            channelName: parsed.twitch.channelName,
        },
        youtube: {
            channelName: parsed.youtube.channelName,
        },
        bridge: {
            pollIntervalMs: parsed.bridge?.pollIntervalMs ?? 5000,
            pollLimitMs: parsed.bridge?.pollLimitMs ?? 180000,
        },
    };
}
