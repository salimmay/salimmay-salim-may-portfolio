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
                url: "/me.png",
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
            <head>
                {/* Has to run before hydration. By the time a React effect could
                    set this, the browser has already restored the previous
                    scroll offset — and Chrome re-applies that restore as
                    lazily-loaded content grows the document, which is how you
                    end up dropped into the middle of the projects section. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `if("scrollRestoration" in history)history.scrollRestoration="manual";`,
                    }}
                />
            </head>
            <body className={`bg-slate-950 text-slate-300 antialiased selection:bg-blue-500/30 selection:text-white`}>
                {children}
            </body>
        </html>
    );
}