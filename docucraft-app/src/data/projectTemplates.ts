export type TemplateQuestionType = "text" | "textarea" | "select";

export type TemplateQuestion = {
  id: string;
  prompt: string;
  type: TemplateQuestionType;
  helperText?: string;
  options?: string[];
  required?: boolean;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  verticalId: string;
  recommendedStack: string[];
  followUpQuestions: TemplateQuestion[];
};

export type ProjectVertical = {
  id: string;
  label: string;
  description: string;
};

export const projectVerticals: ProjectVertical[] = [
  {
    id: "saas",
    label: "SaaS Platforms",
    description:
      "Subscription-based platforms focusing on analytics, collaboration, and productivity for modern teams.",
  },
  {
    id: "ecommerce",
    label: "E-commerce & Marketplaces",
    description:
      "Customer-facing commerce products that require catalog, checkout, and fulfillment orchestration.",
  },
  {
    id: "operations",
    label: "Operations & Internal Tools",
    description:
      "Workflow automation, inventory tracking, and process tooling for operational excellence.",
  },
];

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "saas-product-analytics",
    name: "Product Analytics Platform",
    description:
      "End-to-end analytics platform for SaaS teams to track product usage, retention, and experiment impact.",
    verticalId: "saas",
    recommendedStack: [
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Kafka",
      "Snowflake",
    ],
    followUpQuestions: [
      {
        id: "core-metrics",
        prompt: "Which metrics are most critical for your stakeholders?",
        type: "textarea",
        helperText: "Examples: activation rate, churn, feature adoption, or customer health score.",
        required: true,
      },
      {
        id: "event-ingestion",
        prompt: "How will product events be ingested into the platform?",
        type: "select",
        options: [
          "Client SDKs",
          "Backend instrumentation",
          "Data warehouse imports",
          "Third-party integration (Segment, RudderStack, etc.)",
        ],
        helperText: "Choose the primary source of telemetry. You can clarify additional sources later.",
        required: true,
      },
    ],
  },
  {
    id: "saas-collaboration-hub",
    name: "Team Collaboration Hub",
    description:
      "Centralized collaboration workspace with real-time messaging, knowledge base, and task coordination.",
    verticalId: "saas",
    recommendedStack: [
      "React",
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "WebSockets",
    ],
    followUpQuestions: [
      {
        id: "primary-use-cases",
        prompt: "What are the top collaboration scenarios you need to enable first?",
        type: "textarea",
        helperText: "Examples: async status updates, project documentation, or ticket triage.",
        required: true,
      },
      {
        id: "compliance",
        prompt: "Do you have any compliance or data residency requirements?",
        type: "text",
        helperText: "Mention standards like SOC 2, ISO 27001, HIPAA, or regional storage constraints.",
      },
    ],
  },
  {
    id: "ecommerce-marketplace",
    name: "Multi-vendor Marketplace",
    description:
      "Marketplace that connects multiple sellers to buyers with catalog management and escrowed payments.",
    verticalId: "ecommerce",
    recommendedStack: [
      "Next.js",
      "React",
      "Node.js",
      "PostgreSQL",
      "Stripe Connect",
      "Algolia",
    ],
    followUpQuestions: [
      {
        id: "catalog-size",
        prompt: "How large is the initial product catalog and how frequently will it change?",
        type: "text",
        helperText: "Share the number of SKUs and expected daily/weekly updates.",
        required: true,
      },
      {
        id: "fulfillment",
        prompt: "Who manages fulfillment and shipping logistics?",
        type: "select",
        options: [
          "Vendors ship directly",
          "Centralized warehouse",
          "Dropship partners",
          "Hybrid model",
        ],
        required: true,
      },
      {
        id: "trust-safety",
        prompt: "What trust & safety controls are required for onboarding sellers?",
        type: "textarea",
        helperText: "Mention KYC steps, document verification, dispute resolution, or review workflows.",
      },
    ],
  },
  {
    id: "ecommerce-subscription-box",
    name: "Subscription Box Service",
    description:
      "Personalized subscription box platform with quiz-based onboarding and recurring fulfillment.",
    verticalId: "ecommerce",
    recommendedStack: [
      "Remix",
      "React",
      "GraphQL",
      "PostgreSQL",
      "Stripe Billing",
      "AWS Lambda",
    ],
    followUpQuestions: [
      {
        id: "personalization",
        prompt: "How should the personalization quiz influence box curation?",
        type: "textarea",
        helperText: "Explain mapping rules, scoring, or machine learning models used for recommendations.",
        required: true,
      },
      {
        id: "renewal-cadence",
        prompt: "What renewal cadence options should customers have?",
        type: "select",
        options: ["Monthly", "Quarterly", "Bi-annual", "Custom"],
        required: true,
      },
    ],
  },
  {
    id: "operations-inventory-control",
    name: "Inventory Control Dashboard",
    description:
      "Internal dashboard for tracking stock levels, supplier SLAs, and automated replenishment rules.",
    verticalId: "operations",
    recommendedStack: [
      "Next.js",
      "React",
      "NestJS",
      "PostgreSQL",
      "RabbitMQ",
      "PowerBI",
    ],
    followUpQuestions: [
      {
        id: "integrations",
        prompt: "Which upstream systems provide inventory and sales signals?",
        type: "textarea",
        helperText: "List ERPs, POS systems, or data feeds that must sync with inventory.",
        required: true,
      },
      {
        id: "alerting",
        prompt: "What thresholds should trigger alerts or automated replenishment?",
        type: "text",
        helperText: "Share reorder points, supplier SLAs, or exception handling rules.",
      },
    ],
  },
  {
    id: "operations-field-service",
    name: "Field Service Workflow",
    description:
      "Tooling for dispatching field technicians, capturing work orders, and syncing offline updates.",
    verticalId: "operations",
    recommendedStack: [
      "React Native",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Hasura",
      "Azure Service Bus",
    ],
    followUpQuestions: [
      {
        id: "regions",
        prompt: "Which regions or territories will technicians support at launch?",
        type: "text",
        required: true,
      },
      {
        id: "offline-mode",
        prompt: "How critical is offline support for technicians completing work orders?",
        type: "select",
        options: [
          "Required for all flows",
          "Required for approvals only",
          "Nice to have",
        ],
        required: true,
      },
      {
        id: "reporting",
        prompt: "What reporting views do operations leaders need on day one?",
        type: "textarea",
        helperText: "Examples: technician productivity, SLA attainment, asset utilization.",
      },
    ],
  },
];
