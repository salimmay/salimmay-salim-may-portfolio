// Run with:  node app/tools/lib/encode.test.mjs
//
// These write binary file formats by hand, so they get real assertions rather
// than a glance: CRC32 against the standard vector, the ICO directory checked
// for in-bounds offsets and PNG magic, and the zip round-tripped through the
// operating system's own extractor byte-for-byte.
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { buildIco, buildZip, crc32 } = await import(
  "./encode.ts"
);

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

// A real PNG, so the ICO carries genuine image data rather than filler.
const realPng = readFileSync(new URL("../../../public/StajNet/Home.png", import.meta.url));
const png = new Uint8Array(realPng);

console.log("── CRC32 ──");
// Known-good vector: crc32("123456789") === 0xCBF43926
check("crc32 of '123456789' is 0xCBF43926", crc32(new TextEncoder().encode("123456789")) === 0xcbf43926);

console.log("\n── ICO ──");
const ico = buildIco([
  { size: 16, png },
  { size: 32, png },
  { size: 256, png },
]);
const dv = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
check("reserved field is 0", dv.getUint16(0, true) === 0);
check("type is 1 (icon)", dv.getUint16(2, true) === 1);
check("count is 3", dv.getUint16(4, true) === 3);
check("256 is encoded as 0 in the width byte", ico[6 + 16 * 2] === 0);
check("16 is encoded as 16", ico[6] === 16);
check("bit depth is 32", dv.getUint16(6 + 6, true) === 32);
// Every entry must point at real data inside the file.
let icoOffsetsOk = true;
for (let i = 0; i < 3; i++) {
  const entry = 6 + 16 * i;
  const len = dv.getUint32(entry + 8, true);
  const off = dv.getUint32(entry + 12, true);
  if (off + len > ico.length) icoOffsetsOk = false;
  // PNG magic at the offset proves the payload landed where the directory says.
  if (!(ico[off] === 0x89 && ico[off + 1] === 0x50)) icoOffsetsOk = false;
  if (len !== png.length) icoOffsetsOk = false;
}
check("all 3 entries point at real PNG data in-bounds", icoOffsetsOk);
check("total size = header + directory + payloads", ico.length === 6 + 16 * 3 + png.length * 3);

console.log("\n── ZIP ──");
const zip = buildZip([
  { name: "favicon.ico", data: ico },
  { name: "icon-192.png", data: png },
  { name: "site.webmanifest", data: new TextEncoder().encode('{"icons":[]}') },
]);
const zv = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
check("local header signature", zv.getUint32(0, true) === 0x04034b50);
check("EOCD signature at the end", zv.getUint32(zip.length - 22, true) === 0x06054b50);
check("EOCD reports 3 entries", zv.getUint16(zip.length - 22 + 10, true) === 3);

// The real test: can an actual unzip tool read it back byte-identically?
const dir = mkdtempSync(join(tmpdir(), "ziptest-"));
const zipPath = join(dir, "pack.zip");
writeFileSync(zipPath, Buffer.from(zip));
try {
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${join(dir, "out")}' -Force"`,
    { stdio: "pipe" }
  );
  const extracted = readdirSync(join(dir, "out")).sort();
  check("Expand-Archive extracted 3 files", extracted.length === 3, extracted.join(", "));
  const backIco = readFileSync(join(dir, "out", "favicon.ico"));
  check("favicon.ico round-trips byte-identically", Buffer.compare(backIco, Buffer.from(ico)) === 0);
  const backPng = readFileSync(join(dir, "out", "icon-192.png"));
  check("icon-192.png round-trips byte-identically", Buffer.compare(backPng, realPng) === 0);
} catch (e) {
  check("Expand-Archive could read the zip", false, String(e.message).slice(0, 160));
}

console.log(`\n${failures ? failures + " FAILURE(S)" : "all checks passed"}`);
process.exit(failures ? 1 : 0);
