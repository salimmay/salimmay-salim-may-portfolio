/**
 * Binary encoders for the /tools converter.
 *
 * Deliberately pure — no DOM, no canvas, no browser globals — so they can be
 * unit-tested in Node against real bytes. The canvas work lives in the React
 * component; everything that writes a file format lives here.
 *
 * Both formats are written by hand rather than pulled from a dependency. ICO
 * and stored-ZIP are small, well-specified containers, and a few hundred bytes
 * of header writing is cheaper than shipping a library to a page whose whole
 * pitch is that it does the work locally.
 */

/** All multi-byte fields in both formats are little-endian. */

// ── ICO ─────────────────────────────────────────────────────────────────────

/**
 * Wrap already-encoded PNGs in an ICO container.
 *
 * PNG-inside-ICO is valid and has been read by Windows since Vista, so there is
 * no need to encode BMP+AND-mask by hand. Sizes above 256 are not representable
 * in the directory (the field is one byte, where 0 means 256), so callers must
 * keep entries at 256 or below.
 */
export function buildIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  if (!images.length) throw new Error("buildIco: no images given");
  if (images.some((image) => image.size > 256 || image.size < 1)) {
    throw new Error("buildIco: sizes must be between 1 and 256");
  }

  const HEADER = 6;
  const ENTRY = 16;
  const directorySize = HEADER + ENTRY * images.length;
  const total = directorySize + images.reduce((sum, image) => sum + image.png.length, 0);

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // 1 = icon (2 would be cursor)
  view.setUint16(4, images.length, true);

  let offset = directorySize;
  images.forEach((image, i) => {
    const entry = HEADER + ENTRY * i;
    // 256 is stored as 0 — the field is a single byte.
    out[entry] = image.size === 256 ? 0 : image.size;
    out[entry + 1] = image.size === 256 ? 0 : image.size;
    out[entry + 2] = 0; // palette size, 0 for truecolour
    out[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, image.png.length, true);
    view.setUint32(entry + 12, offset, true);

    out.set(image.png, offset);
    offset += image.png.length;
  });

  return out;
}

// ── ZIP (stored, no compression) ────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Build a ZIP with every entry stored uncompressed.
 *
 * Store rather than deflate on purpose: the payload is PNG and ICO, which are
 * already compressed, so deflate would buy almost nothing while requiring
 * either a dependency or a DEFLATE implementation. Every unzip tool reads
 * stored entries.
 */
export function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  if (!files.length) throw new Error("buildZip: no files given");

  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const sum = crc32(file.data);

    const local = new Uint8Array(30 + nameBytes.length + file.data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // method 0 = stored
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x0021, true); // mod date — 1980-01-01, a stable epoch
    lv.setUint32(14, sum, true);
    lv.setUint32(18, file.data.length, true); // compressed size
    lv.setUint32(22, file.data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);
    local.set(file.data, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); // central directory signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 0, true); // method
    cv.setUint16(12, 0, true); // mod time
    cv.setUint16(14, 0x0021, true); // mod date
    cv.setUint32(16, sum, true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // comment
    cv.setUint16(34, 0, true); // disk number
    cv.setUint16(36, 0, true); // internal attributes
    cv.setUint32(38, 0, true); // external attributes
    cv.setUint32(42, offset, true); // offset of local header
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // end of central directory signature
  ev.setUint16(4, 0, true); // this disk
  ev.setUint16(6, 0, true); // disk with central directory
  ev.setUint16(8, files.length, true); // entries on this disk
  ev.setUint16(10, files.length, true); // total entries
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true); // central directory offset
  ev.setUint16(20, 0, true); // comment length

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const part of [...locals, ...centrals, end]) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}

/**
 * Wrap a raster image in an SVG document.
 *
 * This does NOT vectorise. Turning pixels into paths needs a tracing algorithm
 * and produces a different picture; embedding is an honest conversion of
 * container rather than of content, and the UI says so where the user chooses it.
 */
export function buildSvgWrapper(dataUrl: string, width: number, height: number): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<image href="${dataUrl}" width="${width}" height="${height}"/>`,
    `</svg>`,
  ].join("");
}

/** Standard favicon set — the sizes a browser, iOS and a PWA manifest ask for. */
export const ICO_SIZES = [16, 32, 48, 64, 128, 256] as const;
export const PACK_PNG_SIZES = [16, 32, 180, 192, 512] as const;

export const WEBMANIFEST = JSON.stringify(
  {
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  null,
  2
);
