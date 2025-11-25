import React from "react";
import { Monitor, Server, Database, Terminal } from "lucide-react";

export const DATA = {
  personal: {
    name: "Salim May",
    role: "Full Stack Developer & System Admin",
    bio: "I bridge the gap between robust backend logic and pixel-perfect frontend design. Specializing in TypeScript and Full Stack Architecture to deliver secure, scalable web applications.",
    location: "Tunis, Tunisia",
    email: "maysalimp@gmail.com",
    socials: {
      linkedin: "https://www.linkedin.com/in/salim-may-456a271a3/",
      github: "https://github.com/salimmay",
      behance: "https://www.behance.net/SalimMaytn"
    }
  },
  experience: [
    {
      role: "Frontend Developer (Internship)",
      company: "Tunisair",
      date: "02/2024 - 05/2024",
      desc: "Designed and developed a responsive website using the MERN stack. Improved UX and site performance.",
    },
    {
      role: "Photo Editor",
      company: "Terkina",
      date: "05/2022 - 08/2025",
      desc: "Retouched and color-corrected 2000+ images per project ensuring brand consistency.",
    },
    {
      role: "Brand Ambassador",
      company: "NextWave",
      date: "07/2022 - 02/2023",
      desc: "Promoted products through local events, driving measurable sales increases.",
    },
  ],
  projects: [
    {
      title: "Fiesta App",
      tag: "SaaS",
      desc: "Event venue management with RBAC & Analytics.",
      tech: ["React", "Node.js", "MongoDB"],
      color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
    },
    {
      title: "Cuisine IQ",
      tag: "Real-Time",
      desc: "Contactless ordering with WebSocket sync.",
      tech: ["Socket.io", "Express", "JWT"],
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    },
    {
      title: "Tunisair Portal",
      tag: "Enterprise",
      desc: "Recruitment portal for the national airline.",
      tech: ["MERN", "Secure Uploads"],
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    {
      title: "SalimOS",
      tag: "Interactive",
      desc: "Web Operating System portfolio.",
      tech: ["Next.js", "Canvas"],
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }
  ],
  techStack: [
    { title: "Frontend", items: "React, Next.js, Tailwind", icon: Monitor },
    { title: "Backend", items: "Node, Express, Laravel", icon: Server },
    { title: "Database", items: "Mongo, MySQL, Postgres", icon: Database },
    { title: "DevOps", items: "Linux, Docker, Git", icon: Terminal },
  ]
};