# AI Agent Rules

These rules apply to every AI coding agent working in this repository.

## Mission
Rebuild and improve the WhatsApp sticker bot in small, reviewable stages while preserving its documented behavior and persistent WhatsApp authentication data.

## Required workflow
1. Inspect the repository, current Git status, package scripts, entry points, and relevant docs before editing.
2. Read `docs/AI_REBUILD_PLAN.md`, `docs/FEATURE_SPEC.md`, `docs/TEST_PLAN.md`, and `docs/REBUILD_AGENT_PROMPT.md` before implementation.
3. Establish a baseline and record existing defects before refactoring.
4. Write or update tests before changing behavior where practical.
5. Implement one coherent stage at a time; run the narrowest relevant tests, then the full available checks.
6. Summarize changed files, tests actually run, failures, and remaining risks. Never claim a check passed unless it ran successfully.

## Hard safety constraints
- Never delete, overwrite, reset, regenerate, or migrate WhatsApp authentication/session data automatically. This includes `.wwebjs_auth/`, `data/`, and any discovered session/profile directories.
- Never run destructive Git commands such as `git reset --hard`, `git clean -fd`, or force-push.
- Never print, commit, upload, or log credentials, session tokens, QR payloads, message bodies, or private chat content.
- Do not change production configuration, deploy, restart a live service, or merge into `main` without explicit user approval.
- Do not commit secrets, generated session data, downloaded private media, or local environment files.
- Before any operation that could alter persistent runtime data, stop and ask for approval.
- Do not add dependencies or change the runtime architecture without explaining the reason and compatibility impact.

## Compatibility requirements
- Preserve existing user-facing commands unless a specification explicitly approves a change.
- Treat the current implementation as behavior to audit, not as unquestionable truth. Document discrepancies and bugs.
- Keep sticker image output transparent and contained within a 512x512 canvas at WebP quality 80 unless a deliberate, tested change is approved.
- Keep Brat output white with lowercase black Arial bold text, centered, 1.5px blur, wrapping width 452px, and 1.25 line spacing unless a deliberate, tested change is approved.
- Preserve the QR browser page on port 3000 by default, but make the port configurable and avoid exposing it publicly by default.
- Avoid logging message content or sender identifiers unnecessarily. Use structured, privacy-conscious diagnostics.

## Completion criteria
A stage is complete only when its acceptance criteria are met, relevant tests are run, documentation is updated, and unresolved limitations are explicitly listed. Do not mark the whole rebuild complete while critical features or tests remain incomplete.
