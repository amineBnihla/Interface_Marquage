


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { datede } = await req.json();
    console.log(datede);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred" });
  }
}