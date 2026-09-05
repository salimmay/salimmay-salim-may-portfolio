import { DATA, STATS } from "../data";

/**
 * Single source of truth for search/social copy and structured data.
 *
 * Targeting, in priority order:
 *  1. Brand        — "Salim May", "salimmay"
 *  2. Role + geo   — "full stack developer Tunis / Tunisia", "system admin Tunis"
 *  3. Stack + geo  — "React developer Tunisia", "Next.js developer Tunis"
 *
 * Geo is the realistic differentiator here: competing for bare "full stack
 * developer" is hopeless, while "full stack developer Tunis" is winnable and is
 * what someone hiring locally or nearshore actually types.
 */

export const SITE_URL = "https://salim-may-portfolio.vercel.app";

/** 54 chars — under the ~60 Google renders before truncating. */
export const META_TITLE = "Salim May — Full Stack Developer & System Admin, Tunis";

/** 143 chars — under the ~155 that survives truncation on desktop. */
export const META_DESCRIPTION =
  "Full stack developer in Tunis building React, Next.js and Node platforms — from a multi-vertical SaaS to a real-time 3D marketplace. See the work.";

/** Carries the keyword without wrecking the visual design. */
export const H1 = "Salim May — Full Stack Developer & System Admin in Tunis";

export const OG_ALT = "Salim May, full stack developer based in Tunis, Tunisia";

/**
 * Descriptive alt text, keyed by the image path in DATA. Written to describe
 * what is actually on screen — "Filmstrip" and "thumb" told a screen reader
 * (and an image crawler) nothing at all.
 */
export const IMAGE_ALT: Record<string, string> = {
  "/me.png": "Portrait of Salim May, full stack developer in Tunis",

  "/Terkina/Home.png": "Terkina agency site homepage with a split-screen video hero",
  "/Terkina/Album.png": "Terkina photography album carousel",
  "/Terkina/Orbit.png": "Terkina 360-degree orbital gallery of album covers",
  "/Terkina/Marketplace.png": "Terkina WebGL 3D product marketplace",
  "/Terkina/3d.png": "Terkina 3D model viewer with finish and colour switchers",
  "/Terkina/admin.png": "Terkina admin dashboard showing live database metrics",
  "/Terkina/crm.png": "Terkina CRM with drag-and-drop gallery ordering and stock controls",

  "/Fiesta/Home.png": "Fiesta App landing page for the venue management platform",
  "/Fiesta/dashboard.png": "Fiesta App dashboard showing bookings and venue activity",
  "/Fiesta/contract.png": "Fiesta App contract management screen",
  "/Fiesta/event.png": "Fiesta App event planning and scheduling view",
  "/Fiesta/Finance.png": "Fiesta App finance overview with revenue breakdown",
  "/Fiesta/invoice.png": "Fiesta App automated invoice generated with Puppeteer",
  "/Fiesta/tasks.png": "Fiesta App task board for event staff",

  "/AutoScout/home.png": "AutoScout homepage for the Tunisian car search aggregator",
  "/AutoScout/listings1.png": "AutoScout aggregated car listings from multiple marketplaces",
  "/AutoScout/listings2.png": "AutoScout listing results with normalised vehicle specifications",
  "/AutoScout/Browse.png": "AutoScout browse view with price and specification filters",

  "/Atlas/dashboard.png": "Atlas Insights analytics dashboard with time-series metrics",
  "/Atlas/api-docs.png": "Atlas Insights API documentation for the event ingestion endpoint",

  "/CuisineIQ/Home.png": "Cuisine IQ homepage for the contactless restaurant ordering system",
  "/CuisineIQ/SignIn.png": "Cuisine IQ staff sign-in screen",
  "/CuisineIQ/Orders.png": "Cuisine IQ live kitchen order queue over WebSockets",
  "/CuisineIQ/QRGenerator.png": "Cuisine IQ QR code generator for restaurant tables",
  "/CuisineIQ/Analytics.png": "Cuisine IQ sales analytics for restaurant owners",
  "/CuisineIQ/ShopSettings.png": "Cuisine IQ restaurant settings and menu configuration",
  "/CuisineIQ/PhoneMenu.jpg": "Cuisine IQ mobile menu as a diner sees it after scanning a QR code",
  "/CuisineIQ/PhoneOrder.jpg": "Cuisine IQ mobile ordering flow on a phone",

  "/Zen/history.png": "Zen History Firefox extension showing categorised browsing history",
  "/Zen/time-wasted.png": "Zen History time-tracking breakdown by site category",
  "/Zen/zen-reflections.png": "Zen History AI-generated reflections on browsing habits",

  "/Syrvis/Category.png": "Syrvis e-commerce category browsing page",
  "/Syrvis/Products.png": "Syrvis tech accessories product listing",
  "/Syrvis/Comparison.png": "Syrvis side-by-side product comparison view",
  "/Syrvis/Dashboard.png": "Syrvis seller dashboard with inventory overview",
  "/Syrvis/ManageOrders.png": "Syrvis order management screen",

  "/SalimOS/Desktop.png": "SalimOS browser-based desktop environment with draggable windows",
};

/** Falls back to a useful description rather than an empty alt. */
export const altFor = (src: string, projectTitle?: string) =>
  IMAGE_ALT[src] ?? (projectTitle ? `${projectTitle} project screenshot` : "Project screenshot");

const PERSON_ID = `${SITE_URL}/#salim`;

/**
 * Structured data. Note on expectations: SoftwareApplication only produces a
 * *rich result* when it carries offers or an aggregateRating, which these don't
 * — they aren't products for sale. The value here is entity understanding, i.e.
 * helping Google connect "Salim May" to these named applications and to the
 * technologies behind them. Person and WebSite do the heavier lifting.
 */
export const buildSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: DATA.personal.name,
    jobTitle: DATA.personal.role,
    description: META_DESCRIPTION,
    email: `mailto:${DATA.personal.email}`,
    telephone: DATA.personal.phone,
    url: SITE_URL,
    image: `${SITE_URL}/me.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tunis",
      addressCountry: "TN",
    },
    knowsAbout: DATA.techStack.flatMap((group) => group.skills),
    sameAs: [
      DATA.personal.socials.github,
      DATA.personal.socials.linkedin,
      DATA.personal.socials.behance,
    ],
    worksFor: DATA.experience.slice(0, 1).map((role) => ({
      "@type": "Organization",
      name: role.company,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: META_TITLE,
    description: META_DESCRIPTION,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Projects by ${DATA.personal.name}`,
    numberOfItems: STATS.projects,
    itemListElement: DATA.projects.map((project, index) => {
      const link = (project as { link?: string }).link;
      const live = (project as { ExternalLink?: string }).ExternalLink;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: project.title,
          applicationCategory: "WebApplication",
          operatingSystem: "Web browser",
          description: project.desc,
          author: { "@id": PERSON_ID },
          programmingLanguage: project.tech,
          ...(project.images?.[0] ? { image: `${SITE_URL}${project.images[0]}` } : {}),
          ...(live ? { url: live } : {}),
          ...(link ? { codeRepository: link } : {}),
        },
      };
    }),
  },
];
