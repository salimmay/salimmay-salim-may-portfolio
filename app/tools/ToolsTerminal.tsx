"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Github, Terminal as TerminalIcon } from "lucide-react";

import { DATA } from "../data";
import { BUY_ME_A_COFFEE, TOOLS_H1 } from "../lib/seo";

/**
 * /tools as a working package manager.
 *
 * Two rules shaped this file:
 *
 * 1. The package listing is rendered statically, not typed out. A terminal page
 *    that builds its text character-by-character from an empty string ships an
 *    empty <body> — the exact bug that made the homepage invisible to every
 *    crawler that doesn't run JS. Here the text is always in the DOM and the
 *    entrance is a CSS reveal (animation-fill-mode: both), so it is present and
 *    visible even if JavaScript never executes.
 *
 * 2. The prompt is real. `ls`, `info`, `open`, `coffee` and the rest actually
 *    do something, with history on the arrow keys and tab completion on tool
 *    names. A terminal that only pretends to accept input is set dressing; this
 *    one is the point of the page.
 */

const UTILITIES = DATA.projects.filter((project) => project.kind === "utility");

type Line = { kind: "in" | "out" | "err"; text: string };

const PROMPT = "salim@tools:~$";

const HELP: Line[] = [
  { kind: "out", text: "available commands" },
  { kind: "out", text: "  ls                list every tool" },
  { kind: "out", text: "  info <name>       full description and stack" },
  { kind: "out", text: "  open <name>       open the source repository" },
  { kind: "out", text: "  coffee            support the work" },
  { kind: "out", text: "  whoami            who built these" },
  { kind: "out", text: "  home              back to the portfolio" },
  { kind: "out", text: "  clear             clear the log" },
];

export default function ToolsTerminal() {
  const [log, setLog] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => UTILITIES.map((tool) => tool.id), []);

  const push = useCallback((lines: Line[]) => {
    setLog((prev) => [...prev, ...lines]);
    // Let the DOM settle before scrolling to the new output.
    requestAnimationFrame(() => logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }, []);

  const find = (arg: string) =>
    UTILITIES.find(
      (tool) => tool.id === arg.toLowerCase() || tool.title.toLowerCase() === arg.toLowerCase()
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
            ...UTILITIES.map((tool) => ({
              kind: "out" as const,
              text: `  ${tool.id.padEnd(20)} ${tool.category}`,
            })),
            { kind: "out", text: `${UTILITIES.length} tools, all free.` },
          ]);
          break;

        case "info":
        case "cat": {
          const tool = find(arg);
          if (!tool) {
            push([echo, { kind: "err", text: `no such tool: ${arg || "(nothing given)"}` }]);
            break;
          }
          setExpanded(tool.id);
          push([
            echo,
            { kind: "out", text: tool.title },
            { kind: "out", text: tool.desc },
            {
              kind: "out",
              text: tool.tech.length ? `stack: ${tool.tech.join(", ")}` : "stack: not published yet",
            },
            { kind: "out", text: tool.link ? `source: ${tool.link}` : "source: coming soon" },
          ]);
          break;
        }

        case "open": {
          const tool = find(arg);
          if (!tool) {
            push([echo, { kind: "err", text: `no such tool: ${arg || "(nothing given)"}` }]);
            break;
          }
          if (!tool.link) {
            push([echo, { kind: "err", text: `${tool.title} has no public repository yet` }]);
            break;
          }
          push([echo, { kind: "out", text: `opening ${tool.link}` }]);
          window.open(tool.link, "_blank", "noopener,noreferrer");
          break;
        }

        case "coffee":
          if (BUY_ME_A_COFFEE) {
            push([echo, { kind: "out", text: "thank you, genuinely." }]);
            window.open(BUY_ME_A_COFFEE, "_blank", "noopener,noreferrer");
          } else {
            push([echo, { kind: "out", text: "not set up yet — the tools are free regardless." }]);
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
          window.location.href = "/";
          break;

        case "clear":
          setLog([]);
          break;

        default:
          push([echo, { kind: "err", text: `${command}: command not found — try 'help'` }]);
      }
    },
    [push]
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
      // Complete a tool name on the second word.
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length < 2) return;
      const partial = parts[parts.length - 1].toLowerCase();
      const match = names.find((name) => name.startsWith(partial));
      if (match) setInput([...parts.slice(0, -1), match].join(" "));
    }
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard can be blocked outright; failing quietly beats an alert.
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
      {/* Window chrome */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-[0_0_80px_rgba(37,99,235,0.10)] backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <p className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <TerminalIcon size={12} />
            salim@tools — {UTILITIES.length} packages
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 font-mono text-sm leading-relaxed md:p-7">
          {/* Static session. Present in the served HTML, revealed with CSS. */}
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
            No accounts, no telemetry, no upsell.
          </p>

          <div className="mt-7 space-y-1">
            {UTILITIES.map((tool, i) => {
              const isOpen = expanded === tool.id;
              return (
                <div
                  key={tool.id}
                  className="animate-term-line"
                  style={{ animationDelay: `${260 + i * 90}ms` }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : tool.id)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-baseline gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-blue-500/5"
                  >
                    <span className="text-blue-500 transition-transform group-hover:translate-x-0.5">
                      {isOpen ? "▾" : "▸"}
                    </span>
                    <h2 className="shrink-0 font-bold text-white">{tool.id}</h2>
                    <span className="hidden shrink-0 text-slate-700 sm:inline">
                      {"·".repeat(Math.max(2, 22 - tool.id.length))}
                    </span>
                    <span className="flex-1 truncate text-slate-400">{tool.desc}</span>
                    <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] ${tool.color}`}>
                      {tool.link ? "public" : "wip"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="ml-7 border-l border-slate-800 py-3 pl-5 text-slate-400">
                      {tool.story.split("\n\n").map((para) => (
                        <p key={para.slice(0, 24)} className="mb-3 max-w-2xl leading-relaxed last:mb-0">
                          {para}
                        </p>
                      ))}

                      {tool.tech.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          <span className="text-slate-600">stack</span> {tool.tech.join(" · ")}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {tool.link ? (
                          <>
                            <a
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-400 transition-colors hover:text-blue-300"
                            >
                              <Github size={13} /> source
                            </a>
                            <button
                              onClick={() => copy(`git clone ${tool.link}.git`, tool.id)}
                              className="inline-flex items-center gap-1.5 rounded border border-slate-800 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-300"
                            >
                              {copied === tool.id ? <Check size={12} /> : <Copy size={12} />}
                              {copied === tool.id ? "copied" : "git clone"}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600">source coming soon</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive log */}
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

          {/* Prompt. Enhancement only — everything above reads fine without it. */}
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
              placeholder="type 'help'"
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
        </Link>
      </p>
    </div>
  );
}
