import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ConfigPage from "./pages/ConfigPage";

const router = createHashRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/config", element: <ConfigPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
