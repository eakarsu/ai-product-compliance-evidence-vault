import {
  Activity,
  BarChart3,
  Bell,
  Blocks,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  Database,
  FileText,
  Files,
  LayoutDashboard,
  PackageCheck,
  Plug,
  ShieldCheck,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type FeatureDefinition = { title: string; href: string; category: string; summary: string; bullets: string[] };
export type PageDefinition = {
  title: string;
  eyebrow: string;
  subtitle: string;
  category: string;
  summary: string;
  bullets: string[];
  metrics: Array<{ label: string; value: string; note: string }>;
};
export type FeatureContext = {
  sourceOwners: string[];
  operatingQueues: string[];
  outputs: string[];
  relatedRoutes: Array<{ label: string; href: string }>;
};

const suiteSourceOwners = ["Product releases","Model cards","Security tests","Privacy reviews"];

const features = [
  {
    slug: "evidence-vault",
    title: "Evidence Vault",
    href: "/evidence-vault",
    category: "Evidence",
    icon: Bot,
    summary: "Artifacts, owners, product areas, control links, retention, and audit status.",
    bullets: ["Evidence Vault queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Evidence Vault", value: "24", note: 'Active records' },
      { label: 'Exceptions', value: "2", note: 'Need review' },
      { label: 'Due Soon', value: "4", note: 'Next 14 days' },
    ],
  },
  {
    slug: "model-card-registry",
    title: "Model Card Registry",
    href: "/model-card-registry",
    category: "AI Governance",
    icon: Workflow,
    summary: "Model cards, intended use, limitations, evals, risks, and approvals.",
    bullets: ["Model Card Registry queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Model Card Registry", value: "33", note: 'Active records' },
      { label: 'Exceptions', value: "3", note: 'Need review' },
      { label: 'Due Soon', value: "5", note: 'Next 14 days' },
    ],
  },
  {
    slug: "release-approval-history",
    title: "Release Approval History",
    href: "/release-approval-history",
    category: "Release",
    icon: Users,
    summary: "Release gates, approvers, evidence, exceptions, and go/no-go decisions.",
    bullets: ["Release Approval History queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Release Approval History", value: "42", note: 'Active records' },
      { label: 'Exceptions', value: "4", note: 'Need review' },
      { label: 'Due Soon', value: "6", note: 'Next 14 days' },
    ],
  },
  {
    slug: "security-test-evidence",
    title: "Security Test Evidence",
    href: "/security-test-evidence",
    category: "Security",
    icon: CalendarCheck,
    summary: "Pen tests, scans, findings, remediation, retest status, and proof.",
    bullets: ["Security Test Evidence queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Security Test Evidence", value: "51", note: 'Active records' },
      { label: 'Exceptions', value: "5", note: 'Need review' },
      { label: 'Due Soon', value: "7", note: 'Next 14 days' },
    ],
  },
  {
    slug: "privacy-review-evidence",
    title: "Privacy Review Evidence",
    href: "/privacy-review-evidence",
    category: "Privacy",
    icon: ClipboardList,
    summary: "DPIAs, data maps, lawful basis, retention, and privacy sign-off.",
    bullets: ["Privacy Review Evidence queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Privacy Review Evidence", value: "60", note: 'Active records' },
      { label: 'Exceptions', value: "6", note: 'Need review' },
      { label: 'Due Soon', value: "8", note: 'Next 14 days' },
    ],
  },
  {
    slug: "ai-evaluation-records",
    title: "AI Evaluation Records",
    href: "/ai-evaluation-records",
    category: "AI Governance",
    icon: FileText,
    summary: "Eval suites, results, thresholds, regressions, and deployment decisions.",
    bullets: ["AI Evaluation Records queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "AI Evaluation Records", value: "69", note: 'Active records' },
      { label: 'Exceptions', value: "2", note: 'Need review' },
      { label: 'Due Soon', value: "9", note: 'Next 14 days' },
    ],
  },
  {
    slug: "control-crosswalk",
    title: "Control Crosswalk",
    href: "/control-crosswalk",
    category: "Controls",
    icon: BarChart3,
    summary: "Framework requirements, controls, evidence links, gaps, and owner actions.",
    bullets: ["Control Crosswalk queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Control Crosswalk", value: "78", note: 'Active records' },
      { label: 'Exceptions', value: "3", note: 'Need review' },
      { label: 'Due Soon', value: "4", note: 'Next 14 days' },
    ],
  },
  {
    slug: "customer-audit-packets",
    title: "Customer Audit Packets",
    href: "/customer-audit-packets",
    category: "Customer Trust",
    icon: PackageCheck,
    summary: "Questionnaires, evidence bundles, redactions, approvals, and delivery log.",
    bullets: ["Customer Audit Packets queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Customer Audit Packets", value: "87", note: 'Active records' },
      { label: 'Exceptions', value: "4", note: 'Need review' },
      { label: 'Due Soon', value: "5", note: 'Next 14 days' },
    ],
  },
  {
    slug: "exception-register",
    title: "Exception Register",
    href: "/exception-register",
    category: "Risk",
    icon: ShieldCheck,
    summary: "Accepted gaps, risk owner, expiry, compensating controls, and review cadence.",
    bullets: ["Exception Register queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Exception Register", value: "96", note: 'Active records' },
      { label: 'Exceptions', value: "5", note: 'Need review' },
      { label: 'Due Soon', value: "6", note: 'Next 14 days' },
    ],
  },
  {
    slug: "compliance-dashboard",
    title: "Compliance Dashboard",
    href: "/compliance-dashboard",
    category: "Reporting",
    icon: Activity,
    summary: "Evidence coverage, open gaps, upcoming audits, risk trends, and readiness score.",
    bullets: ["Compliance Dashboard queue","AI assisted review","Audit-ready output"],
    metrics: [
      { label: "Compliance Dashboard", value: "105", note: 'Active records' },
      { label: 'Exceptions', value: "6", note: 'Need review' },
      { label: 'Due Soon', value: "7", note: 'Next 14 days' },
    ],
  },
  {
    slug: "documents",
    title: "Documents",
    href: "/documents",
    category: "Core Platform",
    icon: Files,
    summary: "Product Compliance Evidence Vault documents, evidence, attachments, and exports.",
    bullets: ["Documents","Controls","Audit trail"],
    metrics: [
      { label: "Documents", value: "48", note: 'Tracked' },
      { label: 'Open', value: "7", note: 'Needs review' },
      { label: 'Updated', value: "21", note: 'This week' },
    ],
  },
  {
    slug: "notifications",
    title: "Notifications",
    href: "/notifications",
    category: "Core Platform",
    icon: Bell,
    summary: "Product Compliance Evidence Vault alerts, reminders, exceptions, and approvals.",
    bullets: ["Notifications","Controls","Audit trail"],
    metrics: [
      { label: "Notifications", value: "65", note: 'Tracked' },
      { label: 'Open', value: "10", note: 'Needs review' },
      { label: 'Updated', value: "29", note: 'This week' },
    ],
  },
  {
    slug: "integrations",
    title: "Integrations",
    href: "/integrations",
    category: "Core Platform",
    icon: Plug,
    summary: "Product Compliance Evidence Vault connector health, sync status, and integration warnings.",
    bullets: ["Integrations","Controls","Audit trail"],
    metrics: [
      { label: "Integrations", value: "82", note: 'Tracked' },
      { label: 'Open', value: "13", note: 'Needs review' },
      { label: 'Updated', value: "37", note: 'This week' },
    ],
  },
  {
    slug: "profiles",
    title: "Profiles",
    href: "/profiles",
    category: "Core Platform",
    icon: UserRound,
    summary: "Product Compliance Evidence Vault users, roles, teams, permissions, and ownership settings.",
    bullets: ["Profiles","Controls","Audit trail"],
    metrics: [
      { label: "Profiles", value: "99", note: 'Tracked' },
      { label: 'Open', value: "16", note: 'Needs review' },
      { label: 'Updated', value: "45", note: 'This week' },
    ],
  },
] as const;

const aiFeatures = [
  {
    slug: 'ai-assistant',
    title: 'AI Assistant',
    href: '/features/ai-assistant',
    category: 'Intelligence Layer',
    icon: Bot,
    summary: "Product Compliance Evidence Vault assistant for triage, drafting, analysis, recommendations, and operational review.",
    bullets: ['Triage support', 'Drafting', 'Review guidance'],
    metrics: [
      { label: 'Sessions', value: '128', note: 'Last 24 hours' },
      { label: 'Drafts', value: '204', note: 'Generated' },
      { label: 'Escalations', value: '14', note: 'Expert review' },
    ],
  },
  {
    slug: 'ai-tools',
    title: 'AI Tools',
    href: '/features/ai-tools',
    category: 'Intelligence Layer',
    icon: Activity,
    summary: "Product Compliance Evidence Vault AI tools for scoring, generation, extraction, classification, exception review, and reporting.",
    bullets: ['Scoring', 'Classification', 'Exception review'],
    metrics: [
      { label: 'Runs', value: '318', note: 'Last 24 hours' },
      { label: 'Signals', value: '88', note: 'New alerts' },
      { label: 'Accepted', value: '117', note: 'Reviewer accepted' },
    ],
  },
] as const;

const allFeatures = [...features, ...aiFeatures];

export const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Features', href: '/features', icon: Blocks },
  { label: 'Documents', href: '/documents', icon: Files },
  { label: 'Source Tables', href: '/source-tables', icon: Database },
  { label: 'Profiles', href: '/profiles', icon: UserRound },
];

export const featureNav: NavItem[] = allFeatures.map((feature) => ({ label: feature.title, href: feature.href, icon: feature.icon }));
export const featureCatalog: FeatureDefinition[] = allFeatures.map((feature) => ({ title: feature.title, href: feature.href, category: feature.category, summary: feature.summary, bullets: [...feature.bullets] }));

export const featureFamilies = [
  {
    "name": "Evidence",
    "features": [
      "Evidence Vault"
    ]
  },
  {
    "name": "AI Governance",
    "features": [
      "Model Card Registry",
      "AI Evaluation Records"
    ]
  },
  {
    "name": "Release",
    "features": [
      "Release Approval History"
    ]
  },
  {
    "name": "Security",
    "features": [
      "Security Test Evidence"
    ]
  },
  {
    "name": "Privacy",
    "features": [
      "Privacy Review Evidence"
    ]
  },
  {
    "name": "Controls",
    "features": [
      "Control Crosswalk"
    ]
  },
  {
    "name": "Customer Trust",
    "features": [
      "Customer Audit Packets"
    ]
  },
  {
    "name": "Risk",
    "features": [
      "Exception Register"
    ]
  },
  {
    "name": "Reporting",
    "features": [
      "Compliance Dashboard"
    ]
  },
  {
    "name": "Core Platform",
    "features": [
      "Documents",
      "Notifications",
      "Integrations",
      "Profiles"
    ]
  },
  {
    "name": "Intelligence Layer",
    "features": [
      "AI Assistant",
      "AI Tools"
    ]
  }
];

function toPage(feature: (typeof allFeatures)[number]): PageDefinition {
  return {
    title: feature.title,
    eyebrow: feature.category,
    subtitle: feature.summary,
    category: feature.category,
    summary: feature.title + ' is implemented as a dedicated Product Compliance Evidence Vault workflow with records, AI assistance, approvals, audit, and reporting.',
    bullets: [...feature.bullets],
    metrics: [...feature.metrics],
  };
}

export const pageRegistry: Record<string, PageDefinition> = Object.fromEntries(features.map((feature) => [feature.slug, toPage(feature)]));
export const aiFeatureRegistry: Record<string, PageDefinition> = Object.fromEntries(aiFeatures.map((feature) => [feature.slug, toPage(feature)]));
export const featureContexts: Record<string, FeatureContext> = Object.fromEntries(
  allFeatures.map((feature) => [
    feature.title,
    {
      sourceOwners: suiteSourceOwners,
      operatingQueues: [feature.title + ' records', feature.title + ' approvals', feature.title + ' exceptions'],
      outputs: [feature.title + ' dashboard', feature.title + ' export', feature.title + ' audit trail'],
      relatedRoutes: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'All Features', href: '/features' }, { label: 'AI Tools', href: '/features/ai-tools' }],
    },
  ]),
);
