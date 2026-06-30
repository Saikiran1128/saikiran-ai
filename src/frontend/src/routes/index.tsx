import { createRoute } from "@tanstack/react-router";

import { FeatureCards } from "@/components/landing/FeatureCards";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { rootRoute } from "./__root";

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
      </main>
      <LandingFooter />
    </div>
  );
}
