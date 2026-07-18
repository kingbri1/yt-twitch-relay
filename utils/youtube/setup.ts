import { YoutubeCtx } from "#/types/youtube.js";
import { Innertube } from "youtubei.js";

export async function setupYoutube(channelName: string): Promise<YoutubeCtx> {
    const client = await Innertube.create();

    const resolved = await client.resolveURL(
        `https://youtube.com/@${channelName}`,
    );
    const channelId = resolved.payload.browseId;
    if (!channelId) {
        throw new Error(`Could not resolve YouTube channel: @${channelId}`);
    }

    return {
        channelName,
        client,
    };
}
