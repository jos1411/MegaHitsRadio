# Public proxy security and deployment controls

The stream and artwork routes are public read-only proxies. They use the configured `AZURACAST_BASE_URL` origin only, reject URL credentials/fragments and unsupported paths, and disable redirects so a trusted origin cannot redirect the server to an arbitrary destination. These routes never attach `AZURACAST_API_KEY`; the key is used only by AzuraCast API reads.

Artwork is limited to JPEG, PNG, WebP, and GIF under AzuraCast media/upload/art paths, with a 1 MiB response limit and a five-second body-read timeout. The stream has a bounded setup timeout and remains open for healthy live audio; downstream cancellation cancels its upstream reader. Stream URLs must match `/listen/{station}/{mount}`, `/radio/{mount}`, or `/stream/{mount}`.

HTTP remains permitted only when the configured origin itself is HTTP, to support existing public radio installations. That transport is plaintext and provides no confidentiality or origin authentication; prefer an HTTPS AzuraCast origin. No TLS proof or working HTTPS endpoint is implied by this code.

These application bounds do not enforce deployment-wide concurrency or spending budgets. Configure Worker/platform request concurrency, CPU/runtime limits, and upstream/network budgets separately in deployment controls. Do not treat per-process state as a global limit in serverless deployments.

## Key Learnings

1. Public stream and metadata endpoints do not need the optional admin API key.
2. Redirects must be disabled to ensure the destination stays within the configured origin.
3. Artwork MIME validation must reject SVG because it can contain active content.
4. Audio streams need downstream cancellation rather than a blanket lifetime cap.
5. HTTP audio support is plaintext and is not evidence of TLS protection.
