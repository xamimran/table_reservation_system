import { NextResponse } from "next/server";
import axios from "axios";

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
  return `${day}-${month}-${year}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedDate, mealType, adults, children } = body;

    if (!selectedDate) {
      return NextResponse.json(
        { error: "selectedDate is required" },
        { status: 400 }
      );
    }

    const date = new Date(selectedDate);
    const formattedDate = formatDate(date);

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("Backend URL not found in environment variables");
    }

    const response = await axios.get(`${backendUrl}/table/check_availability`, {
      params: {
        reservation_date: formattedDate,
        slot_time_id: mealType,
        adults,
        children,
      },
    });

    // Check for successful response
    if (response.status !== 200) {
      throw new Error("Failed to fetch table data from the backend");
    }

    return NextResponse.json({
      message: `Table fetched successfully for date: ${formattedDate}`,
      data: response.data,
    });
  } catch (error: any) {
    console.error("Error fetching the table:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}
