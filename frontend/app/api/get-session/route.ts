import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import axios from "axios";
import { STRIPE_SECRET_KEY } from "@/app/constantVariable/constant";

const STRIPE_SECRETKEY = STRIPE_SECRET_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

if (!STRIPE_SECRETKEY) {
  console.error("STRIPE_SECRET_KEY is not set in the environment variables");
}

if (!BACKEND_URL) {
  console.error("BACKEND_URL is not set in the environment variables");
}

const stripe = new Stripe(STRIPE_SECRETKEY as string, {
  apiVersion: "2024-06-20",
});

type PaymentStatus = "PA" | "F" | "P";

export async function GET(req: NextRequest) {
  console.log("GET /api/get-session - Start");
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    console.error("Session ID is missing in the request");
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Retrieving Stripe session");
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let status: PaymentStatus;
    let link: string;

    // Map Stripe payment status to our application status
    switch (session.payment_status) {
      case "paid":
        status = "PA"; // 'PA' for paid
        link = `${req.headers.get("origin")}/success?session_id=${session.id}`;
        break;
      case "unpaid":
      case "no_payment_required":
        status = "F"; // 'F' for failed
        link = `${req.headers.get("origin")}/failed?session_id=${session.id}`;
        break;
      default:
        status = "P"; // 'P' for pending
        link = `${req.headers.get("origin")}/pending?session_id=${session.id}`;
    }

    console.log(`Payment status mapped to: ${status}`);

    if (BACKEND_URL) {
      try {
        if (status === "F") {
          // Delete associated records if payment failed
          if (session.metadata) {
            await deleteAssociatedRecords(session.metadata);
          } else {
            console.warn("Session metadata is null, skipping record deletion");
          }
        } else {
          // Update reservation and payment status
          await updateReservationAndPayment(session, status);
        }
      } catch (error: any) {
        console.error(
          "Error updating or deleting records:",
          error.response ? error.response.data : error.message
        );
      }
    } else {
      console.warn(
        "BACKEND_URL is not set, skipping reservation and payment updates"
      );
    }

    console.log("GET /api/get-session - End");
    return NextResponse.json({
      ...session,
      applicationStatus: status,
      applicationLink: link,
    });
  } catch (error: any) {
    console.error("Error in GET /api/get-session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function updateReservationAndPayment(
  session: Stripe.Checkout.Session,
  status: PaymentStatus
) {
  if (!session.metadata) {
    console.warn("Session metadata is null, skipping updates");
    return;
  }

  const reservationId = session.metadata.reservation_id;
  const paymentId = session.metadata.payment_id;

  if (!reservationId || !paymentId) {
    console.warn("Missing reservation_id or payment_id in session metadata");
    return;
  }

  console.log("Updating reservation status");
  const reservationResponse = await axios.patch(
    `${BACKEND_URL}/reservation/${reservationId}/`,
    {
      payment_status: status === "PA",
    }
  );
  console.log("Reservation update response:", reservationResponse.data);

  console.log("Updating payment status");
  const paymentResponse = await axios.patch(
    `${BACKEND_URL}/payment/${paymentId}/`,
    {
      status: status,
    }
  );
  console.log("Payment update response:", paymentResponse.data);
}

async function deleteAssociatedRecords(metadata: Stripe.Metadata) {
  console.log("Deleting associated records for failed payment");

  // Delete payment record
  if (metadata.payment_id) {
    await axios.delete(`${BACKEND_URL}/payment/${metadata.payment_id}/`);
    console.log(`Deleted payment record: ${metadata.payment_id}`);
  }

  // Delete reservation record
  if (metadata.reservation_id) {
    await axios.delete(
      `${BACKEND_URL}/reservation/${metadata.reservation_id}/`
    );
    console.log(`Deleted reservation record: ${metadata.reservation_id}`);
  }

  // Delete user record if necessary
  // Note: You might want to add additional checks before deleting a user
  if (metadata.user_id) {
    await axios.delete(`${BACKEND_URL}/user_profile/${metadata.user_id}/`);
    console.log(`Deleted user record: ${metadata.user_id}`);
  }
}
