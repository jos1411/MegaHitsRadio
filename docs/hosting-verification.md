# Cloudflare web security handoff

## Exact scope
The integrated source is `4e62137436adda5802c58324815d54781fc887dd` on `feat/hosting-workers-ready`. This is a listener-web handoff, not a deployed service, a clean dependency audit, or a PWA/native-app certification. Follow `cloudflare-deployment.md` for owner configuration.

## Observed successful evidence
- Final full suite: **48 tests passed**; TypeScript, lint and diff checks exited 0.
- Actual OpenNext/Next production Worker builds exited 0, including the final artwork correction.
- Built Worker returned populated now-playing JSON, MP3 bytes and valid artwork with HTTP 200. A foreign artwork target returned 403.
- Canonical AzuraCast artwork initially failed with 403. A regression test observed RED, then the approved station-art route was added.
- AzuraCast's generic artwork then exposed a legitimate same-origin redirect. Two regressions observed RED, followed by a single manually validated hop, a narrow generic-asset path and a strict one-hop limit. Foreign redirects remain rejected. The setup timer is always cleared.
- Independent security verification passed 34 focused tests on the combined implementation, followed by only the correction rechecks (one canonical-path test and three redirect tests). No reproduced severe blocker was reported.
- Desktop browser assertions observed no autoplay, actual play/pause/resume and one audio object across client navigation. Mobile 390px assertions observed no horizontal overflow, reduced-motion preference and completed images.

## Failed checks retained, not relabeled passed
The earlier functional subagent timed out after 30 minutes. A parent wrapper then failed parsing before executing checks. Both remain failed events. The subsequent bounded checks produced the real successful build/test evidence above.

Both composite browser probes exited 1 on the known deferred service-worker registration path: the deliberately blocked-worker desktop context produced an undefined `waiting` registration error; a normal fresh mobile context reported service-worker script evaluation failure. Those probes are **not** reported as fully green or error-free browser runs. The core playback/layout assertions completed before those failures. The owner had explicitly selected web delivery with PWA repair deferred. Offline use, installability, physical phones and lock-screen support remain unverified.

## Secret scanning
Gitleaks was locally built from clean official `v8.30.1` source commit `83d9cd684c87d95d656c1458ef04895a7f1cbd8e`, with verified Go modules. Binary SHA-256: `dd083acb9b5ea49d96dfe948a4cb73e0a20ecbf8e52a6f2d0cf94a64026610af`.

Redacted scans exited 0 with **0 findings** for:
- Initial history: 149 eligible text blobs; eight current intended files.
- Final delta: seven new eligible text blobs from five additional commits; 88 current eligible source/config/docs files.
- Final public Worker assets: 40 text files; three binary image files skipped.
- All eight public route-cache payloads.

Two protected historical example-file blobs were excluded before reading and were manually confirmed placeholder-only by the owner. Three historical binary/non-UTF-8 blobs were skipped; no eligible file exceeded the 5 MiB cap. This is bounded scanning, not a guarantee for future configuration.

Final public-assets manifest SHA-256: `33242b3e4ff3daf902e73ba321eedf14da0eac400eda19bcc7648771c328adff`.
Route-cache manifest SHA-256: `bae8e92119187220dfebdd917936a1d1c6b5073a2772dccb10a9cbf7ae1a08d1`.

## Native review
The isolated proxy slice was approved under lineage `review-604208466ffbeae6`; its exact approval acknowledgement completed with authority burned. The seven reviewed paths were compared against the integrated source and matched. One informational resilience advisory, `R4-001` at `src/app/api/stream/route.ts:37`, was non-blocking; no correction was opened. This is not approval of unrelated code, future configuration or deployment.

## Owner requirements before production
1. Replace the non-secret origin placeholder in `wrangler.jsonc` with the intended AzuraCast origin. Configure and verify origin HTTPS separately; Worker-edge HTTPS does not encrypt an HTTP origin hop. The local tests used public HTTP without an API key and did not prove origin TLS.
2. Public listening does not require a key. Do not put VPS/SSH/admin credentials into Worker vars, frontend code or Git. If a private API is needed later, use a server-side secret and HTTPS transport.
3. Configure platform budgets/abuse limits and keep build inputs trusted. Remaining build/test-tool advisories are disclosed in `cloudflare-deployment.md`; the npm audit is not clean.
4. Publish the exact prepared branch, not the previous `main` version. Account login, deployment, DNS and VPS changes remain owner-controlled and were not performed.

Private scanner/build artifacts live outside the deployable clone under the parent workspace `.pi/`. Some scanner cleanup was safety-blocked; no alternate deletion was attempted. These artifacts are not part of the deployment or Git commits.

Risk: item 2 (proxy security), item 4 (cancellation ordering), item 5 (framework and hosting environment). Checks and residual limitations are recorded above.
