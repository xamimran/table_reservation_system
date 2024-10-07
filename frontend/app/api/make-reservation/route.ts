import { NextResponse } from "next/server";
import axios from "axios";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, PRODUCT_ID } from "@/app/constantVariable/constant";

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function cleanPhoneNumber(phone: string) {
  return phone.replace(/[^\d]/g, "").slice(0, 12);
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, mealType, adults, children, customerDetails, tableData } =
      body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL not found in environment variables");
    }

    const { first_name, last_name, email, phone, user_notes, user_name } =
      customerDetails;
    const formattedPhone = cleanPhoneNumber(phone || "");

    // Step 1: Create or update user profile
    let userProfileResponse;
    try {
      userProfileResponse = await axios.post(`${backendUrl}/user_profile/`, {
        username: user_name || first_name,
        first_name: first_name || "",
        last_name: last_name || "",
        email: email,
        phone: formattedPhone,
        user_notes: user_notes || "General Note",
      });
    } catch (error: any) {
      console.error(
        "Error creating/updating user profile:",
        error.response?.data
      );
      return NextResponse.json(
        {
          error: "Failed to create/update user profile",
          details: error.response?.data,
        },
        { status: 500 }
      );
    }

    const userId = userProfileResponse.data.id;
    const formattedReservationDate = formatDate(new Date(date));
console.log("userProfileResponse",userProfileResponse)
    // Step 2: Create a reservation
    let reservationResponse;
    try {
      reservationResponse = await axios.post(`${backendUrl}/reservation/`, {
        description: "Reserve this table",
        reservation_date: formattedReservationDate,
        payment_status: false,
        no_show: false,
        user_id: userId,
        table_id: tableData,
        slot_time_id: mealType,
      });
    } catch (error: any) {
      console.error("Error creating reservation:", error.response);
      return NextResponse.json(
        { error: "Failed to make reservation", details: error.response },
        { status: 500 }
      );
    }

    // Step 3: Create a Stripe Checkout session
    try {
      const paymentResponse = await axios.post(`${backendUrl}/payment/`, {
        description: `Payment for reservation ${reservationResponse.data.id}`,
        stripe_payment_id: "1234", // You might want to generate this dynamically
        amount: 0, // We'll update this after creating the session
        status: "P",
        user: userId,
        reservation_id: reservationResponse.data.id,
        table_id: tableData,
      });

      const paymentId = paymentResponse.data.id; // Assuming the API returns the created payment's ID

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: PRODUCT_ID,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get(
          "origin"
        )}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get(
          "origin"
        )}/canceled?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: customerDetails.email,
        metadata: {
          reservation_id: reservationResponse.data.id,
          user_id: userId,
          first_name: customerDetails.first_name,
          last_name: customerDetails.last_name,
          phone: customerDetails.phone,
          user_notes: customerDetails.user_notes,
          adults: adults.toString(),
          children: children.toString(),
          date: date,
          table_id: tableData,
          meal_type: mealType,
          payment_id: paymentId, // Add the payment ID to the metadata
        },
      });
      await axios.patch(`${backendUrl}/payment/${paymentId}/`, {
        amount: session.amount_total,
        stripe_payment_id: session.id,
      });

      return NextResponse.json({
        message: `Reservation created successfully for date: ${formattedReservationDate}`,
        reservationId: reservationResponse.data.id,
        paymentUrl: session.url,
      });
    } catch (error: any) {
      console.error("Error creating Stripe session:", error);
      return NextResponse.json(
        { error: "Failed to create payment session", details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}
