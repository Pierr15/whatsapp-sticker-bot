# Feature Specification

This document defines the compatibility contract and proposed new behavior for the rebuild. Existing behavior must be audited before it is treated as authoritative. New feature requirements below are planned specifications, not claims that the current application already supports them.

## Existing commands to preserve

| Command | Expected behavior | Input source |
|---|---|---|
| `.s` | Create a sticker using configured default name and author | Image caption or reply/quote to an image |
| `.stiker Nama Stiker|Nama Author` | Create a sticker using supplied metadata | Image caption or reply/quote to an image |
| `.stiker |Nama Author` | Use default sticker name and supplied author | Image caption or reply/quote to an image |
| `.stiker Nama Stiker|` | Use supplied name and default author | Image caption or reply/quote to an image |
| `.stiker` | Use both defaults | Image caption or reply/quote to an image |
| `.brat teks` | Generate a static Brat-style text sticker | Text after command |
| `.help`, `.menu` | Show command help | Text message |

Parsing must be case-insensitive for command names, trim surrounding whitespace, and avoid matching unrelated commands (for example, `.bratman` must not be treated as `.brat`). Existing aliases must remain available unless a separate approved change specifies otherwise.

## Planned command groups

The exact command names, aliases, permission matrix, argument syntax, and help copy must be written into a command matrix before implementation. Do not silently repurpose an existing command.

- **Text sticker:** generate a sticker from user-supplied text, with explicit length/format limits and safe rendering.
- **Metadata management:** allow an authorized user to configure default sticker pack name and author. Define whether changes persist across restarts and how defaults are restored. Do not retroactively change metadata already embedded in previously sent stickers.
- **Batch:** process up to 5 images per request. Reject excess items clearly. Bound each file's size, total batch size, processing time, and concurrency; avoid memory spikes.
- **Search:** search the local collection and approved internet sources. Keep local search useful when the internet is unavailable. Internet providers/domains must be explicitly allowlisted; validate media type, size, redirects, and download time before processing.
- **Owner/access control:** owner-only commands must use an explicit, validated owner identity. Group broadcast is restricted to configured allowlisted groups. Fail closed when owner/allowlist configuration is missing or invalid.
- **Utility:** only add utilities with documented command syntax, permissions, limits, and tests.
- **Help/menu:** expose only implemented commands and accurately label owner-only commands.

## Image sticker output
- Accept supported image media that the underlying WhatsApp client can download and the image processor can decode.
- Resize to a 512x512 canvas using `contain`.
- Preserve transparency and use a transparent background for padded areas.
- Encode as WebP at quality 80.
- Set WhatsApp sticker pack name and author from command arguments or configured defaults.
- If no valid image is found, return a concise usage error.
- If media download, decoding, or encoding fails, return a safe user-facing error and log stage/error metadata without message body or media contents.
- Audit whether quoted-sticker input is intentional before changing or removing it.

## Brat sticker output
Current visual compatibility target:
- 512x512 canvas; solid white background.
- Lowercase text, black bold Arial.
- Center-aligned text, vertically centered as a group.
- Blur filter 1.5px.
- Maximum line width 452px and line height 1.25 times font size.
- Adaptive font size for reasonable input lengths.
- WebP output, currently quality 90.
- Sticker metadata name `brat` and configured default author.

Requirements:
- Empty text returns a usage error.
- Long text must not cause an infinite loop, crash, or silently produce a blank image.
- Test text rendering at the PNG stage and validate decoded WebP after encoding.
- Keep text content out of diagnostic logs.

## Connection, QR, and health behavior
- Continue using the existing WhatsApp Web client library unless a migration is justified and explicitly approved.
- Preserve authenticated session data across ordinary restarts and reconnects.
- Support terminal QR output and a local browser QR page.
- Browser URL defaults to `http://localhost:3000`; host/port configurable.
- Bind the QR server to loopback by default, not all network interfaces.
- Avoid duplicate listeners, overlapping initialization, uncontrolled restart loops, and leaked timers.
- Distinguish process-running, WhatsApp-connected, and ready-to-process-commands health states.
- Shutdown should stop HTTP listening and close the WhatsApp client gracefully where possible.
- Never log raw QR payloads or session credentials.

## Automatic update contract
- A separate updater process/service polls remote `main` every 2 minutes. The updater must remain alive while the bot process is stopped.
- A discovered commit is only a candidate. Validate it in an isolated/staging release directory where possible, using that candidate's dependency lockfile.
- Do not activate a candidate unless dependency installation, automated tests, and required build/static checks pass.
- Use a single-run lock and persistent state to avoid concurrent update cycles or duplicate broadcasts after updater restart.
- Track failed candidate commits and apply a cooldown so one bad commit is not retried endlessly.
- Do not restart the bot if there is no new commit.
- Keep user data, configuration, credentials, and WhatsApp session directories outside the candidate source/dependency swap.
- Never use destructive Git commands to force a working tree clean.

## Maintenance broadcasts
- Send maintenance notices only to explicitly configured allowlisted groups.
- Send the maintenance-start notice while the current WhatsApp client is still connected and before an ordinary planned shutdown.
- Make up to 3 total attempts per group with bounded timeout and backoff.
- If all start-notice attempts fail, do not proceed with a normal planned shutdown unless a separately approved emergency policy allows it.
- After activation, start the bot and verify WhatsApp connectivity and command readiness before sending the completion notice.
- If the bot is healthy but the completion notice fails, report notification failure separately from bot health.
- If the bot is already offline, prioritize recovery; do not falsely claim the start notice was delivered.
- Persist update/broadcast state safely so a restarted updater does not repeat an entire cycle without reason.

## Rollback contract
- Roll back automatically if candidate activation, startup, or health checks fail.
- Restore the last known healthy source revision and its matching dependency state/lockfile, not only the Git pointer.
- Keep rollback releases separate where host capabilities allow.
- Verify health after rollback and report whether recovery succeeded.
- Never delete or regenerate WhatsApp authentication/session data during rollback.

## Local dashboard
- Local-only operational status page; bind to `127.0.0.1` by default.
- Initial release is read-only: health, active/candidate commit IDs, last check/update result, and safe timestamps.
- No arbitrary shell execution, session controls, QR payloads, message bodies, sender identifiers, credentials, or private media.
- Dashboard failure must not prevent the bot or updater from running.
- Remote access requires separate security review and explicit approval.

## Configuration and privacy
Preserve current defaults unless an explicit change is approved:
- Sticker name: `✨ Stiker`
- Sticker author: `StikerBot`
- QR HTTP port: `3000`

Use validated environment variables or a small config module. Do not commit secrets or local environment files. Errors should be concise and in Indonesian; internal logs should be structured and privacy-conscious.

## Out of scope unless explicitly approved
- Replacing the WhatsApp client library.
- Adding a database or external hosted service without a demonstrated requirement.
- Automatically deleting or reauthenticating sessions.
- Exposing the dashboard publicly.
- Deployment, production configuration changes, live service restart, or merge to `main`.
- Breaking changes to existing commands or default sticker appearance.
