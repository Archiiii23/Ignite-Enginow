import { createFileRoute } from "@tanstack/react-router";
import { canonical, pageMeta } from "@/lib/seo";
import { homeDescription } from "@/lib/seo-descriptions";
import { FloatingNav } from "@/components/site/FloatingNav";
import { Hero } from "@/components/site/Hero";
import { FeaturedEvents } from "@/components/site/FeaturedEvents";
import { Timeline } from "@/components/site/Timeline";
import { Features } from "@/components/site/Features";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

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
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNav overDark />
      <div className="theme-dark bg-background text-foreground">
        <Hero />
      </div>
      <FeaturedEvents />
      <div className="theme-dark bg-background text-foreground">
        <Timeline />
      </div>
      <Features />
      <div className="theme-dark bg-background text-foreground">
        <Testimonials />
      </div>
      <FAQ />
      <div className="theme-dark bg-background text-foreground">
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
