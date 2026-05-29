export type FeatureSurfaceRow = { id: string; item: string; status: string; owner: string; nextStep: string };
export type FeatureSurface = {
  workItems: FeatureSurfaceRow[];
  quickActions: string[];
  controlChecks: Array<{ id: string; label: string; done: boolean }>;
  activityLog: Array<{ id: string; message: string; at: string }>;
};

const featureSeeds = [
  [
    "evidence-vault",
    "Evidence Vault",
    "Evidence Vault operating queue",
    "Evidence Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "model-card-registry",
    "Model Card Registry",
    "Model Card Registry operating queue",
    "AI Governance Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "release-approval-history",
    "Release Approval History",
    "Release Approval History operating queue",
    "Release Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "security-test-evidence",
    "Security Test Evidence",
    "Security Test Evidence operating queue",
    "Security Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "privacy-review-evidence",
    "Privacy Review Evidence",
    "Privacy Review Evidence operating queue",
    "Privacy Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "ai-evaluation-records",
    "AI Evaluation Records",
    "AI Evaluation Records operating queue",
    "AI Governance Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "control-crosswalk",
    "Control Crosswalk",
    "Control Crosswalk operating queue",
    "Controls Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "customer-audit-packets",
    "Customer Audit Packets",
    "Customer Audit Packets operating queue",
    "Customer Trust Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "exception-register",
    "Exception Register",
    "Exception Register operating queue",
    "Risk Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "compliance-dashboard",
    "Compliance Dashboard",
    "Compliance Dashboard operating queue",
    "Reporting Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "documents",
    "Documents",
    "Documents operating queue",
    "Core Platform Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "notifications",
    "Notifications",
    "Notifications operating queue",
    "Core Platform Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "integrations",
    "Integrations",
    "Integrations operating queue",
    "Core Platform Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "profiles",
    "Profiles",
    "Profiles operating queue",
    "Core Platform Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "ai-assistant",
    "AI Assistant",
    "AI Assistant operating queue",
    "Intelligence Layer Lead",
    "Review evidence, assign owner, and record next action"
  ],
  [
    "ai-tools",
    "AI Tools",
    "AI Tools operating queue",
    "Intelligence Layer Lead",
    "Review evidence, assign owner, and record next action"
  ]
] as const;

function buildSurface(slug: string, title: string, item: string, owner: string, nextStep: string): FeatureSurface {
  return {
    workItems: [
      { id: `${slug}-1`, item, status: 'Open', owner, nextStep },
      { id: `${slug}-2`, item: `${title} exception review`, status: 'Review', owner: 'Operations', nextStep: 'Investigate exception and assign owner' },
      { id: `${slug}-3`, item: `${title} weekly operating queue`, status: 'Queued', owner: 'Team Lead', nextStep: 'Prioritize next actions' },
    ],
    quickActions: [`Create ${title} record`, `Export ${title} list`, `Review ${title} exceptions`],
    controlChecks: [
      { id: `${slug}-check-1`, label: `${title} owner assigned`, done: true },
      { id: `${slug}-check-2`, label: `${title} next step documented`, done: false },
      { id: `${slug}-check-3`, label: `${title} audit trail current`, done: true },
    ],
    activityLog: [
      { id: `${slug}-log-1`, message: `${title} queue refreshed`, at: '2026-05-29 09:00' },
      { id: `${slug}-log-2`, message: `${title} exception assigned`, at: '2026-05-29 11:30' },
    ],
  };
}

export const featureSurfaceBySlug: Record<string, FeatureSurface> = Object.fromEntries(featureSeeds.map(([slug, title, item, owner, nextStep]) => [slug, buildSurface(slug, title, item, owner, nextStep)]));
export const featureSurfaces: Record<string, FeatureSurface> = Object.fromEntries(featureSeeds.map(([slug, title]) => [title, featureSurfaceBySlug[slug]]));
