import { NextResponse } from "next/server";







export async  function POST(req:Request){
  const xmlText = await req.text()
  
  console.log(process.env.FODEX_USERNAME)
    try {
        const apiURL = "https://eai.tangermed.ma:29443/api/listecolisage/receive";
        const username = process.env.FODEX_USERNAME || "";
        const password = process.env.FODEX_PASSWORD || "";
        const authString = Buffer.from(username + ":" + password).toString("base64");
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + authString,
                "Content-Type": "text/xml; charset=UTF-8"
            },
            body: xmlText // <<< XML RAW envoyé tel quel
        });
          console.log(xmlText)
        const responseText = await response.text();
    // :feu: Manually handle non-2xx responses
    if (!response.ok) {
      return NextResponse.json(
        {
          message: `API returned error`,
          status: response.status,
          statusText: response.statusText,
          responseText
        },
        { status: response.status }
      );
    }
    return NextResponse.json(
      {
        message: "XML sent successfully",
        responseText
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error:", err);
    return NextResponse.json(
      {
        message: "Failed to send XML",
        error: err
      },
      { status: 500 }
    );
  }
}
