import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Example query to fetch all users
    const result = await query("SELECT * FROM users");
    res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, error: error.message });
    } else {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, error: "An unknown error occurred" });
    }
  }
}