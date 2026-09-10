"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Coffee, Github, Terminal as TerminalIcon } from "lucide-react";

import { DATA } from "../data";
import { BUY_ME_A_COFFEE, TOOLS_H1 } from "../lib/seo";
import { TOOLS, type Tool } from "./registry";

/**
 * /tools index, as a working package manager.
 *
 * Two rules shaped this file:
 *
 * 1. The listing is rendered, never typed. A terminal that builds its text
 *    character-by-character from an empty string ships an empty <body> — the
 *    exact bug that made the homepage invisible to crawlers that don't run JS.
 *    Here the text is always in the DOM and the entrance is a CSS reveal with
 *    animation-fill-mode: both, so it is present and visible with JS off.
 *
 * 2. The prompt is real. Commands execute, with history on the arrow keys and
 *    tab completion on tool names. A terminal that only pretends to take input
 *    is set dressing; this one is the index.
 */

type Line = { kind: "in" | "out" | "err"; text: string };

const PROMPT = "salim@tools:~$";

const CATEGORY_COLOR: Record<Tool["category"], string> = {
  Images: "text-blue-400 border-blue-500/30",
  Colour: "text-violet-400 border-violet-500/30",
  Privacy: "text-emerald-400 border-emerald-500/30",
  Media: "text-amber-400 border-amber-500/30",
  Developer: "text-sky-400 border-sky-500/30",
  Security: "text-rose-400 border-rose-500/30",
};

const HELP: Line[] = [
  { kind: "out", text: "available commands" },
  { kind: "out", text: "  ls                 list every tool" },
  { kind: "out", text: "  info <name>        what a tool does" },
  { kind: "out", text: "  open <name>        launch it (or open its repo)" },
  { kind: "out", text: "  coffee             support the work" },
  { kind: "out", text: "  whoami             who built these" },
  { kind: "out", text: "  home               back to the portfolio" },
  { kind: "out", text: "  clear              clear the log" },
];

export default function ToolsTerminal() {
  const router = useRouter();
  const [log, setLog] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const slugs = useMemo(() => TOOLS.map((tool) => tool.slug), []);

  const push = useCallback((lines: Line[]) => {
    setLog((prev) => [...prev, ...lines]);
    requestAnimationFrame(() =>
      logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    );
  }, []);

  const find = (arg: string) =>
    TOOLS.find(
      (tool) => tool.slug === arg.toLowerCase() || tool.name.toLowerCase() === arg.toLowerCase()
    );

  const run = useCallback(
    (raw: string) => {
      const entry = raw.trim();
      if (!entry) return;

      setHistory((prev) => [entry, ...prev].slice(0, 50));
      setHistoryIndex(-1);

      const [command, ...rest] = entry.split(/\s+/);
      const arg = rest.join(" ");
      const echo: Line = { kind: "in", text: entry };

      switch (command.toLowerCase()) {
        case "help":
          push([echo, ...HELP]);
          break;

        case "ls":
          push([
            echo,
            ...TOOLS.map((tool) => ({
              kind: "out" as const,
              text: `  ${tool.slug.padEnd(20)} ${tool.ready ? "" : "[soon] "}${tool.blurb}`,
            })),
            { kind: "out", text: `${TOOLS.length} tools · ${TOOLS.filter((t) => t.ready).length} ready` },
          ]);
          break;

        case "info":
        case "cat": {
          const tool = find(arg);
          if (!tool) {
            push([echo, { kind: "err", text: `no such tool: ${arg || "(nothing given)"}` }]);
            break;
          }
          push([
            echo,
            { kind: "out", text: `${tool.name} — ${tool.category}` },
            { kind: "out", text: tool.description },
            {
              kind: "out",
              text: tool.kind === "browser" ? "runs: in this browser" : "runs: standalone application",
            },
            { kind: "out", text: tool.ready ? "status: ready" : "status: not built yet" },
          ]);
          break;
        }

        case "run":
        case "open": {
          const tool = find(arg);
          if (!tool) {
            push([echo, { kind: "err", text: `no such tool: ${arg || "(nothing given)"}` }]);
            break;
          }
          if (!tool.ready) {
            push([echo, { kind: "err", text: `${tool.name} is not built yet` }]);
            break;
          }
          if (tool.kind === "browser") {
            push([echo, { kind: "out", text: `launching ${tool.name}…` }]);
            router.push(`/tools/${tool.slug}`);
          } else if (tool.link) {
            push([echo, { kind: "out", text: `opening ${tool.link}` }]);
            window.open(tool.link, "_blank", "noopener,noreferrer");
          } else {
            push([echo, { kind: "err", text: `${tool.name} has no public repository yet` }]);
          }
          break;
        }

        case "coffee":
          if (BUY_ME_A_COFFEE) {
            push([echo, { kind: "out", text: "thank you, genuinely." }]);
            window.open(BUY_ME_A_COFFEE, "_blank", "noopener,noreferrer");
          } else {
            push([
              echo,
              { kind: "out", text: "Buy Me a Coffee link is coming soon!" },
              { kind: "out", text: "Every tool here runs 100% in your browser and is free forever." },
            ]);
          }
          break;

        case "whoami":
          push([
            echo,
            { kind: "out", text: `${DATA.personal.name} — ${DATA.personal.role}` },
            { kind: "out", text: DATA.personal.location },
            { kind: "out", text: DATA.personal.email },
          ]);
          break;

        case "home":
        case "cd":
          push([echo, { kind: "out", text: "returning to the portfolio…" }]);
          router.push("/");
          break;

        case "clear":
          setLog([]);
          break;

        default:
          push([echo, { kind: "err", text: `${command}: command not found — try 'help'` }]);
      }
    },
    [push, router]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) {
        setHistoryIndex(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(next >= 0 ? history[next] : "");
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length < 2) return;
      const partial = parts[parts.length - 1].toLowerCase();
      const match = slugs.find((slug) => slug.startsWith(partial));
      if (match) setInput([...parts.slice(0, -1), match].join(" "));
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-[0_0_80px_rgba(37,99,235,0.10)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            </div>
            <p className="flex items-center gap-2 font-mono text-xs text-slate-500">
              <TerminalIcon size={12} />
              salim@tools — {TOOLS.length} packages
            </p>
          </div>

          <button
            type="button"
            onClick={() => run("coffee")}
            className="flex items-center gap-1.5 rounded border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 font-mono text-xs text-amber-400 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
            title={BUY_ME_A_COFFEE ? "Support Salim on Buy Me a Coffee" : "Buy Me a Coffee (coming soon)"}
          >
            <Coffee size={12} />
            <span>coffee</span>
            {!BUY_ME_A_COFFEE && <span className="text-[10px] text-amber-500/70">[soon]</span>}
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 font-mono text-sm leading-relaxed md:p-7">
          <p className="animate-term-line text-slate-500" style={{ animationDelay: "40ms" }}>
            <span className="text-emerald-400">{PROMPT}</span> ls --all
          </p>

          <h1
            className="animate-term-line mt-4 text-xl font-bold text-white md:text-2xl"
            style={{ animationDelay: "120ms" }}
          >
            {TOOLS_H1}
          </h1>
          <p
            className="animate-term-line mt-2 max-w-2xl text-slate-400"
            style={{ animationDelay: "180ms" }}
          >
            Small things I needed and could not find a decent free version of, so I wrote them.
            No accounts, no telemetry, no upsell — and the browser ones never upload your files.
          </p>

          <div className="mt-7 space-y-1">
            {TOOLS.map((tool, i) => {
              const href = tool.kind === "browser" ? `/tools/${tool.slug}` : tool.link;
              const inner = (
                <>
                  <span className="text-blue-500">{tool.ready ? "▸" : "·"}</span>
                  <h2 className="shrink-0 font-bold text-white">{tool.slug}</h2>
                  <span className="hidden shrink-0 text-slate-700 sm:inline">
                    {"·".repeat(Math.max(2, 22 - tool.slug.length))}
                  </span>
                  <span className="flex-1 truncate text-slate-400">{tool.blurb}</span>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-[10px] ${CATEGORY_COLOR[tool.category]}`}
                  >
                    {tool.ready ? tool.category.toLowerCase() : "soon"}
                  </span>
                </>
              );

              return (
                <div key={tool.slug} className="animate-term-line" style={{ animationDelay: `${260 + i * 70}ms` }}>
                  {tool.ready && href ? (
                    tool.kind === "browser" ? (
                      <Link
                        href={href}
                        className="group flex items-baseline gap-3 rounded px-2 py-2 transition-colors hover:bg-blue-500/5"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline gap-3 rounded px-2 py-2 transition-colors hover:bg-blue-500/5"
                      >
                        {inner}
                        <Github size={12} className="shrink-0 text-slate-600" />
                      </a>
                    )
                  ) : (
                    <div className="flex items-baseline gap-3 rounded px-2 py-2 opacity-50">{inner}</div>
                  )}
                </div>
              );
            })}
          </div>

          {log.length > 0 && (
            <div className="mt-6 space-y-0.5 border-t border-slate-900 pt-5">
              {log.map((line, i) => (
                <p
                  key={i}
                  className={
                    line.kind === "in"
                      ? "text-slate-300"
                      : line.kind === "err"
                        ? "text-red-400/90"
                        : "whitespace-pre-wrap text-slate-400"
                  }
                >
                  {line.kind === "in" && <span className="text-emerald-400">{PROMPT} </span>}
                  {line.text}
                </p>
              ))}
            </div>
          )}
          <div ref={logEndRef} />

          <div
            className="mt-5 flex items-center gap-2 border-t border-slate-900 pt-5"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="shrink-0 text-emerald-400">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input. Type help for available commands."
              placeholder="type 'help', or 'open image-converter'"
              className="flex-1 bg-transparent text-slate-200 caret-blue-400 outline-none placeholder:text-slate-700"
            />
            <span className="animate-caret text-blue-400">▍</span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center font-mono text-xs text-slate-600">
        {"//"} arrows for history · tab completes a name ·{" "}
        <Link href="/" className="text-slate-500 transition-colors hover:text-blue-400">
          back to the portfolio
        </Link>{" "}
        <ArrowUpRight size={11} className="inline" />
      </p>
    </div>
  );
}
