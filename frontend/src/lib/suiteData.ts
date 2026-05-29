export type Metric = { label: string; value: string; note: string };
export const sourceSystems = [
  {
    "name": "Product releases",
    "ownership": "Product releases contributes operating evidence, workflows, control signals, and reporting inputs to Product Compliance Evidence Vault.",
    "coverage": [
      "Evidence Vault",
      "Model Card Registry",
      "AI tools",
      "Audit evidence"
    ]
  },
  {
    "name": "Model cards",
    "ownership": "Model cards contributes operating evidence, workflows, control signals, and reporting inputs to Product Compliance Evidence Vault.",
    "coverage": [
      "Model Card Registry",
      "Release Approval History",
      "AI tools",
      "Audit evidence"
    ]
  },
  {
    "name": "Security tests",
    "ownership": "Security tests contributes operating evidence, workflows, control signals, and reporting inputs to Product Compliance Evidence Vault.",
    "coverage": [
      "Release Approval History",
      "Security Test Evidence",
      "AI tools",
      "Audit evidence"
    ]
  },
  {
    "name": "Privacy reviews",
    "ownership": "Privacy reviews contributes operating evidence, workflows, control signals, and reporting inputs to Product Compliance Evidence Vault.",
    "coverage": [
      "Security Test Evidence",
      "Privacy Review Evidence",
      "AI tools",
      "Audit evidence"
    ]
  }
];

export const dashboardMetrics: Metric[] = [
  { label: 'Workflow Areas', value: '10', note: 'Dedicated modules' },
  { label: 'Evidence Sources', value: '4', note: 'Mapped sources' },
  { label: 'AI Tools', value: '13', note: 'Suite copilots' },
  { label: 'Open Work', value: '64', note: 'Across workflows' },
];

export const healthMetrics: Metric[] = [
  { label: 'Connector Health', value: '96%', note: 'Pilot baseline' },
  { label: 'Audit Coverage', value: '100%', note: 'All workflows logged' },
  { label: 'Review Queue', value: '22', note: 'Needs owner action' },
  { label: 'Automation Runs', value: '351', note: 'Last 24 hours' },
];

export const dashboardModules = [
  "Evidence Vault operating view",
  "Model Card Registry operating view",
  "Release Approval History operating view",
  "Security Test Evidence operating view",
  "Privacy Review Evidence operating view",
  "AI Evaluation Records operating view",
  "Control Crosswalk operating view",
  "Customer Audit Packets operating view"
];
export const workflowHighlights = [
  "Evidence Vault workflow with records, AI assist, approvals, audit, and reporting",
  "Model Card Registry workflow with records, AI assist, approvals, audit, and reporting",
  "Release Approval History workflow with records, AI assist, approvals, audit, and reporting",
  "Security Test Evidence workflow with records, AI assist, approvals, audit, and reporting",
  "Privacy Review Evidence workflow with records, AI assist, approvals, audit, and reporting",
  "AI Evaluation Records workflow with records, AI assist, approvals, audit, and reporting"
];
