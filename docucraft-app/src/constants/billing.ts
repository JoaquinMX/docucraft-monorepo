export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  credits: number;
  isSubscription: boolean;
  highlight?: boolean;
}

export const BILLING_PLANS: Record<string, BillingPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for getting started with occasional AI-assisted diagrams.",
    price: 20,
    currency: "usd",
    credits: 20,
    isSubscription: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Power through more projects with a generous credit bundle.",
    price: 49,
    currency: "usd",
    credits: 60,
    isSubscription: false,
    highlight: true,
  },
  scale: {
    id: "scale",
    name: "Scale",
    description: "Unlock unlimited generations for teams that rely on DocuCraft daily.",
    price: 99,
    currency: "usd",
    credits: 0,
    isSubscription: true,
  },
};

export const GENERATION_CREDIT_COST = 1;
