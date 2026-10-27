# Test Plan

Tests should run locally without a real WhatsApp login. Mock the WhatsApp client and message objects for unit tests; real-device and live-service checks are manual, controlled, and opt-in. Record exact commands, exit codes, and relevant output.

## Unit tests

### Command parsing and compatibility
- Recognize `.s`, `.stiker`, `.brat`, `.help`, and `.menu`.
- Command matching is case-insensitive and trims surrounding whitespace.
- Parse `.stiker Name|Author`, `.stiker |Author`, `.stiker Name|`, and `.stiker`.
- Ignore unrelated strings such as `.bratman` and `.stikerextra`.
- Handle multiple pipe characters according to an explicit policy.
- Existing commands remain available after each refactoring stage.

### Metadata and configuration
- Defaults are used when arguments are empty or omitted.
- Custom name/author are trimmed and passed to the send operation.
- Unicode and special characters do not crash metadata handling.
- Overlong metadata is rejected or normalized according to a documented rule.
- Metadata changes persist only according to the approved configuration contract.
- Invalid or missing owner/access-control configuration fails closed.
- No credentials or private configuration values appear in logs.

### Image pipeline and batch
- Valid PNG/JPEG/WebP fixtures produce decodable WebP output at 512x512.
- Transparent padding remains transparent for images that do not fill the canvas.
- Corrupt/unsupported input fails cleanly; missing media never reaches the encoder.
- Decoded output is checked, not merely a non-empty Buffer.
- Batch of 1 and batch of 5 are accepted.
- Batch above 5 is rejected with a concise message.
- Per-file/aggregate size, processing-time, and concurrency limits are enforced.
- One failed image does not cause an uncontrolled retry or leak resources for the remaining batch.

### Brat and text sticker rendering
- Empty input is rejected.
- Text is lowercased for the existing Brat command.
- Background pixels are white; text produces visible non-background pixels.
- Short, long, Unicode, and multi-word inputs do not crash.
- Wrapping and vertical placement stay within canvas bounds.
- PNG output is valid before WebP conversion; encoded WebP decodes to 512x512.
- Text content is not written to diagnostic logs.

### Search
- Local search works without network access.
- Search provider timeout/failure returns a safe, understandable result.
- Internet search calls only configured allowlisted providers/domains.
- Redirects, MIME types, file size, download time, and malformed media are validated.
- Search results are not treated as trusted instructions or arbitrary download URLs.
- No unbounded download, request loop, or excessive concurrency occurs.

### Connection lifecycle, QR, and health
- QR event updates in-memory QR state and clears the boot watchdog.
- Ready event clears QR state and watchdog timers.
- Repeated boot/reconnect triggers do not initialize multiple clients concurrently.
- Reconnect failure is logged without session data.
- Retry limits, timeout, cooldown, and shutdown paths are covered.
- Shutdown closes the HTTP server/client gracefully without deleting session data.
- Health distinguishes process running, WhatsApp connected, and command-ready.
- QR/dashboard HTTP host and port are configurable; default binding is loopback/port 3000.
- Non-root QR paths return 404 and server errors do not create unhandled rejections.

### Broadcast and updater
- Polling interval is configured to 2 minutes and remote checks have bounded timeouts.
- No new commit means no candidate install, broadcast, or bot restart.
- Only one update cycle can run at a time, including after updater restarts.
- Candidate dependency installation and test failure prevent activation.
- Failed candidate commit is recorded and does not enter an endless retry loop.
- Start notice is sent before ordinary shutdown and only to allowlisted groups.
- Each group gets no more than 3 total attempts, with bounded timeout/backoff.
- Failed start notice blocks an ordinary planned shutdown unless an approved emergency policy exists.
- Completion notice is sent only after health/readiness passes.
- Notification failure is reported separately from actual bot health.
- Rollback restores both source and matching dependency state.
- Failed activation or failed health check triggers rollback and a post-rollback health check.
- Session/auth directories, user data, local config, and secrets are not touched by candidate activation or rollback.
- Persistent state prevents accidental duplicate update/broadcast cycles.

### Local dashboard and privacy
- Dashboard binds to loopback by default.
- Status page does not expose credentials, QR payloads, message bodies, sender IDs, or media.
- Dashboard outage does not stop the bot/updater.
- No arbitrary shell execution or session mutation is available in the initial read-only dashboard.

## Integration/manual checks
Only perform with explicit user approval and a controlled test WhatsApp account/environment:
1. Start the bot and confirm the QR page is reachable locally.
2. Link a test account only if authentication is required.
3. Send an image with `.s`; reply to an image with `.s`.
4. Try `.stiker Demo|Test Author`, `.stiker |Test Author`, and `.stiker Demo|`.
5. Generate `.brat halo dunia`; try empty and long text.
6. Confirm help/menu matches implemented commands.
7. Restart normally and confirm the existing session is reused.
8. Simulate a temporary disconnect without deleting authentication data.
9. In a staging environment, test candidate pass, candidate test failure, dependency failure, health failure, rollback, and broadcast retry exhaustion.
10. Confirm no update cycle occurs when the remote commit is unchanged.
11. Verify allowlisted-group restrictions with a non-production test setup.
12. Verify dashboard is local-only and remains optional.

## Reporting
- Add npm scripts for tests and static checks only after auditing the existing setup.
- Prefer Node's built-in `node:test` if it meets needs and avoids unnecessary dependencies.
- Run focused tests after each stage and all available checks before handoff.
- Report exact commands, exit status, failures, skipped tests, and environmental blockers.
- Never label a check passed unless it actually ran successfully.
