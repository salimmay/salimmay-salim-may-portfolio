import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://salim-may-portfolio.vercel.app/"),

    title: "Salim May - Portfolio & Blog",
    description: "Business Information Systems Graduate specializing in System Administration, Web Development, and Creative Design.",
    keywords: ["web development", "portfolio", "blog", "system administration", "creative design", "Salim May"],
    authors: [{ name: "Salim May" }],
    openGraph: {
        title: "Salim May - Portfolio & Blog",
        description: "Business Information Systems Graduate specializing in System Administration, Web Development, and Creative Design.",
        type: "website",
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
        <html lang="en" className="scroll-smooth">
            <body className={`bg-slate-950 text-slate-300 antialiased selection:bg-blue-500/30 selection:text-white`}>
                {children}
            </body>
        </html>
    );
}