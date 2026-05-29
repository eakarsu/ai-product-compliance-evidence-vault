export type SourceDataColumn = {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultValue: string;
  sourceLine: string;
};

export type SourceDataTable = {
  id: string;
  sourceProject: string;
  name: string;
  displayName: string;
  framework: string;
  sourceFile: string;
  columns: SourceDataColumn[];
};

export const sourceDataTables: SourceDataTable[] = [
  {
    "id": "ai-product-compliance-evidence-vault-evidence-vault",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "evidence_vault",
    "displayName": "Evidence Vault",
    "framework": "AppSchema",
    "sourceFile": "generated/evidence-vault.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Evidence",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-model-card-registry",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "model_card_registry",
    "displayName": "Model Card Registry",
    "framework": "AppSchema",
    "sourceFile": "generated/model-card-registry.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "AI Governance",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-release-approval-history",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "release_approval_history",
    "displayName": "Release Approval History",
    "framework": "AppSchema",
    "sourceFile": "generated/release-approval-history.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Release",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-security-test-evidence",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "security_test_evidence",
    "displayName": "Security Test Evidence",
    "framework": "AppSchema",
    "sourceFile": "generated/security-test-evidence.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Security",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-privacy-review-evidence",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "privacy_review_evidence",
    "displayName": "Privacy Review Evidence",
    "framework": "AppSchema",
    "sourceFile": "generated/privacy-review-evidence.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Privacy",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-ai-evaluation-records",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "ai_evaluation_records",
    "displayName": "AI Evaluation Records",
    "framework": "AppSchema",
    "sourceFile": "generated/ai-evaluation-records.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "AI Governance",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-control-crosswalk",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "control_crosswalk",
    "displayName": "Control Crosswalk",
    "framework": "AppSchema",
    "sourceFile": "generated/control-crosswalk.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Controls",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  },
  {
    "id": "ai-product-compliance-evidence-vault-customer-audit-packets",
    "sourceProject": "Product Compliance Evidence Vault",
    "name": "customer_audit_packets",
    "displayName": "Customer Audit Packets",
    "framework": "AppSchema",
    "sourceFile": "generated/customer-audit-packets.schema.ts",
    "columns": [
      {
        "name": "id",
        "type": "UUID",
        "nullable": false,
        "primaryKey": true,
        "unique": true,
        "defaultValue": "generated",
        "sourceLine": "id UUID PRIMARY KEY"
      },
      {
        "name": "name",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "name TEXT NOT NULL"
      },
      {
        "name": "status",
        "type": "TEXT",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "open",
        "sourceLine": "status TEXT NOT NULL"
      },
      {
        "name": "owner",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "",
        "sourceLine": "owner TEXT"
      },
      {
        "name": "category",
        "type": "TEXT",
        "nullable": true,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "Customer Trust",
        "sourceLine": "category TEXT"
      },
      {
        "name": "updated_at",
        "type": "TIMESTAMP",
        "nullable": false,
        "primaryKey": false,
        "unique": false,
        "defaultValue": "now()",
        "sourceLine": "updated_at TIMESTAMP NOT NULL DEFAULT now()"
      }
    ]
  }
];
