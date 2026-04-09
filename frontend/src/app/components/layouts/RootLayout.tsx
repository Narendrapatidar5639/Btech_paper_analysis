import { Outlet, ScrollRestoration } from "react-router-dom";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import { Toaster } from "../ui/sonner";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeProvider";

export function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0a1a] dark:bg-[#0a0a1a] light:bg-gray-50 text-white dark:text-white light:text-gray-900 overflow-x-hidden transition-colors duration-300">
          {/* Gradient Background */}
          <div className="fixed inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20 light:opacity-10 animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20 light:opacity-10 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20 light:opacity-10 animate-blob animation-delay-4000" />
          </div>

          <div className="relative z-10">
            <Navbar />
            <main className="pt-16 min-h-[calc(100vh-4rem)]">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}