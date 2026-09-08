import SeoContent from "./components/SeoContent";
import PortfolioRouter from "./PortfolioRouter";
import { buildSchema } from "./lib/seo";

/**
 * Server component wrapper for the homepage.
 *
 * SeoContent and the Person/WebSite/ItemList schema used to be rendered from the
 * root layout, which meant they also landed on /tools — putting the portfolio's
 * H1 and its entire document outline onto a page about something else, and
 * competing with that page's own heading. Both belong to this route only.
 *
 * PortfolioRouter is the client half; keeping it in its own module is what lets
 * this file stay a server component and emit the markup into the static HTML.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
      />
      <SeoContent />
      <PortfolioRouter />
    </>
  );
}
