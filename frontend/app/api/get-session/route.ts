// pages/api/get-session.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const SECRET_KEY = "sk_test_51PpvOqRszTyZf6hG7oOEKqA39KAeCga8R2dqNzJP49Lu5EX21CWQaDu1KF2dFAGF2wcJmCBoYsinbjUVWXWmhe1S00Q1dVp1fI";
const stripe = new Stripe(SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

// Dummy function to simulate updating the transaction in a database
const updateTransactionInDatabase = async (transaction: any) => {
  // Log the updated transaction data to the console (simulating a database update)
  console.log("Updating transaction:", transaction);
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let status = session.payment_status;
    let link = `${req.headers.get("origin")}/success?session_id=${session.id}`;

    // Map Stripe payment status to our application status
    switch (session.payment_status) {
      case 'paid':
        status = 'successful';
        break;
      case 'unpaid':
        status = 'failed';
        link = `${req.headers.get("origin")}/failed?session_id=${session.id}`;
        break;
      case 'no_payment_required':
        status = 'canceled';
        link = `${req.headers.get("origin")}/canceled?session_id=${session.id}`;
        break;
      default:
        status = 'pending';
        link = `${req.headers.get("origin")}/pending?session_id=${session.id}`;
    }

    // Prepare the updated transaction object
    const updatedTransaction = {
      sessionId: session.id,
      paymentIntent: session.payment_intent,
      status: status,
      link: link,
      paymentStatus: session.payment_status,
      checkoutStatus: session.status,
    };

    // Update the transaction in your database (dummy function)
    await updateTransactionInDatabase(updatedTransaction);

    return NextResponse.json({
      ...session,
      applicationStatus: status,
      applicationLink: link,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}