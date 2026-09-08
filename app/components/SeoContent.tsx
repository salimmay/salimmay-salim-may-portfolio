import { DATA } from "../data";
import { H1 } from "../lib/seo";

/**
 * The document's semantic content, always present in the served HTML.
 *
 * Why this exists: every layout in this site is a client component, and the 3D
 * one is dynamic with ssr:false. The prerendered page was therefore a 10 KB
 * shell with a completely empty <body> — no headings, no project names, no
 * copy. Googlebot renders JavaScript on a second pass and would eventually get
 * there, but Bing, LinkedIn, Slack, Discord and most AI crawlers do not render
 * at all, so they saw nothing whatsoever.
 *
 * This is a server component, so it lands in the static HTML. It is sr-only
 * rather than hidden: `sr-only` clips it visually while leaving it in the
 * accessibility tree, which is also a genuine win here — the visible site is
 * WebGL and animation heavy and reads poorly to a screen reader. It mirrors the
 * visible content rather than adding keywords that aren't on the page, so it is
 * not cloaking; display:none would be, and would be discounted anyway.
 */
export default function SeoContent() {
  return (
    <section className="sr-only" aria-label="Portfolio summary">
      <h1>{H1}</h1>
      <p>{DATA.personal.bio}</p>
      <p>
        Based in {DATA.personal.location}. Contact: {DATA.personal.email}.
      </p>

      <h2>Technical stack</h2>
      {DATA.techStack.map((group) => (
        <p key={group.title}>
          <strong>{group.title}:</strong> {group.skills.join(", ")}
        </p>
      ))}

      <h2>Experience</h2>
      {DATA.experience.map((role) => (
        <article key={`${role.company}-${role.date}`}>
          <h3>
            {role.role} at {role.company}
          </h3>
          <p>{role.date}</p>
          {role.achievements.map((achievement) => (
            <p key={achievement}>{achievement}</p>
          ))}
          <p>Stack: {role.stack.join(", ")}</p>
        </article>
      ))}

      <h2>Selected work</h2>
      {DATA.projects.map((project) => (
        <article key={project.id}>
          <h3>
            {project.title} — {project.category}
          </h3>
          <p>{project.desc}</p>
          <p>Built with {project.tech.join(", ")}.</p>
        </article>
      ))}

      <h2>Contact</h2>
      <p>
        Email {DATA.personal.email} or call {DATA.personal.phone}.
      </p>
      <ul>
        <li>
          <a href={DATA.personal.socials.github}>GitHub</a>
        </li>
        <li>
          <a href={DATA.personal.socials.linkedin}>LinkedIn</a>
        </li>
        <li>
          <a href={DATA.personal.socials.behance}>Behance</a>
        </li>
      </ul>
    </section>
  );
}
