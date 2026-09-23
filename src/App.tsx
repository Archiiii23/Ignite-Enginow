import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./lib/auth-context";
import { PlatformStoreProvider } from "./lib/platform-store";
import { NotificationProvider } from "./lib/notifications";
import { SmoothScroll } from "./components/motion/SmoothScroll";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./routes/index";
import AboutPage from "./routes/about";
import EventsIndexPage from "./routes/events.index";
import EventDetailPage from "./routes/events.$eventId";
import DashboardPage from "./routes/dashboard";
import AuthPage from "./routes/auth";
import AdminPage from "./routes/admin";
import OrganizerPage from "./routes/organizer";
import ResourcesPage from "./routes/resources";
import CareersPage from "./routes/careers";
import ContactPage from "./routes/contact";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PlatformStoreProvider>
            <NotificationProvider>
              <Toaster />
              <BrowserRouter>
                <SmoothScroll>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/events" element={<EventsIndexPage />} />
                    <Route path="/events/:eventId" element={<EventDetailPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/organizer" element={<OrganizerPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </SmoothScroll>
              </BrowserRouter>
            </NotificationProvider>
          </PlatformStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
