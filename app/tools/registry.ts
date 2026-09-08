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
    ready: false,
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
    ready: false,
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
    ready: false,
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
    ready: false,
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
