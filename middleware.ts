import { NextRequest, NextResponse } from "next/server";




export default  function middleware(req:NextRequest,res:NextResponse){


     if(req.nextUrl.pathname == '/' && !req.cookies.has("session_token")){
         return NextResponse.redirect(new URL('/login', req.url))
}
     
 NextResponse.next()

}