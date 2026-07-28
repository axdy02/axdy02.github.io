"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves these supplied screenshots directly; every image has intrinsic dimensions and lazy loading. */

import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  type CSSProperties,
  type FormEvent,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  assetPaths,
  capabilities,
  contactLinks,
  education,
  experience,
  involvement,
  navItems,
  projects,
  site,
  type NavSectionId,
  type Project,
} from "../site-data";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="scene-loader">Initialising system core</div>,
});

const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

type ContactValues = {
  name: string;
  email: string;
  project: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const initialContactValues: ContactValues = {
  name: "",
  email: "",
  project: "",
  message: "",
};

function Reveal({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 38 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ExternalAction({
  href,
  children,
  className = "",
  download,
}: PropsWithChildren<{
  href: string;
  className?: string;
  download?: string;
}>) {
  const external = href.startsWith("http");

  return (
    <a
      className={`button ${className}`.trim()}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      download={download}
    >
      {children}
    </a>
  );
}

function SectionKicker({
  index,
  children,
}: PropsWithChildren<{ index: string }>) {
  return (
    <p className="section-kicker">
      {index} / {children}
    </p>
  );
}

function MediaFrame({
  media,
  eager = false,
  compact = false,
}: {
  media: Project["media"][number];
  eager?: boolean;
  compact?: boolean;
}) {
  const dimensions = media.src.includes("logo")
    ? { width: 216, height: 53 }
    : media.src.includes("area-intelligence")
      ? { width: 1845, height: 1053 }
      : media.src.includes("dashboard.png") &&
          media.src.includes("floodready")
        ? { width: 1844, height: 1032 }
        : media.src.includes("floodready-map")
          ? { width: 1863, height: 1042 }
          : media.src.includes("floodready-reports")
            ? { width: 1846, height: 1046 }
            : media.src.includes("submit-report")
              ? { width: 1845, height: 1033 }
              : media.src.includes("emostudy")
                ? { width: 1849, height: 1044 }
                : { width: 1844, height: 1044 };

  return (
    <figure className={`media-card${compact ? " is-logo" : ""}`}>
      <figcaption className="media-label">{media.caption}</figcaption>
      <img
        src={media.src}
        alt={media.alt}
        width={dimensions.width}
        height={dimensions.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

function ProjectNotes({ project }: { project: Project }) {
  const thirdLabel = project.details.keyDecision
    ? "Key decision"
    : project.details.focus
      ? "Product focus"
      : "Design constraint";
  const thirdValue =
    project.details.keyDecision ??
    project.details.focus ??
    project.details.constraint ??
    "";

  return (
    <div className="project-notes">
      <article className="project-note">
        <span>01 / The problem</span>
        <h3>What needed solving</h3>
        <p>{project.details.problem}</p>
      </article>
      <article className="project-note">
        <span>02 / The approach</span>
        <h3>How it was shaped</h3>
        <p>{project.details.approach}</p>
      </article>
      <article className="project-note">
        <span>03 / {thirdLabel}</span>
        <h3>Where judgment mattered</h3>
        <p>{thirdValue}</p>
      </article>
    </div>
  );
}

function ProjectMeta({ project }: { project: Project }) {
  return (
    <div>
      <dl className="case-meta">
        {project.year ? (
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
        ) : null}
        <div>
          <dt>Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{project.stack.join(" · ")}</dd>
        </div>
      </dl>
      <div className="action-row case-actions">
        {project.liveUrl ? (
          <ExternalAction href={project.liveUrl} className="primary">
            View live
          </ExternalAction>
        ) : null}
        <ExternalAction href={project.repoUrl}>Source code</ExternalAction>
      </div>
    </div>
  );
}

function FloodReadyCase() {
  const project = projects[0];
  const [heroMedia, ...supportingMedia] = project.media;

  return (
    <article className="case-study" id={project.slug}>
      <Reveal>
        <div className="case-heading-row">
          <SectionKicker index="01">Flagship system</SectionKicker>
          <h2 className="case-title acid">{project.title}</h2>
        </div>
        <div className="case-intro">
          <div>
            <p className="case-lede">{project.summary}</p>
            <p className="case-supporting">{project.supportingLine}</p>
          </div>
          <ProjectMeta project={project} />
        </div>
      </Reveal>

      <Reveal className="project-hero-media">
        <span className="media-label">{heroMedia.caption}</span>
        <img
          src={heroMedia.src}
          alt={heroMedia.alt}
          width="1844"
          height="1044"
          loading="lazy"
          decoding="async"
        />
      </Reveal>

      <div className="media-grid">
        {supportingMedia.map((media, index) => (
          <Reveal
            key={media.src}
            className={index === supportingMedia.length - 1 ? "media-logo-wrap" : ""}
          >
            <MediaFrame
              media={media}
              compact={index === supportingMedia.length - 1}
            />
          </Reveal>
        ))}
      </div>

      <Reveal>
        <ProjectNotes project={project} />
      </Reveal>

      <Reveal className="architecture">
        <div className="architecture-head">
          <h3>Resilient report flow</h3>
          <span>Designed to preserve evidence</span>
        </div>
        <div
          className="flow"
          style={{
            "--flow-count": project.architectureFlow?.length ?? 1,
          } as CSSProperties}
        >
          {project.architectureFlow?.map((step, index) => (
            <div className="flow-step" key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </article>
  );
}

function EmoStudyCase() {
  const project = projects[1];
  const media = project.media[0];

  return (
    <article className="case-study" id={project.slug}>
      <Reveal>
        <div className="case-heading-row">
          <SectionKicker index="02">Human-centred product</SectionKicker>
          <h2 className="case-title">{project.title}</h2>
        </div>
        <div className="case-intro">
          <div>
            <p className="case-lede">{project.summary}</p>
            <p className="case-supporting">{project.supportingLine}</p>
          </div>
          <ProjectMeta project={project} />
        </div>
      </Reveal>

      <div className="emostudy-layout">
        <Reveal className="project-hero-media emostudy-media">
          <span className="media-label">{media.caption}</span>
          <img
            src={media.src}
            alt={media.alt}
            width="1849"
            height="1044"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
        <Reveal className="emostudy-side">
          <div className="signal-card">
            <small>Focus session / concept signal</small>
            <div className="timer-face">
              25:00 <span>MIN</span>
            </div>
          </div>
          <div className="signal-card">
            <small>Private, on-device expression signal</small>
            <div className="signal-bars" aria-hidden="true">
              {Array.from({ length: 7 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <ProjectNotes project={project} />
      </Reveal>
    </article>
  );
}

function AquaVisionCase() {
  const project = projects[2];
  const stages = ["Original", "Restored", "Enhanced", "Detected"];

  return (
    <article className="case-study" id={project.slug}>
      <Reveal>
        <div className="case-heading-row">
          <SectionKicker index="03">Computer vision system</SectionKicker>
          <h2 className="case-title acid">{project.title}</h2>
        </div>
        <div className="case-intro">
          <div>
            <p className="case-lede">{project.summary}</p>
            <p className="case-supporting">
              Visual samples are being prepared. The pipeline and source code are
              available now.
            </p>
          </div>
          <ProjectMeta project={project} />
        </div>
      </Reveal>

      <Reveal className="aquavision-stage">
        <div className="stage-placeholder">
          {stages.map((stage, index) => (
            <div className="stage-node" key={stage}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{stage}</span>
            </div>
          ))}
        </div>
        <div className="stage-caption">
          <span>Pipeline visual / samples deliberately withheld until ready</span>
          <span>Classical image processing + lightweight detection</span>
        </div>
      </Reveal>

      <Reveal>
        <ProjectNotes project={project} />
      </Reveal>

      <Reveal className="architecture">
        <div className="architecture-head">
          <h3>Technical pipeline</h3>
          <span>Designed for laptop-class hardware</span>
        </div>
        <ul className="technical-list">
          {project.technicalHighlights?.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </article>
  );
}

function ContactForm() {
  const [values, setValues] = useState(initialContactValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setValue = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: ContactErrors = {};
    if (!values.name.trim()) nextErrors.name = "Please add your name.";
    if (!values.email.trim()) {
      nextErrors.email = "Please add your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = "Please use a valid email address.";
    }
    if (!values.message.trim()) {
      nextErrors.message = "Tell me a little about the problem.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    if (!validate()) return;

    if (!contactEndpoint) {
      const subject = encodeURIComponent(
        values.project.trim()
          ? `${values.project.trim()} — portfolio enquiry`
          : "Portfolio enquiry",
      );
      const body = encodeURIComponent(
        `Hi Ansh,\n\n${values.message.trim()}\n\nFrom: ${values.name.trim()} (${values.email.trim()})`,
      );
      setStatus("Opening your email app with this message filled in.");
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Contact endpoint rejected the message.");
      setValues(initialContactValues);
      setStatus("Message sent. I’ll get back to you soon.");
    } catch {
      setStatus(
        `The form could not send right now. Email me directly at ${site.email}.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setValue("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="name-error"
            placeholder="How should I address you?"
          />
          <span className="field-error" id="name-error">
            {errors.name}
          </span>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-error"
            placeholder="you@example.com"
          />
          <span className="field-error" id="email-error">
            {errors.email}
          </span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="project">Project or opportunity</label>
        <input
          id="project"
          name="project"
          value={values.project}
          onChange={(event) => setValue("project", event.target.value)}
          placeholder="What are we exploring?"
        />
        <span className="field-error" aria-hidden="true" />
      </div>
      <div className="field">
        <label htmlFor="message">The problem</label>
        <textarea
          id="message"
          name="message"
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby="message-error"
          placeholder="A few useful details are enough to start."
        />
        <span className="field-error" id="message-error">
          {errors.message}
        </span>
      </div>
      <div className="form-footer">
        <div>
          <p className="form-note">
            {contactEndpoint
              ? "Your message is sent through the connected contact service."
              : "This static portfolio opens your email app; nothing is stored here."}
          </p>
          <p className="form-status" aria-live="polite">
            {status}
          </p>
        </div>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Sending" : "Start a conversation"}
        </button>
      </div>
    </form>
  );
}

export default function PortfolioExperience() {
  const [booting, setBooting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<NavSectionId>("work");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      try {
        const hasBooted = window.sessionStorage.getItem("ak-portfolio-booted");
        if (hasBooted || reducedMotion) return;
        setBooting(true);
        timer = window.setTimeout(() => {
          setBooting(false);
          window.sessionStorage.setItem("ak-portfolio-booted", "true");
        }, 1050);
      } catch {
        setBooting(true);
        timer = window.setTimeout(() => setBooting(false), 700);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id as NavSectionId);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0.05, 0.2, 0.5] },
    );

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add("menu-open");
    const previousFocus = document.activeElement as HTMLElement | null;
    const menu = menuRef.current;
    const focusables = menu?.querySelectorAll<HTMLElement>("a, button");
    focusables?.[0]?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", handleKey);
      if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const move = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("is-visible");
      const target = event.target as Element | null;
      cursor.classList.toggle(
        "is-hovering",
        Boolean(target?.closest("a, button, input, textarea")),
      );
    };
    const hide = () => cursor.classList.remove("is-visible");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <AnimatePresence>
        {booting ? (
          <motion.div
            className="boot-screen"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="boot-inner">
              <div className="boot-copy">
                <strong>{site.mark}</strong>
                <span>
                  System online
                  <br />
                  Delhi / 2026
                </span>
              </div>
              <div className="boot-line">
                <span />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
        <a className="monogram" href="#top" aria-label="Ansh Kapoor, home">
          <span className="monogram-mark">{site.mark}</span>
          <span>{site.name}</span>
        </a>
        <span className="topbar-status">
          <i className="status-dot" aria-hidden="true" />
          {site.availability}
        </span>
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              className={`nav-link${activeSection === item.id ? " is-active" : ""}`}
              href={item.href}
              key={item.id}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="menu-toggle"
          ref={menuButtonRef}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-icon" aria-hidden="true" />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="mobile-menu"
            id="mobile-navigation"
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => (
                <a href={item.href} key={item.id} onClick={closeMenu}>
                  {item.label} <span>{item.index}</span>
                </a>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="page-main" id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-meta">
              <span>{site.identityLabel}</span>
              <span>{site.heroMicrocopy}</span>
            </div>
            <div>
              <h1 className="hero-title" id="hero-title">
                <span>{site.headline[0]}</span>
                <span>{site.headline[1]}</span>
              </h1>
              <div className="hero-summary-row">
                <p className="hero-summary">{site.summary}</p>
                <div className="action-row">
                  <ExternalAction href="#work" className="primary">
                    Explore work
                  </ExternalAction>
                  <ExternalAction
                    href={assetPaths.resume}
                    className="download"
                    download="Ansh-Kapoor-Resume.pdf"
                  >
                    Resume
                  </ExternalAction>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-label="Abstract AK system core">
            <div className="scene-fallback" aria-hidden="true">
              <div className="scene-fallback-core">AK</div>
            </div>
            <HeroScene />
            <span className="visual-corner">AK / System core / 01</span>
            <span className="visual-index">Full-stack / product / systems</span>
          </div>
          <span className="scroll-cue" aria-hidden="true">
            Scroll to inspect
          </span>
        </section>

        <div className="proof-strip" aria-label="Selected proof points">
          <div className="proof-track">
            {[0, 1].flatMap((copy) =>
              [
                "Product-minded full-stack work",
                "500K+ records processed at CDAC",
                "Maps, computer vision, and adaptive interfaces",
                "From interface to deployment",
              ].map((item) => (
                <span className="proof-item" key={`${copy}-${item}`}>
                  {item}
                </span>
              )),
            )}
          </div>
        </div>

        <section className="section-shell" id="work" aria-labelledby="work-title">
          <div className="section-grid">
            <SectionKicker index="01">Selected work</SectionKicker>
            <div>
              <Reveal>
                <h2 className="section-heading" id="work-title">
                  PRODUCTS BUILT TO <em>WORK.</em>
                </h2>
              </Reveal>
              <div className="work-index">
                {projects.map((project) => (
                  <a className="work-row" href={`#${project.slug}`} key={project.slug}>
                    <span className="work-number">{project.index}</span>
                    <h3 className="work-name">{project.title}</h3>
                    <span className="work-type">{project.subtitle}</span>
                    <span className="work-year">{project.year ?? "View system"}</span>
                    <span className="work-arrow" aria-hidden="true">
                      ↘
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FloodReadyCase />
        <EmoStudyCase />
        <AquaVisionCase />

        <section
          className="section-shell capabilities"
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="capabilities-layout">
            <div className="capabilities-sticky">
              <SectionKicker index="02">Capabilities</SectionKicker>
              <h2 id="capabilities-title">
                ONE BUILDER.
                <br />
                <span>FULL SYSTEM.</span>
              </h2>
              <p>
                I move across the product stack so the interface, application
                logic, data model, and deployment reinforce one another.
              </p>
            </div>
            <div className="capability-list">
              {capabilities.map((capability) => (
                <article className="capability" key={capability.id}>
                  <span className="capability-number">{capability.index}</span>
                  <h3>{capability.title}</h3>
                  <div className="capability-bottom">
                    <p>{capability.summary}</p>
                    <div className="tag-list" aria-label={`${capability.title} tools`}>
                      {capability.skills.map((skill) => (
                        <span className="tag" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-shell"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-grid">
            <SectionKicker index="03">Experience</SectionKicker>
            <div>
              <Reveal>
                <h2 className="section-heading" id="experience-title">
                  LEARNING AT <em>SCALE.</em>
                </h2>
              </Reveal>
              <div className="experience-list">
                {experience.map((item) => (
                  <article className="experience-row" key={item.id}>
                    <span className="experience-date">{item.period}</span>
                    <span className="experience-org">{item.organization}</span>
                    <div className="experience-body">
                      <h3>{item.role}</h3>
                      <p>{item.summary}</p>
                      <div className="tag-list experience-tags">
                        {item.tags.map((tag) => (
                          <span className="tag dark" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="education-grid">
            {education.map((item) => (
              <article className="education-card" key={item.id}>
                <small>Education / {item.period}</small>
                <div>
                  <h3>{item.degree}</h3>
                  <p>{item.institution}</p>
                </div>
              </article>
            ))}
            {involvement.map((item) => (
              <article className="education-card" key={item.id}>
                <small>Involvement / {item.year}</small>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.role}</p>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section-shell about"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-layout">
            <div>
              <SectionKicker index="04">About</SectionKicker>
              <Reveal>
                <h2 className="about-statement" id="about-title">
                  I TURN MESSY, REAL-WORLD PROBLEMS INTO PRODUCTS PEOPLE CAN{" "}
                  <span>ACTUALLY USE.</span>
                </h2>
              </Reveal>
            </div>
            <div className="about-aside">
              <p>{site.about.primary}</p>
              <p>{site.about.personality}</p>
            </div>
          </div>
          <div className="principles">
            <article className="principle">
              <b>01 / See the whole system</b>
              <p>
                The screen, API, data model, and deployment are one product—not
                separate hand-offs.
              </p>
            </article>
            <article className="principle">
              <b>02 / Design before decoration</b>
              <p>{site.about.designInterest}</p>
            </article>
            <article className="principle">
              <b>03 / Learn by shipping</b>
              <p>{site.about.interests}</p>
            </article>
          </div>
        </section>

        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <SectionKicker index="05">Contact</SectionKicker>
          <h2 className="contact-heading" id="contact-title">
            {site.contact.headline[0]} /<br />
            {site.contact.headline[1]}
            <span>{site.contact.supportingLine}</span>
          </h2>
          <div className="contact-layout">
            <div className="contact-copy">
              <p>
                Have an internship, graduate role, or product problem where a
                curious full-stack builder could help? Send the useful context.
              </p>
              <div className="contact-links">
                {contactLinks.map((link) => (
                  <a
                    className="contact-link"
                    href={link.href}
                    key={link.id}
                    aria-label={link.ariaLabel}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    download={link.download}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
          <footer className="footer">
            <span>© 2026 Ansh Kapoor</span>
            <span>Designed and engineered in Delhi</span>
            <a href="#top">Back to top ↑</a>
          </footer>
        </section>
      </main>
      <div className="cursor" ref={cursorRef} aria-hidden="true" />
    </div>
  );
}
