# Rebuild Preflight Checklist

Use this checklist before any application-code change. The initial audit is read-only. Do not paste credentials, QR codes, session files, private chat content, or secret environment values into issues or chat.

## 1. Confirm the working context
- [ ] Confirm the repository is `Pierr15/whatsapp-sticker-bot`.
- [ ] Confirm the active branch is `docs/ai-rebuild-blueprint` for planning, then create/use a separate implementation branch only after the audit is approved.
- [ ] Record `git status --short --branch` and do not overwrite uncommitted changes.
- [ ] Confirm no production deployment, live restart, merge to `main`, or authentication reset is part of Stage 0.

## 2. Read-only environment inventory
Record versions and results, but do not expose secrets:
- [ ] `node --version`
- [ ] `npm --version`
- [ ] `git --version`
- [ ] `npm pkg get scripts engines type dependencies devDependencies`
- [ ] `npm ls --depth=0` (record missing/incompatible packages; do not automatically install/update)
- [ ] Inspect the existing module system and entry points.
- [ ] Identify the actual host/OS, service manager, working directory, start/stop commands, and restart policy.
- [ ] Confirm whether Docker is installed; do not assume it is.

## 3. Repository and data safety
- [ ] Map source, tests, docs, generated files, logs, local configuration, and runtime data paths.
- [ ] Inspect `.gitignore` and tracked-file status for session/config artifacts without printing their contents.
- [ ] Identify `.wwebjs_auth/`, `data/`, and any other authentication/profile directories. Record paths only.
- [ ] Check whether local runtime files are tracked, ignored, or outside the repository.
- [ ] Confirm rollback can preserve sessions, user data, local config, and secrets independently of source releases.
- [ ] Do not run `git reset --hard`, `git clean -fd`, force-push, session deletion, or session regeneration.

## 4. Behavior baseline
- [ ] Verify actual behavior of `.s`, `.stiker`, `.brat`, `.help`, and `.menu` against README and feature spec.
- [ ] Verify image-caption and quoted-image flows; note whether quoted stickers are accepted.
- [ ] Record sticker output defaults and metadata defaults.
- [ ] Verify QR terminal output and local browser page behavior without exposing the QR payload.
- [ ] Inspect reconnect/watchdog/listener behavior, including possible duplicate QR listeners.
- [ ] Reproduce suspected defects only in a safe development/test environment.
- [ ] Capture logs only after removing tokens, QR payloads, message text, sender IDs, and other private values.

## 5. Establish a safe test baseline
- [ ] Check whether tests already exist and identify the current test runner.
- [ ] Run only non-destructive checks that are already configured.
- [ ] Record exact commands, exit codes, and failures.
- [ ] Identify pure functions that can be tested without WhatsApp login.
- [ ] Do not link a real account or change a live service during Stage 0.

## 6. Decisions to finalize before feature implementation
- [ ] Allowed internet-search providers/domains and permitted media sources.
- [ ] Owner identity configuration and allowlisted broadcast group IDs.
- [ ] Maintenance-start and maintenance-complete message copy.
- [ ] Per-file and aggregate batch size, timeout, concurrency, and retry backoff.
- [ ] Actual host/service manager and safe staging/rollback approach.
- [ ] Health/readiness probe and failed-update cooldown.
- [ ] Exact command names and permission matrix for new features.

## 7. Stage 0 exit gate
Stage 0 is ready for review only when:
- [ ] Audit report separates verified facts from assumptions.
- [ ] Existing command/behavior matrix is recorded.
- [ ] Session, data, config, and secret locations are identified without revealing contents.
- [ ] Current startup/recovery process and host constraints are understood.
- [ ] Known defects and risks are prioritized.
- [ ] A smallest-next-step proposal and acceptance criteria are written.
- [ ] No application code, live service, production config, or persistent runtime data was changed.

## Recommended first implementation slice after approval
Start with a low-risk, testable slice: extract command parsing/config validation into pure modules, add regression tests, and verify behavior remains compatible. Do not begin the updater, dashboard, or broad feature expansion until the existing lifecycle and test baseline are stable.
