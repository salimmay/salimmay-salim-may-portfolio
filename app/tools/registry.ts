/**
 * The tool collection.
 *
 * Single source of truth: the terminal index, the /tools/[slug] routes, the
 * sitemap and the structured data all read from here. Adding a tool is one
 * entry plus one component — no per-tool routing, metadata or schema work.
 *
 * Data only, deliberately. No React imports, so the sitemap and schema builders
 * can pull this in without dragging component code with them.
 */

export type ToolKind =
  /** Runs in the browser, on this site. */
  | "browser"
  /** A standalone application that lives somewhere else. */
  | "download";

export type Tool = {
  slug: string;
  name: string;
  /** One line for the terminal listing. Keep it short — it truncates. */
  blurb: string;
  /** Fuller description for the tool page and its meta description. */
  description: string;
  category: "Images" | "Colour" | "Privacy" | "Media";
  category: "Images" | "Colour" | "Privacy" | "Media" | "Developer" | "Security";
  kind: ToolKind;
  /** Search terms this tool should be findable by. Drives page metadata. */
  keywords: string[];
  /** Present for kind: "download", absent for browser tools. */
  link?: string;
  /** False until the component exists — the terminal marks these "soon". */
  ready: boolean;
};

export const TOOLS: Tool[] = [
  {
    slug: "image-converter",
    name: "Image Converter",
    blurb: "Convert and resize images, or build a full favicon pack",
    description:
      "Convert PNG, JPEG, WebP, GIF and SVG into ICO, PNG, JPEG or WebP, at any size. Or generate a complete favicon pack — multi-size .ico, Apple touch icon, PWA icons and a web manifest — as a single zip. Everything runs in your browser; no file is ever uploaded.",
    category: "Images",
    kind: "browser",
    keywords: [
      "png to ico",
      "favicon generator",
      "image converter",
      "jpeg to webp",
      "resize image online",
      "favicon pack",
    ],
    ready: true,
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    blurb: "Shrink JPEG, PNG and WebP with a live size readout",
    description:
      "Compress images with a quality slider and see the before and after size as you drag it. Runs entirely in the browser.",
    category: "Images",
    kind: "browser",
    keywords: ["compress image", "shrink png", "reduce image size", "optimise jpeg"],
    ready: false,
  },
  {
    slug: "metadata-stripper",
    name: "Metadata Stripper",
    blurb: "Remove EXIF and GPS data before you post an image",
    description:
      "Photographs carry the camera, the timestamp and often the exact coordinates where they were taken. This strips all of it, without the file leaving your machine.",
    category: "Privacy",
    kind: "browser",
    keywords: ["remove exif", "strip gps from photo", "image metadata remover", "exif cleaner"],
    ready: true,
  },
  {
    slug: "colour-converter",
    name: "Colour Converter",
    blurb: "Convert between hex, RGB, HSL and OKLCH",
    description:
      "Convert a colour between every notation CSS understands, including OKLCH, with copyable output in each.",
    category: "Colour",
    kind: "browser",
    keywords: ["hex to rgb", "rgb to hsl", "oklch converter", "css colour converter"],
    ready: true,
  },
  {
    slug: "contrast-checker",
    name: "Contrast Checker",
    blurb: "Check a colour pair against WCAG AA and AAA",
    description:
      "Enter a foreground and background colour and see the contrast ratio, with a pass or fail against WCAG AA and AAA for both normal and large text.",
    category: "Colour",
    kind: "browser",
    keywords: ["wcag contrast checker", "colour contrast ratio", "accessibility contrast"],
    ready: true,
  },
  {
    slug: "palette-extractor",
    name: "Palette Extractor",
    blurb: "Pull the dominant colours out of an image",
    description:
      "Drop in an image and get its dominant colours as a palette, with hex values you can copy.",
    category: "Colour",
    kind: "browser",
    keywords: ["extract colours from image", "image palette generator", "dominant colour"],
    ready: true,
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    blurb: "Generate SVG and PNG QR codes with custom styling",
    description:
      "Generate high-resolution QR codes for URLs, Wi-Fi networks, vCards, emails, phone numbers, and raw text. Customize foreground and background colors, error-correction levels, and quiet zone margins with instant SVG and PNG downloads.",
    category: "Developer",
    kind: "browser",
    keywords: [
      "qr code generator",
      "wifi qr code",
      "vcard qr code",
      "svg qr code",
      "custom qr code generator",
    ],
    ready: true,
  },
  {
    slug: "css-box-shadow-generator",
    name: "CSS Box Shadow Generator",
    blurb: "Layer multi-stage box shadows with live preview",
    description:
      "Build multi-layer CSS box shadows with live controls for offset, blur, spread, color, opacity, and inset. Test against light and dark surfaces, reorder layers, and copy valid CSS.",
    category: "Developer",
    kind: "browser",
    keywords: [
      "css box shadow generator",
      "box shadow generator",
      "smooth shadow css",
      "multi layer shadow",
      "css shadow tool",
    ],
    ready: true,
  },
  {
    slug: "svg-optimizer",
    name: "SVG Optimizer",
    blurb: "Clean bloated markup and metadata from SVG files",
    description:
      "Safely sanitize and minify SVG files by stripping XML comments, editor metadata, non-rendering tags, scripts, and redundant whitespace. Compares byte sizes with live preview and safe download.",
    category: "Images",
    kind: "browser",
    keywords: [
      "svg optimizer",
      "minify svg",
      "clean svg online",
      "svg sanitizer",
      "remove svg metadata",
    ],
    ready: true,
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    blurb: "Cryptographically secure passwords with entropy readout",
    description:
      "Generate cryptographically secure passwords using window.crypto.getRandomValues. Customize length, character sets, and ambiguous character filtering with guaranteed group inclusion, unbiased Fisher-Yates shuffle, and NIST entropy estimation.",
    category: "Security",
    kind: "browser",
    keywords: [
      "password generator",
      "secure password generator",
      "csprng password",
      "random password generator",
      "password entropy",
    ],
    ready: true,
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    blurb: "Convert Unix timestamps, ISO dates, and local times",
    description:
      "Convert between Unix seconds, milliseconds, ISO 8601, UTC, and your local timezone. Supports past/future dates before 1970, relative time readouts, and a live ticking clock.",
    category: "Developer",
    kind: "browser",
    keywords: [
      "unix timestamp converter",
      "epoch converter",
      "iso 8601 to unix",
      "milliseconds to date",
      "relative time calculator",
    ],
    ready: true,
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    blurb: "Format, validate, minify, and sort JSON keys",
    description:
      "Format, indent, validate, and minify JSON documents locally. Sort object keys alphabetically (shallow or deep), locate syntax error line and column numbers, and copy or download the result.",
    category: "Developer",
    kind: "browser",
    keywords: [
      "json formatter",
      "json validator",
      "minify json",
      "sort json keys",
      "pretty print json",
    ],
    ready: true,
  },
  {
    slug: "zenith",
    name: "Zenith",
    blurb: "Track the shows you are part-way through",
    description:
      "A tracker for what you have watched, what is next, and what you abandoned three episodes in. Express and MongoDB behind a JWT login.",
    category: "Media",
    kind: "download",
    keywords: ["tv show tracker", "series tracker"],
    link: "https://github.com/salimmay/zenith",
    ready: true,
  },
  {
    slug: "download-manager",
    name: "Download Manager",
    blurb: "Segmented downloads with pause and resume",
    description:
      "A download manager in the vein of IDM — segmented downloads, pause and resume, and a queue that survives being closed.",
    category: "Media",
    kind: "download",
    keywords: ["download manager", "idm alternative"],
    ready: false,
  },
];

export const BROWSER_TOOLS = TOOLS.filter((tool) => tool.kind === "browser");
export const READY_TOOLS = TOOLS.filter((tool) => tool.ready);

export const toolBySlug = (slug: string) => TOOLS.find((tool) => tool.slug === slug);

/** Only tools with a real page get routes and sitemap entries. */
export const ROUTABLE_TOOLS = TOOLS.filter((tool) => tool.kind === "browser" && tool.ready);
