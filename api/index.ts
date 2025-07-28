import { getSessionCookie } from "@/lib/cookiesSetting";
import axios from "axios";

const baseUrl =
  typeof window !== "undefined"
    ? localStorage.getItem('BaseUrl') || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL


 export const api = axios.create({
    baseURL:baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  async (config)=>{
    const session_token = await getSessionCookie()
    config.headers.Authorization = session_token || ""
    return config
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
)


