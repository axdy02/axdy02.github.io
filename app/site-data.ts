export type NavSectionId =
  | "work"
  | "capabilities"
  | "experience"
  | "about"
  | "contact";

export type NavItem = {
  readonly id: NavSectionId;
  readonly index: string;
  readonly label: string;
  readonly href: `#${NavSectionId}`;
};

export type SiteMetadata = {
  readonly name: string;
  readonly mark: string;
  readonly role: string;
  readonly location: string;
  readonly email: string;
  readonly title: string;
  readonly description: string;
  readonly headline: readonly [string, string];
  readonly summary: string;
  readonly identityLabel: string;
  readonly availability: string;
  readonly heroMicrocopy: string;
  readonly about: {
    readonly primary: string;
    readonly personality: string;
    readonly designInterest: string;
    readonly interests: string;
  };
  readonly contact: {
    readonly headline: readonly [string, string];
    readonly supportingLine: string;
  };
};

export type AssetPaths = {
  readonly resume: string;
  readonly projects: {
    readonly floodready: {
      readonly landing: string;
      readonly dashboard: string;
      readonly map: string;
      readonly submitReport: string;
      readonly areaIntelligence: string;
      readonly reports: string;
      readonly logo: string;
    };
    readonly emostudy: {
      readonly focusDashboard: string;
    };
    readonly aquavision: {
      readonly original: string;
      readonly restored: string;
      readonly enhanced: string;
      readonly detected: string;
    };
  };
};

export type ProjectMedia = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly status: "available" | "planned";
};

export type ProjectDetails = {
  readonly problem: string;
  readonly approach: string;
  readonly ownership: string;
  readonly keyDecision?: string;
  readonly focus?: string;
  readonly constraint?: string;
};

export type Project = {
  readonly slug: "floodready" | "emostudy" | "aquavision";
  readonly index: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly repositoryTitle?: string;
  readonly subtitle: string;
  readonly year?: string;
  readonly role: string;
  readonly summary: string;
  readonly supportingLine?: string;
  readonly details: ProjectDetails;
  readonly stack: readonly string[];
  readonly liveUrl?: string;
  readonly repoUrl: string;
  readonly media: readonly ProjectMedia[];
  readonly architectureFlow?: readonly string[];
  readonly technicalHighlights?: readonly string[];
  readonly accent: "flood" | "violet" | "ocean";
};

export type Capability = {
  readonly id: "interfaces" | "systems" | "data-deployment";
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly skills: readonly string[];
};

export type Experience = {
  readonly id: string;
  readonly role: string;
  readonly organization: string;
  readonly period: string;
  readonly summary: string;
  readonly tags: readonly string[];
};

export type Education = {
  readonly id: string;
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
};

export type Involvement = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly year: string;
  readonly summary: string;
};

export type ContactLink = {
  readonly id: "email" | "linkedin" | "github" | "resume";
  readonly label: string;
  readonly href: string;
  readonly ariaLabel: string;
  readonly external: boolean;
  readonly download?: string;
};

export const assetPaths = {
  resume: "/Ansh-Kapoor-Resume.pdf",
  projects: {
    floodready: {
      landing: "/media/projects/floodready/floodready-landing.png",
      dashboard: "/media/projects/floodready/floodready-dashboard.png",
      map: "/media/projects/floodready/floodready-map.png",
      submitReport:
        "/media/projects/floodready/floodready-submit-report.png",
      areaIntelligence:
        "/media/projects/floodready/floodready-area-intelligence.png",
      reports: "/media/projects/floodready/floodready-reports.png",
      logo: "/media/projects/floodready/floodready-logo.png",
    },
    emostudy: {
      focusDashboard:
        "/media/projects/emostudy/emostudy-focus-dashboard.png",
    },
    aquavision: {
      original: "/media/projects/aquavision/original.png",
      restored: "/media/projects/aquavision/restored.png",
      enhanced: "/media/projects/aquavision/enhanced.png",
      detected: "/media/projects/aquavision/detected.png",
    },
  },
} as const satisfies AssetPaths;

export const site = {
  name: "Ansh Kapoor",
  mark: "AK",
  role: "Full-Stack Developer",
  location: "Delhi, India",
  email: "anshk12456@gmail.com",
  title: "Ansh Kapoor — Full-Stack Developer",
  description:
    "Portfolio of Ansh Kapoor, a full-stack developer building intelligent, real-world web applications across interfaces, APIs, data, and deployment.",
  headline: ["ALWAYS LEARNING.", "ALWAYS GROWING."],
  summary:
    "Full-stack developer building intelligent, real-world web applications.",
  identityLabel: "ANSH KAPOOR / FULL-STACK DEVELOPER / DELHI, INDIA",
  availability: "Open to internships and graduate software roles.",
  heroMicrocopy:
    "Built with curiosity, careful systems, and an unreasonable number of browser tabs.",
  about: {
    primary:
      "I like turning messy real-world problems into products people can actually use. That means caring about the screen, the API, the database, and the deployment - not treating any of them as someone else's job. I learn by building, breaking, fixing, and eventually shipping.",
    personality:
      "Usually powered by curiosity, stubborn debugging, and an unreasonable number of browser tabs.",
    designInterest:
      "Sketching and conceptual drawing shaped how I think about layout, hierarchy, and the way an interface feels before a user reads a single line.",
    interests:
      "Interested in full-stack products, useful automation, maps, and thoughtful UI.",
  },
  contact: {
    headline: ["HAVE A PROBLEM", "WORTH BUILDING?"],
    supportingLine: "Let's turn it into something real.",
  },
} as const satisfies SiteMetadata;

export const navItems = [
  { id: "work", index: "01", label: "Work", href: "#work" },
  {
    id: "capabilities",
    index: "02",
    label: "Capabilities",
    href: "#capabilities",
  },
  {
    id: "experience",
    index: "03",
    label: "Experience",
    href: "#experience",
  },
  { id: "about", index: "04", label: "About", href: "#about" },
  { id: "contact", index: "05", label: "Contact", href: "#contact" },
] as const satisfies readonly NavItem[];

export const projects = [
  {
    slug: "floodready",
    index: "01",
    eyebrow: "01 / FLAGSHIP SYSTEM",
    title: "FloodReady",
    subtitle: "Disaster reporting and incident-mapping platform",
    year: "2026",
    role: "Team project · Primary developer / lead full-stack contributor",
    summary:
      "FloodReady is a disaster-reporting and incident-mapping platform where authenticated users can submit geotagged flood evidence, see reports appear on a shared map, and receive background validation supported by image and weather analysis.",
    supportingLine:
      "Led the project's end-to-end implementation across product design, frontend development, backend APIs, database architecture, validation services, containerization, and deployment.",
    details: {
      problem:
        "Flood information is fragmented, delayed, and difficult to evaluate at a local level.",
      approach:
        "Combine citizen-submitted geotagged evidence, shared mapping, and resilient background validation.",
      ownership:
        "Product UI, map experience, API integration, schema and geospatial data, validation flow, Docker setup, deployment, and most end-to-end implementation.",
      keyDecision:
        "Store and expose a report before background validation so a failed analysis cannot erase the original evidence.",
    },
    stack: [
      "Next.js",
      "Node.js",
      "Express",
      "Prisma",
      "PostgreSQL",
      "PostGIS",
      "FastAPI",
      "Docker",
    ],
    liveUrl: "https://floodready.anshkapoor.tech",
    repoUrl: "https://github.com/axdy02/FloodReady",
    media: [
      {
        src: assetPaths.projects.floodready.landing,
        alt: "FloodReady landing page with a dark map, product headline, demonstration state, and calls to action.",
        caption: "Landing experience",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.dashboard,
        alt: "FloodReady dashboard showing validation metrics and a shared report map.",
        caption: "Validation dashboard",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.map,
        alt: "FloodReady reports map with sidebar navigation, persisted report markers, a severity legend, and a submit action.",
        caption: "Shared reports map",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.submitReport,
        alt: "FloodReady report submission interface with category, severity, location selection, and an interactive map.",
        caption: "Geotagged report submission",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.areaIntelligence,
        alt: "FloodReady area intelligence screen with place search, map radius, report summary, and an AI area-summary panel.",
        caption: "Area intelligence",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.reports,
        alt: "FloodReady reports list showing evidence thumbnails, user severity, AI assessment, timestamps, location, confidence, and validation state.",
        caption: "Evidence and validation states",
        status: "available",
      },
      {
        src: assetPaths.projects.floodready.logo,
        alt: "FloodReady product logo with a live-status label.",
        caption: "FloodReady project mark",
        status: "available",
      },
    ],
    architectureFlow: [
      "Citizen report",
      "Authenticated API",
      "Immediate persistence",
      "Shared map visibility",
      "Background validation",
      "Severity and confidence update",
    ],
    accent: "flood",
  },
  {
    slug: "emostudy",
    index: "02",
    eyebrow: "02 / HUMAN-CENTRED PRODUCT",
    title: "EmoStudy",
    subtitle: "Emotion-aware adaptive study timer",
    year: "2026",
    role: "Solo project",
    summary:
      "EmoStudy is an emotion-aware study timer that privately analyses facial expressions on the user's device and adapts Pomodoro sessions around their current state.",
    supportingLine:
      "The product combines a focused timer experience with live expression scores, session insights, focus analytics, charts, and streak tracking.",
    details: {
      problem:
        "Standard study timers ignore how the user is feeling during a session.",
      approach:
        "Use on-device expression analysis as a private interaction signal and adapt the timer experience around it.",
      ownership:
        "Concept, interface, timer logic, emotion integration, analytics experience, and deployment.",
      focus:
        "Make the experience useful even when camera permission is unavailable.",
    },
    stack: [
      "JavaScript",
      "Responsive UI",
      "On-device expression analysis",
      "Data visualization",
    ],
    liveUrl: "https://emostudy.anshkapoor.tech",
    repoUrl: "https://github.com/axdy02/EmoStudy",
    media: [
      {
        src: assetPaths.projects.emostudy.focusDashboard,
        alt: "EmoStudy focus dashboard showing study modes, a circular timer, camera state, expression scores, and a session timeline.",
        caption: "Adaptive focus dashboard",
        status: "available",
      },
    ],
    accent: "violet",
  },
  {
    slug: "aquavision",
    index: "03",
    eyebrow: "03 / COMPUTER VISION SYSTEM",
    title: "AquaVision",
    repositoryTitle: "Underwater-enhance-detection",
    subtitle:
      "Underwater image restoration, enhancement, and object detection",
    role: "Solo project",
    summary:
      "AquaVision is a lightweight computer-vision pipeline that restores degraded underwater images, improves visual clarity, and detects regions of interest without requiring expensive hardware or large training datasets.",
    details: {
      problem:
        "Underwater images often suffer from strong color casts, haze, low contrast, and noise.",
      approach:
        "Apply a staged classical image-processing pipeline, then detect contours or use an optional lightweight model fallback.",
      ownership:
        "Complete Python pipeline, enhancement stages, detection logic, configuration, CLI/GUI behavior, and documentation.",
      constraint:
        "Keep the system usable on a normal laptop CPU without heavy model training.",
    },
    stack: ["Python", "OpenCV", "MobileNet-SSD", "Desktop GUI"],
    repoUrl: "https://github.com/axdy02/Underwater-enhance-detection",
    media: [
      {
        src: assetPaths.projects.aquavision.original,
        alt: "Reserved AquaVision frame for the original underwater image before processing.",
        caption: "Original · Visual sample being prepared",
        status: "planned",
      },
      {
        src: assetPaths.projects.aquavision.restored,
        alt: "Reserved AquaVision frame for the color-restored underwater image.",
        caption: "Restored · Visual sample being prepared",
        status: "planned",
      },
      {
        src: assetPaths.projects.aquavision.enhanced,
        alt: "Reserved AquaVision frame for the contrast-enhanced underwater image.",
        caption: "Enhanced · Visual sample being prepared",
        status: "planned",
      },
      {
        src: assetPaths.projects.aquavision.detected,
        alt: "Reserved AquaVision frame for the underwater image with detected regions highlighted.",
        caption: "Detected · Visual sample being prepared",
        status: "planned",
      },
    ],
    technicalHighlights: [
      "White balancing and color correction",
      "CLAHE contrast enhancement",
      "Simplified dehazing",
      "Bilateral and median noise reduction",
      "Sharpening, brightness, saturation, and gamma adjustment",
      "Edge and contour detection",
      "Optional MobileNet-SSD fallback",
      "Python, OpenCV, and a lightweight desktop GUI",
    ],
    accent: "ocean",
  },
] as const satisfies readonly Project[];

export const capabilities = [
  {
    id: "interfaces",
    index: "01",
    title: "Building Interfaces",
    summary:
      "Responsive interfaces, product dashboards, and visual systems designed around real user workflows.",
    skills: [
      "React",
      "Next.js",
      "JavaScript",
      "HTML",
      "CSS",
      "Responsive UI",
      "Interactive dashboards",
    ],
  },
  {
    id: "systems",
    index: "02",
    title: "Engineering Systems",
    summary:
      "Backend services and APIs that connect polished interfaces to dependable application logic.",
    skills: [
      "Node.js",
      "Express",
      "FastAPI",
      "REST APIs",
      "Authentication",
      "Python",
      "Java",
    ],
  },
  {
    id: "data-deployment",
    index: "03",
    title: "Data and Deployment",
    summary:
      "Structured data models, geospatial applications, containerized services, version control, and end-to-end deployment.",
    skills: [
      "PostgreSQL",
      "PostGIS",
      "MySQL",
      "Prisma",
      "Docker",
      "Git",
      "GitHub",
      "Vercel",
    ],
  },
] as const satisfies readonly Capability[];

export const experience = [
  {
    id: "cdac-big-data-intern",
    role: "BIG DATA INTERN",
    organization:
      "Centre for Development of Advanced Computing (CDAC), New Delhi",
    period: "June 2024 - July 2024",
    summary:
      "Built a sentiment-analysis system that processed more than 500,000 records through Big Data ETL pipelines and presented the results through interactive visualization dashboards for stakeholder review.",
    tags: [
      "Big Data ETL",
      "Python",
      "NLP",
      "Dashboarding",
      "500K+ records",
    ],
  },
] as const satisfies readonly Experience[];

export const education = [
  {
    id: "kr-mangalam-btech-cse",
    degree: "B.Tech in Computer Science Engineering",
    institution: "K.R. Mangalam University, New Delhi",
    period: "2023 - 2027",
  },
] as const satisfies readonly Education[];

export const involvement = [
  {
    id: "smart-india-hackathon-2024",
    name: "Smart India Hackathon",
    role: "University Team Member",
    year: "2024",
    summary:
      "Collaborated with a university team to prototype a software solution for a real-world problem under strict time constraints.",
  },
] as const satisfies readonly Involvement[];

export const contactLinks = [
  {
    id: "email",
    label: "Send an email",
    href: "mailto:anshk12456@gmail.com",
    ariaLabel: "Send an email to Ansh Kapoor",
    external: false,
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    href: "https://www.linkedin.com/in/ansh-kapoor-b5a929358/",
    ariaLabel: "Open Ansh Kapoor's LinkedIn profile in a new tab",
    external: true,
  },
  {
    id: "github",
    label: "Open GitHub",
    href: "https://github.com/axdy02",
    ariaLabel: "Open Ansh Kapoor's GitHub profile in a new tab",
    external: true,
  },
  {
    id: "resume",
    label: "Download résumé",
    href: assetPaths.resume,
    ariaLabel: "Download Ansh Kapoor's résumé as a PDF",
    external: false,
    download: "Ansh-Kapoor-Resume.pdf",
  },
] as const satisfies readonly ContactLink[];
