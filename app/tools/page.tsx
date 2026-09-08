import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Coffee, Github } from "lucide-react";

import { DATA } from "../data";
import {
  BUY_ME_A_COFFEE,
  SITE_URL,
  TOOLS_DESCRIPTION,
  TOOLS_H1,
  TOOLS_TITLE,
  buildToolsSchema,
} from "../lib/seo";

/**
 * Unlike the three portfolio layouts, this is a plain server component.
 *
 * That is the whole point of it: the copy, the headings and every tool name are
 * in the HTML that ships, so this page needs none of the sr-only workaround the
 * homepage requires. It also means no framer-motion here — transitions are CSS.
 *
 * Different audience, too. Someone searching "png to ico converter" is looking
 * for a tool, not for someone to hire, so the copy targets that and the support
 * link lives here rather than on a CV.
 */

const UTILITIES = DATA.projects.filter((project) => project.kind === "utility");

export const metadata: Metadata = {
  title: TOOLS_TITLE,
  description: TOOLS_DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: TOOLS_TITLE,
    description: TOOLS_DESCRIPTION,
    url: `${SITE_URL}/tools`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TOOLS_TITLE,
    description: TOOLS_DESCRIPTION,
  },
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildToolsSchema(UTILITIES)) }}
      />

      {/* Ambient wash, CSS only — no canvas on this page, it would be dead weight. */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,#0b1220_0%,#020617_60%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-28">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-xs tracking-widest text-slate-500 transition-colors hover:text-blue-400"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          SALIM MAY — PORTFOLIO
        </Link>

        <header className="mt-10 border-b border-slate-800/80 pb-12">
          <p className="font-mono text-xs tracking-[0.25em] text-blue-400">{"///"} TOOLS</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            {TOOLS_H1}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Small things I needed and could not find a decent free version of, so I wrote
            them. No accounts, no telemetry, no upsell — take them, use them, fork them.
          </p>

          {BUY_ME_A_COFFEE && (
            <a
              href={BUY_ME_A_COFFEE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 font-mono text-sm text-amber-300 transition-colors hover:border-amber-400/60 hover:text-amber-200"
            >
              <Coffee size={15} />
              Buy me a coffee
            </a>
          )}
        </header>

        <section aria-label="Tools" className="mt-14 grid gap-5 md:grid-cols-2">
          {UTILITIES.map((tool) => (
            <article
              key={tool.id}
              className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-blue-500/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{tool.title}</h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {tool.category}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] ${tool.color}`}>
                  {tool.tag}
                </span>
              </div>

              <p className="mt-4 flex-1 leading-relaxed text-slate-400">{tool.desc}</p>

              {tool.tech.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tool.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-slate-800 bg-slate-950/70 px-2 py-0.5 font-mono text-[11px] text-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {tool.link ? (
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 font-mono text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  <Github size={14} />
                  Source
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ) : (
                /* Better to say so than to ship a link to a repo that 404s. */
                <p className="mt-6 font-mono text-xs text-slate-600">Source coming soon</p>
              )}
            </article>
          ))}
        </section>

        <footer className="mt-20 border-t border-slate-800/80 pt-8">
          <p className="font-mono text-xs text-slate-600">
            {"//"} Built by{" "}
            <Link href="/" className="text-slate-400 transition-colors hover:text-blue-400">
              {DATA.personal.name}
            </Link>{" "}
            in {DATA.personal.location} —{" "}
            <a
              href={`mailto:${DATA.personal.email}`}
              className="text-slate-400 transition-colors hover:text-blue-400"
            >
              {DATA.personal.email}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
