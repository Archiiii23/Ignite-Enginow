import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { RoleSelectionModal } from "@/components/auth/RoleSelectionModal";
import { canonical, pageMeta } from "@/lib/seo";
import { homeDescription } from "@/lib/seo-descriptions";
import { FloatingNav } from "@/components/site/FloatingNav";
import { AnnouncementBanner } from "@/components/site/AnnouncementBanner";
import { Hero } from "@/components/site/Hero";
import { StatsSection } from "@/components/site/StatsSection";
import { FeaturedEvents } from "@/components/site/FeaturedEvents";
import { CategoriesGrid } from "@/components/site/CategoriesGrid";
import { PopularOrganizers } from "@/components/site/PopularOrganizers";
import { Timeline } from "@/components/site/Timeline";
import { Features } from "@/components/site/Features";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { PinnedStorySection } from "@/components/motion/PinnedStorySection";
import { HorizontalStorySection } from "@/components/motion/HorizontalStorySection";
import { ThreeRoleEcosystem } from "@/components/motion/ThreeRoleEcosystem";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta({
      title: "Home",
      description: homeDescription(),
      socialDescription:
        "Discover and host hackathons, workshops and webinars on Enginow Ignite.",
      path: "/",
    }),
    links: canonical("/"),
  }),
  component: Landing,
});

function Landing() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute w-7 h-7 rounded-full bg-primary/20 animate-pulse" />
        </div>
        <p className="mt-4 text-xs tracking-wider uppercase font-semibold text-muted-foreground animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {user && user.isRoleSelected === false && <RoleSelectionModal isOpen={true} />}
      <ScrollProgress />
      <AnnouncementBanner />
      <FloatingNav />
      <Hero />
      <StatsSection />
      <FeaturedEvents />
      <CategoriesGrid />
      <Timeline />
      <PinnedStorySection />
      <HorizontalStorySection />
      <ThreeRoleEcosystem />
      <Features />
      <PopularOrganizers />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

