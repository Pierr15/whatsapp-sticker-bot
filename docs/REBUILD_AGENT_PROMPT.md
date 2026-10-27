# Reusable Prompt: Rebuild This Repository

You are the lead engineer responsible for evolving this repository safely in small, reviewable stages. Do not begin with a broad rewrite.

## First actions
1. Read `AGENTS.md` and all relevant documents in `docs/`.
2. Inspect current branch and working tree without overwriting user changes.
3. Complete Stage 0 of `docs/AI_REBUILD_PLAN.md`: audit files, scripts, runtime, dependencies, command behavior, session paths, service manager, and recovery method.
4. Report verified facts separately from hypotheses, and identify the smallest safe next stage.
5. Do not edit application code until the audit report is reviewable and the user approves moving to implementation.

## Language and architecture
- Start with JavaScript on the existing Node.js runtime. Keep the current WhatsApp client library unless a migration is justified and explicitly approved.
- Inspect `package.json` and current imports before choosing ESM or CommonJS; use one module system consistently.
- Prefer small modules with clear responsibilities and tests. Do not add architecture or dependencies without a concrete reason.
- Prefer Node's built-in `node:test` if it is sufficient.
- Reconsider TypeScript only after modular boundaries and regression tests stabilize; explain the trade-off before proposing a migration.
- Keep pure parsing, validation, media transformations, update decisions, and health policy testable without a live WhatsApp client.

## Compatibility target
Preserve the existing behavior unless a separate change is approved:
- `.s`
- `.stiker Name|Author` with per-field defaults
- `.brat text`
- `.help` and `.menu`
- image caption and quoted-image flows
- terminal QR plus local browser QR page
- safe reconnect behavior and persistent authentication

See `docs/FEATURE_SPEC.md` and `docs/TEST_PLAN.md` for the proposed feature/acceptance contracts.

## Planned expansion
The roadmap includes text stickers, metadata management, batch processing capped at 5 images, local plus allowlisted internet search, owner/access control, utility commands, health reporting, maintenance broadcasts, a 2-minute polling updater, automatic rollback, and a loopback-only read-only dashboard. Treat these as planned requirements, not existing functionality. Finalize unresolved provider/allowlist/limit choices before implementing the relevant stage.

## Non-negotiable protections
- Never delete, reset, move, overwrite, regenerate, or migrate `.wwebjs_auth/`, `data/`, or any discovered session/profile directory.
- Never run destructive Git commands such as `git reset --hard`, `git clean -fd`, or force-push.
- Never print QR payloads, session tokens, credentials, private message text, sender identifiers, or media contents.
- Do not deploy, alter production settings, restart a live service, merge to `main`, or change account authentication without explicit user approval.
- Do not assume Docker is installed or assume a particular runtime host before the audit.
- Do not change the WhatsApp client library without presenting migration cost and obtaining approval.
- Keep credentials, local config, session data, and user data outside release staging/rollback operations.
- Automatic updates must validate a candidate before activation; rollback must restore both source and matching dependency state.
- Maintenance notices go only to configured allowlisted groups, with at most 3 attempts per group. Send the start notice before ordinary shutdown and the completion notice only after health/readiness passes.
- Dashboard is loopback-only and read-only by default.

## Work loop
For each approved stage:
1. State the goal, expected files, risks, and acceptance criteria.
2. Add/update tests before or alongside implementation.
3. Make the smallest coherent change.
4. Run focused tests and available static checks.
5. Review the diff for accidental behavior changes, secrets, session/runtime data, and unrelated edits.
6. Update docs.
7. Report exact test commands/results, unrun checks, and remaining risks.
8. Stop and ask before any action that risks persistent data or requires production access.

## Initial assignment
Complete Stage 0 only. Produce a read-only audit report and recommended implementation order. Do not implement the rewrite, deploy, restart a live service, or merge to `main`.
