import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;

  constructor(private supabase: SupabaseService) {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  async createCheckoutSession(entryId: string, amount: number) {
    // Option 1: Call Supabase Edge Function
    const { data, error } = await this.supabase.client.functions.invoke(
      'create-checkout-session',
      {
        body: { entryId, amount }
      }
    );

    if (error) throw error;
    return data.sessionId;

    // Option 2: Call your own backend API
    // return this.http.post<{sessionId: string}>('/api/create-checkout', {
    //   entryId,
    //   amount
    // }).toPromise();
  }

  async redirectToCheckout(sessionId: string) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    // Use the modern Stripe API
    window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
  }

  async updatePaymentStatus(entryId: string, status: 'pending' | 'paid' | 'failed', paymentId?: string) {
    const { error } = await this.supabase.client
      .from('entries')
      .update({
        payment_status: status,
        payment_id: paymentId
      })
      .eq('id', entryId);

    if (error) throw error;
  }

  async verifyPayment(sessionId: string) {
    // This should ideally be done via webhook
    // But for client-side verification:
    const { data, error } = await this.supabase.client.functions.invoke(
      'verify-payment',
      { body: { sessionId } }
    );

    if (error) throw error;
    return data;
  }
}
