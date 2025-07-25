import axios from "axios";

const HostUrl  = localStorage.getItem('BaseUrl') || process.env.NEXT_PUBLIC_API_URL


export const api = axios.create({
    baseURL:HostUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

