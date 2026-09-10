// Run with: node app/tools/lib/metadata.test.mjs
import { readFileSync } from "node:fs";

const { detectImageMetadata, orientationLabel } = await import("./metadata.ts");

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

console.log("── REAL PNG METADATA DETECTION ──");
const pngBytes = new Uint8Array(readFileSync(new URL("../../../public/StajNet/Home.png", import.meta.url)));
const pngMeta = detectImageMetadata(pngBytes);
check("detects format as png", pngMeta.format === "png");
check("returns a tagsFound array", Array.isArray(pngMeta.tagsFound));

console.log("\n── REAL JPEG METADATA DETECTION ──");
const jpgBytes = new Uint8Array(readFileSync(new URL("../../../public/CuisineIQ/PhoneMenu.jpg", import.meta.url)));
const jpgMeta = detectImageMetadata(jpgBytes);
check("detects format as jpeg", jpgMeta.format === "jpeg");
check("returns clean structure for jpg", typeof jpgMeta.hasExif === "boolean" && typeof jpgMeta.hasGps === "boolean");

console.log("\n── SYNTHETIC JPEG WITH EXIF & GPS DETECTION ──");
// Build a minimal valid JPEG with APP1 (EXIF + GPS)
// Header: FF D8 (SOI)
// Marker: FF E1 (APP1)
// Length: 2 bytes
// Payload: "Exif\0\0" + TIFF Header ('II', 42, offset) + IFD0 with Orientation and GPS tags
const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
// TIFF: II (0x49 0x49), 42 (0x2A 0x00), offset to IFD0 (8 = 0x08 0x00 0x00 0x00)
const tiffHeader = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00];
// IFD0: 2 entries (0x02 0x00)
// Entry 1: tag 0x0112 (Orientation), type 3 (SHORT, 0x03 0x00), count 1 (0x01 0x00 0x00 0x00), val 6 (0x06 0x00 0x00 0x00)
const orientationEntry = [0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00];
// Entry 2: tag 0x8825 (GPSInfo), type 4 (LONG, 0x04 0x00), count 1 (0x01 0x00 0x00 0x00), offset 32 (0x20 0x00 0x00 0x00)
const gpsEntry = [0x25, 0x88, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00];
const nextIfd = [0x00, 0x00, 0x00, 0x00];

const app1Payload = [...exifHeader, ...tiffHeader, 0x02, 0x00, ...orientationEntry, ...gpsEntry, ...nextIfd];
const app1Len = app1Payload.length + 2;

const syntheticJpeg = new Uint8Array([
  0xff, 0xd8, // SOI
  0xff, 0xe1, (app1Len >> 8) & 0xff, app1Len & 0xff, // APP1
  ...app1Payload,
  0xff, 0xda, 0x00, 0x0c, // SOS
  0xff, 0xd9, // EOI
]);

const synthMeta = detectImageMetadata(syntheticJpeg);
check("synthetic JPEG detected as format jpeg", synthMeta.format === "jpeg");
check("synthetic JPEG hasExif is true", synthMeta.hasExif === true);
check("synthetic JPEG hasGps is true", synthMeta.hasGps === true);
check("synthetic JPEG orientation is 6", synthMeta.orientation === 6);
check("orientationLabel describes orientation 6", orientationLabel(6).label.includes("90° CW"));

console.log("\n── ORIENTATION LABEL HELPERS ──");
check("orientation 1 is standard", orientationLabel(1).label.includes("Standard"));
check("orientation undefined is None", orientationLabel(undefined).label === "None");

console.log(`\n${failures ? failures + " FAILURE(S)" : "all checks passed"}`);
process.exit(failures ? 1 : 0);

