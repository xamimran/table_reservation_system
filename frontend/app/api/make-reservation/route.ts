import { NextResponse } from "next/server";
import axios from "axios";

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

    const { first_name, last_name, email, phone, user_notes } = customerDetails;

    const username = first_name ? first_name.toLowerCase() : "unknown";
    const formattedPhone = cleanPhoneNumber(phone || "");

    // Step 1: Create or update user profile
    let userId: number;
    let userProfileResponse;
    try {
      userProfileResponse = await axios.post(`${backendUrl}/user_profile/`, {
        username,
        first_name: first_name || "",
        last_name: last_name || "",
        email: email,
        phone: formattedPhone,
        user_notes: user_notes || "",
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

      return NextResponse.json({
        message: `User profile created/updated and reservation made successfully for date: ${formattedReservationDate}`,
        userProfileData: userProfileResponse.data,
        reservationData: reservationResponse.data,
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
