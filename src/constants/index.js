export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceXAF: 0,
    limits: { websites: 1, monthlyAudits: 3, aiWords: 2000, trackedKeywords: 10, teamMembers: 1 },
    features: [
      "1 website",
      "Basic SEO audit",
      "Limited AI content",
      "Basic recommendations",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    // XAF prices are the amounts actually charged via Fapshi (Mobile
    // Money / Orange Money only settle in XAF). Placeholder figures —
    // adjust to your actual pricing before going live.
    priceXAF: 15000,
    limits: { websites: 1, monthlyAudits: 15, aiWords: 20000, trackedKeywords: 50, teamMembers: 1 },
    features: [
      "Multiple audits",
      "AI content generation",
      "Keyword tracking",
      "Monitoring",
      "Automated recommendations",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 79,
    priceXAF: 45000,
    limits: { websites: 5, monthlyAudits: 60, aiWords: 100000, trackedKeywords: 250, teamMembers: 3 },
    features: [
      "Multiple websites",
      "Advanced AI content",
      "Automated optimization",
      "Reports",
      "Integrations",
      "Priority processing",
    ],
    highlighted: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 199,
    priceXAF: 120000,
    limits: { websites: 25, monthlyAudits: 300, aiWords: 500000, trackedKeywords: 1000, teamMembers: 10 },
    features: [
      "Multiple clients",
      "White-label reports",
      "Client management",
      "Team members",
      "Advanced automation",
    ],
  },
};

export const SEVERITY = {
  critical: { label: "Critical", weight: 4 },
  high: { label: "High", weight: 3 },
  medium: { label: "Medium", weight: 2 },
  low: { label: "Low", weight: 1 },
  info: { label: "Info", weight: 0 },
};

export const SCORE_WEIGHTS = {
  technical: 0.25,
  onPage: 0.25,
  content: 0.2,
  performance: 0.15,
  mobile: 0.1,
  accessibility: 0.05,
};

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Websites", href: "/dashboard/websites", icon: "globe" },
  { label: "SEO Audits", href: "/dashboard/audits", icon: "search" },
  { label: "AI Content", href: "/dashboard/content", icon: "sparkles" },
  { label: "Keywords", href: "/dashboard/keywords", icon: "target" },
  { label: "Recommendations", href: "/dashboard/recommendations", icon: "lightbulb" },
  { label: "Monitoring", href: "/dashboard/monitoring", icon: "activity" },
  { label: "Reports", href: "/dashboard/reports", icon: "file" },
  { label: "Integrations", href: "/dashboard/integrations", icon: "plug" },
];

export const DASHBOARD_NAV_BOTTOM = [
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
  { label: "Billing", href: "/dashboard/billing", icon: "card" },
];

export const MARKETING_NAV = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "AI Content", href: "/#ai-content" },
  { label: "Pricing", href: "/pricing" },
];
