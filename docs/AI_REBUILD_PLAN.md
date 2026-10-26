# AI Rebuild Plan

## Objective
Rebuild `Pierr15/whatsapp-sticker-bot` into a maintainable, testable WhatsApp sticker bot while retaining core behavior and protecting existing WhatsApp login data.

Repository: https://github.com/Pierr15/whatsapp-sticker-bot  
Baseline branch: `main`  
Planning branch: `docs/ai-rebuild-blueprint`

## Baseline observations
The current repository documents and implements:
- `.s`: create a sticker using default pack name and author.
- `.stiker Nama|Author`: create a sticker with per-request metadata; either side may be omitted to use defaults.
- `.brat teks`: generate a white-background, lowercase black text sticker with a blur effect.
- `.help` and `.menu`: display help.
- Image input via a caption or a quoted/replied-to image.
- A QR page served on port 3000, plus terminal QR output.
- WhatsApp Web connection lifecycle handling, reconnect attempts, and watchdog timers.

Known audit leads to verify, not assume:
- `index.js` registers the `qr` event handler twice.
- The `ready` log lists commands but help and implementation should be cross-checked for exact parity.
- The `start` npm script runs an OS-specific `apt-get` installation command before Node starts, making it unsuitable for Windows and many non-Debian environments.
- The HTTP QR server has no explicit configurable port or host in the current implementation.
- Current code is concentrated in one large file, making pure logic and media processing difficult to test independently.
- The README says the project is currently disabled; clarify what “disabled” means and do not silently assume production status.

## Operating rules
- Work on a dedicated feature branch, not directly on `main`.
- Do not deploy or merge as part of the rebuild.
- Preserve all existing session/auth directories and user data.
- Do not scan, expose, or print session contents.
- Keep changes small enough to review and roll back.
- Confirm dependency and runtime compatibility before replacing libraries.

## Stages

### Stage 0: Repository audit
Deliverables:
- Record current file tree, Node version assumptions, dependencies, scripts, and authentication storage locations.
- Capture baseline behavior and known defects.
- Inspect `.gitignore` and ensure runtime sessions, logs, generated media, and secrets are excluded.
Acceptance:
- No source or runtime data changed.
- Audit notes distinguish verified facts from hypotheses.

### Stage 1: Specifications and test foundation
Deliverables:
- Command/behavior matrix based on `docs/FEATURE_SPEC.md`.
- Tests for command parsing, metadata defaults, text wrapping, and media transformation where practical.
- Test and lint scripts that run on the intended development platform.
Acceptance:
- Tests can run without connecting to a real WhatsApp account.
- No test needs real session credentials or private chat data.

### Stage 2: Safe modularization
Potential module boundaries, to be finalized after audit:
- WhatsApp client/lifecycle
- command parsing and routing
- sticker metadata/defaults
- image sticker processing
- Brat rendering
- QR/status HTTP server
- configuration and privacy-conscious logging
Acceptance:
- Existing commands remain compatible.
- Startup and reconnect behavior is covered by tests or documented integration checks.
- Session directory is not migrated or deleted.

### Stage 3: Reliability and configuration
Deliverables:
- Validate environment/configuration at startup.
- Configurable HTTP host/port with loopback-safe defaults.
- Bounded and understandable reconnect strategy; avoid duplicate initialization and timer leaks.
- Clear shutdown handling for the client and HTTP server.
- Actionable errors without private content.
Acceptance:
- No duplicate QR listeners or competing initialization paths.
- Invalid configuration fails with a safe, clear message.
- Tests cover reconnect guards and cleanup logic where feasible.

### Stage 4: Regression and documentation
Deliverables:
- Run automated tests and available static checks.
- Update README with accurate setup instructions for supported platforms.
- Document environment variables, session preservation, troubleshooting, and limitations.
Acceptance:
- Documented commands match implementation.
- All unrun tests and known limitations are listed honestly.

### Stage 5: Review-ready handoff
Deliverables:
- Final diff summary, test report, known risks, and suggested next step.
- No deployment, production service restart, merge, or session reset.
Acceptance:
- User can review the branch before any integration.

## Suggested architecture
Do not force this structure before auditing dependencies and testability. A possible target is:
```
src/
  config/
  commands/
  media/
  whatsapp/
  http/
  logging/
test/
docs/
index.js or src/index.js
```

Keep the architecture proportional to this bot's scope. Avoid introducing a database or external service unless a documented requirement needs it.

## Definition of done
- Feature parity is demonstrated by tests or a documented manual test matrix.
- Sticker metadata and visual output have regression coverage.
- Authentication/session data remains untouched.
- Startup works on the explicitly supported platform(s).
- No secrets or private media are committed.
- The final report states exactly what was and was not tested.
