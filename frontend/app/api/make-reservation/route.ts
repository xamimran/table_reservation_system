import { NextResponse } from "next/server";
import axios from "axios";
import Stripe from "stripe";
import {STRIPE_SECRET_KEY,PRODUCT_ID} from "@/app/constantVariable/constant"

let SECRET_KEY = STRIPE_SECRET_KEY

// Initialize Stripe with the secret key
const stripe = new Stripe(SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const saveTransactionToDatabase = async (transaction: any) => {
  // Log the transaction data to the console (simulating a database save)
  console.log("Saving transaction:", transaction);
};
function cleanPhoneNumber(phone: string) {
  return phone.replace(/[^\d]/g, "").slice(0, 12);
}

function formatDate(date: Date) {
  const year = date.getFullYear(); // Get the full year (YYYY)
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month and pad with leading zeros
  const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with leading zeros
  return `${year}-${month}-${day}`; // Return formatted date as YYYY-MM-DD
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, mealType, adults, children, customerDetails, tableData } =
      body;

    // Validate required field 'date'
    if (!date) {
      return NextResponse.json(
        { error: "selectedDate is required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL not found in environment variables");
    }

    const { first_name, last_name, email, phone, user_notes,user_name } = customerDetails;

    // const username = first_name ? first_name.toLowerCase() : "unknown";
    const formattedPhone = cleanPhoneNumber(phone || "");

    // Step 1: Create or update user profile
    let userId: number;
    let userProfileResponse;
    try {
      userProfileResponse = await axios.post(`${backendUrl}/user_profile/`, {
        username:user_name || first_name,
        first_name: first_name || "",
        last_name: last_name || "",
        email: email,
        phone: formattedPhone,
        user_notes: user_notes || "Genral Note",
      });
      userId = userProfileResponse.data.id; // Get the user ID from the response
    } catch (error: any) {
      console.error(
        "Error creating/updating user profile:",
        error.response.data
      );
      return NextResponse.json(
        {
          error: "Failed to create/update user profile",
          details: error.response.data,
        },
        { status: 500 }
      );
    }

    const formattedReservationDate = formatDate(new Date(date));

    // Step 2: Create a reservation
    try {
      const reservationResponse = await axios.post(
        `${backendUrl}/reservation/`,
        {
          description: "Reserve this table",
          reservation_date: formatDate(new Date(date)),
          user_id: userId, // Use the userId obtained from the first request
          table_id: tableData, // Assuming tableData has an `id` property
          slot_time_id: mealType, // Assuming mealType corresponds to the slot_time_id
        }
      );
      const lineItems = [
        {
          price: PRODUCT_ID, // Replace with actual price ID
          quantity: 1,
        },
      ];
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/canceled?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: customerDetails.email,  // Set customer's email for receipt
        
        // Add metadata to store additional info
        metadata: {
          first_name: customerDetails.first_name,
          last_name: customerDetails.last_name,
          phone: customerDetails.phone,
          user_notes: customerDetails.user_notes,
          adults: adults.toString(),
          children: children.toString(),
          date,
          tableData,
        },
      });
  
      // Prepare the transaction object to save
      const transaction = {
        sessionId: session.id,
        paymentIntent: null, // Initially, we don't have a payment intent
        status: 'pending',   // Initial status
        customerDetails,
        adults,
        children,
        date,
        tableData,
        link: `${req.headers.get("origin")}/success?session_id=${session.id}`, // Link to check status
      };
  
      // Save transaction to your database (dummy function)
      await saveTransactionToDatabase(transaction);
  







      return NextResponse.json({
        message: `User profile created/updated and reservation made successfully for date: ${formattedReservationDate}`,
        userProfileData: userProfileResponse.data,
        reservationData: reservationResponse.data,
        sessionUrl: session.url, 
      });
    } catch (error: any) {
      console.error("Error creating reservation:", error.response.data);
      return NextResponse.json(
        { error: "Failed to make reservation", details: error.response.data },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error.response.data);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error.response.data },
      { status: 500 }
    );
  }
}


