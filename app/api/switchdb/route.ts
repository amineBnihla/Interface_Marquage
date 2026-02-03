// api/switch-db/route.ts
import { getDB } from "@/lib/connexiondb/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { db } = await req.json();

  try {
    if (!db) {
      return NextResponse.json(
        { message: "Database name is required" },
        { status: 400 }
      );
    }

    // ✅ Test connection to the new database
  
    const pool = await getDB(db);

    // Verify connection works
    const result = await pool.request().query("SELECT DB_NAME() as currentDb");
    const connectedDb = result.recordset[0].currentDb;

    console.log(`✅ Successfully connected to: ${connectedDb}`);

    // ✅ Store selected DB in a cookie so all future requests use it
    const response = NextResponse.json({
      message: "ok",
      database: connectedDb,
    });

    response.cookies.set("selected_db", db, {
      path: "/",
      httpOnly: true,
    });

    return response;

  } catch (error) {
    console.error("❌ Connection failed:", error);
    return NextResponse.json(
      { message: "Failed to Connect" },
      { status: 500 }
    );
  }
}