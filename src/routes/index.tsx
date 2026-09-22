import { useNavigate } from "@/lib/router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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

export default function Landing() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center relative overflow-hidden select-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-72 w-72 rounded-full bg-primary/20 blur-[100px] animate-pulse"
        />
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(234,88,12,0.3)] backdrop-blur-xl">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 animate-[spin_8s_linear_infinite]" />
            <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75" />
          </div>
          <span className="mt-5 font-display text-sm font-semibold tracking-wider uppercase text-white/90">
            ENGINOW IGNITE
          </span>
          <p className="mt-1 text-xs font-mono text-muted-foreground tracking-widest uppercase animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
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

