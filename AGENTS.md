# AI Agent Rules

These rules apply to every AI coding agent working in this repository.

## Mission
Evolve the WhatsApp sticker bot incrementally, preserving compatible behavior and persistent WhatsApp authentication data. The first milestone is a read-only audit, not a broad rewrite.

## Required workflow
1. Inspect repository branch/status, file tree, scripts, dependencies, runtime assumptions, session/data paths, and relevant docs before editing.
2. Read `docs/AI_REBUILD_PLAN.md`, `docs/FEATURE_SPEC.md`, `docs/TEST_PLAN.md`, and `docs/REBUILD_AGENT_PROMPT.md`.
3. Complete Stage 0 and present the audit report before application-code changes.
4. Prefer JavaScript + the existing Node.js runtime first. Reconsider TypeScript only after modules and tests stabilize.
5. Establish a baseline; write/update tests before changing behavior where practical.
6. Implement one approved stage at a time; run focused checks and then the available full suite.
7. Summarize changed files, tests actually run, failures, and remaining risks. Never claim a check passed unless it ran successfully.

## Hard safety constraints
- Never delete, overwrite, reset, regenerate, or migrate WhatsApp authentication/session data. This includes `.wwebjs_auth/`, `data/`, and any discovered session/profile directories.
- Never run destructive Git commands such as `git reset --hard`, `git clean -fd`, or force-push.
- Never print, commit, upload, or log credentials, session tokens, QR payloads, message bodies, or private chat content.
- Do not change production configuration, deploy, restart a live service, or merge into `main` without explicit user approval.
- Do not commit secrets, generated session data, downloaded private media, or local environment files.
- Before any operation that could alter persistent runtime data, stop and ask for approval.
- Do not add dependencies, change the WhatsApp client library, or migrate the language/runtime without explaining the reason and compatibility impact.
- Automatic updates must validate candidate dependencies/tests before activation and rollback both source and matching dependencies.
- Never run the planned maintenance broadcast outside configured allowlisted groups. Keep the updater separate from the bot process and prevent overlapping update cycles.

## Compatibility requirements
- Preserve existing user-facing commands unless a specification explicitly approves a change.
- Treat the current implementation as behavior to audit, not unquestionable truth. Document discrepancies and bugs.
- Keep sticker image output transparent and contained within a 512x512 canvas at WebP quality 80 unless a deliberate, tested change is approved.
- Keep Brat output white with lowercase black Arial bold text, centered, 1.5px blur, wrapping width 452px, and 1.25 line spacing unless a deliberate, tested change is approved.
- Preserve the QR browser page on port 3000 by default, but make the port configurable and avoid exposing it publicly by default.
- Avoid logging message content or sender identifiers unnecessarily. Use structured, privacy-conscious diagnostics.
- Dashboard is loopback-bound and read-only by default; the bot must not depend on it.

## Completion criteria
A stage is complete only when its acceptance criteria are met, relevant tests are run, documentation is updated, and unresolved limitations are explicitly listed. The entire rebuild is not complete while critical features or tests remain incomplete.
