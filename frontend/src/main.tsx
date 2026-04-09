// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from "react-router-dom"; // MUST be from react-router-dom
import { router } from "./app/routes"; // The file where you defined createBrowserRouter
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* This provides the 'basename' context to everything inside it */}
    <RouterProvider router={router} />
  </React.StrictMode>
);