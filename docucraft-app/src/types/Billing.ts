export interface UserBillingProfile {
  planId: string;
  creditsRemaining: number;
  subscriptionActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastPaymentIntentId?: string;
}

export class InsufficientCreditsError extends Error {
  constructor(message = "Insufficient credits for this operation") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}
