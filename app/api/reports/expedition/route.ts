import { NextResponse } from "next/server";
import { getDB } from "@/lib/connexiondb/db";
import { generatePDF } from "./generatePDF copy";

// Increase timeout for API route (add to route.ts config)
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log("Starting PDF generation...");
  
  const { searchParams } = new URL(req.url);
  const choosen = Number(searchParams.get("choosen") || 1);
  const dateStart = searchParams.get("dateStart");
  const dateEnd = searchParams.get("dateEnd");

  let db;

  try {
    // Get database connection
    db = await getDB();

    // Execute stored procedure
    const result = await db.request()
      .input("Choosen", choosen)
      .input("DateStart", dateStart)
      .input("DateEnd", dateEnd)
      .execute("sp_PaletteEtat");

    const rows = result.recordset;
    console.log(`Retrieved ${rows?.length || 0} rows`);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const pdfBytes = await generatePDF(rows, dateStart, dateEnd);
    // Return PDF response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport_palettes_${dateStart}_${dateEnd}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Length": pdfBytes.length.toString()
      }
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    
    // Detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    
    return NextResponse.json(
      { 
        error: "Failed to generate PDF", 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  } finally {
    // Clean up database connection if needed
    try {
      if (db && db.connected) {
        await db.close();
      }
    } catch (err) {
      console.warn("Error closing DB connection:", err);
    }
  }
}