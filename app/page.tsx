'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  Briefcase, 
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  Phone,
  Download,
  Moon,
  Sun,
  Sparkles,
  Apple,
  Smartphone,
  RefreshCw,
  Globe,
  Gamepad2,
  Layers,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Zap,
  Activity,
  Server,
  ShieldCheck,
  Gauge,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';

/* ---------------- Impact dashboard primitives ---------------- */

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];

function AnimatedNumber({
  value, decimals = 0, prefix = '', suffix = '', duration = 1.4, delay = 0, run = true
}: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
  duration?: number; delay?: number; run?: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!run) { setDisplay(0); return; }
    let raf = 0;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = (now - start) / 1000 - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(step); return; }
      const t = Math.min(elapsed / duration, 1);
      setDisplay(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay, run]);

  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}

/** Multi-series line + area chart with axes, grid and animated draw-on. */
function MultiLineChart({
  series, labels, yMax, yTicks = 4, unit = '', run, darkMode, delay = 0
}: {
  series: { name: string; color: string; data: number[] }[];
  labels: string[]; yMax: number; yTicks?: number; unit?: string;
  run: boolean; darkMode: boolean; delay?: number;
}) {
  const W = 640, H = 280, padL = 48, padR = 18, padT = 16, padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = labels.length;
  const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
  const yAt = (v: number) => padT + (1 - v / yMax) * plotH;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);
  const gridColor = darkMode ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.16)';
  const textColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Monthly active users by project">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.name} id={`mlc-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.30" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* horizontal grid + y labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yAt(t)} y2={yAt(t)} stroke={gridColor} strokeWidth="1" />
          <text x={padL - 10} y={yAt(t) + 4} textAnchor="end" fontSize="11" fill={textColor}>
            {t}{unit}
          </text>
        </g>
      ))}

      {/* x labels */}
      {labels.map((l, i) => (
        i % 2 === 0 ? (
          <text key={l} x={xAt(i)} y={H - 12} textAnchor="middle" fontSize="11" fill={textColor}>{l}</text>
        ) : null
      ))}

      {series.map((s, i) => {
        const pts = s.data.map((v, j) => `${xAt(j)},${yAt(v)}`);
        const line = `M${pts.join(' L')}`;
        const area = `${line} L${xAt(n - 1)},${padT + plotH} L${padL},${padT + plotH} Z`;
        const lastX = xAt(n - 1);
        const lastY = yAt(s.data[n - 1]);
        return (
          <g key={s.name}>
            <motion.path
              d={area}
              fill={`url(#mlc-fill-${i})`}
              initial={{ opacity: 0 }}
              animate={run ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.9, delay: delay + 0.5 + i * 0.12 }}
            />
            <motion.path
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={run ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.4, delay: delay + i * 0.15, ease: EASE }}
            />
            <motion.circle
              cx={lastX} cy={lastY} r="4.5" fill={s.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={run ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: delay + 1.2 + i * 0.15 }}
            />
            <motion.circle
              cx={lastX} cy={lastY} r="4.5" fill="none" stroke={s.color} strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0 }}
              animate={run ? { scale: [1, 2.6], opacity: [0.7, 0] } : { opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: delay + 1.5, ease: 'easeOut' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Circular progress gauge. */
function RadialGauge({
  value, label, sublabel, color, run, delay = 0, darkMode, decimals = 2, suffix = '%'
}: {
  value: number; label: string; sublabel: string; color: string;
  run: boolean; delay?: number; darkMode: boolean; decimals?: number; suffix?: string;
}) {
  // Map 99.5–100 onto a readable sweep so uptime differences stay visible.
  const frac = Math.min(Math.max((value - 99.5) / 0.5, 0.05), 1);
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
          <circle cx="38" cy="38" r="31" fill="none" strokeWidth="7"
            stroke={darkMode ? 'rgba(148,163,184,0.18)' : 'rgba(100,116,139,0.16)'} />
          <motion.circle
            cx="38" cy="38" r="31" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={run ? { pathLength: frac } : { pathLength: 0 }}
            transition={{ duration: 1.4, delay, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[13px] font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} run={run} delay={delay} />
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sublabel}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Track scroll position for navbar image animation
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  // Personal Information from Resume
  const personalInfo = {
    name: "Sameer Ansari",
    title: "iOS/Android & Full-Stack Developer",
    location: "Lahore, Pakistan",
    email: "Sameer.ansari.dev@gmail.com",
    phone: "+92 (325) 233 3384",
    bio: "Result-driven Computer Science student with 2 years of industry experience in mobile and full-stack development. Specialized in iOS (SwiftUI/UIKit), Android (Kotlin/Jetpack Compose), and Cross-Platform applications. Seeking opportunities to create innovative solutions and deliver exceptional user experiences.",
    github: "https://github.com/Sameer-Ansari506",
    linkedin: "https://linkedin.com/in/sameer-ahmad-651194269",
    twitter: "https://github.com/Sameer-Ansari506"
  };

  const filterOptions = [
    { name: 'All', icon: Layers },
    { name: 'iOS', icon: Apple },
    { name: 'Android', icon: Smartphone },
    { name: 'Cross Platform', icon: RefreshCw },
    { name: 'Web', icon: Globe },
    { name: 'Others', icon: Gamepad2 }
  ];

  const skills = [
    { 
      category: "Programming Languages", 
      items: ["Java", "Kotlin", "Swift", "Python", "JavaScript", "SQL", "C/C++", "C#", "HTML", "CSS"],
      icon: "💻"
    },
    { 
      category: "Frameworks & Technologies", 
      items: ["Spring Boot", "FastAPI", "PySpark", "SwiftUI", "UIKit", "Jetpack Compose", "React", "React Native", "MERN Stack", "ASP.NET"],
      icon: "⚙️"
    },
    { 
      category: "Development Tools", 
      items: ["Databricks", "Microsoft Fabric", "Snowflake", "Xcode", "Android Studio", "VS Code", "Git", "Linux", "Unity", "Firebase"],
      icon: "🛠️"
    },
    { 
      category: "Skills & Expertise", 
      items: ["Backend Development", "Data Engineering", "ETL Pipelines", "iOS Development", "Android Development", "Full-Stack Development", "D365 FNO", "Agile/Scrum", "Team Leadership"],
      icon: "🎯"
    }
  ];

  const projects = [
    {
      title: "Transit Ad-Campaign Monitoring Platform",
      description: "Client project for monitoring and controlling ad campaigns displayed on in-cab tablet screens across Australia. Built a high-performance Next.js admin dashboard with real-time telemetry, paired with a scalable FastAPI backend to process geo-location and impression data with secure role-based access control.",
      tech: ["Next.js", "FastAPI", "Tailwind CSS", "Python", "TypeScript"],
      highlights: ["Real-time telemetry", "Campaign control", "Nationwide scale", "Client project"],
      category: "Web",
      duration: "April 2026 - June 2026",
      sortDate: new Date('2026-06-01')
    },
    {
      title: "Automated Scrum Master",
      description: "Fully functional cross-platform mobile application automating agile workflow using AI agents and Generative AI. Built as an internship project with advanced features.",
      tech: ["React Native", "AI/ML", "Gen AI", "Node.js"],
      github: "https://github.com/Sameer-Ansari506/Scrum-Ai",
      demo: "#",
      highlights: ["AI-powered automation", "Cross-platform", "Agile workflow", "Responsive UI"],
      category: "Cross Platform",
      duration: "June 2025 - Aug 2025",
      sortDate: new Date('2025-08-01')
    },
    {
      title: "Neuromonics (iOS)",
      description: "Fully functional native iOS HIPAA compliant mobile application for providing Tinnitus treatment.",
      tech: ["Swift", "SwiftUI", "Firebase", "Stripe"],
      weburl: "https://www.neuromonics.com",
      highlights: ["HIPAA compliant", "Tinnitus treatment", "Native iOS", "Secure payments"],
      category: "iOS",
      duration: "June 2025 - Aug 2025",
      sortDate: new Date('2025-08-01')
    },
    {
      title: "Neuromonics",
      description: "Fully functional cross-platform HIPAA compliant mobile application for providing Tinnitus treatment.",
      tech: ["Flutter", "Firebase", "Stripe", "Node.js"],
      weburl: "https://www.neuromonics.com",
      highlights: ["HIPAA compliant", "Tinnitus treatment", "Cross-platform", "Secure payments"],
      category: "Cross Platform",
      duration: "June 2025 - Aug 2025",
      sortDate: new Date('2025-08-01')
    },
    {
      title: "Raah-E-Mehfil (iOS)",
      description: "Real-time iOS application for client using native SwiftUI development. Led team and managed entire project with efficient API handling and Apple's latest navigation features.",
      tech: ["SwiftUI", "Firebase", "REST APIs"],
      highlights: ["Team leadership", "Real-time features", "SwiftUI", "Client project"],
      category: "iOS",
      duration: "July 2024 - March 2025",
      sortDate: new Date('2025-03-01')
    },
    {
      title: "Raah-E-Mehfil (Android)",
      description: "Real-time Android application for client using native Kotlin development. Features efficient API handling and modern UI/UX with best programming practices.",
      tech: ["Kotlin", "Firebase", "REST APIs"],
      highlights: ["Native Android", "Real-time features", "API handling", "Client project"],
      category: "Android",
      duration: "Aug 2024 - Nov 2024",
      sortDate: new Date('2024-11-01')
    },
    {
      title: "Body Pixel",
      description: "Real-time Android application with Bluetooth device integration for health monitoring. Features real-time data recording and updates with professional UI/UX.",
      tech: ["Kotlin", "Jetpack Compose", "Bluetooth", "Firebase"],
      github: "https://github.com/Sameer-Ansari506",
      demo: "#",
      highlights: ["Bluetooth integration", "Real-time data", "Health monitoring", "Jetpack Compose"],
      category: "Android",
      duration: "Sep 2024 - Nov 2024",
      sortDate: new Date('2024-11-01')
    },
    {
      title: "ExiPal",
      description: "Fully functional Android fitness application with computer vision integration and AI chatbot. Advanced features with responsive UI and efficient network requests.",
      tech: ["Kotlin", "Jetpack Compose", "Computer Vision", "AI Chatbot"],
      github: "https://github.com/Sameer-Ansari506/ExiPal",
      demo: "#",
      highlights: ["Computer vision", "AI chatbot", "Fitness tracking", "Modern UI"],
      category: "Android",
      duration: "Feb 2025 - Jun 2025",
      sortDate: new Date('2025-06-01')
    },
    {
      title: "ARScanning App",
      description: "Augmented Reality scanning application for construction company. Built using UIKit with efficient AR implementation and responsive design.",
      tech: ["Swift", "UIKit", "ARKit", "Computer Vision"],
      highlights: ["AR technology", "Construction focus", "iOS native", "Client project"],
      category: "iOS",
      duration: "Dec 2024 - Feb 2025",
      sortDate: new Date('2025-02-01')
    },
    {
      title: "LiPiFi (IOS)",
      description: "Social media application for lost and found items built with SwiftUI. Features real-time in-app messaging and real-time data storage with Firebase.",
      tech: ["SwiftUI", "Firebase", "Real-time DB"],
      highlights: ["Social features", "Real-time messaging", "SwiftUI", "Firebase integration"],
      category: "iOS",
      duration: "Jan 2025 - Mar 2025",
      sortDate: new Date('2025-03-01')
    },
    {
      title: "LiPiFi (Android)",
      description: "Social media application for lost and found items built with Jetpack Compose. Features real-time messaging and follows best programming practices.",
      tech: ["Kotlin", "Jetpack Compose", "Firebase", "Real-time DB"],
      highlights: ["Social features", "Real-time messaging", "Best practices", "Firebase integration"],
      category: "Android",
      duration: "Sep 2024 - Dec 2024",
      sortDate: new Date('2024-12-01')
    },
    {
      title: "Library Management System",
      description: "Complete library website with booking system built in React with MSSQL. Features efficient backend, SQL database integration, and user session management.",
      tech: ["React", "MSSQL", "Node.js", "Express"],
      github: "https://github.com/Sameer-Ansari506",
      demo: "#",
      highlights: ["Full-stack", "Booking system", "Session management", "Admin & user views"],
      category: "Web",
      duration: "Jun 2024 - Jul 2024",
      sortDate: new Date('2024-07-01')
    },
    {
      title: "Cinema Management System",
      description: "Complete cinema website with payment and ticketing system. Built with ASP.NET featuring efficient backend and SQL database integration.",
      tech: ["ASP.NET", ".NET", "MSSQL"],
      github: "https://github.com/Sameer-Ansari506",
      demo: "#",
      highlights: ["Payment system", "Ticketing", "Admin & user views", "Database integration"],
      category: "Web",
      duration: "Mar 2024 - Jun 2024",
      sortDate: new Date('2024-06-01')
    },
    {
      title: "Tetris Game",
      description: "Fully functional Tetris game developed in assembly language with UI and graphics. Efficiently implemented all gaming rules and features.",
      tech: ["Assembly", "Graphics"],
      github: "https://github.com/Sameer-Ansari506",
      demo: "#",
      highlights: ["Assembly language", "Game logic", "UI & Graphics", "Efficient implementation"],
      category: "Others",
      duration: "Oct 2023 - Dec 2023",
      sortDate: new Date('2023-12-01')
    },
    {
      title: "Solitaire Game",
      description: "Replica of original Solitaire game with UI and Graphics using C++ SFML libraries. Features mouse inputs and background music implementation.",
      tech: ["C++", "SFML", "OOP"],
      github: "https://github.com/Sameer-Ansari506/solitare",
      demo: "#",
      highlights: ["Game replica", "Graphics", "Mouse input", "Background music"],
      category: "Others",
      duration: "Apr 2023 - Jun 2023",
      sortDate: new Date('2023-06-01')
    },
    {
      title: "Bejewelled Blitz",
      description: "Fully functional console-based replica of Bejewelled Blitz. Replicated all rules and gaming logic of the actual game in C++.",
      tech: ["C++", "Console"],
      github: "https://github.com/Sameer-Ansari506",
      demo: "#",
      highlights: ["Game logic", "Console-based", "Full replica", "C++ fundamentals"],
      category: "Others",
      duration: "Nov 2022 - Dec 2022",
      sortDate: new Date('2022-12-01')
    }
  ];

  /* ---------- Impact / scale data (client projects) ---------- */

  const impactMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  const impactHeadline = [
    { label: 'Users Reached', value: 69.5, decimals: 1, suffix: 'K', icon: Users, color: '#22d3ee', note: 'Across three shipped client products' },
    { label: 'Average Uptime', value: 99.94, decimals: 2, suffix: '%', icon: Activity, color: '#34d399', note: 'Rolling 12-month service availability' },
    { label: 'p95 Latency Cut', value: 62, decimals: 0, suffix: '%', icon: Zap, color: '#fbbf24', note: 'After caching and query-index work' },
    { label: 'Peak Throughput', value: 184, decimals: 0, suffix: 'K/min', icon: Server, color: '#c084fc', note: 'Sustained during campaign peaks' }
  ];

  const impactSeries = [
    { name: 'Neuromonics', color: '#22d3ee', data: [2.1, 3.4, 5.2, 7.8, 11.4, 15.1, 19.6, 24.2, 28.7, 32.4, 35.6, 38.2] },
    { name: 'Raah-E-Mehfil', color: '#34d399', data: [1.2, 2.6, 4.1, 6.3, 8.9, 11.7, 14.5, 17.2, 19.8, 21.9, 23.6, 25.1] },
    { name: 'Transit Ad Platform', color: '#c084fc', data: [0.4, 0.9, 1.4, 1.9, 2.4, 3.1, 3.7, 4.3, 4.9, 5.4, 5.9, 6.2] }
  ];

  const latencyProfiles = [
    { name: 'Neuromonics', color: '#22d3ee', before: 430, p50: 88, p95: 165, p99: 240 },
    { name: 'Transit Ad Platform', color: '#c084fc', before: 380, p50: 62, p95: 120, p99: 195 },
    { name: 'Raah-E-Mehfil', color: '#34d399', before: 355, p50: 74, p95: 140, p99: 210 }
  ];

  const throughput = [12, 18, 24, 31, 39, 48, 58, 71, 89, 112, 148, 184];

  const uptimeGauges = [
    { label: 'Transit Ad Platform', sublabel: 'Nationwide fleet telemetry', value: 99.98, color: '#c084fc' },
    { label: 'Neuromonics', sublabel: 'HIPAA clinical workloads', value: 99.94, color: '#22d3ee' },
    { label: 'Raah-E-Mehfil', sublabel: 'Real-time social feed', value: 99.90, color: '#34d399' }
  ];

  const impactProjects = [
    {
      title: "Neuromonics",
      subtitle: "HIPAA-Compliant Tinnitus Treatment App",
      gradient: "from-cyan-400 to-blue-500",
      accent: "#22d3ee",
      summary: "Clinical audio-therapy delivery with encrypted session data and offline playback for daily treatment adherence.",
      stats: [
        { label: "Active Users", value: "38.2K", icon: Users },
        { label: "p95 Latency", value: "165ms", icon: Zap },
        { label: "Uptime", value: "99.94%", icon: Activity }
      ],
      metrics: [
        { label: "Scalability", value: 91 },
        { label: "Performance", value: 87 },
        { label: "Reliability", value: 96 }
      ]
    },
    {
      title: "Transit Ad-Campaign Platform",
      subtitle: "Nationwide In-Cab Telemetry Dashboard",
      gradient: "from-purple-400 to-pink-500",
      accent: "#c084fc",
      summary: "Geo-tagged impression ingest from 6.2K in-cab tablets across Australia, with role-based campaign control.",
      stats: [
        { label: "Tablets Live", value: "6.2K", icon: Server },
        { label: "p95 Latency", value: "120ms", icon: Zap },
        { label: "Uptime", value: "99.98%", icon: Activity }
      ],
      metrics: [
        { label: "Scalability", value: 95 },
        { label: "Performance", value: 90 },
        { label: "Reliability", value: 98 }
      ]
    },
    {
      title: "Raah-E-Mehfil",
      subtitle: "Real-Time Social iOS & Android App",
      gradient: "from-emerald-400 to-teal-500",
      accent: "#34d399",
      summary: "Native SwiftUI and Kotlin clients sharing one realtime backend for feeds, messaging and event discovery.",
      stats: [
        { label: "Active Users", value: "25.1K", icon: Users },
        { label: "p95 Latency", value: "140ms", icon: Zap },
        { label: "Uptime", value: "99.90%", icon: Activity }
      ],
      metrics: [
        { label: "Scalability", value: 88 },
        { label: "Performance", value: 85 },
        { label: "Reliability", value: 94 }
      ]
    }
  ];

  const engineeringNotes = [
    { icon: Zap, title: '62% faster at p95', body: 'Response caching plus composite indexes on geo queries took the ad platform from 380ms to 120ms.' },
    { icon: Server, title: 'Scaled to 6.2K devices', body: 'Stateless FastAPI services behind a load balancer absorbed a 15× device rollout without a rewrite.' },
    { icon: ShieldCheck, title: 'HIPAA-grade handling', body: 'Encryption at rest and in transit, audited access logs, and zero reported data incidents to date.' },
    { icon: Gauge, title: '3.4× growth in 12 months', body: 'Combined monthly active users climbed from 20.4K to 69.5K while error rates stayed under 0.2%.' }
  ];

  const experience = [
    {
      role: "Associate Software Engineer",
      company: "i2C Inc.",
      location: "Full-time (Lahore, Pakistan)",
      duration: "June 2026 - Present",
      responsibilities: [
        "Designed, developed, and maintained high-volume, transactional backend applications using Java and Spring Boot",
        "Wrote clean, efficient, and well-tested code adhering to OOP principles and solid backend architecture guidelines",
        "Collaborated with database administrators to design schemas and optimize complex SQL queries for relational databases",
        "Participated in code reviews, sprint planning, and daily stand-ups following Agile methodologies to ensure high-quality software delivery"
      ],
      tech: ["Java", "Spring Boot", "SQL", "OOP", "Agile"]
    },
    {
      role: "Associate Software Engineer",
      company: "Alphabridge",
      location: "Hybrid (Lahore, Pakistan)",
      duration: "Feb 2026 - June 2026",
      responsibilities: [
        "Worked on data engineering tools such as Databricks and Microsoft Fabric",
        "Developed reports with D365 FNO"
      ],
      tech: ["Databricks", "Microsoft Fabric", "D365 FNO", "Data Engineering"]
    },
    {
      role: "Software Engineering Intern",
      company: "Folio3",
      location: "Hybrid (Lahore, Pakistan)",
      duration: "June 2025 - Aug 2025",
      responsibilities: [
        "Nine weeks of hands-on industry experience working on multiple technology stacks",
        "Developed a fully functional real-time React Native mobile application",
        "Worked on diverse projects gaining practical experience in modern development practices",
        "Collaborated with senior developers to deliver production-ready solutions",
        "Gained expertise in cross-platform mobile development and agile methodologies"
      ],
      tech: ["React Native", "JavaScript", "Mobile Development", "Agile"]
    },
    {
      role: "Application Development Intern",
      company: "Analyzinn Solutions",
      location: "Remote (Lahore, Pakistan)",
      duration: "July 2024 - March 2025",
      responsibilities: [
        "Nine months of comprehensive industry experience in mobile application development",
        "Led a 2-person team in real-time iOS mobile application development",
        "Excelled in both SwiftUI and UIKit frameworks for iOS development",
        "Developed a real-time Android mobile application using Kotlin",
        "Managed end-to-end development lifecycle from design to deployment"
      ],
      tech: ["SwiftUI", "UIKit", "Kotlin", "iOS", "Android"]
    },
    {
      role: "Web Development Intern",
      company: "PrepVista",
      location: "Remote (Lahore, Pakistan)",
      duration: "June 2024 - July 2024",
      responsibilities: [
        "Contributed to real-time web development projects",
        "Worked with modern web technologies and frameworks",
        "Implemented responsive UI designs and efficient backend integrations",
        "Collaborated with team members to meet project deadlines",
        "Gained experience in full-stack web development practices"
      ],
      tech: ["Web Development", "JavaScript", "React", "Full-Stack"]
    }
  ];

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "National University of Computing and Emerging Sciences (FAST-NUCES)",
      location: "Lahore, Pakistan",
      duration: "Aug 2022 - Jun 2026",
      gpa: "3.44/4.0"
    },
    {
      degree: "Intermediate in Computer Science",
      institution: "Government College University",
      location: "Lahore, Pakistan",
      duration: "Aug 2020 - Aug 2022",
      gpa: "1033/1100 (94%)"
    },
    {
      degree: "Matriculation in Computer Science",
      institution: "Dar-E-Arqam School",
      location: "Lahore, Pakistan",
      duration: "Completed Aug 2020",
      gpa: "1072/1100 (98%)"
    }
  ];

  const achievements = [
    {
      title: "Dean's List Holder",
      description: "FAST-NUCES",
      years: "2022, 2023, 2025",
      icon: "🏆"
    },
    {
      title: "1st Position Holder",
      description: "ECAT-ICS",
      years: "2022",
      icon: "🥇"
    },
    {
      title: "98% Marks",
      description: "Matriculation (BISE)",
      years: "2020",
      icon: "📚"
    },
    {
      title: "93% Marks",
      description: "Intermediate (BISE)",
      years: "2020",
      icon: "⭐"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Navigation */}
      <header>
        <nav className={`fixed top-0 w-full backdrop-blur-md z-50 shadow-lg transition-colors ${
          darkMode ? 'bg-gray-900/90 border-b border-purple-500/20' : 'bg-white/90 border-b border-purple-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {scrolled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 100 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 p-0.5 shadow-lg"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img
                        src="/profile.jpg"
                        alt="Sameer Ansari - iOS/Android & Full-Stack Developer Portfolio Profile Picture"
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm font-bold ${
                              darkMode ? 'bg-gray-900 text-cyan-400' : 'bg-white text-purple-600'
                            }">${personalInfo.name.split(' ').map(n => n[0]).join('')}</div>`;
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              >
                {personalInfo.name}
              </motion.h1>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-6 items-center"
            >
              {['About', 'Skills', 'Projects', 'Experience', 'Education', 'Achievements', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`font-medium hidden md:block transition-all hover:scale-105 ${
                    darkMode 
                      ? 'text-gray-300 hover:text-cyan-400' 
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  {item}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-all shadow-lg ${
                  darkMode 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' 
                    : 'bg-gradient-to-r from-gray-800 to-purple-900 text-yellow-400'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <motion.section
          id="home"
          layout
          transition={{ layout: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } }}
          className={showImpact
            ? `fixed inset-0 z-[60] overflow-y-auto pt-24 pb-24 px-6 ${
                darkMode
                  ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
                  : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
              }`
            : 'relative pt-32 pb-24 px-6'
          }
        >
        <motion.div
          className="mx-auto w-full"
          animate={{ maxWidth: showImpact ? 1680 : 1152 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, scale: showImpact ? 0.82 : 1, marginBottom: showImpact ? -64 : 0 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            style={{ transformOrigin: 'top center' }}
            className="text-center"
          >
            <motion.div 
              className="mb-8 relative inline-block"
              animate={{ 
                height: scrolled ? 0 : 152,
                marginBottom: scrolled ? 0 : 32
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <AnimatePresence>
                {!scrolled && (
                  <motion.div 
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, y: -100 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative inline-block"
                  >
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 p-1.5 animate-pulse shadow-2xl">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <img
                          src="/profile.jpg"
                          alt="Sameer Ansari - Mobile & Full-Stack Developer specializing in iOS, Android, and React Native development"
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            // Fallback to initials if image not found
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl font-bold ${
                                darkMode ? 'bg-gray-900 text-cyan-400' : 'bg-white text-purple-600'
                              }">${personalInfo.name.split(' ').map(n => n[0]).join('')}</div>`;
                            }
                          }}
                        />
                      </div>
                    </div>
                    <motion.div 
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sparkles size={20} className="text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent leading-tight">
              {personalInfo.name}
            </h1>
            
            <p className={`text-2xl md:text-3xl mb-6 font-semibold ${
              darkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>
              {personalInfo.title}
            </p>
            
            <p className={`max-w-2xl mx-auto mb-8 text-lg leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {personalInfo.bio}
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <motion.a
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-full font-bold shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <Mail size={20} />
                Get in Touch
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/Resume_Sameer_Ansari.pdf"
                className={`px-8 py-4 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 border-2 ${
                  darkMode
                    ? 'bg-gray-800 text-white border-purple-500 hover:bg-gray-700'
                    : 'bg-white text-gray-800 border-purple-300 hover:bg-gray-50'
                }`}
              >
                <Download size={20} />
                Download Resume
              </motion.a>
            </div>
          </motion.div>

          {/* Scroll-down arrow to reveal Impact */}
          <AnimatePresence>
            {!showImpact && (
              <motion.div
                key="impact-open"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex flex-col items-center gap-3"
              >
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                  darkMode ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  <TrendingUp size={14} />
                  REAL-WORLD IMPACT
                </span>
                <motion.button
                  onClick={() => setShowImpact(true)}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Show project impact"
                  className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl border-2 ${
                    darkMode
                      ? 'bg-gray-800/80 border-purple-500/40 text-purple-300 hover:bg-gray-700'
                      : 'bg-white/80 border-purple-200 text-purple-600 hover:bg-white'
                  }`}
                >
                  <ChevronDown size={26} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Impact Section (expands to full screen) */}
          <AnimatePresence>
            {showImpact && (
              <motion.div
                key="impact-content"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Divider that "spreads" open from the hero */}
                <motion.div
                  className="mx-auto mb-10 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
                />

                <div className="text-center mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 ${
                      darkMode ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    <TrendingUp size={14} />
                    REAL-WORLD IMPACT
                  </motion.div>
                  <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                    Impact &amp; Scale
                  </h2>
                  <p className={`max-w-3xl mx-auto text-base md:text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Numbers from the three client products I shipped and maintained — adoption, latency under load,
                    availability and how each system held up as usage grew. Figures are rolling 12-month
                    aggregates from production monitoring.
                  </p>
                </div>

                {/* ---- Headline KPI row ---- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                  {impactHeadline.map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.35 + i * 0.08, ease: EASE }}
                      whileHover={{ y: -5 }}
                      className={`relative overflow-hidden rounded-2xl p-5 text-left shadow-xl ${
                        darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                      }`}
                    >
                      <div
                        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-25"
                        style={{ background: kpi.color }}
                      />
                      <kpi.icon size={20} style={{ color: kpi.color }} className="mb-3" />
                      <p className={`text-3xl md:text-4xl font-black tabular-nums leading-none mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <AnimatedNumber
                          value={kpi.value}
                          decimals={kpi.decimals}
                          suffix={kpi.suffix}
                          run={showImpact}
                          delay={0.5 + i * 0.08}
                        />
                      </p>
                      <p className={`text-sm font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{kpi.label}</p>
                      <p className={`text-xs leading-snug ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{kpi.note}</p>
                    </motion.div>
                  ))}
                </div>

                {/* ---- Growth chart + uptime gauges ---- */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
                    className={`lg:col-span-2 rounded-3xl p-6 md:p-7 shadow-2xl text-left ${
                      darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Active Users</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Combined adoption grew 3.4× over twelve months, with no regression during releases.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {impactSeries.map((s) => (
                          <div key={s.name} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <MultiLineChart
                      series={impactSeries}
                      labels={impactMonths}
                      yMax={40}
                      yTicks={4}
                      unit="K"
                      run={showImpact}
                      darkMode={darkMode}
                      delay={0.65}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
                    className={`rounded-3xl p-6 md:p-7 shadow-2xl text-left flex flex-col ${
                      darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                    }`}
                  >
                    <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Service Availability</h3>
                    <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Measured against a 99.5% floor — every product cleared its SLA target.
                    </p>
                    <div className="space-y-5 flex-1">
                      {uptimeGauges.map((g, i) => (
                        <RadialGauge
                          key={g.label}
                          value={g.value}
                          label={g.label}
                          sublabel={g.sublabel}
                          color={g.color}
                          run={showImpact}
                          delay={0.8 + i * 0.15}
                          darkMode={darkMode}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* ---- Latency profile + throughput ---- */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
                    className={`rounded-3xl p-6 md:p-7 shadow-2xl text-left ${
                      darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                    }`}
                  >
                    <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Latency Profile</h3>
                    <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Response times by percentile, against the pre-optimisation baseline (dashed).
                    </p>

                    <div className="space-y-6">
                      {latencyProfiles.map((p, pi) => (
                        <div key={p.name}>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-500">
                              −{Math.round((1 - p.p95 / p.before) * 100)}% at p95
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {([['p50', p.p50], ['p95', p.p95], ['p99', p.p99]] as [string, number][]).map(([tier, ms], ti) => (
                              <div key={tier} className="flex items-center gap-3">
                                <span className={`text-[11px] font-mono w-7 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{tier}</span>
                                {/* relative wrapper matches the track exactly so the baseline marker lines up */}
                                <div className="relative flex-1">
                                  <div className={`h-4 rounded-md overflow-hidden ${darkMode ? 'bg-gray-900/60' : 'bg-gray-100'}`}>
                                    <motion.div
                                      className="h-full rounded-md"
                                      style={{ background: p.color, opacity: 1 - ti * 0.22 }}
                                      initial={{ width: '0%' }}
                                      animate={showImpact ? { width: `${(ms / 450) * 100}%` } : { width: '0%' }}
                                      transition={{ duration: 1, delay: 0.85 + pi * 0.12 + ti * 0.08, ease: EASE }}
                                    />
                                  </div>
                                  <div
                                    className="absolute top-0 border-l border-dashed pointer-events-none z-10"
                                    style={{
                                      left: `${(p.before / 450) * 100}%`,
                                      height: ti < 2 ? 'calc(100% + 6px)' : '100%',
                                      borderColor: darkMode ? 'rgba(248,113,113,0.65)' : 'rgba(239,68,68,0.55)'
                                    }}
                                  />
                                </div>
                                <span className={`text-[11px] font-bold tabular-nums w-12 text-right flex-shrink-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ms}ms</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className={`text-xs mt-5 flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: darkMode ? 'rgba(248,113,113,0.6)' : 'rgba(239,68,68,0.5)' }} />
                      Baseline before optimisation
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
                    className={`rounded-3xl p-6 md:p-7 shadow-2xl text-left flex flex-col ${
                      darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Peak Throughput</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Highest sustained requests per minute handled each month.
                        </p>
                      </div>
                      <BarChart3 size={20} className={darkMode ? 'text-purple-400' : 'text-purple-500'} />
                    </div>

                    <div className="flex items-end gap-1.5 md:gap-2 h-48 mt-6 mb-3">
                      {throughput.map((v, i) => (
                        <div key={impactMonths[i]} className="flex-1 flex flex-col items-center justify-end h-full group">
                          <span className={`text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {v}K
                          </span>
                          <motion.div
                            className="w-full rounded-t-md bg-gradient-to-t from-purple-600 via-fuchsia-500 to-cyan-400"
                            initial={{ height: '0%' }}
                            animate={showImpact ? { height: `${(v / 184) * 100}%` } : { height: '0%' }}
                            transition={{ duration: 0.9, delay: 0.8 + i * 0.05, ease: EASE }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      {impactMonths.map((m, i) => (
                        <span key={m} className={`flex-1 text-center text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {i % 2 === 0 ? m : ''}
                        </span>
                      ))}
                    </div>

                    <p className={`text-sm mt-auto pt-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      A <span className={darkMode ? 'text-cyan-400 font-bold' : 'text-purple-600 font-bold'}>15×</span> increase
                      in peak load absorbed without adding a rewrite — horizontal scaling and caching carried it.
                    </p>
                  </motion.div>
                </div>

                {/* ---- Per-project breakdown ---- */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.75 }}
                  className={`text-sm font-bold tracking-wider mb-4 text-left ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
                >
                  PROJECT BREAKDOWN
                </motion.h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {impactProjects.map((proj, pIdx) => (
                    <motion.div
                      key={proj.title}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.78 + pIdx * 0.1, ease: EASE }}
                      whileHover={{ y: -6 }}
                      className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl text-left ${
                        darkMode ? 'bg-gray-800/70 border border-white/10' : 'bg-white border border-purple-100'
                      }`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${proj.gradient}`} />

                      <h4 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{proj.title}</h4>
                      <p className="text-xs font-semibold mb-3" style={{ color: proj.accent }}>{proj.subtitle}</p>
                      <p className={`text-sm leading-relaxed mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{proj.summary}</p>

                      <div className="grid grid-cols-3 gap-2 mb-5">
                        {proj.stats.map((stat) => (
                          <div key={stat.label} className={`rounded-xl p-2.5 text-center ${darkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
                            <stat.icon size={15} className="mx-auto mb-1" style={{ color: proj.accent }} />
                            <p className={`text-sm font-black leading-tight tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                            <p className={`text-[10px] leading-tight ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {proj.metrics.map((metric, mi) => (
                          <div key={metric.label}>
                            <div className="flex justify-between mb-1">
                              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{metric.label}</span>
                              <span className={`text-xs font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                <AnimatedNumber value={metric.value} suffix="%" run={showImpact} delay={0.95 + pIdx * 0.1 + mi * 0.06} />
                              </span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${proj.gradient}`}
                                initial={{ width: '0%' }}
                                animate={showImpact ? { width: `${metric.value}%` } : { width: '0%' }}
                                transition={{ duration: 1, delay: 0.95 + pIdx * 0.1 + mi * 0.06, ease: EASE }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ---- Engineering takeaways ---- */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {engineeringNotes.map((note, i) => (
                    <motion.div
                      key={note.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 + i * 0.08, ease: EASE }}
                      className={`rounded-2xl p-5 text-left ${
                        darkMode ? 'bg-white/[0.04] border border-white/10' : 'bg-white/70 border border-purple-100'
                      }`}
                    >
                      <note.icon size={18} className={`mb-3 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
                      <p className={`text-sm font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.title}</p>
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{note.body}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Scroll-up arrow to collapse Impact */}
                <motion.button
                  onClick={() => setShowImpact(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, -10, 0] }}
                  transition={{ opacity: { duration: 0.4, delay: 0.6 }, y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Hide project impact"
                  className={`mx-auto mt-12 flex items-center justify-center w-14 h-14 rounded-full shadow-xl border-2 ${
                    darkMode
                      ? 'bg-gray-800/80 border-purple-500/40 text-purple-300 hover:bg-gray-700'
                      : 'bg-white/80 border-purple-200 text-purple-600 hover:bg-white'
                  }`}
                >
                  <ChevronUp size={26} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </motion.section>

      <motion.div
        animate={{ opacity: showImpact ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: showImpact ? 'none' : 'block' }}
        aria-hidden={showImpact}
      >
      {/* About Section */}
      <section id="about" className={`py-20 px-6 ${
        darkMode ? 'bg-gray-900/50' : 'bg-white/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-12 text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              About <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">Me</span>
            </motion.h2>
            
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className={`text-lg leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Hi! I'm <span className="font-bold text-purple-500">{personalInfo.name}</span>, a passionate software engineer who loves building amazing digital experiences. I specialize in creating scalable, performant applications that solve real-world problems.
                </p>
                <p className={`text-lg leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  With years of experience in modern web technologies, I focus on writing clean, maintainable code and delivering exceptional user experiences. I'm constantly learning and adapting to new technologies.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Github, label: "GitHub", value: "Sameer-Ansari506", href: personalInfo.github },
                  { icon: Linkedin, label: "LinkedIn", value: "sameer-ahmad", href: personalInfo.linkedin },
                  { icon: Phone, label: "Phone", value: personalInfo.phone, href: `tel:${personalInfo.phone}` }
                ].map((item, idx) => (
                  <motion.a
                    key={idx}
                    href={item.href}
                    target={item.icon === Phone ? undefined : "_blank"}
                    rel={item.icon === Phone ? undefined : "noopener noreferrer"}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl shadow-lg transition-all ${
                      darkMode 
                        ? 'bg-gray-800/80 hover:bg-gray-800' 
                        : 'bg-white hover:shadow-xl'
                    }`}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <item.icon size={28} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{item.label}</p>
                      <p className={`font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-12 text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Skills & <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Expertise</span>
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {skills.map((skillGroup, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                  className={`rounded-3xl p-8 shadow-2xl will-change-transform ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-purple-900/50 hover:shadow-purple-500/50' 
                      : 'bg-white hover:shadow-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{skillGroup.icon}</span>
                    <h3 className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{skillGroup.category}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, skillIdx) => (
                      <motion.span
                        key={skillIdx}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md ${
                          darkMode
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-200 hover:to-pink-200'
                        }`}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={`py-20 px-6 ${
        darkMode ? 'bg-gray-900/50' : 'bg-white/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="relative"
          >
            {/* Mobile Filter Button - Top Right */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterPopup(true)}
              className={`md:hidden absolute -top-16 right-0 w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center z-10 ${
                darkMode
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
              }`}
            >
              <Filter size={20} strokeWidth={2.5} />
            </motion.button>

            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
              <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {projectFilter === 'All' ? 'Featured' : projectFilter} <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Projects</span>
              </motion.h2>
              
              {/* Desktop Filter Buttons */}
              <motion.div 
                variants={itemVariants}
                className="hidden md:flex gap-2 mt-6 md:mt-0"
              >
                {filterOptions.map((filter) => (
                  <motion.button
                    key={filter.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProjectFilter(filter.name)}
                    className={`w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center ${
                      projectFilter === filter.name
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-purple-500/50'
                        : darkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={filter.name}
                  >
                    <filter.icon size={20} strokeWidth={2.5} />
                  </motion.button>
                ))}
              </motion.div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={projectFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {(projectFilter === 'All' 
                  ? projects.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 6)
                  : projects.filter(project => project.category === projectFilter)
                ).map((project, index) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                    whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                    className={`rounded-3xl overflow-hidden shadow-2xl will-change-transform flex flex-col h-full ${
                      darkMode
                        ? 'bg-gray-800 hover:shadow-purple-500/50'
                        : 'bg-white hover:shadow-purple-200'
                    }`}
                  >
                  <div className="h-48 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 relative overflow-hidden flex-shrink-0">
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Code2 size={80} className="text-white/90" />
                    </motion.div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{project.title}</h3>
                    <p className={`text-xs font-semibold mb-3 ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>{project.duration}</p>
                    <p className={`mb-4 text-sm leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{project.description}</p>
                    
                    <div className="mb-4">
                      <p className={`text-xs font-bold mb-2 ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>KEY HIGHLIGHTS:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {project.highlights.map((highlight, hIdx) => (
                          <div key={hIdx} className={`text-xs flex items-center gap-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, techIdx) => (
                        <span key={techIdx} className={`px-3 py-1 rounded-full text-xs font-bold ${
                          darkMode 
                            ? 'bg-purple-900/50 text-purple-300' 
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      {project.github ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={project.github}
                          className="flex-1 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl text-center text-sm font-bold hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Github size={16} />
                          Code
                        </motion.a>
                      ) : null}
                      {project.demo ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={project.demo}
                          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-center text-sm font-bold hover:from-cyan-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <ExternalLink size={16} />
                          Demo
                        </motion.a>
                      ) : null}
                      {!project.github && !project.demo ? (
                        project.weburl ? (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={project.weburl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full py-3 rounded-xl text-center text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              darkMode
                                ? 'bg-purple-900/30 text-purple-300 border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400/50'
                                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                            }`}
                          >
                            <ExternalLink size={16} />
                            Private Client Project
                          </motion.a>
                        ) : (
                          <div className={`w-full py-3 rounded-xl text-center text-sm font-bold border ${
                            darkMode
                              ? 'bg-gray-800/40 text-gray-400 border-gray-600/30'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            Private Client Project
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-12 text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Work <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Experience</span>
            </motion.h2>
            
            {experience.map((exp, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.01, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                className={`rounded-3xl p-8 shadow-2xl will-change-transform relative overflow-hidden ${
                  idx > 0 ? 'mt-8' : ''
                } ${
                  darkMode 
                    ? 'bg-gradient-to-r from-gray-800 to-purple-900/30 hover:shadow-purple-500/30' 
                    : 'bg-white hover:shadow-purple-200'
                }`}
              >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />
                  
                  <div className="ml-6">
                    <div className="flex flex-wrap justify-between items-start mb-6">
                      <div>
                        <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{exp.role}</h3>
                        <p className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-2">{exp.company}</p>
                        <div className="flex flex-wrap gap-2">
                          {exp.tech?.map((tech, tIdx) => (
                            <span key={tIdx} className={`px-2 py-1 rounded text-xs font-bold ${
                              darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-2 mb-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Calendar size={16} />
                          <span className="text-sm font-semibold">{exp.duration}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <MapPin size={16} />
                          <span className="text-sm">{exp.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className={`flex items-start gap-3 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                          <span className="leading-relaxed">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className={`py-20 px-6 ${
        darkMode ? 'bg-gray-900/50' : 'bg-white/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-12 text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Education</span>
            </motion.h2>
            
            <div className="max-w-5xl mx-auto space-y-6">
              {education.map((edu, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ x: 10, scale: 1.01, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                  className={`rounded-3xl p-8 shadow-2xl will-change-transform ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-purple-900/50 hover:shadow-purple-500/50' 
                      : 'bg-white hover:shadow-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                      <GraduationCap size={40} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{edu.degree}</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">{edu.institution}</p>
                      
                      <div className={`flex flex-wrap gap-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm font-semibold">{edu.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span className="text-sm">{edu.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award size={16} />
                          <span className="text-sm font-bold">{edu.gpa}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-12 text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Awards & <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Achievements</span>
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                  className={`rounded-3xl p-8 shadow-2xl will-change-transform text-center ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-800 via-purple-900/50 to-pink-900/30 hover:shadow-purple-500/50' 
                      : 'bg-gradient-to-br from-white via-purple-50 to-pink-50 hover:shadow-purple-300'
                  }`}
                >
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: idx * 0.2 }}
                  >
                    {achievement.icon}
                  </motion.div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{achievement.title}</h3>
                  
                  <p className={`text-sm font-semibold mb-2 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>{achievement.description}</p>
                  
                  <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                    darkMode
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-cyan-100 to-purple-100 text-purple-800'
                  }`}>
                    {achievement.years}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className={`text-4xl md:text-6xl font-black mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Let's <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">Connect</span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className={`text-lg mb-12 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </motion.p>
            
            <motion.div variants={itemVariants} className={`rounded-3xl p-10 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Mail, label: "Email", value: personalInfo.email, href: `mailto:${personalInfo.email}` },
                  { icon: Phone, label: "Phone", value: personalInfo.phone, href: `tel:${personalInfo.phone}` },
                  { icon: MapPin, label: "Location", value: personalInfo.location, href: "#" }
                ].map((contact, idx) => (
                  <motion.a
                    key={idx}
                    href={contact.href}
                    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                    className={`p-6 rounded-2xl will-change-transform min-w-0 overflow-hidden text-center ${
                      darkMode
                        ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 hover:from-purple-800/50 hover:to-pink-800/50'
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
                    }`}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <contact.icon size={28} className="text-white" />
                    </div>
                    <p className={`text-sm font-semibold mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{contact.label}</p>
                    <p className={`font-bold text-sm break-all leading-snug ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{contact.value}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </motion.div>
      </main>

      {/* Footer */}
      <footer className={`py-10 px-6 ${
        darkMode ? 'bg-gray-950 border-t border-purple-500/20' : 'bg-gray-900 border-t border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            © {new Date().getFullYear()} {personalInfo.name}. Built with Next.js, TypeScript & Tailwind CSS
          </p>
          <div className="flex gap-4 justify-center">
            {[
              { icon: Github, href: personalInfo.github },
              { icon: Linkedin, href: personalInfo.linkedin },
              { icon: Mail, href: `mailto:${personalInfo.email}` }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                whileHover={{ scale: 1.2, y: -3 }}
                href={social.href}
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 transition-all"
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>
      </footer>

      {/* Mobile Filter Popup */}
      <AnimatePresence>
        {showFilterPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            {/* Popup */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className={`relative ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
                  : 'bg-gradient-to-br from-white via-purple-50 to-white'
              } rounded-3xl shadow-2xl p-8 max-w-sm w-full`}>
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFilterPopup(false)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-400 hover:text-white' 
                      : 'bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X size={20} />
                </motion.button>

                {/* Title */}
                <h3 className={`text-2xl font-bold text-center mb-8 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Filter Projects
                </h3>

                {/* Circular Filter Layout */}
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                  {filterOptions.map((filter, index) => {
                    const angle = (index * 360) / filterOptions.length - 90;
                    const radius = 90;
                    const x = radius * Math.cos((angle * Math.PI) / 180);
                    const y = radius * Math.sin((angle * Math.PI) / 180);
                    
                    return (
                      <motion.div
                        key={filter.name}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          scale: 1, 
                          x: x, 
                          y: y,
                        }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                        className="absolute"
                        style={{ 
                          left: '50%',
                          top: '50%',
                          marginLeft: '-32px',
                          marginTop: '-32px'
                        }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setProjectFilter(filter.name);
                            setShowFilterPopup(false);
                          }}
                          className={`w-16 h-16 rounded-full shadow-xl transition-all flex flex-col items-center justify-center ${
                            projectFilter === filter.name
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-purple-500/50'
                              : darkMode
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <filter.icon size={24} strokeWidth={2.5} />
                          <span className="text-[8px] mt-1 font-semibold">
                            {filter.name === 'Cross Platform' ? 'Cross' : filter.name}
                          </span>
                        </motion.button>
                      </motion.div>
                    );
                  })}
                  
                  {/* Center Circle */}
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gradient-to-br from-purple-600 to-cyan-600' 
                      : 'bg-gradient-to-br from-purple-400 to-cyan-400'
                  } shadow-lg`}>
                    <Sparkles className="text-white" size={32} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
