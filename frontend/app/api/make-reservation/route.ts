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
    // Step 2: Create a reservation
    let reservationResponse;
    try {
      reservationResponse = await axios.post(`${backendUrl}/reservation/`, {
        reservation_date: formattedReservationDate,
        payment_status: false,
        no_show: false,
        user_id: userId,
        table_id: tableData?.id,
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
        table_id: tableData?.id,
      });

      const paymentId = paymentResponse.data.id; // Assuming the API returns the created payment's ID
      const customer = await stripe.customers.create({ email });
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
      });

      return NextResponse.json({
        message: `Reservation created successfully for date: ${formattedReservationDate}`,
        reservationId: reservationResponse.data.id,
        clientSecret: setupIntent.client_secret,
        customerId: customer.id,
        paymentId: paymentId,
        userId:userId
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
