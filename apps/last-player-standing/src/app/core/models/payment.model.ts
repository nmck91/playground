export interface PaymentSession {
  sessionId: string;
  url?: string;
}

export interface PaymentVerification {
  success: boolean;
  payment_id?: string;
  entry_id?: string;
}
