import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  getNowPlayingStatic: vi.fn(), getStationId: vi.fn(() => "1"), getBaseUrl: vi.fn(() => "https://radio.example.com"),
}));
vi.mock("@/lib/azuracast", () => mocks);
import { GET as stream } from "@/app/api/stream/route";
import { GET as art } from "@/app/api/art/route";

const data = (url: string) => ({ station: { listen_url: url } });
const artRequest = (url: string) => new Request(`https://site.example/api/art?url=${encodeURIComponent(url)}`);
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("public proxy security", () => {
  it.each([
    ["foreign origin", "https://evil.example/listen/station/mp3"],
    ["credentials", "https://user:pass@radio.example.com/listen/station/mp3"],
    ["unsupported scheme", "ftp://radio.example.com/listen/station/mp3"],
    ["unsupported path", "https://radio.example.com/admin/export"],
  ])("rejects stream %s before fetch", async (_name, url) => {
    mocks.getNowPlayingStatic.mockResolvedValue(data(url));
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const response = await stream(new Request("http://localhost/api/stream"));
    expect(response.status).toBe(502);
    expect(await response.text()).toBe("Stream unavailable");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not follow stream redirects", async () => {
    mocks.getNowPlayingStatic.mockResolvedValue(data("https://radio.example.com/listen/station/mp3"));
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: "https://evil.example/x" } })); vi.stubGlobal("fetch", fetcher);
    expect((await stream(new Request("http://localhost/api/stream"))).status).toBe(502);
    expect(fetcher).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ redirect: "manual" }));
  });

  it.each([
    ["HTML", "text/html"], ["SVG", "image/svg+xml"],
  ])("rejects %s artwork without relaying it", async (_name, mime) => {
    const fetcher = vi.fn().mockResolvedValue(new Response("bad", { headers: { "content-type": mime } })); vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest("https://radio.example.com/uploads/art.jpg"));
    expect(response.status).toBe(502);
    expect(await response.text()).toBe("Artwork unavailable");
  });

  it("rejects artwork paths outside approved art routes before fetch", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest("https://radio.example.com/admin/config"));
    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects artwork redirects", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: "https://evil.example/x" } })); vi.stubGlobal("fetch", fetcher);
    expect((await art(artRequest("https://radio.example.com/uploads/art.jpg"))).status).toBe(502);
    expect(fetcher).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ redirect: "manual" }));
  });

  it("bounds declared and streamed artwork size", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array(2 * 1024 * 1024), { headers: { "content-type": "image/jpeg" } })); vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest("https://radio.example.com/uploads/art.jpg"));
    expect(response.status).toBe(502);
    const over = vi.fn().mockResolvedValue(new Response("x", { headers: { "content-type": "image/jpeg", "content-length": "99999999" } })); vi.stubGlobal("fetch", over);
    expect((await art(artRequest("https://radio.example.com/uploads/art.jpg"))).status).toBe(502);
  });

  it("cancels the upstream audio reader when the client cancels", async () => {
    mocks.getNowPlayingStatic.mockResolvedValue(data("https://radio.example.com/listen/station/mp3"));
    let canceled = false;
    const upstreamBody = new ReadableStream<Uint8Array>({ cancel() { canceled = true; } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(upstreamBody, { headers: { "content-type": "audio/mpeg" } })));
    const response = await stream(new Request("http://localhost/api/stream"));
    await response.body?.cancel();
    expect(canceled).toBe(true);
  });

  it("preserves successful public audio and safe image responses", async () => {
    mocks.getNowPlayingStatic.mockResolvedValue(data("https://radio.example.com/listen/station/mp3"));
    const audio = vi.fn().mockResolvedValue(new Response("audio", { headers: { "content-type": "audio/mpeg" } })); vi.stubGlobal("fetch", audio);
    expect((await stream(new Request("http://localhost/api/stream"))).headers.get("content-type")).toBe("audio/mpeg");
    const image = vi.fn().mockResolvedValue(new Response("image", { headers: { "content-type": "image/jpeg" } })); vi.stubGlobal("fetch", image);
    const response = await art(artRequest("https://radio.example.com/uploads/art.jpg"));
    expect(response.status).toBe(200); expect(response.headers.get("content-type")).toBe("image/jpeg");
  });
});
