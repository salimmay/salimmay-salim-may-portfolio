"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { 
  Github, Linkedin, Mail, MapPin,
  Terminal, Cpu, Layers,
  ArrowUpRight,
  Download, X, Maximize2, ChevronLeft, ChevronRight, ChevronDown, Clock
} from "lucide-react";
import { 
  motion, Variants, AnimatePresence, 
  useMotionValue, useTransform, useMotionTemplate, useSpring 
} from "framer-motion";
import { DATA, STATS, yearsBuilding, type Project } from "../../data"; 
import ContributionGraph from "../ContributionGraph";

// Never emits — the snapshot differs per environment, not over time.
const subscribeNever = () => () => {};

// --- 3D TILT CARD + SPOTLIGHT ---
const TiltCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    
    spotX.set(mouseX);
    spotY.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative transform-gpu ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${spotX}px ${spotY}px,
              rgba(99, 102, 241, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full w-full rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

// --- LIVE CLOCK CELL ---
// A dashboard should show something that is actually moving. This one is
// honest: the time really is Tunis time, and the offset is measured against
// the visitor's own clock. Ticking through useSyncExternalStore rather than
// setState-in-an-effect, which is both the idiomatic pattern and lint-clean.
const TUNIS_TZ = "Africa/Tunis";

const subscribeSecond = (onChange: () => void) => {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
};
const secondsNow = () => Math.floor(Date.now() / 1000);

const LiveCell = () => {
  // Server snapshot is 0, so the first paint shows placeholders instead of a
  // time that would disagree with the client and trip a hydration warning.
  const seconds = useSyncExternalStore(subscribeSecond, secondsNow, () => 0);

  const now = seconds ? new Date(seconds * 1000) : null;
  const time = now
    ? now.toLocaleTimeString("en-GB", { timeZone: TUNIS_TZ, hour12: false })
    : "--:--:--";
  // %24 guards the midnight edge, where some engines report hour 24.
  const hour = now ? Number(time.slice(0, 2)) % 24 : -1;
  const working = hour >= 9 && hour < 18;

  // Whole-hour difference between Tunis and wherever the visitor is.
  let offsetLabel = "";
  if (now) {
    const diff = Math.round(
      (new Date(now.toLocaleString("en-US", { timeZone: TUNIS_TZ })).getTime() -
        new Date(now.toLocaleString("en-US")).getTime()) /
        3600000
    );
    offsetLabel =
      diff === 0
        ? "Same time as you"
        : diff > 0
          ? `${diff}h ahead of you`
          : `${Math.abs(diff)}h behind you`;
  }

  return (
    <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between gap-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
        <span
          className={`w-2 h-2 rounded-full ${working ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}
        />
        <Clock size={12} /> Tunis
      </div>
      <div>
        <p className="text-4xl md:text-5xl font-bold text-white font-mono tabular-nums tracking-tight">
          {time}
        </p>
        <p className="text-zinc-500 text-sm mt-2">{offsetLabel || "\u00a0"}</p>
      </div>
      <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
        {now ? (working ? "Within working hours" : "Outside working hours") : "\u00a0"}
      </p>
    </div>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="text-3xl md:text-4xl font-bold text-white tabular-nums">{value}</p>
    <p className="text-zinc-500 text-[11px] mt-1 uppercase tracking-wider">{label}</p>
  </div>
);

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "circOut" } }
};

// --- PORTAL MODAL COMPONENT (Fixes Centering & Animation) ---
const ProjectModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  const [currentImg, setCurrentImg] = useState(0);
  // Client-only gate, without setState in an effect: the server snapshot is
  // false and the client snapshot true, so React flips it once at hydration.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (project.images && project.images.length > 0) {
      setCurrentImg((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.images && project.images.length > 0) {
      setCurrentImg((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  // If not mounted on client yet, return null
  if (!mounted) return null;

  // Render to document.body to escape parent transforms
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-5xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Header */}
        <div className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 select-none z-20">
          <div className="flex gap-2">
            <button onClick={onClose} className="group relative w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
               <X size={8} className="opacity-0 group-hover:opacity-100 text-black font-bold" />
            </button>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <Terminal size={12} /> ~/projects/{project.title.toLowerCase().replace(/\s/g, '-')}
          </div>
          <div className="w-10 flex justify-end">
             <Maximize2 size={14} className="text-zinc-600" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-zinc-900/50">
          
          {/* Image Carousel */}
          <div className="w-full h-64 md:h-[400px] bg-zinc-950 relative group select-none border-b border-zinc-800 shrink-0">
             {project.images && project.images.length > 0 ? (
               <div className="relative w-full h-full overflow-hidden">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={currentImg}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="absolute inset-0"
                   >
                     <Image 
                       src={project.images[currentImg]} 
                       alt={`${project.title} slide ${currentImg}`}
                       fill
                       className="object-contain"
                       priority
                     />
                     <Image 
                       src={project.images[currentImg]} 
                       alt="blur-bg"
                       fill
                       className="object-cover -z-10 opacity-20 blur-3xl scale-110"
                     />
                   </motion.div>
                 </AnimatePresence>

                 {project.images.length > 1 && (
                   <>
                     <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"><ChevronLeft size={24} /></button>
                     <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"><ChevronRight size={24} /></button>
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {project.images.map((_: string, idx: number) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentImg ? 'bg-white scale-125' : 'bg-white/40'}`} />
                        ))}
                     </div>
                   </>
                 )}
               </div>
             ) : (
               <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-zinc-700 font-bold text-4xl opacity-20 uppercase tracking-widest">{project.title}</span>
               </div>
             )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8">
            {/* Thumbnails */}
            {project.images && project.images.length > 1 && (
               <div className="flex gap-2 overflow-x-auto pb-6 pt-2 snap-x scrollbar-none mb-4">
                 {project.images.map((img: string, idx: number) => (
                   <button 
                     key={idx}
                     onClick={(e) => { e.stopPropagation(); setCurrentImg(idx); }}
                     className={`relative w-20 h-14 shrink-0 rounded-md overflow-hidden border transition-all ${idx === currentImg ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                   >
                     <Image src={img} alt="thumb" fill className="object-cover" />
                   </button>
                 ))}
               </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
               <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.color || 'bg-zinc-800 text-zinc-400'}`}>
                    {project.tag}
                  </span>
               </div>
            </div>
            
            <div className="prose prose-invert max-w-none text-zinc-300">
                <p className="text-lg leading-relaxed mb-6">
                {project.story || project.desc}
                </p>
            </div>

            <div className="bg-zinc-950/80 rounded-xl p-6 border border-zinc-800 mt-8">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Cpu size={14} /> Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t: string) => (
                  <span key={t} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded text-xs font-mono hover:border-indigo-500/50 transition-colors cursor-default">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- MAIN COMPONENT ---
export default function BentoLayout() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // Which cell is expanded, if any. Expanding reflows the grid in place via
  // framer's layout animation, and reveals content Bento otherwise hides —
  // per-role achievements and the full skill lists.
  const [expandedCell, setExpandedCell] = useState<"experience" | "tech" | null>(null);
  const toggleCell = (cell: "experience" | "tech") =>
    setExpandedCell((current) => (current === cell ? null : cell));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-indigo-500/30 p-4 md:p-8 pt-28 pb-32">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 py-4">
          <div className="text-2xl font-bold text-white tracking-tighter cursor-default">
            Salim<span className="text-indigo-500">.May</span>
          </div>
          <a href={`mailto:${DATA.personal.email}`} className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-800 hover:border-indigo-500/50 transition-all flex items-center gap-2">
            <Mail size={16} /> Contact Me
          </a>
        </header>

        <motion.div 
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >

          {/* 1. INTRO CARD (Clean Static Title) */}
          <motion.div variants={itemVar} className="md:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                System Online
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                Full Stack Developer <br />
                <span className="text-zinc-500">& System Admin.</span>
              </h1>
              
              <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-8">
                {DATA.personal.bio}
              </p>

              <div className="flex gap-3">
                 <SocialBtn icon={<Linkedin size={20} />} href={DATA.personal.socials.linkedin} label="LinkedIn" />
                 <SocialBtn icon={<Github size={20} />} href={DATA.personal.socials.github} label="Github" />
                 <SocialBtn icon={<Mail size={20} />} href={`mailto:${DATA.personal.email}`} label="Email" />
              </div>
            </div>
          </motion.div>

          {/* 2. PROFILE PICTURE CARD */}
          <motion.div variants={itemVar} className="md:col-span-4 h-full">
            <TiltCard className="h-full">
              <div className="relative h-full min-h-[300px]">
                <Image 
                  src="/me.png" 
                  alt="Salim May" 
                  fill 
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-bold text-lg">{DATA.personal.name}</p>
                  <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin size={14} /> {DATA.personal.location}</p>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* 3. AT A GLANCE + LIVE CLOCK */}
          <motion.div
            variants={itemVar}
            className="md:col-span-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <Stat value={String(STATS.projects)} label="Projects shipped" />
            <Stat value={`${yearsBuilding()}+`} label="Years building" />
            <Stat value={String(STATS.technologies)} label="Technologies" />
            <Stat value={String(STATS.roles)} label="Roles held" />
          </motion.div>

          <motion.div variants={itemVar} className="md:col-span-4">
            <LiveCell />
          </motion.div>

          {/* 4. TECH STACK */}
          <motion.div layout variants={itemVar} className="md:col-span-12 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="shrink-0">
               <button
                 onClick={() => toggleCell("tech")}
                 className="group/t flex items-center gap-3 text-left"
               >
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Cpu className="text-indigo-500" /> Technical Arsenal
                 </h3>
                 <ChevronDown
                   size={16}
                   className={`text-zinc-600 group-hover/t:text-indigo-400 transition-all ${expandedCell === "tech" ? "rotate-180" : ""}`}
                 />
               </button>
               <p className="text-zinc-500 text-sm mt-1">
                 {expandedCell === "tech" ? "Every tool, listed." : "The tools I use to build."}
               </p>
            </div>
            
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
               {DATA.techStack.map((tech) => (
                 <TechCategory
                   key={tech.title}
                   title={tech.title}
                   items={tech.items}
                   skills={tech.skills}
                   icon={<tech.icon size={16} />}
                   expanded={expandedCell === "tech"}
                 />
               ))}
            </div>
          </motion.div>

          {/* 4. EXPERIENCE LIST */}
          <motion.div
            layout
            variants={itemVar}
            className={`${expandedCell === "experience" ? "md:col-span-12" : "md:col-span-4 row-span-2"} bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8`}
          >
            {/* Header doubles as the expand control. Expanding reveals each
                role's achievements and stack, which this layout otherwise
                drops entirely — it only ever showed the one-line desc. */}
            <button
              onClick={() => toggleCell("experience")}
              className="group/e w-full flex items-center justify-between gap-4 mb-6"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="text-indigo-500" /> Experience
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-600 group-hover/e:text-indigo-400 transition-colors">
                {expandedCell === "experience" ? "collapse" : "detail"}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expandedCell === "experience" ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            <div
              className={
                expandedCell === "experience"
                  ? "grid md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8"
                  : "space-y-8 relative before:absolute before:left-[11px] before:top-2 before:h-[85%] before:w-[2px] before:bg-zinc-800"
              }
            >
              {DATA.experience.map((job, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-6 h-6 bg-zinc-900 border-4 border-zinc-800 rounded-full z-10" />
                  <h4 className="text-white font-bold">{job.role}</h4>
                  <p className="text-indigo-400 text-sm font-medium mb-1">{job.company}</p>
                  <p className="text-zinc-500 text-xs mb-2">{job.date}</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">{job.desc}</p>

                  {expandedCell === "experience" && (
                    <div className="mt-4 space-y-px">
                      {job.achievements.map((item, n) => (
                        <div key={item} className="flex gap-3 border-l border-zinc-800 py-1.5 pl-4">
                          <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <p className="text-zinc-400 text-xs leading-relaxed">{item}</p>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {job.stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
              <div className="mt-8 mb-6">
               <ContributionGraph />
             </div>            
             <div className="mt-8 pt-8 border-t border-zinc-800">
              <a 
                href="/salimmay.pdf" 
                download
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-sm"
              >
                <Download size={16} /> Download Full Resume
              </a>
            </div>
          </motion.div>

          {/* 5. PROJECTS GRID */}
          <motion.div variants={itemVar} className="md:col-span-8 row-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {DATA.projects.map((project, i) => (
                <div 
                  key={i} 
                  className="h-full"
                >
                  <TiltCard 
                    className="group cursor-pointer h-full"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${project.color || 'bg-zinc-800 text-zinc-400'}`}>
                          {project.tag}
                        </span>
                        <ArrowUpRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3">{project.desc}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tech.slice(0,3).map(t => (
                          <span key={t} className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded text-xs">
                            {t}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className="px-2 py-1 text-zinc-600 text-xs">+{project.tech.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* --- MODAL RENDERER (Portal) --- */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

const SocialBtn = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300" title={label}>{icon}</a>
);

const TechCategory = ({
  title,
  items,
  skills,
  icon,
  expanded,
}: {
  title: string;
  items: string;
  skills: string[];
  icon: React.ReactNode;
  expanded: boolean;
}) => (
  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
    <div className="flex items-center gap-2 mb-2 text-zinc-300 font-bold text-sm">{icon} {title}</div>
    {expanded ? (
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400"
          >
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <div className="text-xs text-zinc-500 leading-relaxed">{items}</div>
    )}
  </div>
);