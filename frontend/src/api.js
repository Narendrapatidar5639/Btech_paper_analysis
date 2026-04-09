import axios from 'axios';

// 1. Base URL fetch karein (Vite ke liye VITE_ prefix zaroori hai)
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
    baseURL: BASE_URL,
    // Agar aap direct /api/ routes hit kar rahe hain toh yahan /api add kar sakte hain
    // baseURL: `${BASE_URL}/api`, 
});

// 2. Credentials enable karein (Login/Session ke liye zaroori hai)
API.defaults.withCredentials = true;

// 3. Optional: Headers set karein taaki Django JSON format samajh sake
API.defaults.headers.post['Content-Type'] = 'application/json';

export default API;