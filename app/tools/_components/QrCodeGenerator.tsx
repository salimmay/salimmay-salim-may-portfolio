"use client";

import React, { useCallback, useEffect, useId, useState } from "react";
import {
  Check,
  Contact,
  Copy,
  Download,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  Sparkles,
  Type,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  formatEmail,
  formatPhone,
  formatSms,
  formatVCard,
  formatWifi,
  generateQrDataUrl,
  generateQrSvg,
  normalizeUrl,
  type EmailPayload,
  type QrContentType,
  type QrErrorCorrectionLevel,
  type SmsPayload,
  type VCardPayload,
  type WifiEncryption,
  type WifiPayload,
} from "../lib/qr";

const TABS: { id: QrContentType; label: string; icon: LucideIcon }[] = [
  { id: "url", label: "URL", icon: Globe },
  { id: "text", label: "Text", icon: Type },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "vcard", label: "vCard", icon: Contact },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
];

const ECL_OPTIONS: { id: QrErrorCorrectionLevel; label: string; desc: string }[] = [
  { id: "L", label: "L (7%)", desc: "Lowest density, high speed" },
  { id: "M", label: "M (15%)", desc: "Standard, balanced" },
  { id: "Q", label: "Q (25%)", desc: "High recovery" },
  { id: "H", label: "H (30%)", desc: "Maximum redundancy" },
];

export default function QrCodeGenerator() {
  const [tab, setTab] = useState<QrContentType>("url");

  // Form states
  const [rawText, setRawText] = useState("");
  const [urlInput, setUrlInput] = useState("https://salimmay.com");
  const [wifi, setWifi] = useState<WifiPayload>({
    ssid: "GuestNetwork",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardPayload>({
    firstName: "Salim",
    lastName: "May",
    organization: "Engineering",
    title: "Software Engineer",
    phone: "+216 00 000 000",
    email: "contact@salimmay.com",
    url: "https://salimmay.com",
  });
  const [email, setEmail] = useState<EmailPayload>({
    email: "hello@example.com",
    subject: "Inquiry",
    body: "Hi Salim,",
  });
  const [phone, setPhone] = useState("+1 555 0199");
  const [sms, setSms] = useState<SmsPayload>({ phone: "+1 555 0199", message: "Hello!" });

  // Customization styling
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [ecl, setEcl] = useState<QrErrorCorrectionLevel>("M");
  const [margin, setMargin] = useState(3);
  const [size, setSize] = useState(512);

  // Output previews
  const [svgString, setSvgString] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const darkPickerId = useId();
  const lightPickerId = useId();

  // Compute active payload text
  const computePayload = useCallback((): string => {
    switch (tab) {
      case "url":
        return normalizeUrl(urlInput);
      case "text":
        return rawText;
      case "wifi":
        return formatWifi(wifi);
      case "vcard":
        return formatVCard(vcard);
      case "email":
        return formatEmail(email);
      case "phone":
        return formatPhone(phone);
      case "sms":
        return formatSms(sms);
    }
  }, [tab, urlInput, rawText, wifi, vcard, email, phone, sms]);

  const activePayload = computePayload();

  // Update QR Code on changes
  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setError(null);
      if (!activePayload.trim()) {
        setSvgString("");
        setDataUrl("");
        return;
      }
      try {
        const svg = await generateQrSvg(activePayload, {
          errorCorrectionLevel: ecl,
          margin,
          darkColor,
          lightColor,
        });
        const png = await generateQrDataUrl(activePayload, {
          errorCorrectionLevel: ecl,
          margin,
          width: size,
          darkColor,
          lightColor,
        });
        if (!cancelled) {
          setSvgString(svg);
          setDataUrl(png);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to generate QR code");
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [activePayload, ecl, margin, darkColor, lightColor, size]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${tab}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${tab}-${size}px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Content Type Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Input Form Controls */}
        <div className="space-y-4 lg:col-span-7">
          {tab === "url" && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Destination URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none transition focus:border-blue-500"
              />
            </div>
          )}

          {tab === "text" && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Plain Text or Structured Data
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Type or paste any plain text..."
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none transition focus:border-blue-500"
              />
            </div>
          )}

          {tab === "wifi" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Network SSID
                </label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  placeholder="Wi-Fi Name"
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Encryption
                  </label>
                  <select
                    value={wifi.encryption}
                    onChange={(e) =>
                      setWifi({ ...wifi, encryption: e.target.value as WifiEncryption })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>

                {wifi.encryption !== "nopass" && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifi.password || ""}
                      onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                      placeholder="Network Password"
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 pt-1 text-slate-300">
                <input
                  type="checkbox"
                  checked={wifi.hidden || false}
                  onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 accent-blue-500"
                />
                <span>Hidden network</span>
              </label>
            </div>
          )}

          {tab === "vcard" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={vcard.firstName}
                    onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={vcard.lastName}
                    onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={vcard.organization || ""}
                    onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={vcard.title || ""}
                    onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={vcard.phone || ""}
                    onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={vcard.email || ""}
                    onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email.email}
                  onChange={(e) => setEmail({ ...email, email: e.target.value })}
                  placeholder="recipient@example.com"
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Subject
                </label>
                <input
                  type="text"
                  value={email.subject || ""}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Message Body
                </label>
                <textarea
                  rows={3}
                  value={email.body || ""}
                  onChange={(e) => setEmail({ ...email, body: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {tab === "phone" && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0199"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          )}

          {tab === "sms" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={sms.phone}
                  onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Preset Text Message
                </label>
                <textarea
                  rows={3}
                  value={sms.message || ""}
                  onChange={(e) => setSms({ ...sms, message: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Raw payload string inspector */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Raw Encoded Payload
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activePayload, "raw")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copied === "raw" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied === "raw" ? "Copied" : "Copy Payload"}</span>
              </button>
            </div>
            <pre className="mt-1.5 max-h-24 overflow-x-auto whitespace-pre-wrap break-all text-[11px] text-slate-400">
              {activePayload || "(empty)"}
            </pre>
          </div>

          {/* Customization Styling Accordion/Grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
            <h3 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-400" />
              Styling & Error Correction
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Foreground Color */}
              <div>
                <label htmlFor={darkPickerId} className="block text-[10px] uppercase text-slate-400 font-bold">
                  Foreground Color
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-700 focus-within:ring-2 focus-within:ring-blue-400">
                    <input
                      id={darkPickerId}
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer opacity-0"
                    />
                    <div className="h-full w-full" style={{ backgroundColor: darkColor }} />
                  </div>
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label htmlFor={lightPickerId} className="block text-[10px] uppercase text-slate-400 font-bold">
                  Background Color
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-700 focus-within:ring-2 focus-within:ring-blue-400">
                    <input
                      id={lightPickerId}
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer opacity-0"
                    />
                    <div className="h-full w-full" style={{ backgroundColor: lightColor }} />
                  </div>
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Error correction level */}
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-bold">
                Error Correction (Fault Tolerance)
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ECL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEcl(opt.id)}
                    className={`rounded border p-2 text-left transition-colors ${
                      ecl === opt.id
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="block font-bold">{opt.label}</span>
                    <span className="block text-[9px] text-slate-500 leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiet zone & Size */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Quiet Zone (Margin)</span>
                  <span>{margin} blocks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>PNG Output Resolution</span>
                  <span>{size} × {size}px</span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={2048}
                  step={128}
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Export Card */}
        <div className="flex flex-col items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl lg:col-span-5">
          <div className="w-full text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Live Scalable Preview
            </span>

            {/* QR Render Window */}
            <div className="mt-4 flex min-h-[260px] w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-6">
              {svgString ? (
                <div
                  className="max-h-[220px] max-w-[220px] shadow-lg transition-transform duration-200 hover:scale-105"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-600">
                  <QrCode size={36} />
                  <span>Enter data to render QR</span>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-2 text-[11px] text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <button
              type="button"
              disabled={!svgString}
              onClick={downloadSvg}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              <Download size={14} />
              <span>Download Vector SVG</span>
            </button>

            <button
              type="button"
              disabled={!dataUrl}
              onClick={downloadPng}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800 disabled:opacity-40"
            >
              <Download size={14} />
              <span>Download PNG ({size}×{size}px)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
