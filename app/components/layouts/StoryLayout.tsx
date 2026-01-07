"use client";

import React, { useState, MouseEvent, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Github, Linkedin, Mail, MapPin, Phone, Download,
  Code, Database, Terminal, Layers, Menu, X, FolderGit2,
  ArrowRight, ExternalLink, LayoutGrid, Film, ZoomIn, BriefcaseIcon, Cpu 
} from "lucide-react";
import { 
  motion, useMotionTemplate, useMotionValue, AnimatePresence, useSpring, useTransform 
} from "framer-motion";
import { DATA } from "../../data";

// --- 1. MAGNETIC NAV ITEM ---
const MagneticNav = ({ children, onClick, className }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = e.clientX - (left + width / 2);
    const middleY = e.clientY - (top + height / 2);
    x.set(middleX * 0.3); // Strength of magnetic pull
    y.set(middleY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// --- 2. HYPERTEXT ANIMATION ---
const HyperText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";

  const triggerAnimation = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return alphabets[Math.floor(Math.random() * 26)];
          })
          .join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    triggerAnimation();
  }, [text]);

  return (
    <span className={className} onMouseEnter={triggerAnimation}>
      {displayText}
    </span>
  );
};

// --- LIGHTBOX ---
const Lightbox = ({ src, onClose }: { src: string, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
    >
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50">
        <X size={32} />
      </button>
      <motion.div 
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="relative w-full h-full max-w-5xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt="Full screen" fill className="object-contain" sizes="100vw" />
      </motion.div>
    </motion.div>
  );
};

// --- PROJECT DRAWER ---
const ProjectDrawer = ({ project, onClose }: { project: any, onClose: () => void }) => {
  const [viewMode, setViewMode] = useState<'scrapbook' | 'filmstrip'>('scrapbook');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]" 
      />

      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[650px] bg-slate-900 border-l border-slate-800 z-[101] flex flex-col shadow-2xl"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative w-full h-64 md:h-80 bg-slate-800 shrink-0">
             {project.images && project.images.length > 0 ? (
               <Image src={project.images[0]} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-slate-600">No Image</div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
             <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all">
               <X size={20} />
             </button>
          </div>

          <div className="p-8 md:p-12">
            <span className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-3 block">
              {project.category}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">{project.title}</h2>
            <div className="prose prose-invert prose-lg text-slate-300 mb-12">
               <h3 className="text-white text-xl font-bold mb-4">The Story</h3>
               <p className="leading-relaxed text-slate-400">{project.story}</p>
               <p className="leading-relaxed text-slate-400 mt-4">{project.desc}</p>
            </div>

            {project.images && project.images.length > 1 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <FolderGit2 size={16} className="text-blue-500"/> Project Gallery
                   </h3>
                   <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700">
                     <button onClick={() => setViewMode('scrapbook')} className={`p-2 rounded-md transition-all ${viewMode === 'scrapbook' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><LayoutGrid size={16} /></button>
                     <button onClick={() => setViewMode('filmstrip')} className={`p-2 rounded-md transition-all ${viewMode === 'filmstrip' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Film size={16} /></button>
                   </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {viewMode === 'scrapbook' ? (
                    <motion.div key="scrapbook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="columns-2 gap-4 space-y-4">
                      {project.images.slice(1).map((img: string, idx: number) => (
                        <div key={idx} className="break-inside-avoid relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 cursor-zoom-in" onClick={() => setLightboxImg(img)}>
                          <Image src={img} alt="Scrapbook" width={600} height={400} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 300px" />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><ZoomIn className="text-white drop-shadow-md" size={24} /></div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="filmstrip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x mandatory custom-scrollbar">
                      {project.images.slice(1).map((img: string, idx: number) => (
                        <div key={idx} className="snap-center shrink-0 w-[85%] md:w-[70%] aspect-video relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 cursor-zoom-in group" onClick={() => setLightboxImg(img)}>
                          <Image src={img} alt="Filmstrip" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 85vw, 400px" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><ZoomIn className="text-white drop-shadow-md" size={32} /></div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="border-t border-slate-800 pt-8">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium border border-slate-700">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex gap-4 shrink-0 z-20">
          <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-blue-900/20">Live Demo <ExternalLink size={16} /></a>
          <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-bold border border-slate-700">Code <Github size={16} /></a>
        </div>
      </motion.div>
      <AnimatePresence>
        {lightboxImg && <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
      </AnimatePresence>
    </>
  );
};

// --- MAIN COMPONENT ---
export default function StoryLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVIGATION with Magnetic Buttons */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-white tracking-tight cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <span className="group-hover:text-blue-400 transition-colors duration-300">Salim</span>
            <span className="text-blue-500 group-hover:text-white transition-colors duration-300">May</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-1">
            {["About", "Experience", "Projects", "Skills", "Education", "Contact"].map((item) => (
              <MagneticNav
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="relative px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
              >
                {item}
              </MagneticNav>
            ))}
          </div>

          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col gap-4">
            {["About", "Experience", "Projects", "Skills", "Education", "Contact"].map((item) => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left py-2 hover:text-blue-400">{item}</button>
            ))}
          </motion.div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="about" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-spin-slow opacity-10">
            <div className="absolute top-[50%] left-[50%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-[50%] left-[50%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          </div>
        </div>

        <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
              <Image src="/me.png" alt="Salim May" fill className="object-cover object-top" priority />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-blue-300 uppercase bg-blue-900/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-blue-500/40 transition-all cursor-default select-none">
            <Terminal size={12} className="text-blue-400" />
            <p className="text-blue-300">Full-stack Developer & System Admin</p>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-[length:200%_auto] animate-gradient">
              Solutions & Systems
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {DATA.personal.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => scrollTo("contact")} className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25">
              Get in Touch
            </button>
            <a href="/salimmay.pdf" download className="px-8 py-3 bg-slate-800 text-white rounded-full font-medium hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700">
              <Download size={18} /> Download Resume
            </a>
          </div>

          <div className="mt-16 flex justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-2"><MapPin size={16} /> {DATA.personal.location}</div>
            <div className="flex items-center gap-2"><Phone size={16} /> {DATA.personal.phone}</div>
          </div>
        </FadeIn>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <BriefcaseIcon /> Work Experience
            </h2>
          </FadeIn>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {DATA.experience.map((job, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <TimelineItem index={idx} role={job.role} company={job.company} date={job.date} stack={job.stack}>
                  <ul className="list-disc list-inside space-y-2 text-slate-400">
                    {job.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </TimelineItem>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <FolderGit2 className="text-blue-500" /> Featured Projects
            </h2>
          </FadeIn>

          <div className="flex flex-col gap-6">
            {DATA.projects.map((project) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={project.id}>
                <SpotlightCard className="w-full cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setActiveStory(project)}>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">{project.category}</span>
                        </div>
                        <p className="text-slate-400 text-base mb-6 leading-relaxed line-clamp-2">{project.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((t) => (
                            <span key={t} className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono">{t}</span>
                          ))}
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-blue-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                           Read Story <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DRAWER RENDERER */}
      <AnimatePresence>
        {activeStory && (
          <ProjectDrawer project={activeStory} onClose={() => setActiveStory(null)} />
        )}
      </AnimatePresence>

      {/* SKILLS SECTION */}
      <section id="skills" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <Terminal className="text-purple-500" /> Technical Arsenal
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DATA.techStack.map((tech) => (
              <SkillCardWrapper key={tech.title} title={tech.title} icon={<tech.icon className="text-blue-400"/>} skills={tech.skills} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="py-20 px-6 border-t border-slate-900 bg-slate-950">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Collaborate?</h2>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <SocialLink href={`mailto:${DATA.personal.email}`} icon={<Mail />} label="Email Me" />
            <SocialLink href={DATA.personal.socials.linkedin} icon={<Linkedin />} label="LinkedIn" />
            <SocialLink href={DATA.personal.socials.github} icon={<Github />} label="GitHub" />
          </div>
          <div className="text-slate-600 text-sm">© {new Date().getFullYear()} Salim May.</div>
        </FadeIn>
      </footer>
    </div>
  );
}

// --- HELPERS  ---
const FadeIn = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const SpotlightCard = ({ children, className = "", onClick }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-800 bg-slate-900/50 overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.1), transparent 80%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

const TimelineItem = ({ role, company, date, children, stack, index }: any) => {
  const isEven = index % 2 === 0;
  return (
    <div className="relative pl-8 md:pl-0">
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-slate-950 shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10" />
      <div className="md:absolute md:left-4 absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-600 md:hidden" />
      <div className={`md:flex justify-between items-start gap-10 ${!isEven ? "flex-row-reverse" : ""}`}>
        <div className={`hidden md:block w-[calc(50%-2rem)] ${!isEven ? "text-left" : "text-right"}`}>
          <div className="text-blue-400 font-mono text-sm mb-1">{date}</div>
          <div className="text-slate-500 font-bold text-lg">{company}</div>
        </div>
        <div className="md:w-[calc(50%-2rem)] mb-8 md:mb-0">
          <div className="md:hidden mb-2"><span className="text-blue-400 font-mono text-xs block">{date}</span><span className="text-slate-500 font-bold">{company}</span></div>
          <h3 className="text-xl font-bold text-white mb-3">{role}</h3>
          <div className="mb-4">{children}</div>
          <div className="flex flex-wrap gap-2">{stack.map((tech: string) => (<span key={tech} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{tech}</span>))}</div>
        </div>
      </div>
    </div>
  );
};

const SkillCardWrapper = ({ title, skills, icon }: any) => (
  <SpotlightCard className="p-6 h-full">
    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-slate-950 rounded-lg border border-slate-800">{icon}</div><h3 className="font-bold text-white">{title}</h3></div>
    <div className="flex flex-wrap gap-2">{skills.map((s: string) => (<span key={s} className="px-3 py-1 bg-slate-950 text-slate-400 text-xs rounded-full border border-slate-800">{s}</span>))}</div>
  </SpotlightCard>
);

const SocialLink = ({ href, icon, label }: any) => (
  <a href={href} target="_blank" className="flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500 transition-all group hover:bg-slate-900/80">
    <div className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-white">{label}</span>
  </a>
);