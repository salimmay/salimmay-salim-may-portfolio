/**
 * Pure binary metadata inspection for JPEG, PNG, and WebP images.
 *
 * Runs locally with zero dependencies. Detects EXIF, GPS tags, camera info,
 * XMP packets, ICC profiles, and PNG text chunks before cleaning.
 */

export type DetectedMetadata = {
  format: "jpeg" | "png" | "webp" | "unknown";
  hasExif: boolean;
  hasGps: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  hasIptc: boolean;
  hasTextComments: boolean;
  camera?: string;
  dateTime?: string;
  orientation?: number;
  tagsFound: string[];
};

/** Parse JPEG markers for EXIF, GPS, XMP, and IPTC */
function inspectJpeg(bytes: Uint8Array): DetectedMetadata {
  const result: DetectedMetadata = {
    format: "jpeg",
    hasExif: false,
    hasGps: false,
    hasXmp: false,
    hasIcc: false,
    hasIptc: false,
    hasTextComments: false,
    tagsFound: [],
  };

  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return result;

  let offset = 2;
  const len = bytes.length;

  while (offset + 4 < len) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    // Standalone markers
    if (marker === 0xd9 || marker === 0xda) break; // EOI or SOS
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    if (offset + 2 > len) break;
    const markerLen = (bytes[offset] << 8) | bytes[offset + 1];
    const markerEnd = offset + markerLen;
    const payloadStart = offset + 2;

    if (marker === 0xe1) {
      // APP1: EXIF or XMP
      const header = String.fromCharCode(...bytes.slice(payloadStart, payloadStart + 4));
      if (header === "Exif") {
        result.hasExif = true;
        result.tagsFound.push("EXIF Header");
        parseExifTiff(bytes, payloadStart + 6, markerEnd, result);
      } else {
        const xmpHeader = String.fromCharCode(...bytes.slice(payloadStart, payloadStart + 28));
        if (xmpHeader.includes("http://ns.adobe.com/xap/1.0/")) {
          result.hasXmp = true;
          result.tagsFound.push("XMP Data");
        }
      }
    } else if (marker === 0xe2) {
      const iccHeader = String.fromCharCode(...bytes.slice(payloadStart, payloadStart + 11));
      if (iccHeader.includes("ICC_PROFILE")) {
        result.hasIcc = true;
        result.tagsFound.push("ICC Colour Profile");
      }
    } else if (marker === 0xed) {
      result.hasIptc = true;
      result.tagsFound.push("IPTC / Photoshop IRB");
    } else if (marker === 0xfe) {
      result.hasTextComments = true;
      result.tagsFound.push("JPEG Comment (COM)");
    }

    offset = markerEnd;
  }

  return result;
}

/** Parses TIFF header and IFD0 tags inside EXIF segment */
function parseExifTiff(
  bytes: Uint8Array,
  start: number,
  end: number,
  result: DetectedMetadata
) {
  if (start + 8 > end) return;

  const isLE = bytes[start] === 0x49 && bytes[start + 1] === 0x49; // 'II' = little endian, 'MM' = big endian
  const isBE = bytes[start] === 0x4d && bytes[start + 1] === 0x4d;
  if (!isLE && !isBE) return;

  const readU16 = (idx: number) =>
    isLE ? bytes[idx] | (bytes[idx + 1] << 8) : (bytes[idx] << 8) | bytes[idx + 1];
  const readU32 = (idx: number) =>
    isLE
      ? (bytes[idx] | (bytes[idx + 1] << 8) | (bytes[idx + 2] << 16) | (bytes[idx + 3] << 24)) >>> 0
      : ((bytes[idx] << 24) | (bytes[idx + 1] << 16) | (bytes[idx + 2] << 8) | bytes[idx + 3]) >>> 0;

  const tiffMagic = readU16(start + 2);
  if (tiffMagic !== 42) return;

  const ifd0Offset = readU32(start + 4);
  let cur = start + ifd0Offset;
  if (cur + 2 > end) return;

  const numEntries = readU16(cur);
  cur += 2;

  let make = "";
  let model = "";

  for (let i = 0; i < numEntries && cur + 12 <= end; i++, cur += 12) {
    const tag = readU16(cur);
    const count = readU32(cur + 4);

    if (tag === 0x0112) {
      // Orientation
      result.orientation = readU16(cur + 8);
      result.tagsFound.push(`Orientation Tag (${result.orientation})`);
    } else if (tag === 0x8825) {
      // GPS IFD
      result.hasGps = true;
      result.tagsFound.push("GPS Coordinates & Telemetry");
    } else if (tag === 0x010f) {
      // Make
      const valOffset = count > 4 ? start + readU32(cur + 8) : cur + 8;
      make = readAscii(bytes, valOffset, Math.min(count, 32));
    } else if (tag === 0x0110) {
      // Model
      const valOffset = count > 4 ? start + readU32(cur + 8) : cur + 8;
      model = readAscii(bytes, valOffset, Math.min(count, 32));
    } else if (tag === 0x9003 || tag === 0x0132) {
      // DateTime
      const valOffset = count > 4 ? start + readU32(cur + 8) : cur + 8;
      result.dateTime = readAscii(bytes, valOffset, Math.min(count, 20));
      result.tagsFound.push("Timestamp / Date Created");
    }
  }

  if (make || model) {
    result.camera = `${make} ${model}`.trim();
    result.tagsFound.push(`Camera (${result.camera})`);
  }
}

function readAscii(bytes: Uint8Array, start: number, maxLen: number): string {
  let str = "";
  for (let i = 0; i < maxLen && start + i < bytes.length; i++) {
    const code = bytes[start + i];
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str.trim();
}

/** Parse PNG chunks for tEXt, zTXt, iTXt, eXIf */
function inspectPng(bytes: Uint8Array): DetectedMetadata {
  const result: DetectedMetadata = {
    format: "png",
    hasExif: false,
    hasGps: false,
    hasXmp: false,
    hasIcc: false,
    hasIptc: false,
    hasTextComments: false,
    tagsFound: [],
  };

  if (bytes.length < 8) return result;
  // PNG signature: \x89PNG\r\n\x1a\n
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
    return result;
  }

  let offset = 8;
  const len = bytes.length;

  while (offset + 8 <= len) {
    const chunkLen =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];
    const chunkType = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    const dataStart = offset + 8;
    offset += 12 + chunkLen;

    if (chunkType === "eXIf") {
      result.hasExif = true;
      result.tagsFound.push("PNG eXIf Chunk");
      parseExifTiff(bytes, dataStart, dataStart + chunkLen, result);
    } else if (chunkType === "tEXt" || chunkType === "zTXt") {
      result.hasTextComments = true;
      result.tagsFound.push(`PNG ${chunkType} text metadata`);
    } else if (chunkType === "iTXt") {
      result.hasTextComments = true;
      const sample = String.fromCharCode(...bytes.slice(dataStart, Math.min(dataStart + 40, len)));
      if (sample.includes("XML:com.adobe.xmp")) {
        result.hasXmp = true;
        result.tagsFound.push("PNG XMP Packet");
      } else {
        result.tagsFound.push("PNG iTXt metadata");
      }
    } else if (chunkType === "iCCP") {
      result.hasIcc = true;
      result.tagsFound.push("ICC Profile Chunk");
    } else if (chunkType === "tIME") {
      result.tagsFound.push("PNG Modification Timestamp");
    } else if (chunkType === "IEND") {
      break;
    }
  }

  return result;
}

/** Parse WebP chunks for EXIF and XMP */
function inspectWebP(bytes: Uint8Array): DetectedMetadata {
  const result: DetectedMetadata = {
    format: "webp",
    hasExif: false,
    hasGps: false,
    hasXmp: false,
    hasIcc: false,
    hasIptc: false,
    hasTextComments: false,
    tagsFound: [],
  };

  if (bytes.length < 12) return result;
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff !== "RIFF" || webp !== "WEBP") return result;

  let offset = 12;
  const len = bytes.length;

  while (offset + 8 <= len) {
    const chunkType = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const chunkLen =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24);
    const dataStart = offset + 8;
    offset += 8 + chunkLen + (chunkLen % 2); // padded to even

    if (chunkType === "EXIF") {
      result.hasExif = true;
      result.tagsFound.push("WebP EXIF Chunk");
      parseExifTiff(bytes, dataStart, dataStart + chunkLen, result);
    } else if (chunkType === "XMP ") {
      result.hasXmp = true;
      result.tagsFound.push("WebP XMP Chunk");
    } else if (chunkType === "ICCP") {
      result.hasIcc = true;
      result.tagsFound.push("WebP ICC Profile");
    }
  }

  return result;
}

/** Detect metadata across JPEG, PNG, and WebP */
export function detectImageMetadata(bytes: Uint8Array): DetectedMetadata {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return inspectJpeg(bytes);
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return inspectPng(bytes);
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return inspectWebP(bytes);
  }

  return {
    format: "unknown",
    hasExif: false,
    hasGps: false,
    hasXmp: false,
    hasIcc: false,
    hasIptc: false,
    hasTextComments: false,
    tagsFound: [],
  };
}

/**
 * Returns a human-friendly label and description for any orientation tag (1-8).
 */
export function orientationLabel(tag?: number): { label: string; desc: string } {
  switch (tag) {
    case 1:
      return { label: "1 (Standard)", desc: "Upright, 0° rotation" };
    case 2:
      return { label: "2 (Mirrored)", desc: "Flipped horizontally" };
    case 3:
      return { label: "3 (180°)", desc: "Upside-down, rotated 180°" };
    case 4:
      return { label: "4 (Flipped)", desc: "Flipped vertically" };
    case 5:
      return { label: "5 (Transposed)", desc: "Mirrored horizontally and rotated 270° CW" };
    case 6:
      return { label: "6 (90° CW)", desc: "Rotated 90° clockwise (portrait phone shot)" };
    case 7:
      return { label: "7 (Transverse)", desc: "Mirrored horizontally and rotated 90° CW" };
    case 8:
      return { label: "8 (270° CW)", desc: "Rotated 270° clockwise" };
    default:
      return { label: "None", desc: "No orientation tag present; standard raster layout" };
  }
}

