import type { Metadata } from "next";
import "./globals.css";
import { META_DESCRIPTION, META_TITLE, OG_ALT, SITE_URL } from "./lib/seo";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: META_TITLE,
    description: META_DESCRIPTION,
    // `keywords` is deliberately gone: Google has ignored it since 2009, and the
    // old list ("blog") described a section that doesn't exist on this site.
    authors: [{ name: "Salim May", url: SITE_URL }],
    creator: "Salim May",
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
        title: META_TITLE,
        description: META_DESCRIPTION,
        url: SITE_URL,
        siteName: "Salim May",
        locale: "en_US",
        type: "profile",
        images: [
            {
                url: "/me.png",
                // The real pixel size of the file. It was declared 1200x630,
                // which made social cards crop straight through the face.
                width: 1024,
                height: 1536,
                alt: OG_ALT,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: META_TITLE,
        description: META_DESCRIPTION,
        images: [{ url: "/me.png", alt: OG_ALT }],
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
