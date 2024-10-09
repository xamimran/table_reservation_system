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
  const paymentMethodId = searchParams.get("payment_method_id");
  const customerId = searchParams.get("customer_id");
  const paymentId = searchParams.get("payment_id");
  const userId = searchParams.get("user_id");
  const reservationId = searchParams.get("reservation_id");

  if (
    !paymentMethodId ||
    !customerId ||
    !paymentId ||
    !userId ||
    !reservationId
  ) {
    console.error("Required parameters are missing in the request");
    return NextResponse.json(
      { error: "Required parameters are missing" },
      { status: 400 }
    );
  }

  try {
    // Instead of creating a PaymentIntent, we'll check if the card is valid
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    let status: PaymentStatus;
    let link: string;

    // If we can retrieve the payment method, we consider it successful
    if (paymentMethod) {
      status = "PA"; // 'PA' for paid (in this case, it means the card was successfully saved)
      link = `/success?payment_method=${paymentMethodId}`; // Remove req.headers.get("origin")
    } else {
      status = "F"; // 'F' for failed
      link = `/canceled?payment_method=${paymentMethodId}`; // Remove req.headers.get("origin")
    }

    console.log(`Card save status mapped to: ${status}`);

    if (BACKEND_URL) {
      try {
        if (status === "F") {
          // Delete associated records if card save failed
          await deleteAssociatedRecords({
            payment_id: paymentId,
            reservation_id: reservationId,
            user_id: userId,
          });
        } else {
          // Update reservation and payment status
          await updateReservationAndPayment(
            { payment_id: paymentId, reservation_id: reservationId },
            status,
            paymentMethodId,
            customerId
          );
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
      paymentMethod,
      applicationStatus: status,
      applicationLink: link,
    });
  } catch (error: any) {
    console.error("Error in GET /api/get-session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function updateReservationAndPayment(
  metadata: { reservation_id: string; payment_id: string },
  status: PaymentStatus,
  paymentMethodId: any,
  customerId: any
) {
  const reservationId = metadata.reservation_id;
  const paymentId = metadata.payment_id;

  if (!reservationId || !paymentId) {
    console.warn("Missing reservation_id or payment_id in metadata");
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
      stripe_payment_id: paymentMethodId,
      description: customerId,
    }
  );
  console.log("Payment update response:", paymentResponse.data);
}

async function deleteAssociatedRecords(metadata: {
  payment_id: string;
  reservation_id: string;
  user_id: string;
}) {
  console.log("Deleting associated records for failed card save");

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
