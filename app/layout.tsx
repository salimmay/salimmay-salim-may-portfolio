import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "./globals.css";

// Inter is a variable font, so 'weights' are usually optional, 
// but keeping your config is fine.
//const inter = Inter({subsets: ["latin"], weight: ['300', '400', '500', '600', '700', '800', '900'], display: 'swap',});

export const metadata: Metadata = {
    title: "Salim May - Portfolio & Blog",
    description: "Business Information Systems Graduate specializing in System Administration, Web Development, and Creative Design.",
    keywords: ["web development", "portfolio", "blog", "system administration", "creative design", "Salim May"],
    authors: [{ name: "Salim May" }],
    openGraph: {
        title: "Salim May - Portfolio & Blog",
        description: "Business Information Systems Graduate specializing in System Administration, Web Development, and Creative Design.",
        type: "website",
         url: "https://salim-may-portfolio.vercel.app/", 
        images: [
            {
                url: "/me.jpg",
                width: 1200,
                height: 630,
                alt: "Salim May Portfolio",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // 1. Added 'scroll-smooth' for the navigation links
        <html lang="en" className="scroll-smooth">
            {/* 2. Added global dark theme classes to body */}
            <body className={`bg-slate-950 text-slate-300 antialiased selection:bg-blue-500/30 selection:text-white`}>
                {children}
            </body>
        </html>
    );
}