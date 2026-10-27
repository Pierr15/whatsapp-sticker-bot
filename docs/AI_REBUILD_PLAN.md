# AI Rebuild Plan

## Objective
Evolve `Pierr15/whatsapp-sticker-bot` into a maintainable, testable WhatsApp sticker bot with stronger reliability and operational safety. This is an incremental evolution of the existing project, not a blind rewrite. Preserve compatible commands, sticker output, and WhatsApp authentication data.

Repository: https://github.com/Pierr15/whatsapp-sticker-bot  
Baseline branch: `main`  
Planning branch: `docs/ai-rebuild-blueprint`

## Decisions already agreed
- **Language/runtime:** JavaScript on Node.js first. Keep the existing WhatsApp integration and avoid a language migration. Reconsider TypeScript only after module boundaries and tests stabilize, and only if the extra type/build step earns its keep.
- **Architecture:** modular, with responsibilities separated; keep it proportional to this bot.
- **Priority:** balanced across features, reliability, and maintainability.
- **Compatibility:** preserve existing commands and defaults unless a change is separately approved and documented.
- **New feature groups:** text stickers, local and internet search, owner/access control, metadata management, batch processing (maximum 5 images per request), and utility commands.
- **Operations:** reconnect, health/readiness reporting, maintenance broadcasts, automatic updates, rollback, and a local-only dashboard.
- **Updater:** poll the remote `main` branch every 2 minutes. Treat a new commit as a candidate, not as automatically safe to activate.
- **Maintenance notifications:** send to configured allowlisted groups only; attempt each broadcast up to 3 times. Send the start notice before ordinary shutdown, and the completion notice only after the updated bot is confirmed healthy.
- **Update failure:** automatically roll back to the last known healthy version, including the matching dependency state.
- **Internet search:** permitted sources only; source/provider allowlist must be finalized before implementation.
- **Dashboard:** local-only, loopback-bound by default, with no secrets or private message content.
- **Deployment boundary:** no production configuration changes, live service restarts, deployment, or merge to `main` without explicit approval.

These are planning decisions, not implemented behavior.

## Baseline observations
The current repository documents and implements:
- `.s`: create a sticker using default pack name and author.
- `.stiker Nama|Author`: create a sticker with per-request metadata; either side may be omitted to use defaults.
- `.brat teks`: generate a white-background, lowercase black text sticker with a blur effect.
- `.help` and `.menu`: display help.
- Image input via a caption or a quoted/replied-to image; the current handler may also accept quoted stickers, which must be verified.
- A QR page served on port 3000, plus terminal QR output.
- WhatsApp Web connection lifecycle handling, reconnect attempts, and watchdog timers.

Known audit leads to verify, not assume:
- `index.js` appears to register the `qr` event handler twice.
- The ready log, help output, README, and actual command implementation may differ.
- The `start` npm script runs an OS-specific `apt-get` chain before Node starts.
- The QR HTTP server may not expose configurable host/port settings.
- Core logic is concentrated in a large entry file.
- README says the project is disabled; clarify what this means before any operational assumption.

## Target language and developer workflow
1. Use the existing Node.js ecosystem and the WhatsApp library already in the repository unless the audit proves a blocker.
2. Prefer JavaScript modules with one consistent module system (ESM or CommonJS, chosen after inspecting `package.json` and current imports).
3. Use a Node.js LTS version compatible with the existing dependency set; verify exact versions during Stage 0 rather than guessing.
4. Start with Node's built-in `node:test` if it fits the project, to avoid adding a test dependency without need.
5. Add lint/format tools only after checking the existing setup and explaining the benefit.
6. Use VS Code's Node debugger/Inspector for repeatable debugging; never log secrets, raw QR payloads, or private chat content.
7. Revisit TypeScript after modularization and regression tests are stable. Do not migrate solely for fashion or claim it improves runtime performance.

## Suggested architecture
Finalize module names after the audit. A proportional starting point:
```
src/
  app.js
  config/
  commands/
    sticker.js
    brat.js
    text.js
    search.js
    owner.js
    utility.js
  services/
    whatsapp.js
    media.js
    search/
    broadcast.js
  infrastructure/
    logger.js
    health.js
    updater/
  http/
    qr-server.js
    dashboard.js
  utils/
    validation.js
tests/
docs/
```
Keep command parsing, validation, media transformation, update decisions, and health policy testable without a live WhatsApp client. Avoid adding a database or external service unless a documented requirement needs it.

## Stages

### Stage 0: Read-only audit and baseline
Deliverables:
- Record file tree, branch/status, Node/npm versions, package scripts, dependency tree, module system, and supported runtime assumptions.
- Identify the current commands, actual output defaults, WhatsApp client lifecycle, QR server, auth/session locations, data/config/log paths, and service manager if any.
- Inspect `.gitignore` and identify any tracked secrets, session artifacts, or generated files without printing their contents.
- Record reproducible defects and distinguish verified facts from hypotheses.
- Document the current start/stop/recovery method for the actual host. Do not assume Docker or a particular service manager exists.
Acceptance:
- No application source, live service, authentication/session data, or production configuration changed.
- Audit report is reviewable before implementation starts.

### Stage 1: Test foundation and compatibility contract
Deliverables:
- Command/behavior matrix and baseline manual checklist.
- Unit tests for parsing, metadata defaults, text wrapping, media conversion, validation, and lifecycle guards where practical.
- Platform-compatible test scripts that do not require a live WhatsApp account.
Acceptance:
- Tests can run without real session credentials or private chat data.
- Existing commands and default visual output have regression coverage.

### Stage 2: Modularize existing behavior
Deliverables:
- Separate command routing, configuration, media/sticker handling, Brat rendering, WhatsApp lifecycle, QR HTTP server, and logging.
- Keep dependency and module-system changes minimal.
Acceptance:
- Existing commands remain compatible.
- No session migration or deletion.
- Existing and new tests pass; any behavior differences are explicitly approved.

### Stage 3: Reliability and safe configuration
Deliverables:
- Startup configuration validation; configurable loopback-safe HTTP host/port.
- Idempotent connection startup, bounded reconnect/backoff, watchdog cleanup, graceful shutdown, and health states.
- Distinguish process-running, WhatsApp-connected, and command-ready states.
Acceptance:
- No duplicate client initialization or uncontrolled retry loop.
- Safe diagnostics and clear failure states.
- Session data survives ordinary restart and reconnect.

### Stage 4: User-facing feature expansion
Deliverables:
- Text sticker command.
- Metadata management with documented defaults and validation.
- Batch image sticker creation, maximum 5 images per request.
- Search over the local collection and approved internet sources.
- Owner/access-control and utility commands.
- Updated help/menu and Indonesian error messages.
Acceptance:
- Existing command behavior stays compatible.
- Input, output, file-size, processing-time, and concurrency bounds are tested.
- Local search still works if an internet provider is unavailable.
- Internet search is restricted to an explicit source/provider allowlist; downloaded media is validated and size/time-limited.
- Owner identity and allowlists are configured safely, not hard-coded as hidden assumptions.

### Stage 5: Maintenance broadcast and automatic updater
Deliverables:
- A separate updater process/service that remains alive while the WhatsApp bot is stopped.
- Lightweight polling of remote `main` every 2 minutes, with timeout, single-run lock, persistent update state, and failed-candidate cooldown.
- Candidate validation: inspect commit, install dependencies from the candidate lockfile, run tests and build/static checks, then stage/activate only if checks pass.
- Maintenance-start broadcast to configured allowlisted groups before normal shutdown; up to 3 attempts per group with bounded timeout/backoff.
- Graceful stop, safe activation, restart, health/readiness verification, and completion broadcast only after health passes.
- Automatic rollback to the last known healthy source revision **and matching dependencies/lockfile** if activation or health checks fail.
Acceptance:
- No new commit means no restart.
- Invalid candidate is never activated and does not trigger an endless retry loop.
- A single update cycle can run at a time; updater survives bot downtime and restart.
- Maintenance notices are not sent to arbitrary groups.
- If start notice fails all 3 attempts, do not proceed with an ordinary planned shutdown unless an explicit emergency policy has been approved. Log a safe operational status.
- If completion notice fails but the bot is healthy, report notification failure separately from bot health.
- Never report success until the health check actually passes.

### Stage 6: Local dashboard
Deliverables:
- Loopback-only dashboard for safe operational status, recent health state, last checked/active commit, and update outcome.
- Read-only status by default; no session controls or arbitrary command execution in the initial release.
Acceptance:
- Bind to `127.0.0.1` by default; remote exposure requires a separately reviewed authentication/network design.
- No secrets, QR payloads, message bodies, sender identifiers, or private media in dashboard/logs.
- Bot/updater continue functioning if the dashboard is down.

### Stage 7: Recovery drills, documentation, and release review
Deliverables:
- Simulated failed tests, dependency install failure, failed health check, rollback, and notification failures in a non-production environment.
- README/setup/troubleshooting, configuration reference, operator runbook, and recovery steps.
- Diff review and final test report.
Acceptance:
- All critical criteria pass or are explicitly deferred with approval.
- No deployment, production restart, or merge to `main` until the user explicitly approves.

## Cross-cutting safety requirements
- Never delete, overwrite, regenerate, or migrate `.wwebjs_auth/`, `data/`, or any discovered session/profile directories.
- Never run `git reset --hard`, `git clean -fd`, force-push, or any equivalent destructive recovery.
- Preserve local configuration, user data, and secrets outside the candidate deployment directory.
- Do not log credentials, session tokens, raw QR payloads, private message bodies, or media contents.
- Prefer a separate staging directory/release directory for candidate validation where the host allows it.
- A rollback must restore source and its corresponding dependency state, not merely move a Git ref.
- Do not assume Docker is installed or that the runtime host is Termux/Linux/Windows until Stage 0 confirms it.
- Keep the dashboard optional and do not couple core bot readiness to dashboard availability.

## Open decisions required before the relevant implementation stage
- Which internet search providers/domains are allowed, and whether media download is permitted from each.
- Actual allowlisted group IDs and exact maintenance-start/completion copy.
- Owner identity and how owner/group allowlists are stored and protected.
- Maximum per-file and total batch size, processing timeout, concurrency limit, and retry backoff/timeouts.
- Actual host/service manager and a non-destructive staging/rollback mechanism.
- Exact health/readiness probe and failed-candidate cooldown policy.
- Whether TypeScript is justified after the JavaScript foundation stabilizes.

## Definition of done
- Feature parity and new features are demonstrated by tests or a documented manual test matrix.
- Automated tests do not require a live WhatsApp account.
- Session/authentication data remains untouched.
- Startup works on the explicitly supported platform.
- Updater has demonstrated candidate rejection, healthy activation, rollback, and safe notification behavior in a test environment.
- Dashboard is loopback-only and contains no sensitive data.
- Documentation accurately describes setup, operations, limitations, and recovery.
- The final report states exactly what was and was not tested.
