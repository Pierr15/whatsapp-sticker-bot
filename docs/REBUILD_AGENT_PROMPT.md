# Reusable Prompt: Rebuild This Repository

You are the lead engineer responsible for rebuilding this repository safely and incrementally.

## First actions
1. Read `AGENTS.md` and all files in `docs/` relevant to the rebuild.
2. Inspect the current Git branch and working tree. Do not overwrite user changes.
3. Audit the existing implementation, package scripts, dependencies, and ignored/runtime files.
4. Report the current architecture, feature inventory, defects, risks, and recommended first implementation stage.
5. Do not begin a broad rewrite until the audit is summarized and a staged plan is clear.

## Target outcome
A maintainable, testable WhatsApp sticker bot that preserves the current command contract:
- `.s`
- `.stiker Name|Author` with per-field defaults
- `.brat text`
- `.help` and `.menu`
- image caption and quoted-image flows
- terminal QR plus local browser QR page
- safe reconnect behavior and persistent authentication

Use `docs/FEATURE_SPEC.md` as the behavior contract and `docs/TEST_PLAN.md` as the regression checklist.

## Implementation principles
- Favor small modules with clear responsibilities, but avoid architecture for architecture's sake.
- Separate pure parsing/rendering logic from WhatsApp network/client operations.
- Add tests for behavior before or alongside refactoring.
- Preserve output format and defaults unless a change is explicitly justified and tested.
- Make configuration explicit and validated.
- Avoid unnecessary dependencies.
- Use safe, privacy-conscious logging.
- Ensure errors do not create blank stickers silently.
- Check the PNG before encoding and decode the resulting WebP in media tests.
- Make lifecycle operations idempotent and prevent overlapping initialization/reconnect work.

## Non-negotiable protections
- Never delete, reset, move, or rewrite `.wwebjs_auth/`, `data/`, or any discovered session/profile directory.
- Never run destructive Git commands or force-push.
- Never print QR payloads, session tokens, private message text, or media contents.
- Do not deploy, alter production settings, restart a live service, merge to `main`, or change account authentication without explicit user approval.
- Do not assume Docker is installed.
- Do not change the WhatsApp client library without presenting the migration cost and obtaining approval.

## Work loop
For each stage:
1. State the goal and files expected to change.
2. Add or update tests.
3. Implement the smallest coherent change.
4. Run tests and static checks available in the environment.
5. Review the diff for unintended changes, secrets, and runtime data.
6. Update docs.
7. Report exact test results and remaining risks.
8. Stop if a step risks persistent session data or requires production access.

## Initial assignment
Complete Stage 0 from `docs/AI_REBUILD_PLAN.md` first. Produce an audit report and proposed implementation order. Do not perform the full rewrite until the audit and plan are reviewable. Do not deploy or merge.
