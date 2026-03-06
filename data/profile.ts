export const profile = {
  name: "Meshack",
  role: "Full-Stack Developer / Fintech Engineer",
  headline:
    "I build resilient financial platforms, developer tooling, and data-intensive products with an obsession for clarity, security, and performance.",
  location: "Tanzania",
  email: "kazimoto17@proton.me",
  socials: {
    github: "https://github.com/dmesha3",
    linkedin: "https://www.linkedin.com/in/meshackkazimoto",
    x: "https://x.com/dmesha_"
  }
};

export type Project = {
  name: string;
  description: string;
  problem: string;
  solution: string;
  tech: string[];
  role: string;
  projectUrl?: string;
  githubUrl?: string;
  openSource?: boolean;
};

export const metrics = [
  { label: "Years Experience", value: "4+" },
  { label: "Products Shipped", value: "20+" },
  { label: "Systems Built", value: "35+" },
  { label: "Latency Wins", value: "<50ms" }
];

export const techStack = [
  "TypeScript",
  "React",
  "Next.js",
  "Spring Boot",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Kafka",
  "Docker",
  "Git",
  "Flutter",
  "SwiftUI",
  "React Native",
  "Expo"
];

export const projects: Project[] = [
  {
    name: "Winvo",
    description:
      "An invoice financing platform that connects borrowers with investors to unlock working capital.",
    problem:
      "Small businesses struggle to access quick funding while investors lack transparent, structured investment opportunities.",
    solution:
      "Built a platform where borrowers post invoices and investors fund them, with clear returns, lifecycle tracking, and secure role-based access.",
    tech: ["Next.js", "Spring Boot", "PostgreSQL", "Docker"],
    role: "Lead Developer",
    projectUrl: "https://winvo.io",
    // githubUrl: "https://github.com/dmesha3/winvo",
    // openSource: false
  },
  {
    name: "Mobile Banking App (DCB Commercial Bank)",
    description:
      "A mobile banking application enabling customers to perform secure financial transactions.",
    problem:
      "Bank customers needed a reliable and easy-to-use mobile channel for daily banking services.",
    solution:
      "Implemented a clean and intuitive Flutter-based mobile interface focused on usability, performance, and secure transaction flows.",
    tech: ["Flutter"],
    role: "Frontend Developer",
    projectUrl: "https://apps.apple.com/tz/app/dcb-pesa-plus/id6670619861",
    // openSource: false
  },
  {
    name: "Wakala Portal",
    description:
      "A WhatsApp-based platform that simplifies float exchanges between agents and super agents.",
    problem:
      "Manual coordination between agents caused delays, errors, and lack of transaction visibility.",
    solution:
      "Built a system that automates float requests and approvals through WhatsApp, with real-time tracking and a centralized admin dashboard.",
    tech: [
      "Next.js",
      "React Native",
      "PostgreSQL",
      "Prisma",
      "WhatsApp API"
    ],
    role: "Lead Developer",
    projectUrl: "https://wakalaportal.co.tz",
  },
  {
    name: "Internet Banking System (DCB Commercial Bank)",
    description:
      "A web-based internet banking platform for retail and business customers.",
    problem:
      "Customers needed a secure and accessible web channel for managing their bank accounts.",
    solution:
      "Developed user-facing banking interfaces integrated with backend services for secure and reliable transactions.",
    tech: ["Next.js", "React", "Spring Boot", "PostgreSQL"],
    role: "Frontend Developer",
    projectUrl: "https://ibankplus.dcb.co.tz",
  },
  {
    name: "Zama",
    description:
      "Most user-friendly, efficient, and reliable payment solution for your business.",
    problem:
      "Digital operation stores or service is big challengs for business in Tanzania.",
    solution:
      "Customers can place orders and make payments, specifying their choices, which minimizes repetitive inquiries.",
    tech: ["Next.js", "React", "Prisma", "PostgreSQL"],
    role: "Frontend Developer",
    projectUrl: "https://www.zamapay.me",
  },
  {
    name: "JSON Transform Engine (JTX)",
    description:
      "A lightweight JSON transformation engine for building integrations, ETL pipelines, and API middleware.",
    problem:
      "Modern systems exchange JSON data but often use incompatible formats. Developers repeatedly write custom mapping code to convert structures, rename fields, and normalize data across services.",
    solution:
      "JTX allows developers to define transformation rules using a simple JSON specification. The engine compiles the spec and transforms incoming JSON into the required structure, enabling reusable, testable, and scalable data transformations across services.",
    tech: ["Java", "Spring Boot", "Jackson", "Maven", "Picocli"],
    role: "Backend / System Architect",
    githubUrl: "https://github.com/dmesha3/json-transform"
  },
  {
    name: "elgon",
    description:
      "A performance-first Go web framework that stays close to net/http while shipping Spring Boot-like production batteries.",
    problem:
      "Many Go frameworks are either too minimal for production readiness or become heavy when you add logging, metrics, health checks, auth, and OpenAPI.",
    solution:
      "Designed a fast core (router + middleware + context) with optional production modules: health/ready/live, structured logging, metrics, OpenTelemetry, config, auth/RBAC, OpenAPI, DB adapters, migrations, and jobs—without slowing the hot path.",
    tech: ["Go", "net/http", "OpenTelemetry", "Prometheus", "Redis", "OpenAPI"],
    role: "Founder / Lead Engineer",
    githubUrl: "https://github.com/dmesha3/elgon",
    projectUrl: "https://elgon-go.vercel.app",
    openSource: true,
  },
  {
    name: "Voice AI Platform",
    description:
      "A web platform for managing and delivering AI-powered voice solutions.",
    problem:
      "Teams needed a centralized interface to manage voice content and AI-driven audio workflows.",
    solution:
      "Developed a modern frontend integrated with a headless CMS to manage voice data and delivery pipelines.",
    tech: ["Next.js", "Strapi"],
    role: "Frontend Developer",
    projectUrl: "https://adbtech.ai/products/voithai",
    // openSource: false
  },
  {
    name: "ADB Blog Platform",
    description:
      "A blogging platform focused on publishing AI-generated and AI-assisted content.",
    problem:
      "Content teams needed a flexible platform to manage and publish AI-driven articles efficiently.",
    solution:
      "Implemented a modern frontend connected to a headless CMS for scalable content management.",
    tech: ["React", "Next.js", "Strapi"],
    role: "Frontend Developer",
    projectUrl: "https://adbtech.ai",
    // openSource: false
  },
  {
    name: "Bus Ticketing System",
    description:
      "An online bus ticketing system that allows users to reserve seats and make payments easily.",
    problem:
      "Passengers faced difficulties securing seats and handling manual ticketing processes.",
    solution:
      "Built a responsive web interface for seat selection, booking, and seamless payment integration.",
    tech: ["Next.js", "Supabase"],
    role: "Frontend Developer",
    projectUrl: "https://fasttickets.vercel.app/"
  },
  {
    name: "Crowdfunding Platform",
    description:
      "A crowdfunding application for business and social groups to raise and manage funds collectively.",
    problem:
      "Groups lacked a transparent and structured way to collect, track, and manage contributions.",
    solution:
      "Developed a full-stack system with group management, contribution tracking, and secure backend services.",
    tech: ["Flutter", "Spring Boot", "PostgreSQL", "Docker", "Kubernetes"],
    role: "Full Stack Developer",
    openSource: false
  },
  {
    name: "Football Intel",
    description:
      "A sports data platform providing advanced statistics, technical analysis, and match predictions for the Tanzania Premier League.",
    problem:
      "Clubs, analysts, and fans lacked access to structured and insightful football data.",
    solution:
      "Designed a data-driven platform with detailed match stats, analytics, and prediction logic tailored to the local league.",
    tech: [
      "Bun",
      "Expo",
      "Hono",
      "Turborepo",
      "PostgreSQL",
      "GraphQL",
      "Drizzle"
    ],
    role: "Founder / Lead Engineer",
    // projectUrl: "https://footballintel.co.tz",
    githubUrl: "https://github.com/dmesha3/football-intel",
    openSource: true
  },
  {
    name: "Fastrepo",
    description:
      "A CLI-based monorepo tool for managing and inspecting packages efficiently.",
    problem:
      "Large monorepos are hard to navigate, slow to inspect, and difficult to maintain.",
    solution:
      "Built a high-performance Rust CLI that analyzes monorepo structures and provides fast, actionable insights.",
    tech: ["Rust", "CLI"],
    role: "Founder / Lead Engineer",
    // projectUrl: "https://fastrepo.dev",
    githubUrl: "https://github.com/dmesha3/fastrepo",
    openSource: true
  },
  {
    name: "dMusic",
    description:
      "A premium local-first iOS music player built with SwiftUI, focused on smooth playback, elegant interactions, and offline reliability.",
    problem:
      "Many mobile music players either feel outdated or depend heavily on internet services, making local library management and high-quality playback inconsistent.",
    solution:
      "Built a SwiftUI app with queue-based playback, playlists, search and smart sorting, favorites, lock-screen controls, background audio, and a future-ready source abstraction (LocalSource now, RemoteSource later).",
    tech: ["SwiftUI", "AVFoundation", "MediaPlayer", "SwiftData", "MVVM"],
    role: "iOS Developer",
    githubUrl: "https://github.com/dmesha3/dmusic",
    // openSource: false
  },
  {
    name: "Event Management Platform",
    description:
      "An event management system with ticketing, QR code scanning, and attendee tracking.",
    problem:
      "Event organizers lacked efficient tools for ticket validation and crowd management.",
    solution:
      "Built a cross-platform system for ticket sales, QR-based check-ins, and real-time attendee monitoring.",
    tech: ["PNPM", "Next.js", "Flutter", "PostgreSQL", "Prisma"],
    role: "Lead Engineer",
    projectUrl: "https://event-platform-web-one.vercel.app/en",
    githubUrl: "https://github.com/dmesha3/event-platform"
  },
  {
    name: "Opsync",
    description:
      "A modern office management system designed to streamline internal operations.",
    problem:
      "Organizations struggle with fragmented tools for managing daily office workflows.",
    solution:
      "Built a unified system with a scalable architecture using modern runtimes and data layers.",
    tech: ["Bun", "Next.js", "Expo", "PostgreSQL", "Effect", "Drizzle"],
    role: "Founder / Lead Engineer",
    githubUrl: "https://github.com/dmesha3/opsync",
  }
];

export const experiences = [
  {
    company: "Independent",
    title: "Founder & Lead Engineer",
    period: "2025 -- Present",
    achievements: [
      "Building and maintaining production systems including Wakala Portal, Football Intel, and Opsync.",
      "Designing and implementing full-stack solutions across web, mobile, and backend services.",
      "Developing transaction-heavy and real-time systems with secure authentication and role-based access.",
      "Managing system architecture, deployments, and infrastructure using Docker, VPS, and modern tooling."
    ]
  },
  {
    company: "Amecore Technologies Co. Ltd",
    title: "Software Developer",
    period: "2024 -- 2025",
    achievements: [
      "Developed full-stack financial solutions including POS systems, mobile apps, and web applications.",
      "Worked on core banking-related platforms such as Winvo and internal financial tools.",
      "Designed and implemented backend services, APIs, and system architectures.",
      "Handled infrastructure setup and deployments using VPS, Docker, and production-ready environments."
    ]
  },
  {
    company: "Oohbit Co. Ltd",
    title: "Frontend Developer",
    period: "2022 -- 2023",
    achievements: [
      "Built and maintained user-friendly web interfaces for multiple client projects.",
      "Worked on financial employee payment systems with a focus on clarity and usability.",
      "Developed frontend solutions for a digital billboard management platform.",
      "Collaborated with backend teams to deliver stable and responsive applications."
    ]
  },
];

export const howIBuildSystems = [
  {
    title: "Clarify the risk model",
    description:
      "Define failure modes early, align stakeholders on tradeoffs, and codify policy into system design."
  },
  {
    title: "Design for traceability",
    description:
      "Every action produces a durable audit trail, making compliance and debugging part of the system."
  },
  {
    title: "Ship with guardrails",
    description:
      "Progressive rollouts, automated tests, and monitoring ensure reliability without slowing teams."
  }
];

export const currentFocus = [
  "Financial infrastructure and transaction-heavy systems",
  "Applied AI tools for automation and decision support",
  "Building scalable developer and operational tools for real-world products in Tanzania"
];

export const currentlyBuilding = [
  {
    title: "Wakala Portal",
    detail:
      "A WhatsApp-driven platform that automates float exchanges between agents and super agents, reducing manual coordination."
  },
  {
    title: "Elgon",
    detail:
      "A performance-first Go web framework that stays close to net/http while shipping Spring Boot-like production batteries for real-world systems."
  },
  {
    title: "JSON Transform Engine (JTX)",
    detail:
      "A lightweight JSON transformation engine for building integrations, ETL pipelines, and API middleware."
  }
];

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
];
