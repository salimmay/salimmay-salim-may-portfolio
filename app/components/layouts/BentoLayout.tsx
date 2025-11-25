"use client";

import React from "react";
import Image from "next/image";
import { 
  Github, Linkedin, Mail, MapPin, 
  Code, Database, Terminal, Cpu, Layers, 
  ArrowUpRight, Monitor, Server, 
  Download 
} from "lucide-react";
// 1. IMPORT 'Variants' TYPE HERE
import { motion, Variants } from "framer-motion";

// --- CUSTOM ICONS ---
const BehanceIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 5h6" />
    <path d="M14 11h-3.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 0 2.5-2.5V11" />
    <path d="M8 11H5.5a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 0 2.5-2.5V11" />
    <path d="M18 19V5" />
  </svg>
);

// --- DATA ---
const projects = [
  {
    title: "Fiesta App",
    tag: "SaaS Ecosystem",
    desc: "A comprehensive SaaS solution for event venue management. Features RBAC, financial analytics, and marketplace integration.",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "Redux Toolkit"],
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  {
    title: "Cuisine IQ",
    tag: "Real-Time",
    desc: "Contactless ordering system using WebSocket connections for sub-second synchronization between devices.",
    tech: ["React", "Express", "Socket.io", "QR API", "JWT"],
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  },
  {
    title: "Tunisair Recrut",
    tag: "Enterprise",
    desc: "Official recruitment portal. Streamlined the internship application process and digitized workflows.",
    tech: ["MERN Stack", "Secure Uploads", "Admin Panel", "Data Filtering"],
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    title: "SalimOS",
    tag: "Interactive",
    desc: "An immersive 'Web Operating System' that showcases Full Stack capabilities through gamification.",
    tech: ["Next.js", "Framer Motion", "Canvas"],
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
    {
    title: "Syrvis",
    tag: "E-Commerce",
    desc: "A fully functional marketplace for tech accessories. Implemented a custom shopping cart logic using Redux, secure user authentication, and product search filtering.",
    tech: ["Next.js", "NestJS", "MongoDB", "REST API"],
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  }
];

const experience = [
  {
    role: "Frontend Developer",
    company: "Tunisair",
    date: "Feb 2024 - May 2024",
    desc: "Designed and developed a responsive website using the MERN stack. Improved UX and site performance."
  },
  {
    role: "Photo Editor",
    company: "Terkina",
    date: "May 2022 - Aug 2025",
    desc: "Retouched and color-corrected 2000+ images per project ensuring brand consistency."
  },
  {
    role: "Brand Ambassador",
    company: "NextWave",
    date: "Jul 2022 - Feb 2023",
    desc: "Promoted products through local events, driving measurable sales increases."
  },
];

// --- ANIMATIONS (FIXED TYPES) ---

// 2. ADD ': Variants' TYPE ANNOTATION HERE
const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// 3. ADD ': Variants' TYPE ANNOTATION HERE
const itemVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "circOut" } }
};

// --- MAIN COMPONENT ---
export default function BentoLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-indigo-500/30 p-4 md:p-8 pt-28">
      
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-12 py-4">
          <div className="text-2xl font-bold text-white tracking-tighter cursor-default">
            Salim<span className="text-indigo-500">.May</span>
          </div>
          <a href="mailto:maysalimp@gmail.com" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-800 hover:border-indigo-500/50 transition-all flex items-center gap-2">
            <Mail size={16} /> Contact Me
          </a>
        </header>

        {/* --- BENTO GRID LAYOUT --- */}
        <motion.div 
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >

          {/* 1. INTRO CARD (Large) */}
          <motion.div variants={itemVar} className="md:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Open to work
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                Full Stack Developer <br />
                <span className="text-zinc-500">& System Admin.</span>
              </h1>
              
              <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-8">
                I bridge the gap between <b>robust backend logic</b> and <b>pixel-perfect frontend design</b>. 
                Specializing in TypeScript and Full Stack Architecture to deliver secure, scalable web applications.
              </p>

              <div className="flex gap-3">
                 <SocialBtn icon={<Linkedin size={20} />} href="https://www.linkedin.com/in/salim-may-456a271a3/" label="LinkedIn" />
                 <SocialBtn icon={<Github size={20} />} href="https://github.com/salimmay" label="Github" />
                 <SocialBtn icon={<Mail size={20} />} href="mailto:maysalimp@gmail.com" label="Behance" />
              </div>
            </div>
          </motion.div>

          {/* 2. PROFILE PICTURE CARD (Side) */}
          <motion.div variants={itemVar} className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden relative min-h-[300px]">
            <Image 
              src="/me.png" 
              alt="Salim May" 
              fill 
              className="object-cover object-top hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-bold text-lg">Salim May</p>
              <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin size={14} /> Tunis, Tunisia</p>
            </div>
          </motion.div>

          {/* 3. TECH STACK (Wide Bar) */}
          <motion.div variants={itemVar} className="md:col-span-12 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="shrink-0">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Cpu className="text-indigo-500" /> Technical Arsenal
               </h3>
               <p className="text-zinc-500 text-sm mt-1">The tools I use to build.</p>
            </div>
            
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
               <TechCategory title="Frontend" items="React, Next.js, Tailwind, Redux" icon={<Monitor size={16} />} />
               <TechCategory title="Backend" items="Node, Express, Laravel,  Spring Boot" icon={<Server size={16} />} />
               <TechCategory title="Database" items="MongoDB, MySQL, Postgres" icon={<Database size={16} />} />
               <TechCategory title="DevOps" items="Linux, Docker, Git, System Admin" icon={<Terminal size={16} />} />
            </div>
          </motion.div>

          {/* 4. EXPERIENCE LIST (Tall Left) */}
          <motion.div variants={itemVar} className="md:col-span-4 row-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="text-indigo-500" /> Experience
            </h3>
            
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:h-[85%] before:w-[2px] before:bg-zinc-800">
              {experience.map((job, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-6 h-6 bg-zinc-900 border-4 border-zinc-800 rounded-full z-10" />
                  <h4 className="text-white font-bold">{job.role}</h4>
                  <p className="text-indigo-400 text-sm font-medium mb-1">{job.company}</p>
                  <p className="text-zinc-500 text-xs mb-2">{job.date}</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">{job.desc}</p>
                </div>
              ))}
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

          {/* 5. PROJECTS GRID (Main Content) */}
          <motion.div variants={itemVar} className="md:col-span-8 row-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {projects.map((project, i) => (
                <div key={i} className="group bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${project.color}`}>
                      {project.tag}
                    </span>
                    <ArrowUpRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-zinc-400 text-sm mb-6 flex-1">{project.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tech.map(t => (
                      <span key={t} className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* --- FOOTER --- */}
        <footer className="mt-12 text-center text-zinc-600 text-sm py-8 border-t border-zinc-900">
           © {new Date().getFullYear()} Salim May. Built with Next.js & Tailwind.
        </footer>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

const SocialBtn = ({ icon, href, label }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
    title={label}
  >
    {icon}
  </a>
);

const TechCategory = ({ title, items, icon }: any) => (
  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
    <div className="flex items-center gap-2 mb-2 text-zinc-300 font-bold text-sm">
      {icon} {title}
    </div>
    <div className="text-xs text-zinc-500 leading-relaxed">
      {items}
    </div>
  </div>
);