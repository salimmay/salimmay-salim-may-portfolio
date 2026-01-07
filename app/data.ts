import {
  Monitor, Server, Database, Terminal,
  Code, Layers, Cpu
} from "lucide-react";

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
      role: "Photo Editor",
      company: "Terkina",
      date: "05/2022 - 08/2025",
      desc: "Retouched and color-corrected 2000+ images per project ensuring brand consistency.",
      achievements: [
        "Retouched 2000+ images ensuring brand consistency.",
        "Managed high-volume workflows under tight deadlines.",
        "Collaborated with creative directors on visual strategy."
      ],
      stack: ["Photoshop", "Lightroom"]
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
      id: "fiesta",
      title: "Fiesta App",
      category: "SaaS Ecosystem",
      tag: "SaaS",
      desc: "A multi-vertical operating system supporting 7+ distinct business types via chameleon architecture.",
      story: "This journey started by building a dedicated tool for Venues from scratch. As market needs evolved, I re-engineered the entire core into a 'Chameleon Architecture'. Today, it's a multi-vertical ecosystem where the UI, Database, and Features adapt dynamically based on who is logged in. Built with React 19, it now supports infinite workflows from Catering inventory to Security shift planning all from one unified codebase.",
      tech: ["React", "Node.js", "MongoDB", "Redux Toolkit", "Puppeteer", "Cloudinary"],
      color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      images: [
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
    },
    {
      id: "StajNet",
      title: "StajNet",
      category: "Enterprise Web App",
      tag: "Enterprise",
      desc: "Official recruitment portal developed for the national airline.",
      story: "Handling sensitive data for a national entity requires rigorous security. I streamlined the internship application process by digitizing workflows and building a secure backend for handling candidate documents, reducing the HR processing time significantly.",
      tech: ["MERN Stack", "Secure Uploads", "Admin Panel", "Data Filtering"],
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      images: [
        "/StajNet/Home.png",
        "/StajNet/Dashboard.png",
        "/StajNet/Offers.png",
        "/StajNet/Workshops.png"
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