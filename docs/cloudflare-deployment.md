# Cloudflare Workers owner deployment guide

This project targets Cloudflare Workers through OpenNext. Build and preview are
local; this guide does not authorize account login, domain changes, deployment,
or changes to the AzuraCast/VPS host. Cloudflare's Worker/asset URL is HTTPS at
the edge. That says nothing about TLS between the Worker and the AzuraCast
origin: configure and verify origin TLS separately before production use.

## Runtime configuration

`AZURACAST_BASE_URL` is the server-side URL of the AzuraCast origin and
`AZURACAST_STATION_ID` defaults to `1`. The public now-playing, schedule, and
mount reads do not require an API key. No secret is required for public
listening. If owner-specific private API operations are added later, keep
`AZURACAST_API_KEY` as a Worker secret; never put it in `vars`, source control,
client code, build arguments, or browser-visible configuration. Do not create
or distribute a secret-filled example file.

The checked-in `wrangler.jsonc` selects the confirmed AzuraCast HTTPS origin
`https://radio.megahitsdiscomovil.com` (station `1`). This is the radio origin,
not the web domain; the future apex web domain is not deployed. No API key is
required for public listening. Confirm origin reachability and TLS separately
before deployment. Worker bindings are provided by the Workers runtime and surfaced to
server-side `process.env`; `wrangler.jsonc` enables Cloudflare's
`nodejs_compat_populate_process_env` flag for that mapping. The local preview
check should verify the actual binding before relying on it. Do not expose
environment values in logs or responses. The origin URL is
configuration, not a secret, but should not be embedded in browser bundles.

## Dependency advisory exposure (local lockfile snapshot)

This is a bounded classification of the retained npm advisory output for this
lockfile, not a clean-audit claim or a substitute for a later refreshed audit.
The recorded full audit had 26 affected dependency records (20 moderate, 6
high); `--omit=dev` reported five moderate records and no high records. These
counts are records in dependency chains, not 26 independent listener exploits.
No Next.js or React package was identified as an affected package in that
snapshot.

The generated OpenNext handler metadata (`.open-next/server-functions/default/handler.mjs.meta.json`)
contained 332 inputs. The inspected handler inputs and generated Worker entry
files contained no imports/inputs for the vulnerable library modules listed
below. In the inspected Worker artifacts these libraries therefore were not
reachable through untrusted listener requests. This statement is limited to
those generated dependency graphs; it does not establish global absence of
vulnerabilities or certify all future builds. No remaining audit finding was
identified in vulnerable library code in the inspected listener Worker graph,
so this evidence identifies no dependency-audit runtime blocker. It does not
clear the separately tracked T1 public-proxy risks or other security work.

| Advisory | Affected package/version in lockfile | Dependency chain and exposure classification |
|---|---|---|
| GHSA-5j98-mcp5-4vw2 | `glob@10.3.3` | `@opennextjs/cloudflare@1.20.15` → `@opennextjs/aws@4.1.14` → dev dependency `@node-minify/core@9.0.2` → glob. Advisory concerns glob CLI command execution; this chain is build tooling, and neither glob nor node-minify appears in the inspected Worker input graph. |
| GHSA-3g3m-2fjr-6pw4 | `glob@10.3.3`, `glob@13.0.6` | The former is the OpenNext/AWS build chain above; the latter is reached by `@opennextjs/cloudflare@1.20.15` and `@serwist/next@9.5.13` / `@serwist/build@9.5.13`. This concerns glob cancellation/filesystem traversal. The affected glob modules were absent from the inspected Worker graph; the 13.x copy is used in build tooling. |
| GHSA-g3hv-75wg-m249 | `minimatch@3.1.5`, `9.0.9`, `10.2.6` | Shared dependency of the ESLint/Next lint toolchain, `@typescript-eslint/typescript-estree@8.72.1`, and glob 10/13 chains above. These packages are lint/build tooling; minimatch was absent from the inspected Worker graph. |
| GHSA-rj75-hqrm-r3gf | `postcss-selector-parser@6.1.4` | `tailwindcss@3.4.19` / `postcss-nested@6.2.0` build-time CSS processing. Not present in the inspected Worker graph. |
| GHSA-3wwx-pv8p-q78v, GHSA-pmjh-fq2x-6v4x, GHSA-r53p-7pc4-xj5r, GHSA-rfgv-xxqx-mfg5, GHSA-3xpg-4rpp-hhhm, GHSA-2jfj-6hjv-fm6j, GHSA-2gqq-gqf2-x968, GHSA-w293-vg96-wgc3, GHSA-8436-99hf-9mmv, GHSA-vp8m-p9jh-q5pm, GHSA-rx4f-c7p8-82vq, GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472, GHSA-xjj6-f33q-929c, GHSA-4w7w-5xrc-9h26, GHSA-2m5v-pch6-74hx, GHSA-qrxm-fqhp-jwvm, GHSA-9fm3-97px-rjf6, GHSA-55wc-3pg8-jfw6 | `undici@8.10.0` | `jsdom@30.0.1` → undici, dev/test-only. It is absent from the inspected Worker graph and is not on the listener request path. Other lockfile copies `undici@7.30.1` (Miniflare/Wrangler) and `undici@6.29.1` (dotenvx) are outside the advisory's affected 8.x ranges. |

The audit also labels `@node-minify/core@9.0.2`, `@opennextjs/aws@4.1.14`,
`@opennextjs/cloudflare@1.20.15`, `@serwist/build@9.5.13`,
`@serwist/next@9.5.13`, and `@serwist/webpack-plugin@9.5.13` as affected
package records. For OpenNext, the chain is Cloudflare adapter → AWS adapter
→ its dev dependency `@node-minify/core` → `glob@10.3.3`; for Serwist it is
Serwist build/webpack plugin → `glob@13.0.6`. The eslint-config-next/ESLint and
TypeScript-ESLint records similarly aggregate the minimatch chains in the
table. Those are transitive package-level audit records, not proof that every
adapter function is vulnerable. `@opennextjs/aws` adapter code does appear in
the generated Worker, but the affected glob/minify modules do not appear in its
inspected module graph. The retained audit suggested only
major/incompatible package changes for the remaining glob/minimatch findings;
no forced downgrade or broad override was applied. Compatible releases already
used in this lockfile include `vite@8.3.5`, `vitest@5.1.0`, `zod@4.6.7`, and
`source-map-js@1.2.2`, which are outside the retained affected ranges for the
previously reported advisories. Residual tooling risk remains when building
with untrusted repository inputs; keep lockfile/build inputs reviewed and do
not expose deployment secrets to builds of untrusted changes. Re-check registry
advisories before owner release. If a later report identifies vulnerable code
in the generated Worker rather than build/test tooling, treat it as a
deployment blocker and upgrade or replace the compatible runtime dependency
before publishing.

## Lint compatibility exceptions

The ESLint configuration has narrow exceptions for pre-existing diagnostics
outside this hosting unit's allowed source edits: `@next/next/no-html-link-for-pages`
only in `src/app/offline/page.tsx`; `react-hooks/set-state-in-effect` only in
`src/features/now-playing/NowPlaying.tsx`; `react-hooks/immutability` only in
`src/features/now-playing/useNowPlaying.ts`; and `react-hooks/refs` only in
`__tests__/player.test.tsx`. It also ignores generated `.open-next/**` and
`.wrangler/**` outputs. These exceptions suppress only those named
navigation/React-hook diagnostics in the specified files (or generated output);
they do not disable dependency auditing, secret checks, or security lint rules
for application source. The existing warnings should be reviewed separately
before broad lint-rule policy changes.

## Local build and preview

Use a supported Node.js release (20.9+ for Next.js; Node 22.12+ is needed by
current Wrangler/Vite tooling) and npm. From the repository root:

```sh
npm ci
AZURACAST_BASE_URL=https://your-verified-origin.example npm run build
AZURACAST_BASE_URL=https://your-verified-origin.example npm run cf:build
```

The ordinary Node build and OpenNext Worker build are separate checks. For a
local Worker preview, first configure the placeholder in `wrangler.jsonc` to
the verified origin, then run:

```sh
npm run cf:preview -- --ip 127.0.0.1 --port 3002
```

Exercise the local Worker with read-only GETs (homepage, metadata and the
public audio stream) and verify that server routes can read the runtime
`AZURACAST_BASE_URL` binding. Never use an actual API key for this public-read
check. Stop only the preview process you started. Local previews do not prove
that an account, custom domain, production secret, or deployment is configured.

## Owner deployment checklist

1. Review the lockfile and run tests, typecheck, lint, the Node production
   build, OpenNext build, and loopback Worker preview checks in the target
   environment.
2. Confirm the origin is reachable by the Worker and serves HTTPS with a valid
   certificate. Cloudflare edge HTTPS does not establish origin TLS security.
3. Set `AZURACAST_BASE_URL` and (if needed) `AZURACAST_STATION_ID` as runtime
   Worker variables. Public listening does not need `AZURACAST_API_KEY`; only
   if a later server-side feature requires it, set it through Wrangler's
   secret mechanism and never as a plain variable.
4. Review Cloudflare account, billing, region, routes, domain, and secret
   choices yourself, then follow OpenNext's current Cloudflare deployment
   instructions. Only the owner should authenticate and explicitly choose
   whether to deploy. No deployment or account changes have been performed by
   this project work.
5. Verify the deployed public routes and stream, and separately validate
   origin TLS and any secrets using non-disclosing checks.

## Scope limits

This configuration does not repair or claim PWA installation/offline support.
The Compact player/listener experience remains the product contract. No
analytics, authentication, or advertising has been added. A public HTTPS
Worker asset URL is distinct from HTTPS on the upstream origin.
