import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/AppProviders";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </AppProviders>
  );
}
