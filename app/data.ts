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
      role: "Frontend Developer",
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
      desc: "A comprehensive SaaS solution for event venue management with RBAC.",
      story: "The event management space is cluttered with tools that don't talk to each other. Fiesta App was born out of the need to unify venue booking, financial reporting, and vendor management. I engineered a complex Role-Based Access Control (RBAC) system for multi-user environments.",
      tech: ["React", "TypeScript", "Node.js", "MongoDB", "Redux Toolkit"],
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