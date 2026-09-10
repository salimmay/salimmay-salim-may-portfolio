import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coffee } from "lucide-react";

import { BUY_ME_A_COFFEE, SITE_URL } from "../../lib/seo";
import { ROUTABLE_TOOLS, toolBySlug } from "../registry";
import TerminalBackdrop from "../TerminalBackdrop";
import ImageConverter from "../_components/ImageConverter";
import ColourConverter from "../_components/ColourConverter";
import ContrastChecker from "../_components/ContrastChecker";
import MetadataStripper from "../_components/MetadataStripper";
import PaletteExtractor from "../_components/PaletteExtractor";
import QrCodeGenerator from "../_components/QrCodeGenerator";
import BoxShadowGenerator from "../_components/BoxShadowGenerator";
import SvgOptimizer from "../_components/SvgOptimizer";
import PasswordGenerator from "../_components/PasswordGenerator";
import TimestampConverter from "../_components/TimestampConverter";
import JsonFormatter from "../_components/JsonFormatter";

/**
 * One route for every browser tool in the registry.
 *
 * generateStaticParams prerenders each one, so each tool gets a real static
 * page with its own title, description and heading — which is the entire point.
 * "png to ico" is a search someone makes; it needs a page of its own to land on,
 * not an anchor on a shared index.
 */

const COMPONENTS: Record<string, React.ComponentType> = {
  "image-converter": ImageConverter,
  "colour-converter": ColourConverter,
  "contrast-checker": ContrastChecker,
  "metadata-stripper": MetadataStripper,
  "palette-extractor": PaletteExtractor,
  "qr-code-generator": QrCodeGenerator,
  "css-box-shadow-generator": BoxShadowGenerator,
  "svg-optimizer": SvgOptimizer,
  "password-generator": PasswordGenerator,
  "timestamp-converter": TimestampConverter,
  "json-formatter": JsonFormatter,
};

export function generateStaticParams() {
  return ROUTABLE_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) return {};

  const title = `${tool.name} — free, in your browser | Salim May`;
  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title,
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.slug}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: tool.description },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool || !tool.ready || tool.kind !== "browser") notFound();

  const Component = COMPONENTS[tool.slug];
  if (!Component) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any — runs in the browser",
    url: `${SITE_URL}/tools/${tool.slug}`,
    author: { "@id": `${SITE_URL}/#salim` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className="relative min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <TerminalBackdrop />

      <div className="relative mx-auto max-w-3xl px-5 py-14 md:px-6 md:py-20">
        <div className="flex items-center justify-between">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2 font-mono text-xs tracking-widest text-slate-500 transition-colors hover:text-blue-400"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            ALL TOOLS
          </Link>

          {BUY_ME_A_COFFEE ? (
            <a
              href={BUY_ME_A_COFFEE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs text-amber-300 transition-colors hover:border-amber-500/50 hover:bg-amber-500/20"
              title="Support this project"
            >
              <Coffee size={12} />
              <span>support</span>
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 font-mono text-[11px] text-amber-400/70"
              title="Buy Me a Coffee link coming soon"
            >
              <Coffee size={11} />
              <span>coffee [soon]</span>
            </span>
          )}
        </div>

        <header className="mt-8">
          <p className="font-mono text-xs tracking-[0.25em] text-blue-400">
            {"///"} {tool.category.toUpperCase()}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">{tool.name}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-slate-400">{tool.description}</p>
        </header>

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-sm md:p-7">
          <Component />
        </div>

        <p className="mt-8 font-mono text-[11px] leading-relaxed text-slate-600">
          {"//"} Runs entirely in your browser. Nothing is uploaded, nothing is stored, and it keeps
          working with the network off.
        </p>
      </div>
    </main>
  );
}
