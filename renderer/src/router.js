import { jsx as _jsx } from "react/jsx-runtime";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ConfigPage from "./pages/ConfigPage";
const router = createHashRouter([
    { path: "/", element: _jsx(Dashboard, {}) },
    { path: "/config", element: _jsx(ConfigPage, {}) },
]);
export default function AppRouter() {
    return _jsx(RouterProvider, { router: router });
}
