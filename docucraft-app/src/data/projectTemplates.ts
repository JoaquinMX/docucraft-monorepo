export type TemplateQuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select";

export type TemplateQuestionOption = {
  id: string;
  label: string;
};

export type TemplateQuestion = {
  id: string;
  prompt: string;
  type: TemplateQuestionType;
  helperText?: string;
  options?: TemplateQuestionOption[];
};

export type ProjectTemplate = {
  id: string;
  name: string;
  verticalId: string;
  vertical: string;
  summary: string;
  recommendedStack: string[];
  followUpQuestions: TemplateQuestion[];
};

export type TemplateVertical = {
  id: string;
  label: string;
  description: string;
};

export const templateVerticals: TemplateVertical[] = [
  {
    id: "fintech",
    label: "Financial Services",
    description:
      "Payments, lending, and compliance-heavy experiences that demand rigorous controls.",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description:
      "Clinical systems that balance patient safety, regulatory compliance, and telehealth workflows.",
  },
  {
    id: "commerce",
    label: "Digital Commerce",
    description:
      "Marketplaces and retail platforms focused on merchandising, fulfillment, and trust & safety.",
  },
];

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "payment-orchestration",
    name: "Payment Orchestration Platform",
    verticalId: "fintech",
    vertical: "Financial Services",
    summary:
      "Route and settle global transactions across multiple payment service providers with built-in compliance tooling.",
    recommendedStack: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Kafka",
      "Terraform",
    ],
    followUpQuestions: [
      {
        id: "compliance",
        prompt: "What compliance frameworks are non-negotiable for launch?",
        type: "textarea",
        helperText:
          "List the regulatory regimes (e.g., PCI DSS, SOC 2, PSD2) and any regional nuances the platform must satisfy.",
      },
      {
        id: "payment-methods",
        prompt: "Which payment methods must be supported on day one?",
        type: "multi-select",
        options: [
          { id: "cards", label: "Card payments (Visa, Mastercard, AMEX)" },
          { id: "bank", label: "Bank transfers / ACH" },
          { id: "wallets", label: "Digital wallets (Apple Pay, Google Pay)" },
          { id: "crypto", label: "Crypto payments" },
        ],
      },
      {
        id: "risk-controls",
        prompt: "Describe the risk & fraud controls that must exist from the start.",
        type: "textarea",
        helperText:
          "Call out velocity rules, device fingerprinting, chargeback handling, and escalation workflows.",
      },
    ],
  },
  {
    id: "telehealth",
    name: "Virtual Care & Telehealth Suite",
    verticalId: "healthcare",
    vertical: "Healthcare",
    summary:
      "Deliver remote consultations, asynchronous care plans, and patient engagement while maintaining clinical compliance.",
    recommendedStack: [
      "React Native",
      "GraphQL",
      "Node.js",
      "PostgreSQL",
      "AWS Fargate",
    ],
    followUpQuestions: [
      {
        id: "regions",
        prompt: "Which regions or countries will clinicians and patients operate in?",
        type: "multi-select",
        helperText:
          "Helps define consent flows, localization, and data residency requirements.",
        options: [
          { id: "us", label: "United States" },
          { id: "eu", label: "European Union" },
          { id: "apac", label: "Asia-Pacific" },
          { id: "latam", label: "Latin America" },
        ],
      },
      {
        id: "care-pathways",
        prompt: "What clinical pathways or visit types need to be supported?",
        type: "textarea",
        helperText:
          "Examples: urgent care triage, chronic disease management, behavioral health, follow-up visits.",
      },
      {
        id: "integrations",
        prompt: "List the EHR or medical device integrations that are in scope.",
        type: "textarea",
        helperText:
          "Include HL7/FHIR expectations, device data ingestion, and scheduling interoperability.",
      },
    ],
  },
  {
    id: "marketplace",
    name: "Two-Sided Marketplace Platform",
    verticalId: "commerce",
    vertical: "Digital Commerce",
    summary:
      "Connect buyers and sellers with merchandising tools, fulfillment orchestration, and trust & safety automation.",
    recommendedStack: [
      "Next.js",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "AWS Lambda",
    ],
    followUpQuestions: [
      {
        id: "inventory-scale",
        prompt: "How large is the initial catalog and how frequently does it change?",
        type: "select",
        options: [
          { id: "curated", label: "Highly curated (hundreds of SKUs)" },
          { id: "growing", label: "Growing (thousands of SKUs)" },
          { id: "enterprise", label: "Enterprise scale (tens of thousands or more)" },
        ],
      },
      {
        id: "fulfillment",
        prompt: "Which fulfillment models need to be supported?",
        type: "multi-select",
        options: [
          { id: "dropship", label: "Dropshipping" },
          { id: "in-house", label: "Merchant-managed fulfillment" },
          { id: "3pl", label: "3PL / warehouse partners" },
          { id: "digital", label: "Digital goods / instant delivery" },
        ],
      },
      {
        id: "trust-safety",
        prompt: "Outline the trust & safety policies that must be operational on launch.",
        type: "textarea",
        helperText:
          "Think about identity verification, dispute resolution, SLA enforcement, and content moderation.",
      },
    ],
  },
];
