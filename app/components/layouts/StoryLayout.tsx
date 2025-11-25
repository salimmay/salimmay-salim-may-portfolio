"use client";

import React, { useState, MouseEvent } from "react";
import Link from "next/link"; 
import Image from "next/image";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Download,
  Code,
  Database,
  Terminal,
  Cpu,
  Layers,
  Globe,
  GraduationCap,
  Award,
  Users,
  ExternalLink,
  Menu,
  X,
  FolderGit2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

// --- DATA 
const projects = [
  {
    id: "fiesta",
    title: "Fiesta App",
    category: "SaaS Ecosystem",
    desc: "A comprehensive SaaS solution for event venue management. Engineered a complex Role-Based Access Control (RBAC) system for multi-user environments. Features include real-time calendar synchronization, financial analytics dashboards, and an integrated partner marketplace.",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "Redux Toolkit"],
  },
  {
    id: "cuisine",
    title: "Cuisine IQ",
    category: "Real-Time Platform",
    desc: "Digitizing the dining experience with a contactless ordering system. Implemented WebSocket connections for sub-second synchronization between client devices and kitchen display systems (KDS).",
    tech: ["React", "Express", "Socket.io", "QR API", "JWT"],
  },
  {
    id: "tunisair",
    title: "Tunisair Recrut",
    category: "Enterprise Web App",
    desc: "Official recruitment portal developed for the national airline. Streamlined the internship application process by digitizing workflows. Built a secure backend for handling sensitive candidate data.",
    tech: ["MERN Stack", "Secure Uploads", "Admin Panel", "Data Filtering"],
  },
  {
    id: "syrvis",
    title: "Syrvis",
    category: "E-Commerce",
    desc: "A fully functional marketplace for tech accessories. Implemented a custom shopping cart logic using Redux, secure user authentication, and product search filtering.",
    tech: ["Next.js", "NestJS", "MongoDB", "REST API"],
  },
  {
    id: "SalimOS",
    title: "SalimOS",
    category: "Interactive Portfolio",
    desc: "An immersive, fully interactive 'Web Operating System' that showcases Full Stack capabilities through gamification, physics simulations, and creative UI design.",
    tech: ["Next.js", "Framer Motion", "Canvas"],
  },
];

// --- ANIMATION COMPONENTS ---

const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
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

const SpotlightCard = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
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
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// --- NAVBAR LINK COMPONENT ---
const NavLink = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
    >
      {title}
      {isHovered && (
        <motion.div
          layoutId="nav-line"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
        />
      )}
    </button>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
export default function StoryLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="text-xl font-bold text-white tracking-tight cursor-pointer group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span className="group-hover:text-blue-400 transition-colors duration-300">
              Salim
            </span>
            <span className="text-blue-500 group-hover:text-white transition-colors duration-300">
              May
            </span>
          </div>

          <div className="hidden md:flex gap-4">
            {[
              "About",
              "Experience",
              "Projects",
              "Skills",
              "Education",
              "Contact",
            ].map((item) => (
              <NavLink
                key={item}
                title={item}
                onClick={() => scrollTo(item.toLowerCase())}
              />
            ))}
          </div>

          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col gap-4"
          >
            {[
              "About",
              "Experience",
              "Projects",
              "Skills",
              "Education",
              "Contact",
            ].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-left py-2 hover:text-blue-400"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="about" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-spin-slow opacity-10">
            <div className="absolute top-[50%] left-[50%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-[50%] left-[50%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          </div>
        </div>

        <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
          {/* Profile Picture */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
              <Image
                src="/me.png"
                alt="Salim May"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
          {/* --- TITLE BADGE --- */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-blue-300 uppercase bg-blue-900/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-blue-500/40 transition-all cursor-default select-none">
            <Terminal size={12} className="text-blue-400" />
            Full-stack Developer & System Admin
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-[length:200%_auto] animate-gradient">
              Solutions & Systems
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            I am a developer who bridges the gap between <b>robust backend logic</b> and <b>pixel-perfect frontend design</b>.
        Specializing in <b>TypeScript</b> and <b>Full Stack Architecture</b> to deliver secure, scalable, and high-performance web applications.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollTo("contact")}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25"
            >
              Get in Touch
            </button>
            <a
              href="/salimmay.pdf"
              download
              className="px-8 py-3 bg-slate-800 text-white rounded-full font-medium hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
            >
              <Download size={18} /> Download Resume
            </a>
          </div>

          <div className="mt-16 flex justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin size={16} /> Manouba, Tunis
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} /> +216 27 004 058
            </div>
          </div>
        </FadeIn>
      </section>

      {/* --- EXPERIENCE SECTION --- */}
      <section id="experience" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <BriefcaseIcon /> Work Experience
            </h2>
          </FadeIn>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            <FadeIn delay={0.1}>
              <TimelineItem
                index={0}
                role="Frontend Developer (Internship)"
                company="Tunisair"
                date="02/2024 - 05/2024"
                stack={["MERN Stack", "MongoDB", "Express", "React", "Node.js"]}
              >
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>
                    Designed and developed a responsive website using the{" "}
                    <b>MERN stack</b> from concept to deployment.
                  </li>
                  <li>
                    Improved user experience through clean UI/UX design and
                    optimized site performance.
                  </li>
                </ul>
              </TimelineItem>
            </FadeIn>

            <FadeIn delay={0.2}>
              <TimelineItem
                index={1}
                role="Photo Editor"
                company="Terkina"
                date="05/2022 - 08/2025"
                stack={["Adobe Photoshop", "Lightroom", "Creative Strategy"]}
              >
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>
                    Retouched and color-corrected{" "}
                    <b>2000+ images per project</b> ensuring brand consistency.
                  </li>
                  <li>Produced creative visuals under tight deadlines.</li>
                </ul>
              </TimelineItem>
            </FadeIn>

            <FadeIn delay={0.3}>
              <TimelineItem
                index={2}
                role="Brand Ambassador"
                company="NextWave"
                date="07/2022 - 02/2023"
                stack={["Sales", "Communication"]}
              >
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>
                    Promoted products through local events, driving measurable
                    sales increases.
                  </li>
                  <li>Reported customer feedback and market insights.</li>
                </ul>
              </TimelineItem>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <FolderGit2 className="text-blue-500" /> Featured Projects
            </h2>
          </FadeIn>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-6"
          >
            {projects.map((project) => (
              <motion.div variants={itemVariants} key={project.id}>
                <SpotlightCard className="w-full">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {project.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                            {project.category}
                          </span>
                        </div>
                        <p className="text-slate-400 text-base mb-6 leading-relaxed">
                          {project.desc}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SKILLS SECTION --- */}
      <section id="skills" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
              <Cpu className="text-purple-500" /> Technical Arsenal
            </h2>
          </FadeIn>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <SkillCardWrapper
              title="Languages"
              icon={<Code className="text-blue-400" />}
              skills={["Java", "PHP", "JavaScript", "HTML", "CSS"]}
            />
            <SkillCardWrapper
              title="Frontend"
              icon={<Layers className="text-purple-400" />}
              skills={["React", "Next.js", "Tailwind CSS","Redux"]}
            />
            <SkillCardWrapper
              title="Backend"
              icon={<Database className="text-green-400" />}
              skills={["Node.", "Express", "MongoDB", "Spring Boot","Laravel" ,"MySQL"]}
            />
            <SkillCardWrapper
              title="DevOps"
              icon={<Terminal className="text-orange-400" />}
              skills={["Linux", "Docker", "Git", "System Admin"]}
            />
            <SkillCardWrapper
              title="Management"
              icon={<Users className="text-pink-400" />}
              skills={["Agile", "Scrum", "Jira"]}
            />
            <SkillCardWrapper
              title="Creative"
              icon={<Award className="text-yellow-400" />}
              skills={["Photoshop", "Lightroom", "Illustrator", "PremierPro", "AfterEffect"]}
            />
          </motion.div>
        </div>
      </section>

      {/* --- EDUCATION & FOOTER --- */}
      <section id="education" className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <GraduationCap className="text-blue-500" /> Education
            </h2>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <div className="text-sm text-blue-400 font-mono mb-2">
                09/2018 - 05/2025
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Bachelor Degree
              </h3>
              <div className="text-lg text-slate-300 mb-2">
                Business Information Systems
              </div>
              <p className="text-slate-500">
                Higher School of Digital Economy, University of Manouba.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="text-yellow-500" /> Certifications
            </h2>
            <div className="space-y-4">
              <CertItem
                title="Intro to Programming using HTML & CSS"
                issuer="Microsoft"
                year="2021"
              />
              <CertItem
                title="Adobe Illustrator CC 2020 MasterClass"
                issuer="Udemy"
                year="2020"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <footer
        id="contact"
        className="py-20 px-6 border-t border-slate-900 bg-slate-950"
      >
        <FadeIn className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Collaborate?
          </h2>
          <p className="text-slate-400 mb-10">
            Full-stack developer, system admin, and creative mind ready for your
            next project.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <SocialLink
              href="mailto:maysalimp@gmail.com"
              icon={<Mail />}
              label="Email Me"
            />
            <SocialLink
              href="https://www.linkedin.com/in/salim-may-456a271a3/"
              icon={<Linkedin />}
              label="LinkedIn"
            />
            <SocialLink
              href="https://github.com/salimmay"
              icon={<Github />}
              label="GitHub"
            />
          </div>

          <div className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Salim May. Built with Next.js &
            Tailwind.
          </div>
        </FadeIn>
      </footer>
    </div>
  );
}

// --- HELPER SUB-COMPONENTS ---

const TimelineItem = ({ role, company, date, children, stack, index }: any) => {
  const isEven = index % 2 === 0;

  return (
    <div className="relative pl-8 md:pl-0">
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-slate-950 shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10" />
      <div className="md:absolute md:left-4 absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-600 md:hidden" />

      <div
        className={`md:flex justify-between items-start gap-10 ${
          !isEven ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`hidden md:block w-[calc(50%-2rem)] ${
            !isEven ? "text-left" : "text-right"
          }`}
        >
          <div className="text-blue-400 font-mono text-sm mb-1">{date}</div>
          <div className="text-slate-500 font-bold text-lg">{company}</div>
        </div>

        <div className="md:w-[calc(50%-2rem)] mb-8 md:mb-0">
          <div className="md:hidden mb-2">
            <span className="text-blue-400 font-mono text-xs block">
              {date}
            </span>
            <span className="text-slate-500 font-bold">{company}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{role}</h3>
          <div className="mb-4">{children}</div>
          <div className="flex flex-wrap gap-2">
            {stack.map((tech: string) => (
              <span
                key={tech}
                className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillCardWrapper = ({ title, skills, icon }: any) => (
  <motion.div variants={itemVariants}>
    <SpotlightCard className="p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          {icon}
        </div>
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s: string) => (
          <span
            key={s}
            className="px-3 py-1 bg-slate-950 text-slate-400 text-xs rounded-full border border-slate-800"
          >
            {s}
          </span>
        ))}
      </div>
    </SpotlightCard>
  </motion.div>
);

const CertItem = ({ title, issuer, year }: any) => (
  <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
    <div className="mt-1 text-yellow-500">
      <Award size={20} />
    </div>
    <div>
      <h4 className="font-bold text-white">{title}</h4>
      <p className="text-sm text-slate-400">
        {issuer} • {year}
      </p>
    </div>
  </div>
);

const SocialLink = ({ href, icon, label }: any) => (
  <a
    href={href}
    target="_blank"
    className="flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500 transition-all group hover:bg-slate-900/80"
  >
    <div className="text-blue-500 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-white">{label}</span>
  </a>
);

// Kept this helper from your original file
const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-500"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);