import { NextResponse } from "next/server";




export async  function POST(req:Request){
    const {db} = await req.json()
  try {
    if(!db){
     return  NextResponse.json(
      { 
        message: "Failed to Connect"
      },
      { status: 400 }
    );
    }
    // console.log("helooe db",db)
    process.env.DB_NAME = db
  
 return NextResponse.json({ message: "ok" }, { status: 200 });

  } catch (error) {
    console.log(error)
  return NextResponse.json(
      { 
        message: "Failed to Connect"
      },
      { status: 500 }
    );
  }
}
