# Test Plan

Tests should run locally without a real WhatsApp login. Mock the WhatsApp client and message objects for unit tests; keep real-device checks manual and opt-in.

## Unit tests

### Command parsing
- Recognize `.s`, `.stiker`, `.brat`, `.help`, and `.menu`.
- Command matching is case-insensitive and trims surrounding whitespace.
- Parse `.stiker Name|Author`.
- Parse `.stiker |Author` using the default name.
- Parse `.stiker Name|` using the default author.
- Parse `.stiker` using both defaults.
- Ignore unrelated strings such as `.bratman` and `.stikerextra`.
- Handle multiple pipe characters according to an explicit, documented policy.

### Sticker metadata
- Defaults are used when arguments are empty or omitted.
- Custom name and author are passed to the WhatsApp send call unchanged after trimming.
- Special characters and Unicode do not crash the metadata path.
- Excessively long metadata is handled according to documented validation rules.

### Image pipeline
- Valid PNG/JPEG/WebP fixtures produce decodable WebP output.
- Output dimensions are 512x512.
- Transparent padding remains transparent for images that do not fill the canvas.
- WebP quality configuration is applied as specified.
- Corrupt input and unsupported media fail cleanly.
- Empty or missing media does not call the encoder.
- Tests validate the decoded output, not merely a non-empty Buffer.

### Brat rendering
- Empty input is rejected.
- Text is lowercased.
- Background pixels are white.
- Text produces visible non-background pixels.
- Short, long, Unicode, and multi-word inputs do not crash.
- Wrapping and vertical placement stay within canvas bounds for supported inputs.
- PNG output is valid before WebP conversion.
- Encoded WebP decodes successfully and is 512x512.

### Connection lifecycle
- QR event updates the in-memory QR state and clears the boot watchdog.
- Ready event clears QR state and watchdog timers.
- Repeated boot/reconnect triggers do not initialize multiple clients concurrently.
- Reconnect failure is logged without exposing session data.
- Restart limit and timeout paths are covered.
- Shutdown closes the HTTP server and client without deleting session data.

### HTTP QR page
- Non-root paths return 404.
- The page renders a waiting state before QR availability.
- When QR exists, the page displays a QR image without exposing its raw payload in logs.
- Host and port are configurable and default to loopback/port 3000.
- Server errors are handled without an unhandled rejected promise.

## Integration/manual checks
Only perform these with user approval and a test WhatsApp account:
1. Start the bot and confirm the QR page is reachable locally.
2. Scan/link the test account only if authentication is required.
3. Send an image with `.s`.
4. Reply to an image with `.s`.
5. Send an image with `.stiker Demo|Test Author`.
6. Try `.stiker |Test Author` and `.stiker Demo|`.
7. Generate `.brat halo dunia`.
8. Try invalid media and empty Brat text.
9. Confirm help commands match supported behavior.
10. Restart normally and confirm the existing session is reused.
11. Simulate a temporary disconnect only in a controlled test environment.
12. Confirm shutdown does not remove authentication data.

## Commands and reporting
- Add npm scripts for tests and any chosen lint/static checks.
- Prefer the test runner already present if suitable; otherwise explain the dependency choice.
- Run focused tests after each stage and the full test suite before handoff.
- Record the exact command, exit status, and notable output for each check.
- If a test cannot run in the environment, state why and do not label it passed.
