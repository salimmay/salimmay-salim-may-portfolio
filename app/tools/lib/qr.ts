import QRCode from "qrcode";

export type QrContentType = "text" | "url" | "wifi" | "vcard" | "email" | "phone" | "sms";

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export type WifiPayload = {
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  hidden?: boolean;
};

export type VCardPayload = {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
};

export type EmailPayload = {
  email: string;
  subject?: string;
  body?: string;
};

export type SmsPayload = {
  phone: string;
  message?: string;
};

export type QrOptions = {
  errorCorrectionLevel?: QrErrorCorrectionLevel;
  margin?: number; // quiet zone in blocks
  width?: number; // pixel width for raster
  darkColor?: string; // hex
  lightColor?: string; // hex
};

/**
 * Escape special characters in Wi-Fi SSID and Password according to the ZXing standard:
 * \ -> \\, ; -> \;, , -> \,, : -> \:
 */
export function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"'])/g, "\\$1");
}

export function formatWifi(payload: WifiPayload): string {
  const enc = payload.encryption || "WPA";
  const ssid = escapeWifiString(payload.ssid || "");
  const pass = enc !== "nopass" && payload.password ? escapeWifiString(payload.password) : "";
  const hidden = payload.hidden ? "true" : "false";

  let out = `WIFI:T:${enc};S:${ssid};`;
  if (enc !== "nopass") {
    out += `P:${pass};`;
  }
  if (payload.hidden) {
    out += `H:${hidden};`;
  }
  out += ";";
  return out;
}

export function formatVCard(payload: VCardPayload): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${payload.lastName || ""};${payload.firstName || ""};;;`,
    `FN:${[payload.firstName, payload.lastName].filter(Boolean).join(" ").trim()}`,
  ];

  if (payload.organization) lines.push(`ORG:${payload.organization}`);
  if (payload.title) lines.push(`TITLE:${payload.title}`);
  if (payload.phone) lines.push(`TEL;TYPE=CELL:${payload.phone}`);
  if (payload.email) lines.push(`EMAIL:${payload.email}`);
  if (payload.url) lines.push(`URL:${payload.url}`);

  lines.push("END:VCARD");
  return lines.join("\n");
}

export function formatEmail(payload: EmailPayload): string {
  const email = (payload.email || "").trim();
  const params: string[] = [];
  if (payload.subject) params.push(`subject=${encodeURIComponent(payload.subject)}`);
  if (payload.body) params.push(`body=${encodeURIComponent(payload.body)}`);

  return `mailto:${email}${params.length ? "?" + params.join("&") : ""}`;
}

export function formatSms(payload: SmsPayload): string {
  const phone = (payload.phone || "").trim().replace(/\s+/g, "");
  const msg = payload.message ? `:${payload.message}` : "";
  return `smsto:${phone}${msg}`;
}

export function formatPhone(phone: string): string {
  return `tel:${phone.trim().replace(/\s+/g, "")}`;
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generate a standalone, scalable SVG string of the QR Code.
 */
export async function generateQrSvg(text: string, options: QrOptions = {}): Promise<string> {
  const opts: QRCode.QRCodeToStringOptions = {
    type: "svg",
    margin: options.margin ?? 4,
    errorCorrectionLevel: options.errorCorrectionLevel ?? "M",
    color: {
      dark: options.darkColor ?? "#000000",
      light: options.lightColor ?? "#ffffff",
    },
  };

  return QRCode.toString(text || " ", opts);
}

/**
 * Generate a raster PNG data URL of the QR Code.
 */
export async function generateQrDataUrl(text: string, options: QrOptions = {}): Promise<string> {
  const opts: QRCode.QRCodeToDataURLOptions = {
    margin: options.margin ?? 4,
    width: options.width ?? 512,
    errorCorrectionLevel: options.errorCorrectionLevel ?? "M",
    color: {
      dark: options.darkColor ?? "#000000",
      light: options.lightColor ?? "#ffffff",
    },
  };

  return QRCode.toDataURL(text || " ", opts);
}

