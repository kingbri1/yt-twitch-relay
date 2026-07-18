# bitrelay

<p align="left">
    <img src="https://img.shields.io/badge/Node-LTS-blue" alt="Node-LTS">
    <img src="https://img.shields.io/badge/typescript-blue" alt="TypeScript">
    <a href="https://twitch.tv/kingbri1st">
        <img src="https://img.shields.io/badge/Twitch-kingbri1st-9146FF?logo=twitch&logoColor=white" alt="Twitch">
    </a>
    <a href="/LICENSE">
        <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"/>
    </a>
</p>

<p align="left">
    <a href="https://ko-fi.com/I2I3BDTSW">
        <img src="https://img.shields.io/badge/Support_on_Ko--fi-FF5E5B?logo=ko-fi&style=for-the-badge&logoColor=white" alt="Support on Ko-Fi">
    </a>
</p>

**bitrelay** is a lightweight relay bot that forwards **YouTube livestream chat into Twitch chat**. The name is inspired from my stream mascot "Bit"!

## Disclaimer

This is a hobby project stemming from my curiosity. All builds are provided as-is and bugs might be present. I am not responsible if the program causes issues ranging from minor inconveniences to thermonuclear war.

## Why?

Multistreaming has become increasingly popular, but shared chat is still surprisingly fragmented.

Many creators already have polished Twitch overlays that rely on Twitch chat. There are solutions, but many of them require switching overlay providers and working with new assets. Some of these solutions are also Windows-only, limiting streamers on other operating systems.

Rather than reinvent overlays, bitrelay simply forwards YouTube chat into Twitch and uses your existing overlay.

## Setup

1. Create a new chatbot app in [Twitch Developers](https://dev.twitch.tv/console/apps), and grab the `clientId` and `clientSecret`
2. Clone this repository
3. Copy `config.sample.yml` to `config.yml` and fill in the fields
4. Install dependencies with the Node package manager of your choice (I use pnpm)
5. Authenticate with Twitch by running `pnpm auth:bot` and sign into your bot account in the browser
   1. If you are running bitrelay on a bot account, run `pnpm auth:broadcaster` and make sure to sign in with your broadcaster account
6. Run `pnpm build && pnpm start` which runs the server!

## Features

- Unidirectional relay to work with existing Twitch chat overlays
- Manual commands to attach and detach to a YT chat
- Event-based automatic chat attachment when Twitch starts and stops (Experimental)
- NO Youtube authentication/OAuth needed! Reads YT chat using public APIs

More features will be added as the project matures. If something is missing here, PR it in!

## Contributing

Use the template when creating issues or pull requests, otherwise the developers may not look at your post.

If you have issues with the project:

- Describe the issue in detail
- If you have a feature request, please indicate it as such.

If you have a Pull Request:

- Describe the pull request in detail, what, and why you are changing something

## Developers and Permissions

Creators/Developers:

- [kingbri](https://github.com/kingbri1) - TypeScript, Docker
