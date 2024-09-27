import { NextResponse } from "next/server";
import axios from "axios";

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
  return `${day}-${month}-${year}`;
}

export async function GET(req: Request) {
  try {
 
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("Backend URL not found in environment variables");
    }

    const response = await axios.get(`${backendUrl}/meal_slot_time/`);

    // Check for successful response
    if (response.status !== 200) {
      throw new Error("Failed to fetch table data from the backend");
    }

    return NextResponse.json({
      message: `Meal Slot fetched successfully `,
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
