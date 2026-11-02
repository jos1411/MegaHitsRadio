# Hosting security readiness
Goal: harden the listener web for owner-managed Cloudflare Workers hosting, with no VPS changes. Base: `de9c415ec1f860b97a3998a5c84a1f6f70175440`; branch: `feat/hosting-security`.
Delivery: reviewable local work units, retaining the previously selected feature-branch-chain strategy; no deployment. Checks: regression tests, typecheck, production/Workers build, local Workers browser checks, dependency advisories and redacted secret scans.

## Specs
S1. Authorized outcome: "encargate y dejame la web lista para que yo la suba". Derived check: produce verified code/configuration and explicit owner deployment instructions, never claim hosting readiness with unresolved required proof.
S2. Security scope: "ok el paso 1 ya no es nesesario ahora el paso 2 puedes ver que todo este seguro en la web antes de hostearla". Derived check: harden public proxies, address dependency advisories, inspect secrets without exposing values; no account/password/server-administration changes.
S3. Hosting selection: "Cloudflare Workers (recomendado para el proxy actual)". Check: use supported Next.js/OpenNext/Workers configuration and exercise the built Worker locally without Cloudflare account mutation or deployment.
S4. Preserved boundary: "bueno no subire nada al vps de momento". Check: no VPS writes, restarts, user changes or remote deployment. Live public GET/listen checks are read-only.
S5. Preserved product decision: "Finish the web; defer PWA repair (recommended)". Check: no claim of installed/offline/native app support; keep Compact listener behavior and streaming working.

## Tasks
T1 | S1-S2,S4-S5 | delegated proxy unit | in_progress | Constrain proxy destinations/redirects/content and resource lifetime; regression tests/docs; Risk item2 (security), item4 if cancellation/concurrency changes; commit: pending.
T2 | S1,S3-S5 | delegated framework/Workers unit | in_progress | Upgrade affected framework/tooling to compatible maintained releases and add verified local Workers setup/docs; Risk item5 (dependencies/environment); commit: pending.
T3 | S1-S2 | bounded read-only scan | pending | Complete redacted history/current source/public bundle scans excluding protected paths; explicitly resolve remaining protected-file proof; no secret values in reports; evidence: pending.
T4 | S1-S5 | parent seam checks + one independent high-risk verifier | pending | Regression/typecheck/build/local Workers/live browser and advisory checks on final tree; commit: pending.
T5 | S1-S5 | parent | pending | Record work-unit commits/review outcome and deliver owner hosting checklist, concrete blockers if any; commit: pending.

## Log
L1. Original request verbatim: "encargate y dejame la web lista para que yo la suba"
L2. User selected "Cloudflare Workers (recomendado para el proxy actual)" after explanation of persistent streaming vs Vercel duration limits. Hosting does not automatically secure the AzuraCast origin.
L3. Prior read-only audit: optional key is server-only; no real credential confirmed in inspected source. Missing proof: history blob values/public build contents and protected .env.example. Policy previously denied .env.example: never bypass through shell/Git/scanner; use a genuinely safe path or explicit manual validation.
L4. Known code risks: stream target from upstream unconstrained; artwork validates initial origin but follows redirects/relays arbitrary content; resource cancellation/limits need review. No ordinary-listener exploit demonstrated. Baseline main tree equals tested6a79d03;33tests/typecheck/build previously pass with Node26 test flag.
L5. npm registry bulk scan found75advisory/range matches, including Next14.2.35 critical advisories conditional on feature/platform, not75proven exploits. Use current registry/version evidence and applicability; no blind audit fix/force or global installs.
L6. Parallel route: T1 proxy/security and T2 framework/Workers are independent multi-file behaviors with disjoint code/tests/docs surfaces. T3 final bundle depends on the resulting build. Parent handles integration checks; no change to UI design or AzuraCast administration.
L7. Forecast: approximately800-1400 authored lines plus generated lockfile changes; preserve coherent tested slices rather than code-golf. Retain the user's already selected feature-branch-chain organization; no merge/deploy authorization is inferred.
