// Generates the PWA PNG icons (192, 512, maskable 512) without external deps.
// Run: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

let CRC_TABLE;

function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      CRC_TABLE[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeIcon(size, paddingPx) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [15, 15, 35, 255]; // #0f0f23
  const accent = [232, 69, 69, 255]; // #e84545
  const hole = [15, 15, 35, 255]; // #0f0f23

  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = bg[0];
    rgba[i * 4 + 1] = bg[1];
    rgba[i * 4 + 2] = bg[2];
    rgba[i * 4 + 3] = bg[3];
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = Math.max(0, size / 2 - paddingPx);
  const innerRadius = outerRadius * 0.32;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d2 = dx * dx + dy * dy;
      const i = (y * size + x) * 4;
      if (d2 <= outerRadius * outerRadius) {
        const color = d2 <= innerRadius * innerRadius ? hole : accent;
        rgba[i] = color[0];
        rgba[i + 1] = color[1];
        rgba[i + 2] = color[2];
        rgba[i + 3] = color[3];
      }
    }
  }

  return encodePNG(size, size, rgba);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makeIcon(192, 0));
writeFileSync("public/icons/icon-512.png", makeIcon(512, 0));
writeFileSync("public/icons/icon-maskable-512.png", makeIcon(512, 40));

console.log("Generated public/icons/icon-192.png, icon-512.png, icon-maskable-512.png");
