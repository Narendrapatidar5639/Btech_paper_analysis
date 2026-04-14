import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { SelectionPage } from "./pages/SelectionPage";
import { PapersPage } from "./pages/PapersPage";
import { AnalysisDashboard } from "./pages/AnalysisDashboard";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminAuthPage } from "./pages/admin/AdminAuthPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUploadPage } from "./pages/admin/AdminUploadPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "auth", Component: AuthPage },
      { path: "how-it-works", Component: HowItWorksPage },
      { path: "selection", Component: SelectionPage },
      { path: "papers", Component: PapersPage },
     { path: "dashboard", Component: AnalysisDashboard },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminAuthPage },
      { path: "dashboard", Component: AdminDashboard },
      { path: "upload", Component: AdminUploadPage },
      { path: "reports", Component: AdminReportsPage },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
