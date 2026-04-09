// src/config.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Yahan check karein ki backend URL ke end mein slash hai ya nahi
export const API_BASE_URL = `${BASE_URL}/api`;