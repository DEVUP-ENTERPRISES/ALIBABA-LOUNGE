import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </AppProviders>
  );
}
