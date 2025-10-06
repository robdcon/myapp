import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Example query to fetch all users
    const result = await query("SELECT * FROM users");
    return NextResponse.json({ success: true, users: result.rows });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } else {
      console.error("Error fetching users:", error);
      return NextResponse.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
    }
  }
}