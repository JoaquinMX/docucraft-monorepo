export type TemplateFollowUpQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "multi-select";
  helperText?: string;
  placeholder?: string;
  options?: string[];
};

export type RecommendedTechStack = {
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  notes?: string[];
};

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  vertical: string;
  recommendedTechStack: RecommendedTechStack;
  followUpQuestions: TemplateFollowUpQuestion[];
};

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "ecommerce-storefront",
    name: "E-commerce Storefront",
    description:
      "Optimised for catalog driven retail experiences that need personalised merchandising and fulfilment integrations.",
    vertical: "Retail & Commerce",
    recommendedTechStack: {
      frontend: ["Next.js", "Tailwind CSS", "React Query"],
      backend: ["Node.js", "NestJS", "GraphQL"],
      database: ["PostgreSQL", "Redis"],
      infrastructure: ["Vercel", "AWS Lambda", "Stripe"],
      notes: [
        "Leverage edge caching for product listings.",
        "Plan for multi-currency and localisation support.",
      ],
    },
    followUpQuestions: [
      {
        id: "catalog-size",
        question: "How many products or SKUs do you expect to manage?",
        type: "select",
        options: ["< 1,000", "1,000 - 10,000", "10,000+"],
        helperText:
          "Helps determine caching, search strategy, and merchandising tooling.",
      },
      {
        id: "fulfilment",
        question: "Which fulfilment or shipping providers must be supported?",
        type: "multi-select",
        options: [
          "Shopify Fulfilment",
          "ShipBob",
          "UPS",
          "FedEx",
          "Custom / Other",
        ],
        helperText: "Select all that apply.",
      },
      {
        id: "personalisation-goals",
        question: "Describe any personalisation or recommendation goals.",
        type: "text",
        placeholder: "e.g. personalised bundles, AI driven recommendations",
      },
    ],
  },
  {
    id: "saas-analytics",
    name: "SaaS Analytics Dashboard",
    description:
      "For subscription analytics platforms that need real-time ingestion, reporting, and customer segmentation.",
    vertical: "B2B SaaS",
    recommendedTechStack: {
      frontend: ["Next.js", "TanStack Table", "Recharts"],
      backend: ["Node.js", "FastAPI", "Apache Kafka"],
      database: ["BigQuery", "ClickHouse", "Redis"],
      infrastructure: ["Google Cloud Run", "Cloud Functions", "Segment"],
      notes: [
        "Optimise for streaming pipelines and dimensional modelling.",
        "Anticipate granular role-based access control needs.",
      ],
    },
    followUpQuestions: [
      {
        id: "data-sources",
        question: "List the primary data sources or event streams to ingest.",
        type: "text",
        placeholder: "e.g. Stripe billing events, product telemetry, CRM data",
      },
      {
        id: "realtime-requirements",
        question: "What latency is acceptable for analytics refresh?",
        type: "select",
        options: ["< 1 minute", "1 - 15 minutes", "Hourly", "Daily"],
      },
      {
        id: "audience",
        question: "Who are the target personas consuming the dashboards?",
        type: "multi-select",
        options: [
          "Executives",
          "Finance",
          "Product Managers",
          "Customer Success",
          "Technical Stakeholders",
        ],
      },
    ],
  },
  {
    id: "healthcare-scheduling",
    name: "Healthcare Scheduling Platform",
    description:
      "Guides appointment orchestration, patient engagement, and compliance friendly audit trails for care teams.",
    vertical: "Healthcare",
    recommendedTechStack: {
      frontend: ["Next.js", "Chakra UI", "React Hook Form"],
      backend: ["Node.js", "NestJS", "FHIR APIs"],
      database: ["PostgreSQL", "MongoDB"],
      infrastructure: ["AWS Fargate", "Twilio", "Okta"],
      notes: [
        "Ensure HIPAA compliant logging and data storage policies.",
        "Consider integrations with EMR/EHR systems via FHIR or HL7.",
      ],
    },
    followUpQuestions: [
      {
        id: "appointment-types",
        question: "What appointment types or care pathways should be supported?",
        type: "text",
        placeholder: "e.g. telehealth visits, in-person consults, lab work",
      },
      {
        id: "staff-roles",
        question: "Which clinical or administrative roles need scheduling access?",
        type: "multi-select",
        options: [
          "Physicians",
          "Nurses",
          "Administrative Staff",
          "Patients",
          "External Partners",
        ],
      },
      {
        id: "compliance",
        question: "Highlight any regulatory or compliance considerations.",
        type: "text",
        placeholder: "e.g. HIPAA, GDPR, regional data residency",
      },
    ],
  },
];

export const projectTemplateVerticals = Array.from(
  new Set(projectTemplates.map((template) => template.vertical))
);
