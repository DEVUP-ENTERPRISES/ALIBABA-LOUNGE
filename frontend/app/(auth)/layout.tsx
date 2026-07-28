import { AuthProvider } from "@/contexts/AuthContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#050505]">{children}</div>
    </AuthProvider>
  );
}
