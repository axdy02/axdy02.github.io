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
import Hyperspeed, {
  type HyperspeedEffectOptions,
} from "./Hyperspeed";
import Particles from "./Particles";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="scene-loader">Initialising system core</div>,
});

const BACKGROUND_PARTICLE_COLORS = ["#b8ff3d", "#92d52d", "#d6ff91"];

const HERO_HYPERSPEED_OPTIONS: HyperspeedEffectOptions = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x050805,
    islandColor: 0x0b1409,
    background: 0x000000,
    shoulderLines: 0x263b18,
    brokenLines: 0x1d3112,
    leftCars: [0x2d5a17, 0x6fae2b, 0xb8ff3d],
    rightCars: [0x173b0d, 0x4e851d, 0x91d72d],
    sticks: 0xa8f335,
  },
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

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the synchronous browser fallback.
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    field.remove();
  }

  return copied;
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
    <div className="project-meta-block">
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
  const heroMedia = project.media[0];

  return (
    <article className="case-study" id={project.slug}>
      <Reveal>
        <div className="case-heading-row">
          <SectionKicker index="01">Flagship system</SectionKicker>
          <h2 className="case-title acid">{project.title}</h2>
        </div>
        <div className="case-intro floodready-intro">
          <div className="floodready-copy">
            <p className="case-lede">{project.summary}</p>
            <p className="case-supporting">{project.supportingLine}</p>
          </div>
          <div className="floodready-aside">
            <figure className="floodready-preview-frame">
              <figcaption>
                <span>Landing experience</span>
                <span>Live product / 2026</span>
              </figcaption>
              <div className="floodready-preview-window">
                <img
                  src={heroMedia.src}
                  alt={heroMedia.alt}
                  width="1844"
                  height="1044"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </figure>
            <ProjectMeta project={project} />
          </div>
        </div>
      </Reveal>

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
              One underwater frame, shown through restoration, enhancement, and
              the final detection output.
            </p>
          </div>
          <ProjectMeta project={project} />
        </div>
      </Reveal>

      <Reveal className="aquavision-stage">
        <div
          className="aquavision-gallery"
          aria-label="AquaVision image processing stages"
        >
          {project.media.map((media, index) => (
            <figure className="aquavision-frame" key={media.src}>
              <figcaption>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{media.caption}</span>
              </figcaption>
              <div className="aquavision-image">
                <img
                  src={media.src}
                  alt={media.alt}
                  width="270"
                  height="269"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </figure>
          ))}
        </div>
        <div className="stage-caption">
          <span>One source frame / four processing stages</span>
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

export default function PortfolioExperience() {
  const [booting, setBooting] = useState(true);
  const [emailCopied, setEmailCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<NavSectionId>("work");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const emailResetTimerRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const timer = window.setTimeout(
      () => setBooting(false),
      reducedMotion ? 350 : 1050,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  useEffect(
    () => () => window.clearTimeout(emailResetTimerRef.current),
    [],
  );

  const handleEmailCopy = async () => {
    const copied = await copyText(site.email);

    if (!copied) {
      window.location.href = `mailto:${site.email}`;
      return;
    }

    window.clearTimeout(emailResetTimerRef.current);
    setEmailCopied(true);
    emailResetTimerRef.current = window.setTimeout(
      () => setEmailCopied(false),
      2200,
    );
  };

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
    // Release the scroll lock immediately when an in-menu anchor is chosen.
    // The exit animation can remain mounted briefly, so waiting for the effect
    // cleanup here would leave the page unscrollable during that transition.
    document.body.classList.remove("menu-open");
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Particles
        className="site-particles"
        particleColors={BACKGROUND_PARTICLE_COLORS}
        particleCount={200}
        particleSpread={10}
        speed={0.08}
        particleBaseSize={90}
        sizeRandomness={0.85}
        moveParticlesOnHover
        particleHoverFactor={0.55}
        alphaParticles={false}
        disableRotation={false}
        pixelRatio={1}
      />
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
                <strong>{site.name}</strong>
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
          <span className="monogram-mark" aria-hidden="true">
            {site.mark}
          </span>
          <span>{site.name}</span>
        </a>
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
              <div className="action-row hero-actions">
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
          <div
            className="hero-visual"
            id="hero-core-window"
            role="img"
            aria-label="Interactive AK system core. Click and drag horizontally to rotate it."
          >
            <Hyperspeed
              className="hero-hyperspeed"
              effectOptions={HERO_HYPERSPEED_OPTIONS}
            />
            <HeroScene className="hero-scene" />
          </div>
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
                    <span className="work-year">
                      {"year" in project ? project.year : "View system"}
                    </span>
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
                curious full-stack builder could help? Send the useful context
                directly.
              </p>
              <p className="contact-copy-note">
                Email is the clearest way to start. You can also find my work,
                profile, and résumé below.
              </p>
            </div>
            <div className="contact-direct">
              <p className="contact-direct-label">
                {emailCopied ? "Copied to clipboard" : "Direct email"}
              </p>
              <button
                className={`contact-email${emailCopied ? " is-copied" : ""}`}
                type="button"
                onClick={handleEmailCopy}
                aria-label={`Copy email address ${site.email}`}
                aria-describedby="email-copy-status"
              >
                <span>{site.email}</span>
                <span aria-hidden="true">
                  {emailCopied ? "Copied" : "Copy"}
                </span>
              </button>
              <span
                className="sr-only"
                id="email-copy-status"
                role="status"
                aria-live="polite"
              >
                {emailCopied
                  ? `${site.email} copied to clipboard.`
                  : "Click to copy the email address."}
              </span>
              <div className="contact-links">
                {contactLinks
                  .filter((link) => link.id !== "email")
                  .map((link) => (
                    <a
                      className="contact-link"
                      href={link.href}
                      key={link.id}
                      aria-label={link.ariaLabel}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noreferrer" : undefined}
                      download={"download" in link ? link.download : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
              </div>
            </div>
          </div>
          <footer className="footer">
            <span>© 2026 Ansh Kapoor</span>
            <a href="#top">Back to top ↑</a>
          </footer>
        </section>
      </main>
      <div className="cursor" ref={cursorRef} aria-hidden="true" />
    </div>
  );
}
