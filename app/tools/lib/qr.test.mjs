import assert from "node:assert/strict";
import {
  escapeWifiString,
  formatWifi,
  formatVCard,
  formatEmail,
  formatSms,
  formatPhone,
  normalizeUrl,
  generateQrSvg,
} from "./qr.ts";

console.log("── QR CODE FORMATTERS & GENERATION ──");

// 1. Wi-Fi escaping and formatting
assert.equal(escapeWifiString("My;Network:Special\\Name"), "My\\;Network\\:Special\\\\Name");
const wifiStr = formatWifi({
  ssid: "CoffeeShop",
  password: "Secret;Password:123",
  encryption: "WPA",
  hidden: true,
});
assert.equal(
  wifiStr,
  "WIFI:T:WPA;S:CoffeeShop;P:Secret\\;Password\\:123;H:true;;"
);
console.log("  ok   formatWifi encodes WPA with escaped characters and hidden flag");

const openWifi = formatWifi({
  ssid: "Guest",
  encryption: "nopass",
});
assert.equal(openWifi, "WIFI:T:nopass;S:Guest;;");
console.log("  ok   formatWifi handles open networks without password field");

// 2. vCard formatting
const vcard = formatVCard({
  firstName: "Salim",
  lastName: "May",
  organization: "Engineering",
  title: "Software Engineer",
  phone: "+216 12 345 678",
  email: "contact@salimmay.com",
  url: "https://salimmay.com",
});
assert.ok(vcard.includes("BEGIN:VCARD"));
assert.ok(vcard.includes("VERSION:3.0"));
assert.ok(vcard.includes("N:May;Salim;;;"));
assert.ok(vcard.includes("FN:Salim May"));
assert.ok(vcard.includes("TEL;TYPE=CELL:+216 12 345 678"));
assert.ok(vcard.includes("EMAIL:contact@salimmay.com"));
assert.ok(vcard.includes("END:VCARD"));
console.log("  ok   formatVCard generates compliant vCard 3.0");

// 3. Email and SMS
assert.equal(
  formatEmail({ email: "test@example.com", subject: "Hello", body: "World & More" }),
  "mailto:test@example.com?subject=Hello&body=World%20%26%20More"
);
assert.equal(formatSms({ phone: "+1 234 567", message: "Hi!" }), "smsto:+1234567:Hi!");
assert.equal(formatPhone("+1 (555) 0199"), "tel:+1(555)0199");
console.log("  ok   formatEmail, formatSms, formatPhone create standard URI schemes");

// 4. URL normalization
assert.equal(normalizeUrl("salimmay.com"), "https://salimmay.com");
assert.equal(normalizeUrl("http://localhost:3000"), "http://localhost:3000");
assert.equal(normalizeUrl("https://example.com/test?q=1"), "https://example.com/test?q=1");
console.log("  ok   normalizeUrl preserves schemes and prepends https://");

// 5. SVG generation with qrcode
const svg = await generateQrSvg("https://salimmay.com", {
  errorCorrectionLevel: "H",
  darkColor: "#3b82f6",
  lightColor: "#020617",
  margin: 2,
});
assert.ok(svg.startsWith("<svg"));
assert.ok(svg.includes("#3b82f6"));
assert.ok(svg.includes("#020617"));
console.log("  ok   generateQrSvg produces valid SVG string with custom colors and margin");

console.log("\nall checks passed");

