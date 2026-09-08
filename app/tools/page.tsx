import type { Metadata } from "next";

import { DATA } from "../data";
import {
  SITE_URL,
  TOOLS_DESCRIPTION,
  TOOLS_TITLE,
  buildToolsSchema,
} from "../lib/seo";
import TerminalBackdrop from "./TerminalBackdrop";
import ToolsTerminal from "./ToolsTerminal";

/**
 * Server component. The metadata and JSON-LD are emitted here, and the two
 * children are client components — which still server-render, so every tool
 * name and description is in the shipped HTML.
 *
 * Worth stating plainly, because it is the trap this page was designed around:
 * "use client" does not mean "invisible to crawlers". The homepage ships an
 * empty body because ModelLayout is dynamic(ssr:false) behind a mount gate, not
 * because it is interactive. Nothing here uses either, so the terminal is fully
 * indexable while still being a working REPL.
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
    <main className="relative min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildToolsSchema(UTILITIES)) }}
      />

      <TerminalBackdrop />
      <ToolsTerminal />
    </main>
  );
}
