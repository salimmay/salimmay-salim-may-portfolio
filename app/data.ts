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