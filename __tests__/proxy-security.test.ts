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
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); mocks.getBaseUrl.mockReturnValue("https://radio.example.com"); });

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

  it("allows one same-origin AzuraCast generic artwork redirect", async () => {
    const url = "https://radio.example.com/api/station/lment_radio/art/ea079c61ade598334aa3d8b4";
    const fallback = "/static/vite_dist/assets/generic_song-7JSFKOXX.jpg";
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: fallback } }))
      .mockResolvedValueOnce(new Response("fallback", { headers: { "content-type": "image/jpeg" } }));
    vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest(url));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(await response.text()).toBe("fallback");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenLastCalledWith(`https://radio.example.com${fallback}`, expect.objectContaining({ redirect: "manual" }));
  });

  it("stops after one validated artwork redirect", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "/static/vite_dist/assets/generic_song-7JSFKOXX.jpg" } }))
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "https://evil.example/x" } }));
    vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest("https://radio.example.com/api/station/lment_radio/art/ea079c61ade598334aa3d8b4"));
    expect(response.status).toBe(502);
    expect(await response.text()).toBe("Artwork unavailable");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each([21, 23, 65])("rejects unsupported %i-hex artwork hashes", async (length) => {
    const url = `https://radio.example.com/api/station/lment_radio/art/${"a".repeat(length)}`;
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest(url));
    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Forbidden");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("accepts the 22-hex artwork hash returned by the live AzuraCast origin", async () => {
    mocks.getBaseUrl.mockReturnValue("https://radio.megahitsdiscomovil.com");
    const url = "https://radio.megahitsdiscomovil.com/api/station/megahitsradio/art/ec6ae2c3cac707004bcaef69";
    const fetcher = vi.fn().mockResolvedValue(new Response("cover", { headers: { "content-type": "image/jpeg" } }));
    vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest(url));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(await response.text()).toBe("cover");
    expect(fetcher).toHaveBeenCalledWith(url, expect.objectContaining({ redirect: "manual" }));
  });

  it("accepts the station artwork route returned by AzuraCast", async () => {
    const url = "https://radio.example.com/api/station/lment_radio/art/ea079c61ade598334aa3d8b4";
    const fetcher = vi.fn().mockResolvedValue(new Response("cover", { headers: { "content-type": "image/jpeg" } }));
    vi.stubGlobal("fetch", fetcher);
    const response = await art(artRequest(url));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(await response.text()).toBe("cover");
    expect(fetcher).toHaveBeenCalledWith(url, expect.objectContaining({ redirect: "manual" }));
    fetcher.mockClear();
    const rejected = await art(artRequest(url.replace("radio.example.com", "evil.example")));
    expect(rejected.status).toBe(403);
    expect(await rejected.text()).toBe("Forbidden");
    expect(fetcher).not.toHaveBeenCalled();
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
