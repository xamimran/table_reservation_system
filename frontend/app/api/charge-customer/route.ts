import { STRIPE_SECRET_KEY } from '@/app/constantVariable/constant';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const POST = async (req:any) => {
  try {
    const { customerId, paymentMethodId, amount } = await req.json();

    // Create a payment intent and charge the customer using the saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents (e.g., 5000 = $50)
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true, // Allows charging without the customer being present
      confirm: true,
    });

    return new Response(JSON.stringify({ success: true, paymentIntent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error:any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
