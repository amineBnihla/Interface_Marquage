"use server"
import { cookies } from "next/headers"

 const SESSION_NAME = "session_token"
export async function setSessionCookie(authToken:string){

const cookieSession = await cookies()

  cookieSession.set(SESSION_NAME, authToken, {
    httpOnly:true,
    maxAge: 60 * 60 * 24 * 7, // 7 days from now
    sameSite: "lax",
    secure: process.env.NODE_ENV == "production",
  })

}

export async function getSessionCookie(){

  const cookieSession = await cookies()
  const cookieVal = cookieSession.get(SESSION_NAME)?.value
  console.log(cookieSession.has(SESSION_NAME),cookieVal)
  return cookieVal
}
export async function removeCookie(){

  const cookieSession = await cookies()
  const cookieVal = cookieSession.has(SESSION_NAME)
  if(cookieVal){
  cookieSession.delete(SESSION_NAME)
}
}