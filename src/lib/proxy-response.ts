import { ART_MAX_BYTES, ART_READ_TIMEOUT_MS, SAFE_ART_TYPES } from "@/lib/upstream-policy";

export async function readSafeArtwork(response: Response): Promise<{ body: Uint8Array; type: string } | null> {
  const type = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
  const length = Number(response.headers.get("content-length"));
  if (!SAFE_ART_TYPES.has(type) || (Number.isFinite(length) && length > ART_MAX_BYTES) || !response.body) {
    await response.body?.cancel();
    return null;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    while (true) {
      const next = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("art read timeout")), ART_READ_TIMEOUT_MS); }),
      ]);
      if (timer) clearTimeout(timer);
      if (next.done) break;
      size += next.value.byteLength;
      if (size > ART_MAX_BYTES) { await reader.cancel(); return null; }
      chunks.push(next.value);
    }
  } catch { await reader.cancel(); return null; }
  finally { if (timer) clearTimeout(timer); reader.releaseLock(); }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return { body, type };
}
