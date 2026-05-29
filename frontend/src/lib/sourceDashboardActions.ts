export type SourceDashboardAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  sourceProjects: string[];
  examples: string[];
  count: number;
};

export const sourceDashboardActions: SourceDashboardAction[] = [
  {
    "id": "evidence-vault",
    "label": "Evidence Vault",
    "description": "Evidence Vault action group for Product Compliance Evidence Vault.",
    "href": "/evidence-vault",
    "sourceProjects": [
      "Product releases",
      "Model cards"
    ],
    "examples": [
      "Open Evidence Vault",
      "Review Evidence",
      "Run Evidence Vault AI check"
    ],
    "count": 3
  },
  {
    "id": "model-card-registry",
    "label": "Model Card Registry",
    "description": "Model Card Registry action group for Product Compliance Evidence Vault.",
    "href": "/model-card-registry",
    "sourceProjects": [
      "Model cards",
      "Security tests"
    ],
    "examples": [
      "Open Model Card Registry",
      "Review AI Governance",
      "Run Model Card Registry AI check"
    ],
    "count": 3
  },
  {
    "id": "release-approval-history",
    "label": "Release Approval History",
    "description": "Release Approval History action group for Product Compliance Evidence Vault.",
    "href": "/release-approval-history",
    "sourceProjects": [
      "Security tests",
      "Privacy reviews"
    ],
    "examples": [
      "Open Release Approval History",
      "Review Release",
      "Run Release Approval History AI check"
    ],
    "count": 3
  },
  {
    "id": "security-test-evidence",
    "label": "Security Test Evidence",
    "description": "Security Test Evidence action group for Product Compliance Evidence Vault.",
    "href": "/security-test-evidence",
    "sourceProjects": [
      "Privacy reviews"
    ],
    "examples": [
      "Open Security Test Evidence",
      "Review Security",
      "Run Security Test Evidence AI check"
    ],
    "count": 3
  },
  {
    "id": "privacy-review-evidence",
    "label": "Privacy Review Evidence",
    "description": "Privacy Review Evidence action group for Product Compliance Evidence Vault.",
    "href": "/privacy-review-evidence",
    "sourceProjects": [
      "Product releases",
      "Model cards"
    ],
    "examples": [
      "Open Privacy Review Evidence",
      "Review Privacy",
      "Run Privacy Review Evidence AI check"
    ],
    "count": 3
  },
  {
    "id": "ai-evaluation-records",
    "label": "AI Evaluation Records",
    "description": "AI Evaluation Records action group for Product Compliance Evidence Vault.",
    "href": "/ai-evaluation-records",
    "sourceProjects": [
      "Model cards",
      "Security tests"
    ],
    "examples": [
      "Open AI Evaluation Records",
      "Review AI Governance",
      "Run AI Evaluation Records AI check"
    ],
    "count": 3
  },
  {
    "id": "control-crosswalk",
    "label": "Control Crosswalk",
    "description": "Control Crosswalk action group for Product Compliance Evidence Vault.",
    "href": "/control-crosswalk",
    "sourceProjects": [
      "Security tests",
      "Privacy reviews"
    ],
    "examples": [
      "Open Control Crosswalk",
      "Review Controls",
      "Run Control Crosswalk AI check"
    ],
    "count": 3
  },
  {
    "id": "customer-audit-packets",
    "label": "Customer Audit Packets",
    "description": "Customer Audit Packets action group for Product Compliance Evidence Vault.",
    "href": "/customer-audit-packets",
    "sourceProjects": [
      "Privacy reviews"
    ],
    "examples": [
      "Open Customer Audit Packets",
      "Review Customer Trust",
      "Run Customer Audit Packets AI check"
    ],
    "count": 3
  },
  {
    "id": "exception-register",
    "label": "Exception Register",
    "description": "Exception Register action group for Product Compliance Evidence Vault.",
    "href": "/exception-register",
    "sourceProjects": [
      "Product releases",
      "Model cards"
    ],
    "examples": [
      "Open Exception Register",
      "Review Risk",
      "Run Exception Register AI check"
    ],
    "count": 3
  },
  {
    "id": "compliance-dashboard",
    "label": "Compliance Dashboard",
    "description": "Compliance Dashboard action group for Product Compliance Evidence Vault.",
    "href": "/compliance-dashboard",
    "sourceProjects": [
      "Model cards",
      "Security tests"
    ],
    "examples": [
      "Open Compliance Dashboard",
      "Review Reporting",
      "Run Compliance Dashboard AI check"
    ],
    "count": 3
  }
];
