export type EntityRecord = { id: string; name: string; status: string; owner: string; amount?: string; dueDate?: string; priority?: string };
export type FeatureEntitySet = { title: string; columns: string[]; rows: EntityRecord[] };
const COLUMNS = ['Name', 'Status', 'Owner', 'Amount', 'Due Date', 'Priority'];
const entitySeeds = [
  [
    "evidence-vault",
    "Evidence Vault Records",
    "Evidence Vault priority queue",
    "Open",
    "Evidence Vault exception list",
    "Evidence Lead",
    "$0"
  ],
  [
    "model-card-registry",
    "Model Card Registry Records",
    "Model Card Registry priority queue",
    "Review",
    "Model Card Registry exception list",
    "AI Governance Lead",
    "$0"
  ],
  [
    "release-approval-history",
    "Release Approval History Records",
    "Release Approval History priority queue",
    "Action needed",
    "Release Approval History exception list",
    "Release Lead",
    "$0"
  ],
  [
    "security-test-evidence",
    "Security Test Evidence Records",
    "Security Test Evidence priority queue",
    "Open",
    "Security Test Evidence exception list",
    "Security Lead",
    "$0"
  ],
  [
    "privacy-review-evidence",
    "Privacy Review Evidence Records",
    "Privacy Review Evidence priority queue",
    "Review",
    "Privacy Review Evidence exception list",
    "Privacy Lead",
    "$0"
  ],
  [
    "ai-evaluation-records",
    "AI Evaluation Records Records",
    "AI Evaluation Records priority queue",
    "Action needed",
    "AI Evaluation Records exception list",
    "AI Governance Lead",
    "$0"
  ],
  [
    "control-crosswalk",
    "Control Crosswalk Records",
    "Control Crosswalk priority queue",
    "Open",
    "Control Crosswalk exception list",
    "Controls Lead",
    "$0"
  ],
  [
    "customer-audit-packets",
    "Customer Audit Packets Records",
    "Customer Audit Packets priority queue",
    "Review",
    "Customer Audit Packets exception list",
    "Customer Trust Lead",
    "$0"
  ],
  [
    "exception-register",
    "Exception Register Records",
    "Exception Register priority queue",
    "Action needed",
    "Exception Register exception list",
    "Risk Lead",
    "$0"
  ],
  [
    "compliance-dashboard",
    "Compliance Dashboard Records",
    "Compliance Dashboard priority queue",
    "Open",
    "Compliance Dashboard exception list",
    "Reporting Lead",
    "$0"
  ],
  [
    "documents",
    "Documents Records",
    "Documents priority queue",
    "Review",
    "Documents exception list",
    "Core Platform Lead",
    "$0"
  ],
  [
    "notifications",
    "Notifications Records",
    "Notifications priority queue",
    "Action needed",
    "Notifications exception list",
    "Core Platform Lead",
    "$0"
  ],
  [
    "integrations",
    "Integrations Records",
    "Integrations priority queue",
    "Open",
    "Integrations exception list",
    "Core Platform Lead",
    "$0"
  ],
  [
    "profiles",
    "Profiles Records",
    "Profiles priority queue",
    "Review",
    "Profiles exception list",
    "Core Platform Lead",
    "$0"
  ],
  [
    "ai-assistant",
    "AI Assistant Records",
    "AI Assistant priority queue",
    "Action needed",
    "AI Assistant exception list",
    "Intelligence Layer Lead",
    "$0"
  ],
  [
    "ai-tools",
    "AI Tools Records",
    "AI Tools priority queue",
    "Open",
    "AI Tools exception list",
    "Intelligence Layer Lead",
    "$0"
  ]
] as const;

function buildSet(slug: string, title: string, firstName: string, firstStatus: string, secondName: string, owner: string, amount: string): FeatureEntitySet {
  return {
    title,
    columns: COLUMNS,
    rows: [
      { id: `${slug}-1`, name: firstName, status: firstStatus, owner, amount, dueDate: '2026-06-03', priority: 'High' },
      { id: `${slug}-2`, name: secondName, status: 'Review', owner: 'Operations', amount, dueDate: '2026-06-06', priority: 'Medium' },
      { id: `${slug}-3`, name: `${title.replace(' Records', '')} audit queue`, status: 'Queued', owner: 'Team Lead', amount: '$0', dueDate: '2026-06-10', priority: 'Medium' },
    ],
  };
}

export const featureEntitiesBySlug: Record<string, FeatureEntitySet> = Object.fromEntries(entitySeeds.map(([slug, title, firstName, firstStatus, secondName, owner, amount]) => [slug, buildSet(slug, title, firstName, firstStatus, secondName, owner, amount)]));
