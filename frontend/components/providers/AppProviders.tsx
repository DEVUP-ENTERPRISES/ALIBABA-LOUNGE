"use client";

import { SmoothScrollProvider } from "@/contexts/SmoothScrollContext";
import { LoadingScreen } from "@/components/effects/LoadingScreen";
import { PageTransition } from "@/components/effects/PageTransition";
import { AmbientGlow } from "@/components/effects/AmbientGlow";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { ReservationProvider } from "@/components/providers/ReservationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { WelcomeToast } from "@/components/effects/WelcomeToast";
import { ScrollProgressBar } from "@/components/effects/ScrollProgressBar";
import { StickyReserveCTA } from "@/components/effects/StickyReserveCTA";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScrollProvider>
        <ReservationProvider>
          <ScrollProgressBar />
          <CustomCursor />
          <LoadingScreen />
          <AmbientGlow />
          <WelcomeToast />
          <StickyReserveCTA />
          <PageTransition>{children}</PageTransition>
        </ReservationProvider>
      </SmoothScrollProvider>
    </AuthProvider>
  );
}
