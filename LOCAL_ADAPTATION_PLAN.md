# Carta à Assembleia — Portugal MVP

## Scope and baseline
European Portuguese; Assembleia da República only; no custom domain. Upstream international-starter resolves to cce073a0a429fdcbaff834b76cbedf6ee6573b0f. Keep the fork history and MIT attribution; use its national-only flow, current dependency baseline, and later no-invented-experiences safeguards. Remove German-only routes and data from the deployed application rather than leave them reachable.

## MUST
- Official parliamentary constituency and active-deputy importer with provenance, freshness, validation and safe failure. Explicit constituency selection, including islands and overseas.
- Portuguese homepage, wizard, formal letter prompts, editable output, download/print, privacy and about pages.
- OpenRouter server adapter; validate recipient IDs server-side; bounded input, request limits, timeouts and no prompt logging.
- Olaia Next.js deployment, GitHub branch preview, production approval handoff.
- Unit/integration tests with mocked AI; mobile/desktop browser checks; deployed smoke checks.

## SHOULD
- Optional transactional email via Olaia, only on explicit visitor request, with abuse protection.
- Repeatable data refresh and maintenance instructions.

## OPTIONAL / deferred
Voice, municipalities and regional assemblies, campaigns, statistics, feedback, accounts, custom domain. No database required for this flow.

## Human-owned inputs
OPENROUTER_API_KEY via Olaia dashboard; production promotion approval. User authorized temporary test@test.com contact and delegated naming. Public operator identity/contact must replace this placeholder before a real public launch; do not invent an operator or claim legal readiness.

## Validation
All 22 constituencies; 230 active seats as an anomaly check, never silently accept partial import; mandate substitutions; expired data; unknown/tampered recipient; Madeira/Açores/Europe/outside Europe; arbitrary injected prompt; missing key, timeout, provider failure and throttling; edited output survives email errors; no automatic dispatch to representatives.
