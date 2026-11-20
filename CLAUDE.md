# Carta à Assembleia — agent instructions

This fork is a Portuguese national-parliament MVP. The active app is `web/`; read README.md and LOCAL_ADAPTATION_PLAN.md first. Historical German planning/privacy documents describe upstream, not this deployment.

## Build principles (keep synchronized with CLAUDE.md)
- Use European Portuguese (pt-PT), approachable UI, formal letters and a non-partisan voice.
- Keep the existing paper/envelope/green visual language, accessibility and mobile usability.
- National Assembleia da República only. Do not import German constituency or federal/regional assumptions.
- Never invent political recipients, addresses, personal experiences or claims. Official recipient data is authoritative; validate on the server and fail closed on stale/incomplete data.
- No accounts, visitor-content database, analytics or implicit email dispatch. Do not log concerns, drafts, email addresses, keys or provider responses.
- Email is an explicit visitor request for their own copy. Never run a script that sends real messages or paid AI requests as part of automated tests.
- Tests mock OpenRouter and Olaia email. Run relevant tests, typecheck, lint and build for application changes; routing/data changes also need representative samples.
- Keep provider secrets in the hosting dashboard or gitignored local env. No secrets in public commits.
- Olaia previews are separate from production; promotion requires the platform's human approval.
- The contact test@test.com is a user-authorized test placeholder. Keep noindex until the owner supplies real operator/contact details and explicitly requests public indexing.
- Keep changes lean. Use current official reference data; do not add services or optional features outside the authorized scope.
