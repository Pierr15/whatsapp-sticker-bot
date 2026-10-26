# Feature Specification

This document defines the compatibility contract for the rebuild. If implementation and documentation disagree, inspect current behavior and report the discrepancy before making a breaking decision.

## Commands

| Command | Expected behavior | Input source |
|---|---|---|
| `.s` | Create a sticker using configured default name and author | Image caption or reply/quote to an image |
| `.stiker Nama Stiker|Nama Author` | Create a sticker using supplied metadata | Image caption or reply/quote to an image |
| `.stiker |Nama Author` | Use default sticker name and supplied author | Image caption or reply/quote to an image |
| `.stiker Nama Stiker|` | Use supplied name and default author | Image caption or reply/quote to an image |
| `.stiker` | Use both defaults | Image caption or reply/quote to an image |
| `.brat teks` | Generate a static Brat-style text sticker | Text after command |
| `.help`, `.menu` | Show command help | Text message |

Parsing must be case-insensitive for command names, trim surrounding whitespace, and avoid accidentally matching unrelated command names (for example, `.bratman` should not be treated as `.brat` unless explicitly intended).

## Image sticker output
- Accept supported image media that the underlying WhatsApp client can download and the image processor can decode.
- Resize to a 512x512 canvas using `contain`.
- Preserve transparency and use a transparent background for padded areas.
- Encode as WebP at quality 80.
- Set WhatsApp sticker pack name and author from command arguments or configured defaults.
- If no valid image is found, return a concise usage error.
- If media download, decoding, or encoding fails, return a safe user-facing error and log stage/error metadata without message body or media contents.

The current baseline handler also accepts quoted stickers as input even though the README focuses on images. Audit whether sticker-to-sticker conversion is intentional before changing or removing it.

## Brat sticker output
Current intended visual contract:
- 512x512 output canvas.
- Solid white background.
- Lowercase text.
- Black, bold Arial.
- Center-aligned text, vertically centered as a group.
- Blur filter of 1.5px.
- Maximum line width of 452px.
- Line height of 1.25 times font size.
- Adaptive font size to fit reasonable input lengths.
- WebP output, currently quality 90.
- Sticker metadata uses name `brat` and the configured default author.

Requirements:
- Empty text must return a usage error.
- Long text must not cause an infinite loop, crash, or silently produce a blank image.
- Test text rendering at the PNG stage and validate the decoded WebP after encoding.
- Keep text content out of diagnostic logs.

## Connection and QR behavior
- Use the existing WhatsApp Web client library unless a migration is justified and approved.
- Preserve authenticated session data across ordinary restarts and reconnects.
- Support QR output in terminal and a local browser page.
- Baseline browser URL is `http://localhost:3000`; make host and port configurable during the reliability stage.
- Do not bind the QR server to all network interfaces by default.
- Avoid duplicate listeners, overlapping initialization, uncontrolled restart loops, and leaked timers.
- Shutdown should stop HTTP listening and close the WhatsApp client gracefully where possible.
- Never log the raw QR payload or session credentials.

## Configuration
- Keep default sticker name and author configurable.
- Prefer validated environment variables or a small config module over scattered hard-coded values.
- Preserve current defaults unless the user approves a change:
  - Name: `✨ Stiker`
  - Author: `StikerBot`
  - QR HTTP port: `3000`
- Do not commit secrets or local environment files.

## Reliability and privacy
- No destructive session cleanup.
- Do not log full message bodies, quoted content, media bytes, or authentication data.
- User-facing errors should be concise and in Indonesian, consistent with the existing project.
- Internal errors should include the operation stage and safe error details.
- Avoid catching and swallowing process-level exceptions in a way that leaves the bot falsely appearing healthy. Define an explicit recovery or shutdown policy.

## Out of scope unless explicitly approved
- Changing the WhatsApp library.
- Adding a database, cloud service, or web dashboard.
- Automatically deleting or reauthenticating sessions.
- Deployment or changes to live hosting.
- Removing existing commands or changing the default sticker appearance.
