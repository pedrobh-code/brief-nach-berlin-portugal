# Carta à Assembleia

European Portuguese adaptation of [Brief-nach-Berlin](https://github.com/tholo91/brief-nach-berlin), by Thomas Lorenz. A citizen describes a concern, chooses a current member of Portugal's Assembleia da República, reviews an AI-assisted draft, and sends their own letter. No accounts, automatic political dispatch, analytics, campaigns or letter database.

## Run locally

Node 22 and npm are required.

```sh
cd web
npm ci
cp .env.example .env.local
# Set your own OPENROUTER_API_KEY in .env.local, never in source.
npm run dev
```

Open http://localhost:3000. Without a key the complete interface and official representative lookup work; generation returns an honest unavailable message. Tests mock the AI and email providers and never send letters or paid model requests.

```sh
cd web
npm test
npm run typecheck
npm run lint
npm run build
# With the app serving on localhost:3000 and Chromium installed:
npm run test:e2e
```

## Scope and provenance

The national-only scope follows upstream `international-starter` (`cce073a0a429fdcbaff834b76cbedf6ee6573b0f`). The fork retains its existing history rather than resetting it to that older commit. The deployed `web/` app replaces German routes, data, campaign/database integrations and assets with the Portuguese MVP. The current Next.js/React baseline and later anti-fabrication safeguards are retained. Historical German documentation elsewhere in this repository describes upstream, not this deployment.

Public UI, prompts, output, email template and error messages use pt-PT. Selection is by constituency, including Açores, Madeira, Europa and Fora da Europa; it does not infer a constituency from a postal code or recommend a party. Recipients and postal addresses are validated on the server, never supplied by the model.

## Official representative data

`web/scripts/import-parliament.ts` discovers the latest legislature's JSON resource on [Parliament's official open-data page](https://www.parlamento.pt/Cidadania/Paginas/DAInformacaoBase.aspx). It filters current mandates, resolves parliamentary group membership at the source export date, validates 22 constituencies / 230 unique current members, then atomically replaces the snapshot. Those counts are deliberate anomaly gates: review them when electoral rules or the schema change.

```sh
cd web
npm run data:refresh
npm test
```

The runtime also refreshes on requests, at most once per six hours per process. Failed imports preserve the last validated snapshot; data older than seven days is not offered for selection or letter generation. This is official public reference data, not persisted visitor data. Review the source's reuse terms and attribution for the final public launch. No deputy portraits or private addresses are copied.

## Olaia

The root Dockerfile builds the Next.js standalone server from `web/`, listens on `0.0.0.0:$PORT` (default 3000), and runs as a non-root user. `/api/health` is the liveness endpoint. Build requires no secrets. Docker's context excludes env files, local dependencies, tests' output and unrelated upstream documentation.

- Project: Carta à Assembleia (`YWsqF8a8AEK5`).
- GitHub app: Carta à Assembleia Portugal (`KwKreIfRPS8-`).
- Source branch: `codex/portugal-mvp`.
- Intended production URL: https://carta-a-assembleia.olaia.eu (only live after Olaia promotion).
- Configure `OPENROUTER_API_KEY` in the app's environment dashboard. It is never sent to the browser.
- Olaia injects `OLAIA_EMAIL_ENDPOINT` and `OLAIA_EMAIL_TOKEN`; template slug is `carta-pronta`.
- Optional `LETTER_TOKEN_SECRET` provides stable email tickets across restarts/instances. Without it tickets are process-local and expire after an hour; downloads remain available.
- Push a branch preview, wait for the build, inspect it, and approve its pinned image in Olaia. Environment changes require a fresh release. Never bypass promotion approval.

The initial setup also created an unused empty app named Carta à Assembleia; it has no deployment or persistent services. The GitHub-backed app above is the deployment target.

## Data handling and limits

Visitor concerns and drafts stay in browser memory until generation/email is requested. The app does not log or persist their content; OpenRouter, its model provider and Olaia necessarily process submitted data under their service settings. No localStorage or cookies are used by the app. A before-unload notice helps prevent accidental loss; download before leaving.

Request bodies are bounded, recipient IDs are checked against current data, browser origin is checked, and provider requests have deadlines. Generation is capped at five requests per IP per hour and sixty per instance per hour. Email requires a short-lived signed generation ticket, explicit consent, IP and destination limits, and an idempotency key. These in-memory limits reset on restart and are not distributed; retain a single app replica for this MVP and set a OpenRouter account budget. Add shared rate limiting before scaling or a larger public launch. The proxy's forwarded IP behavior should be confirmed; the global ceiling also bounds requests if those headers are absent or spoofed.

## Release status and owner actions

This is a test deployment. User-authorized contact `test@test.com` is visibly described as temporary; no legal operator identity is invented. Pages carry noindex and robots disallow rules. Before a real public launch, replace the operator/contact details, confirm provider privacy/retention and training settings, review data reuse terms, then decide whether to enable indexing. There is no custom domain.

Live OpenRouter generation requires the owner-supplied key. Automated tests use mocked providers; an owner-initiated real generation and self-email check should verify credentials, delivery and final Portuguese quality before production approval.

## License

Code retains the upstream MIT license and copyright notice in LICENSE. The adaptation does not imply endorsement by the original author, Parliament or a political party. External parliamentary data remains attributable to the Assembleia da República and subject to its applicable terms.

## OpenRouter configuration

The app calls OpenRouter's Chat Completions API using native server-side fetch, not the Mistral SDK. Only `OPENROUTER_API_KEY` is required; the old `MISTRAL_API_KEY` placeholder can be ignored. The model remains pinned to `mistralai/mistral-large-2512`, routed only to Mistral with provider fallbacks disabled, `data_collection: "deny"` and `zdr: true`. If that route is unavailable the app fails clearly instead of silently changing providers. These requested policies do not guarantee EU-only processing or replace review of OpenRouter's own logging/privacy settings. Disable prompt/completion logging and data-sharing in the account and set a spending limit. See [OpenRouter routing](https://openrouter.ai/docs/guides/routing/provider-selection) and [data policies](https://openrouter.ai/docs/guides/privacy/provider-logging).
