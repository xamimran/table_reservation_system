import { STRIPE_SECRET_KEY } from '@/app/constantVariable/constant';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const POST = async (req:any) => {
  try {
    const { email } = await req.json();

    // Create a new Stripe customer
    const customer = await stripe.customers.create({ email });

    // Create a SetupIntent for saving the payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        customerId: customer.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error:any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
