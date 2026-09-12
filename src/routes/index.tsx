import { createFileRoute } from "@tanstack/react-router";
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
