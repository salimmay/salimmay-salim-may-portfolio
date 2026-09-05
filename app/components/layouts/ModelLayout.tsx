"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MousePointer2,
  Phone,
} from "lucide-react";
import dynamic from "next/dynamic";

import { DATA } from "../../data";

// The whole three.js bundle is dead weight until this layout is on screen, and
// it can't render on the server at all, so keep it behind its own chunk.
const AvatarScene = dynamic(() => import("../model/AvatarScene"), {
  ssr: false,
  loading: () => null,
});

// ── Derived stats ───────────────────────────────────────────────────────────
// Read off DATA rather than hard-coded, so the hero can't drift out of date
// the next time a role or project is added.
const START_YEAR = Math.min(
  ...DATA.experience.map((role) => Number(role.date.slice(3, 7))).filter(Number.isFinite)
);
const TECH_COUNT = DATA.techStack.reduce((total, group) => total + group.skills.length, 0);
// "Full Stack Developer & System Admin" → the two things worth cycling.
const SPECIALISMS = DATA.personal.role.split("&").map((part) => part.trim());

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const reveal: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.07, ease: EASE },
  }),
};

const VIEWPORT = { once: true, margin: "-12% 0px -12% 0px" } as const;

/** Shared wrapper: fades a block up the first time it scrolls into view. */
function Reveal({
  children,
  i = 0,
  className,
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={reveal}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ index, title, kicker }: { index: string; title: string; kicker?: string }) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="font-mono text-xs tracking-[0.25em] text-blue-400">
        /// {index} — {title.toUpperCase()}
      </p>
      {kicker && (
        <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">{kicker}</h2>
      )}
      <div className="mt-6 h-px w-full bg-gradient-to-r from-blue-500/60 via-slate-700/40 to-transparent" />
    </Reveal>
  );
}

// ── Decode-on-load text ─────────────────────────────────────────────────────
// Locks characters in left to right while the rest churn through glyphs. Length
// never changes, so there's no reflow while it settles.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*<>/[]{}";

function Decode({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  // Deterministic first paint — no Math.random() during render.
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((ch, i) => (ch === " " ? " " : GLYPHS[i % GLYPHS.length]))
      .join("")
  );

  useEffect(() => {
    const TICK = 28;
    const FRAMES = 34;
    let frame = 0;
    let interval: ReturnType<typeof setInterval>;

    const start = setTimeout(() => {
      interval = setInterval(() => {
        frame += 1;
        const settled = (frame / FRAMES) * text.length * 1.3;
        setDisplay(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < settled) return ch;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join("")
        );
        if (frame >= FRAMES) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, TICK);
    }, delay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, delay]);

  return <span className={className}>{display}</span>;
}

// ── Ambient backplate ───────────────────────────────────────────────────────
// Veo-generated night plate, served from Cloudinary. The transform chain does
// real work: e_boomerang plays it forward then reversed, which turns an 8s clip
// with mismatched ends into a 16s seamless loop; ac_none drops the audio track;
// f_auto/q_auto let Cloudinary pick codec and quality per browser. Net result is
// 2.4 MB for twice the runtime, versus 5.3 MB for the raw file.
const AMBIENT_BASE = "https://res.cloudinary.com/dkdtwmbcp/video/upload";
const AMBIENT_ID = "v1788575460/3dnaked_eye";
const AMBIENT_VIDEO = `${AMBIENT_BASE}/e_boomerang,f_auto,q_auto,ac_none,w_1280/${AMBIENT_ID}.mp4`;
// so_0 = "second offset 0", i.e. Cloudinary renders frame one as a still.
const AMBIENT_POSTER = `${AMBIENT_BASE}/so_0,f_auto,q_auto,w_1280/${AMBIENT_ID}.jpg`;

function AmbientBackplate() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Anyone who asked the OS for less motion gets the poster frame instead — the
  // scene still reads, it just stops moving.
  if (reduceMotion) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={AMBIENT_POSTER} alt="" className="h-full w-full object-cover" />;
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={AMBIENT_POSTER}
      className="h-full w-full object-cover"
    >
      <source src={AMBIENT_VIDEO} type="video/mp4" />
    </video>
  );
}

// ── Ambient scenery ─────────────────────────────────────────────────────────
// Drawn entirely in CSS so there are no extra assets to ship: a planet arc
// above the horizon, a warm glow along the bottom, a breathing key light behind
// the avatar, and a faint perspective grid. Sits behind the 3-D canvas.
function Scenery() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0b1220_0%,#020617_55%,#020617_100%)]" />

      {/* Desktop only — not worth 2.4 MB of someone's cellular data, and the CSS
          scenery below already stands on its own. */}
      <div className="absolute inset-0 hidden opacity-[0.55] md:block">
        <AmbientBackplate />
      </div>
      {/* The plate lifts the left-hand brightness, where all the copy lives, so
          pull it back down before the text sits on top of it. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent md:block" />

      {/* Planet */}
      <div className="absolute left-1/2 top-[-28vh] h-[62vh] w-[62vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(59,130,246,0.30),rgba(30,58,138,0.16)_45%,transparent_68%)] blur-[2px]" />
      <div className="absolute left-1/2 top-[-28vh] h-[62vh] w-[62vh] -translate-x-1/2 rounded-full ring-1 ring-inset ring-blue-400/10" />

      {/* Key light behind the avatar, breathing slowly */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[4%] top-1/2 hidden h-[72vh] w-[72vh] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.20),rgba(139,92,246,0.06)_55%,transparent_70%)] blur-2xl md:block"
      />

      {/* Horizon glow */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[linear-gradient(to_top,rgba(251,146,60,0.10),rgba(59,130,246,0.06)_45%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-[22vh] h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />

      {/* Perspective grid */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26vh] opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(96,165,250,0.5) 1px, transparent 1px), linear-gradient(to top, rgba(96,165,250,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          transform: "perspective(340px) rotateX(62deg)",
          transformOrigin: "bottom",
        }}
      />
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const [specialism, setSpecialism] = useState(0);
  const nameParts = DATA.personal.name.split(" ");

  useEffect(() => {
    if (SPECIALISMS.length < 2) return;
    const id = setInterval(() => setSpecialism((n) => (n + 1) % SPECIALISMS.length), 3600);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    // pointer-events-none so drag-to-rotate reaches the canvas underneath;
    // re-enabled on the copy column itself.
    <div className="pointer-events-none mx-auto flex min-h-screen max-w-7xl items-center px-6 md:px-12">
      <div className="pointer-events-auto w-full max-w-xl py-32 md:py-0">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-slate-500"
        >
          <span className="h-px w-8 bg-gradient-to-r from-blue-500 to-transparent" />
          {DATA.personal.location.toUpperCase()}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-7 font-bold leading-[0.92] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 6vw, 5rem)" }}
        >
          <span className="block text-white">
            <Decode text={nameParts[0]} delay={150} />
          </span>
          <span className="block bg-gradient-to-r from-blue-300 via-white to-violet-300 bg-clip-text text-transparent">
            <Decode text={nameParts.slice(1).join(" ")} delay={420} />
          </span>
        </motion.h1>

        {/* Specialism rotator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
          className="mt-6 flex h-8 items-center gap-3 overflow-hidden font-mono text-base text-slate-300 md:text-xl"
        >
          <span className="text-slate-600">//</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={specialism}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="text-blue-300"
            >
              {SPECIALISMS[specialism]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.02, ease: EASE }}
          className="mt-7 max-w-lg font-mono text-sm leading-relaxed text-slate-400"
        >
          <span className="text-emerald-500">/* </span>
          {DATA.personal.bio}
          <span className="text-emerald-500"> */</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.14, ease: EASE }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <button
            onClick={() => scrollTo("work")}
            className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-mono text-sm font-bold text-white shadow-[0_0_28px_rgba(37,99,235,0.35)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.55)]"
          >
            &gt;View My Work( )
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/50 px-6 py-3 font-mono text-sm text-slate-300 backdrop-blur-md transition-colors hover:border-blue-500/60 hover:text-white"
          >
            &gt; Get In Touch( )
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.26, ease: EASE }}
          className="mt-14 flex gap-10 border-t border-slate-800/80 pt-7"
        >
          <Stat value={`${DATA.projects.length}+`} label="Projects Shipped" />
          <Stat value={`${new Date().getFullYear() - START_YEAR}+`} label="Years Building" />
          <Stat value={`${TECH_COUNT}+`} label="Technologies" />
        </motion.div>

        {/* Scroll cue — kept left, clear of the layout switcher at bottom centre */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="mt-12 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-slate-600"
        >
          SCROLL
          <motion.span
            animate={{ scaleX: [0.25, 1, 0.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="block h-px w-16 origin-left bg-gradient-to-r from-slate-500 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white md:text-3xl">{value}</p>
      <p className="mt-1 font-mono text-[11px] text-slate-500">// {label}</p>
    </div>
  );
}

// ── About + stack ───────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHeading index="01" title="About" kicker="Backend rigour, frontend craft — one person, both ends of the stack." />

      <div className="grid gap-14 md:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="text-lg leading-relaxed text-slate-200">
            I came to engineering from the visual side — years of production design and retouching
            on deadline before I started shipping software. It&apos;s why I care as much about how an
            interface feels as whether the service behind it holds up.
          </p>
          <p className="mt-6 leading-relaxed text-slate-400">
            Since then I&apos;ve built a venue-management platform from nothing and re-architected it
            into a multi-vertical SaaS, written the scraping and normalisation engine behind a
            car-search aggregator, and put Redis-queued ingestion under an analytics service.
            Mostly TypeScript, and at home in Linux and Docker when the job calls for it.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              {DATA.personal.location}
            </span>
            <a
              href={`mailto:${DATA.personal.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-blue-400"
            >
              <Mail size={14} className="text-blue-400" />
              {DATA.personal.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <Phone size={14} className="text-blue-400" />
              {DATA.personal.phone}
            </span>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {DATA.techStack.map((group, i) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.title} i={i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group h-full rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-colors hover:border-blue-500/40"
                >
                  <Icon size={18} className="text-blue-400" />
                  <p className="mt-3 font-mono text-sm font-bold text-white">{group.title}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded border border-slate-800 bg-slate-950/70 px-2 py-0.5 font-mono text-[11px] text-slate-400 transition-colors group-hover:border-slate-700 group-hover:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Experience timeline ─────────────────────────────────────────────────────
function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 75%", "end 65%"],
  });

  return (
    <section id="experience" className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHeading index="02" title="Experience" kicker="Where the work happened." />

      <div ref={trackRef} className="relative pl-8 md:pl-12">
        {/* Rail, plus a beam that fills as the section scrolls past. */}
        <div className="absolute bottom-0 left-0 top-2 w-px bg-slate-800" />
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute bottom-0 left-0 top-2 w-px origin-top bg-gradient-to-b from-blue-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
        />

        <div className="space-y-16">
          {DATA.experience.map((role, i) => (
            <Reveal key={`${role.company}-${role.date}`} i={i % 3}>
              <div className="group relative">
                <span className="absolute -left-8 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-slate-950 bg-slate-600 transition-colors group-hover:bg-blue-400 md:-left-12" />

                <p className="font-mono text-xs tracking-wider text-blue-400">{role.date}</p>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">
                  {role.role} <span className="text-slate-600">@</span>{" "}
                  <span className="text-slate-400">{role.company}</span>
                </h3>

                {/* Indexed lines rather than a bulleted list — reads as a log,
                    which suits the rest of the page better. */}
                <div className="mt-5 space-y-px">
                  {role.achievements.map((item, n) => (
                    <div
                      key={item}
                      className="flex gap-4 border-l border-slate-800 py-2 pl-5 transition-colors hover:border-blue-500/50"
                    >
                      <span className="shrink-0 pt-0.5 font-mono text-[11px] text-slate-600">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {role.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-[11px] text-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Project gallery ─────────────────────────────────────────────────────────
// Main frame plus a thumbnail rail underneath. Arrows and thumbnails drive the
// same index; clicking the frame opens the full-size view.
function ProjectGallery({
  images,
  title,
  onZoom,
}: {
  images: string[];
  title: string;
  onZoom: (src: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);

  const go = (next: number) => {
    const wrapped = (next + images.length) % images.length;
    setDirection(wrapped > index || (index === images.length - 1 && wrapped === 0) ? 1 : -1);
    setIndex(wrapped);
  };

  // Keep the active thumbnail in view when arrows move past the visible rail.
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.children[index] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [index]);

  if (images.length === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-xl border border-slate-800 bg-slate-900/60 font-mono text-xs text-slate-600">
        no preview
      </div>
    );
  }

  const current = images[index];

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        {/* Default (sync) mode, not "wait": both slides are absolutely
            positioned so they cross-fade cleanly, and a stalled exit can never
            leave the frame out of step with the counter. */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.button
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={() => onZoom(current)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`Open ${title} screenshot ${index + 1}`}
          >
            <Image
              src={current}
              alt={`${title} — screenshot ${index + 1}`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 620px"
            />
          </motion.button>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 transition-colors group-hover:ring-blue-500/40" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous screenshot"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/70 p-2 text-slate-300 opacity-0 backdrop-blur-md transition-all hover:border-blue-500/60 hover:text-white group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next screenshot"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/70 p-2 text-slate-300 opacity-0 backdrop-blur-md transition-all hover:border-blue-500/60 hover:text-white group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full border border-slate-700/70 bg-slate-950/70 px-2.5 py-1 font-mono text-[10px] text-slate-400 backdrop-blur-md">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          ref={railRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => go(i)}
              aria-label={`Screenshot ${i + 1}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border transition-all ${
                i === index
                  ? "border-blue-500 opacity-100"
                  : "border-slate-800 opacity-55 hover:opacity-90"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover object-top" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Selected work ───────────────────────────────────────────────────────────
function Projects({ onZoom }: { onZoom: (src: string) => void }) {
  return (
    <section id="work" className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHeading index="03" title="Selected Work" kicker="Things I designed, built and shipped." />

      <div className="space-y-28 md:space-y-40">
        {DATA.projects.map((project, i) => {
          const flipped = i % 2 === 1;
          const repo = (project as { link?: string }).link;
          const live = (project as { ExternalLink?: string }).ExternalLink;

          return (
            <Reveal key={project.id}>
              <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
                <div className={flipped ? "md:order-2" : ""}>
                  <ProjectGallery images={project.images ?? []} title={project.title} onZoom={onZoom} />
                </div>

                <div className={flipped ? "md:order-1" : ""}>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 font-mono text-[11px] ${project.color}`}>
                      {project.tag}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                      {project.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-white md:text-4xl">{project.title}</h3>
                  <p className="mt-4 leading-relaxed text-slate-400">{project.desc}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[11px] text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {(repo || live) && (
                    <div className="mt-7 flex flex-wrap gap-5 font-mono text-sm">
                      {live && (
                        <a
                          href={live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-blue-400 transition-colors hover:text-blue-300"
                        >
                          Live
                          <ArrowUpRight
                            size={14}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </a>
                      )}
                      {repo && (
                        <a
                          href={repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
                        >
                          <Github size={14} />
                          Source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  const { socials } = DATA.personal;

  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHeading index="04" title="Contact" />

      <Reveal>
        <h2 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
          Got something worth building?
          <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Let&apos;s talk about it.
          </span>
        </h2>
      </Reveal>

      <Reveal i={1}>
        <a
          href={`mailto:${DATA.personal.email}`}
          className="group mt-12 inline-flex items-center gap-4 border-b border-slate-700 pb-3 text-xl text-slate-300 transition-colors hover:border-blue-500 hover:text-white md:text-3xl"
        >
          <Mail size={22} className="text-blue-400" />
          {DATA.personal.email}
          <ArrowUpRight
            size={22}
            className="text-slate-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-400"
          />
        </a>
      </Reveal>

      <Reveal i={2}>
        <div className="mt-14 flex flex-wrap gap-3">
          <SocialLink href={socials.github} icon={<Github size={15} />} label="GitHub" />
          <SocialLink href={socials.linkedin} icon={<Linkedin size={15} />} label="LinkedIn" />
          <SocialLink href={socials.behance} icon={<ArrowUpRight size={15} />} label="Behance" />
        </div>
      </Reveal>

      <Reveal i={3}>
        <p className="mt-20 border-t border-slate-800/80 pt-8 font-mono text-xs text-slate-600">
          // {DATA.personal.name} — {DATA.personal.location}
        </p>
      </Reveal>
    </section>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-5 py-2.5 font-mono text-sm text-slate-300 backdrop-blur-md transition-all hover:border-blue-500/50 hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-slate-950/92 p-6 backdrop-blur-sm md:p-14"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative h-full w-full"
          >
            <Image src={src} alt="Project screenshot" fill className="object-contain" sizes="100vw" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function ModelLayout() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // The avatar doesn't leave — it recedes. Opacity and a scrim hand the page
  // over to the copy as the hero scrolls away, so the 3-D stays as atmosphere.
  const stageOpacity = useTransform(heroProgress, [0, 0.9], [1, 0.45]);
  const stageScale = useTransform(heroProgress, [0, 1], [1, 0.94]);
  const scrimOpacity = useTransform(heroProgress, [0.15, 0.9], [0, 0.86]);
  const hintOpacity = useTransform(heroProgress, [0, 0.25], [1, 0]);

  // Drag-to-rotate is only live while the hero owns the screen; past that the
  // canvas must let clicks and selection through to the content above it.
  const [heroActive, setHeroActive] = useState(true);
  useMotionValueEvent(heroProgress, "change", (v) => setHeroActive(v < 0.55));

  const [zoomed, setZoomed] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: pageProgress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500"
      />

      <Scenery />

      {/* 3-D stage: right half on desktop, full-bleed and dialled back on mobile */}
      <motion.div
        style={{ opacity: stageOpacity, scale: stageScale }}
        className={`fixed inset-y-0 right-0 z-0 w-full md:w-[54%] ${
          heroActive ? "" : "pointer-events-none"
        }`}
      >
        <div className="h-full w-full opacity-45 md:opacity-100">
          <AvatarScene interactive={heroActive} />
        </div>
      </motion.div>

      {/* Scrim that lifts the copy off the scene once you start scrolling */}
      <motion.div
        style={{ opacity: scrimOpacity }}
        className="pointer-events-none fixed inset-0 z-[5] bg-slate-950"
      />

      <div className="relative z-10">
        <section ref={heroRef} className="relative">
          <Hero />

          <motion.p
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-10 right-8 hidden items-center gap-2 font-mono text-[11px] text-slate-600 md:flex"
          >
            <MousePointer2 size={12} />
            drag to rotate
          </motion.p>
        </section>

        <About />
        <Experience />
        <Projects onZoom={setZoomed} />
        <Contact />
      </div>

      <Lightbox src={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
}
