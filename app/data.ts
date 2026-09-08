import { Server, Terminal, Code, Layers } from "lucide-react";

/**
 * Shape of an entry in DATA.projects. Declared explicitly rather than inferred,
 * so the layouts can type their props against it instead of falling back to
 * `any`. link / ExternalLink are optional because only some projects have them.
 */
export type Project = {
  id: string;
  title: string;
  category: string;
  tag: string;
  desc: string;
  story: string;
  tech: string[];
  color: string;
  images: string[];
  link?: string;
  ExternalLink?: string;
  /** "tool" = something built to do the work, not a product delivered to a client. */
  /**
   * Absent  = a product, shipped for someone. Shown in Selected Work.
   * "tool"    = built to do the work with. Shown in the Toolchain section.
   */
  kind?: "tool";
};

export const DATA = {
  personal: {
    name: "Salim May",
    role: "Full Stack Developer & System Admin",
    bio: "I bridge the gap between robust backend logic and pixel-perfect frontend design. Specializing in TypeScript and Full Stack Architecture to deliver secure, scalable web applications.",
    location: "Tunis, Tunisia",
    email: "maysalimp@gmail.com",
    phone: "+216 27 004 058",
    socials: {
      linkedin: "https://www.linkedin.com/in/salim-may-456a271a3/",
      github: "https://github.com/salimmay",
      behance: "https://www.behance.net/SalimMaytn"
    }
  },
  experience: [
    {
      role: "Visual Designer → Full Stack Developer",
      company: "Terkina (Freelance)",
      date: "05/2022 - Present",
      desc: "A four-year freelance relationship that grew from high-volume retouching into designing and shipping the agency's platform and CRM.",
      achievements: [
        "Retouched and colour-corrected 2000+ images per project, holding brand consistency across high-volume workflows on tight deadlines.",
        "Worked directly with creative directors on visual strategy, which later shaped how the platform presents their work.",
        "Designed and built the public platform: a WebGL product marketplace streaming .glb models through React Three Fiber, alongside a 360° orbital gallery.",
        "Built the admin CRM behind it — live KPI metrics, drag-and-drop gallery ordering, stock and price controls, and site content editing with on-demand ISR revalidation.",
        "Hardened and shipped it to production: strict CSP, IP-based edge rate limiting, Zod validation, Supabase row-level security, and EN/FR/AR with RTL layout support."
      ],
      stack: ["Next.js", "TypeScript", "Supabase", "React Three Fiber", "Cloudinary", "Photoshop", "Lightroom", "Premiere Pro"]
    },
    {
      role: "Multimedia Designer",
      company: "Unilumin",
      date: "01/2026 - 05/2026",
      desc: "Built the initial platform from scratch and later re-architected the core into a multi-vertical SaaS Ecosystem.",
      achievements: [
        "Produced immersive 3D naked-eye visual simulations for showroom LED screens, tailored to specific client environments and presented in high-stakes pitches.",
        "Designed product catalogs, promotional posters, and AI-generated imagery that directly supported the sales team in closing client deals.",
        "Built and launched the company website from scratch, establishing a modern and cohesive digital brand identity"
      ],
      stack: ["Blender", "Photoshop", "After Effects"]
    },
    {
      role: "Full Stack Developer",
      company: "Fiesta App",
      date: "06/2025 - 12/2025",
      desc: "Built the initial platform from scratch and later re-architected the core into a multi-vertical SaaS Ecosystem.",
      achievements: [
        "Architected and built the initial Venue Management platform from the ground up (Greenfield development).",
        "Led the strategic pivot to a 'Chameleon Architecture', scaling the single app into an ecosystem supporting 7+ distinct industries (Catering, Logistics, Security).",
        "Designed polymorphic MongoDB schemas to handle diverse business logic within a unified codebase without data clutter.",
        "Integrated Puppeteer for automated invoicing and Cloudinary for high-performance media management."
      ],
      stack: ["React", "Node.js", "MongoDB", "Puppeteer"]
    },
    {
      role: "Full Stack Developer",
      company: "Tunisair",
      date: "02/2024 - 05/2024",
      desc: "Designed and developed a responsive website using the MERN stack. Improved UX and site performance.",
      achievements: [
        "Designed and developed a responsive website using the MERN stack.",
        "Improved user experience through clean UI/UX design.",
        "Collaborated with backend teams to integrate REST APIs."
      ],
      stack: ["MERN Stack", "React", "Node.js"]
    },

    {
      role: "Brand Ambassador",
      company: "NextWave",
      date: "07/2022 - 02/2023",
      desc: "Promoted products through local events, driving measurable sales increases.",
      achievements: [
        "Promoted products through local events, driving measurable sales increases.",
        "Generated leads and maintained customer relationships."
      ],
      stack: ["Sales", "Communication"]
    },
  ],
  projects: [
    {
      id: "terkina",
      title: "Terkina",
      category: "Agency Platform & CRM",
      tag: "Platform",
      desc: "A hybrid visual-media and 3D engineering platform for a creative agency, with a custom CRM the team runs the entire public site from.",
      story: "Terkina had to do two things that usually pull against each other: be a showpiece for a visual agency, and be something non-technical staff could actually operate day to day. The public side leans hard on WebGL — a 360 orbital gallery carousel, and a real-time 3D marketplace that streams .glb models through React Three Fiber with finish and colour switchers, contact shadows and cursor-driven rim lighting.\n\nBehind it sits the admin CRM. Live KPI metrics off the database, drag-and-drop gallery reordering with dnd-kit, per-item price visibility and stock toggles, and a content editor that changes the WhatsApp dispatch number, agency email and homepage counters without a redeploy — backed by an on-demand ISR revalidation route so the cache purges the moment something is published. Orders leave through one-click WhatsApp dispatch that quietly persists the lead first, so nothing is lost if the hand-off fails.\n\nThe hardening was its own piece of work: strict Content Security Policy, anti-clickjacking headers, IP-based edge rate limiting, Unicode-safe Zod validation and Supabase row-level security. It ships in English, French and Arabic, with the layout flipping to RTL without a page reload.",
      tech: ["Next.js", "React 19", "TypeScript", "Supabase", "React Three Fiber", "Cloudinary", "Zod"],
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      images: [
        "/Terkina/Home.png",
        "/Terkina/Album.png",
        "/Terkina/Orbit.png",
        "/Terkina/Marketplace.png",
        "/Terkina/3d.png",
        "/Terkina/admin.png",
        "/Terkina/crm.png",
      ],
    },
    {
      id: "vaultp",
      title: "VaultP",
      category: "Local-First Encrypted Vault",
      tag: "Security",
      desc: "An encrypted vault for expenses, debts and documents that runs on Android and Windows off one shared database — no server, no account, fully offline.",
      story: "Every personal finance app I looked at wanted an account, a server and a subscription to hold data that never needed to leave my devices. VaultP is the opposite bet: one encrypted database, shared between an Android phone and a Windows desktop, with every feature working with the network switched off.\n\nThe currency handling is where most of the care went. The Tunisian dinar has three decimal places rather than two, so exponents are looked up per currency instead of assumed, and a foreign charge records both what the vendor billed and what the bank actually debited — the spread is part of the true cost. Where a figure is derived from a past rate it is marked as an estimate rather than presented as fact.\n\nDebts are ledgers rather than running totals: interest is computed on read, partial payments allocate deterministically, and settling produces a receipt instead of erasing history. Documents are encrypted per file and their text is read on-device on both platforms, so search finds a document by what is written inside it without anything being uploaded.\n\nSync is deliberately boring — point both devices at any folder something else already keeps in step, or at your own Google Drive project. The folder only ever receives ciphertext.",
      tech: ["TypeScript", "Electron", "React", "Expo", "SQLite (encrypted)", "Tesseract.js", "ML Kit"],
      color: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      // TODO: screenshots -> public/VaultP/
      images: [],
      link: "https://github.com/salimmay/VaultP",
    },
    {
      id: "logicflow",
      title: "LogicFlow",
      category: "Event-Driven Automation Platform",
      tag: "Infrastructure",
      desc: "A platform for defining business rules visually and running them as events, so the logic lives in configuration rather than buried in application code.",
      story: "Business rules have a habit of ending up hard-coded across a codebase, where changing one means a deploy. LogicFlow pulls them out into something you can draw: define the rule visually, and the platform executes it against incoming events.\n\nThe path is deliberately asynchronous. A NestJS gateway takes events over HTTP, applies rate limiting and auth, and drops them onto a Redis queue rather than processing inline — so a burst of traffic queues instead of timing out. Background workers pick the events up, evaluate the rules against them, and emit results, with real-time observability over the whole pipeline so a rule that misfires is visible rather than silent.\n\nThe whole thing runs under Docker Compose, which keeps the gateway, workers and Redis reproducible as one unit.",
      tech: ["NestJS", "Redis", "TypeScript", "Docker", "Microservices"],
      color: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
      // TODO: screenshots -> public/LogicFlow/ (rule builder, event pipeline view)
      images: [],
      link: "https://github.com/salimmay/logic-flow",
    },
    {
      id: "hannout",
      title: "Hanout Lamine Digital",
      category: "Retail Ecosystem",
      tag: "Commerce",
      desc: "A retail platform built for how a Tunisian corner shop actually trades — informal credit, goods sold loose by weight, and an interface that speaks the local dialect.",
      story: "Standard point-of-sale software assumes a shop that sells sealed units for cash. A Tunisian hanout does neither. It sells sel3a loose by weight, and it runs on trust — the carnet, a running tab a neighbour settles when they can. Software that can't express those two things is useless behind that counter.\n\nSo the model starts there. The digital carnet is a real ledger a customer can see from their phone, balance and transaction history included, rather than a number only the owner controls. Inventory handles quantities that aren't whole units. The customer app is React Native; the owner gets a separate React dashboard built for one person running a shop, not a retail chain.\n\nThe interface speaks Derja rather than translated French, because that is what makes it legible to the people using it. Even the visual language argues the point — warm cream and coffee brown instead of the grey of a supermarket terminal, on the grounds that the shop is a neighbourhood fixture and shouldn't be dressed like a checkout lane.",
      tech: ["React Native", "Expo", "React", "Vite", "Node.js"],
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      // Private repository — write-up only, deliberately no `link`.
      // TODO: screenshots -> public/Hannout/ (storefront, carnet, admin)
      images: [],
    },
    {
      id: "gatt",
      title: "Aziz Gattoussi Portfolio",
      category: "Client Portfolio — Desktop Simulation",
      tag: "Client Work",
      desc: "A portfolio for a UI/UX and motion designer, built as a browser desktop: draggable files, a working dock, and case studies that open as windows.",
      story: "Built for Aziz Gattoussi, a UI/UX and motion designer whose work needed a frame that wasn't another grid of thumbnails. The site presents itself as an operating system instead — it boots with a startup sequence and monogram, then hands you a desktop.\n\nProjects are files you can pick up and throw around, with spring physics doing the work so they carry weight rather than snapping to a grid. Opening one raises a window with the case study inside, laid out by a small layout engine that supports full-width, half-left and centre-narrow editorial blocks, so each study can be paced differently instead of pouring every project into one template.\n\nThe restraint that mattered was keeping it navigable. A desktop metaphor is easy to make cute and hard to make usable, so the dock stays fixed and every window is closable from the same place.",
      tech: ["React", "Vite", "Framer Motion", "JavaScript"],
      color: "bg-slate-400/10 text-slate-300 border-slate-400/20",
      // TODO: screenshots -> public/GATT/ (boot sequence, desktop, case-study window)
      images: [],
      link: "https://github.com/salimmay/GATT",
    },
    {
      id: "oldart",
      title: "OldArt",
      category: "Second-Hand Instrument Marketplace",
      tag: "Marketplace",
      desc: "A Symfony marketplace for used musical instruments, built around offers and negotiation rather than a fixed-price checkout.",
      story: "Second-hand instruments don't sell like retail stock. Condition matters as much as the model, and the price is usually the start of a conversation rather than the end of one. OldArt is built around that: a seller lists an instrument with a description and a condition rating, and buyers respond with their own offer — their price, their message, their contact details — instead of adding it to a basket.\n\nIt is the one thing here that isn't JavaScript. Symfony with Doctrine ORM and Twig templates, migrations under version control, PHPUnit for the test suite, and Docker Compose so the stack comes up as one piece. Building it meant working against a framework with much stronger opinions than Express or Nest have, which is most of why it was worth doing.",
      tech: ["PHP", "Symfony", "Doctrine ORM", "Twig", "Docker", "PHPUnit"],
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      // TODO: screenshots -> public/OldArt/ (listings, instrument page, offer flow)
      images: [],
      link: "https://github.com/salimmay/OldArt",
    },
    {
      id: "slayemcanvas",
      title: "SlayemCanvas",
      category: "AI Website Builder",
      tag: "AI Tooling",
      kind: "tool" as const,
      desc: "An AI site builder with a visual canvas on top — describe a page, drop in a block, or click any element and say what to change. Every edit writes real React and Tailwind.",
      story: "Most AI site builders hand you a mockup and leave the translation to code as your problem. SlayemCanvas removes that step: the canvas edits real React and Tailwind source on disk, so what you see is genuinely what ships.\n\nThe piece that makes it work is an AST layer built on Babel. Every node carries a deterministic ID that survives both AI edits and manual formatting, which is what lets a change stay surgical instead of regenerating the whole page. Click any element and you can either adjust its properties directly or tell the assistant what to change about that node alone.\n\nProjects are disk-backed — you open a real folder, and every change syncs straight to files with no proprietary project format. The preview is an actual Next.js dev server rather than a simulated iframe, so multi-page navigation behaves the way it will in production, and the whole thing exports as a standalone Next.js project.",
      tech: ["Next.js 15", "React 19", "TypeScript", "Google Gemini", "Babel AST", "Tailwind CSS", "Vitest"],
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      // TODO: screenshots -> public/SlayemCanvas/ (split view: blocks, canvas, assistant)
      images: [],
      link: "https://github.com/salimmay/SlayemCanvas",
    },
    {
      id: "slayemcode",
      title: "SlayemCode",
      category: "Autonomous AI Coding Orchestrator",
      tag: "AI Tooling",
      kind: "tool" as const,
      desc: "A local-first orchestrator that runs a hierarchy of AI personas on consumer hardware — planning, delegating, writing code, then verifying it actually works.",
      story: "SlayemCode is built around a hardware constraint rather than around a model: 8GB of VRAM and 32GB of RAM. That budget rules out running several models at once, so the architecture is single-model, multi-persona — one Ollama model at a time, swapped between roles by a FastAPI state machine that manages the task DAG.\n\nThe control plane is where the real work sits: a git engine for diffs and undo, a filesystem sandbox enforcing path boundaries, a security filter, a session store in SQLite, a prompt audit log, and an AST code map for context injection. The Next.js GUI watches all of it over WebSockets — chat, kanban, git diffs, terminal and heatmap in real time.\n\nBy default nothing leaves the machine. Individual personas can be pointed at a remote model, which exists because planning is where a 7B model struggles most and it is one call per project — but the trade is stated plainly in the docs rather than buried, since the builder persona's prompt contains your source. Remote routing is confined to a single provider module; there is no telemetry anywhere else.",
      tech: ["Python", "FastAPI", "Next.js", "Ollama", "SQLite", "WebSockets"],
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      // TODO: screenshots -> public/SlayemCode/ (kanban, git diffs, heatmap)
      images: [],
      link: "https://github.com/salimmay/SlayemCode",
    },
    {
      id: "twilight",
      title: "Twilight Prod",
      category: "Cinematic Studio Site",
      tag: "Motion",
      desc: "A portfolio site for a Tunisian production house, built around momentum scrolling, scroll-choreographed reveals and curtain page transitions.",
      story: "A production house sells the way its work feels, so the site had to move like a film reel rather than a document. Lenis carries the weighted, momentum-based scroll; GSAP handles the scroll-triggered reveals and stagger timelines; View Transitions give navigation a curtain wipe with no visible latency.\n\nIt runs on Astro's islands architecture, so the heavy interactive pieces — the magnetic custom cursor, the hybrid video player that handles both local loops and YouTube, the glassmorphic nav that reacts to scroll position — ship as isolated React islands while everything else stays static HTML. Projects are managed as Markdown, so the studio can add work without touching code.",
      tech: ["Astro 5", "React 19", "GSAP", "Lenis", "Tailwind CSS 4", "TypeScript"],
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      // TODO: screenshots -> public/Twilight/
      images: [],
      link: "https://github.com/salimmay/Twilight-prod",
    },
    {
      id: "stajnet",
      title: "StajNet",
      category: "Recruitment Portal",
      tag: "MERN",
      desc: "A recruitment portal for the Tunisian airline industry — internship offers, applications, candidate quizzes and workshop management, with an admin side behind it.",
      story: "StajNet handles the full loop between a candidate and a recruiter: browsing internship offers, submitting an application with file uploads, sitting a qualifying quiz, and signing up for workshops — with an administrative side for managing all of it.\n\nThe split is conventional MERN and deliberately so. A React front end talks to an Express API over axios, with authentication, file upload handling and persistence in MongoDB behind it. The interest is in the domain rather than the architecture: recruitment flows are full of state that has to survive partial completion, and quizzes and workshops each carry their own scheduling and capacity rules.",
      tech: ["React 18", "Node.js", "Express", "MongoDB", "Tailwind CSS", "MUI"],
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      images: [
        "/StajNet/Home.png",
        "/StajNet/Offers.png",
        "/StajNet/Workshops.png",
        "/StajNet/Dashboard.png"
      ],
      link: "https://github.com/salimmay/Tunisiar-Recrute",
    },
    {
      id: "slayemide",
      title: "SlayemIDE",
      category: "Local LLM Coding CLI",
      tag: "AI Tooling",
      kind: "tool" as const,
      desc: "A terminal coding agent that talks only to models on your own machine — a TUI REPL over Ollama, with vector memory and its own tool layer. Still in progress.",
      story: "SlayemIDE started as the question underneath SlayemCode: how much of a coding agent can run with nothing but a local model and a terminal? It is a TUI REPL built on prompt_toolkit and rich, driving Ollama directly, with ChromaDB for vector memory across sessions and a tool layer that can search the web and read pages back.\n\nThe module split is deliberately small — an engine, a memory store, a provider layer, tools, and the UI effects that make a terminal feel responsive. It packages with PyInstaller behind an Inno Setup installer, so it installs as a normal Windows application rather than requiring a Python environment.\n\nStill unfinished, and listed as such: it is the groundwork that the orchestrator grew out of rather than a finished product.",
      tech: ["Python", "Ollama", "ChromaDB", "prompt_toolkit", "Rich", "PyInstaller"],
      color: "bg-lime-500/10 text-lime-500 border-lime-500/20",
      // TODO: screenshots -> public/SlayemIDE/ (terminal capture)
      images: [],
      link: "https://github.com/salimmay/SlayemIDE",
    },
    
    {
      id: "fiesta",
      title: "Fiesta App",
      category: "SaaS Ecosystem",
      tag: "SaaS",
      desc: "A multi-vertical operating system supporting 7+ distinct business types via chameleon architecture.",
      story: "This journey started by building a dedicated tool for Venues from scratch. As market needs evolved, I re-engineered the entire core into a 'Chameleon Architecture'. Today, it's a multi-vertical ecosystem where the UI, Database, and Features adapt dynamically based on who is logged in. Built with React 19, it now supports infinite workflows from Catering inventory to Security shift planning all from one unified codebase.",
      tech: ["React", "Node.js", "MongoDB", "Redux Toolkit", "Puppeteer", "Cloudinary"],
      color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      images: [
        "/Fiesta/Home.png",
        "/Fiesta/dashboard.png",
        "/Fiesta/contract.png",
        "/Fiesta/event.png",
        "/Fiesta/Finance.png",
        "/Fiesta/invoice.png",
        "/Fiesta/tasks.png"
      ],
    },
    {
      id: "autoscout",
      title: "AutoScout",
      category: "Vertical Search Engine",
      tag: "Aggregator",
      desc: "A real-time search engine aggregating listings from multiple Tunisian car marketplaces into a single UI.",
      story: "The used car market in Tunisia is fragmented across messy platforms like Automobile.tn and Baniola. Finding a deal requires opening twenty tabs. I built AutoScout to unify this chaos.\n\nI engineered a custom scraping engine using Cheerio to fetch data in real-time. The core engineering challenge was Data Normalization: I wrote complex Regex patterns to parse unstructured HTML descriptions into clean, comparable JSON. The platform also includes a 'Fair Price' estimator that calculates market averages dynamically.",
      tech: ["Next.js", "TypeScript", "Cheerio", "Tailwind CSS", "Regex"],
      color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      
      images: [
        "/AutoScout/home.png",
        "/AutoScout/listings1.png",
        "/AutoScout/listings2.png",
        "/AutoScout/Browse.png",
      ],
    },
    {
      id: "atlas",
      title: "Atlas Insights",
      category: "High-Scale Analytics Platform ",
      tag: "Analytics",
      desc: "A multi-tenant analytics platform built for high-throughput ingestion using Redis queues and asynchronous processing.",
      story: "Building an analytics service requires balancing write-heavy ingestion with read-heavy dashboards. Standard synchronous approaches bottleneck during traffic spikes. The challenge was to build a system capable of ingesting millions of events asynchronously while ensuring strict data isolation.\n\nI engineered an Event-Driven Pipeline: The API accepts events and offloads them instantly to Redis (BullMQ) queues. Background workers then aggregate raw streams into time-series metrics via PostgreSQL UPSERTs. This architecture ensures zero-latency ingestion, 202 Accepted responses, and a responsive UI even under heavy load.",
      tech: ["NestJS", "Next.js 14", "PostgreSQL", "Redis", "Docker", "BullMQ"],
      color: "bg-sky-500/10 text-sky-500 border-sky-500/20",
      images: [
        "/Atlas/dashboard.png",
        "/Atlas/api-docs.png",
      ],
    },
    {
      id: "cuisine",
      title: "Cuisine IQ",
      category: "Real-Time Platform",
      tag: "Real-Time",
      desc: "Digitizing the dining experience with a contactless ordering system.",
      story: "Speed is everything in hospitality. The challenge here was latency. I implemented WebSocket connections to ensure that when a customer hits 'Order' on their phone, the kitchen sees it in under 500ms. We successfully eliminated ordering errors by 90%.",
      tech: ["React", "Express", "Socket.io", "QR API", "JWT"],
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      images: [
        "/CuisineIQ/Home.png",
        "/CuisineIQ/SignIn.png",
        "/CuisineIQ/Orders.png",
        "/CuisineIQ/QRGenerator.png",
        "/CuisineIQ/Analytics.png",
        "/CuisineIQ/ShopSettings.png",
        "/CuisineIQ/PhoneMenu.jpg",
        "/CuisineIQ/PhoneOrder.jpg"
      ],
      ExternalLink: "https://addons.mozilla.org/en-US/firefox/addon/zen-history/",
      link: "https://github.com/salimmay/zen-history",
    },
    {
      id: "zen-history",
      title: "Zen History",
      category: " Web Extension",
      tag: "Productivity",
      desc: "An innovative Firefox extension designed to revolutionize your web browsing habits. By leveraging advanced time-tracking algorithms, Zen History provides users with deep insights into their digital consumption, helping them cultivate healthier online behaviors and make more intentional use of their screen time.",
      story: "I designed Zen History to serve as a sophisticated digital wellness tool. Its core feature is a real-time analytics engine that tracks and categorizes browsing activity, providing users with a clear visual breakdown of their time spent across different categories. To encourage mindful usage, I implemented a dynamic AI-driven 'Reflector' that analyzes these patterns and generates personalized, actionable insights. Additionally, the extension includes a 'Time Capsule' feature, allowing users to set future goals and review their progress over time, transforming passive screen time into a conscious journey of self-improvement.",
      tech: ["Firefox Extension API", "Chart.js", "JavaScript", "HTML", "CSS"],
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      images: [
        "/Zen/history.png",
        "/Zen/time-wasted.png",
        "/Zen/zen-reflections.png"
      ]
    },
    {
      id: "syrvis",
      title: "Syrvis",
      category: "E-Commerce",
      tag: "Commerce",
      desc: "A fully functional marketplace for tech accessories.",
      story: "I wanted to build an e-commerce platform that didn't rely on Shopify. Syrvis features custom shopping cart logic using Redux, secure user authentication, and product search filtering, capable of handling complex inventory states.",
      tech: ["Next.js", "NestJS", "MongoDB", "REST API"],
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      images: [
        "/Syrvis/Category.png",
        "/Syrvis/Products.png",
        "/Syrvis/Comparison.png",
        "/Syrvis/Dashboard.png",
        "/Syrvis/ManageOrders.png"
      ]
    },
    {
      id: "SalimOS",
      title: "SalimOS",
      category: "Interactive Portfolio",
      tag: "Creative",
      desc: "An immersive 'Web Operating System' with physics simulations.",
      story: "Why tell people you can code when you can show them? SalimOS is a playground that simulates a desktop environment within the browser, utilizing Framer Motion for window management and canvas for background physics.",
      tech: ["Next.js", "Framer Motion", "Canvas"],
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      images: ["/SalimOS/Desktop.png"]
    },
  ],
  techStack: [
    {
      title: "Languages",
      skills: ["Java", "PHP", "JavaScript", "HTML", "CSS"],
      icon: Code,
      // For Bento view string format
      items: "Java, PHP, JavaScript, HTML, CSS"
    },
    {
      title: "Frontend",
      skills: ["React", "Next.js", "Tailwind CSS", "Redux"],
      icon: Layers,
      items: "React, Next.js, Tailwind, Redux"
    },
    {
      title: "Backend",
      skills: ["Node.js", "Express", "MongoDB", "Spring Boot", "Laravel"],
      icon: Server,
      items: "Node, Express, MongoDB, Spring Boot, Laravel"
    },
    {
      title: "DevOps",
      skills: ["Linux", "Docker", "Git", "System Admin"],
      icon: Terminal,
      items: "Linux, Docker, Git, System Admin"
    },
  ]
};
/**
 * Headline numbers, derived from the data above rather than typed out, so they
 * can't fall out of date the next time a project or role is added. Used by both
 * the 3D hero and the Bento stat strip.
 */
export const STATS = {
  /** Products only. Personal tools and /tools utilities are not "shipped" work. */
  projects: DATA.projects.filter((project) => !project.kind).length,
  roles: DATA.experience.length,
  technologies: DATA.techStack.reduce((total, group) => total + group.skills.length, 0),
  /** Earliest role start year, read out of the "MM/YYYY - ..." date strings. */
  startYear: Math.min(
    ...DATA.experience.map((role) => Number(role.date.slice(3, 7))).filter(Number.isFinite)
  ),
};

/** Years since the first role. A function, so it stays right after New Year. */
export const yearsBuilding = () => new Date().getFullYear() - STATS.startYear;
