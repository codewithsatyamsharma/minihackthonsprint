import { ReactNode } from "react";
import { Navbar } from "./Navbar";
export function Layout({ children }: { children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground dark">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}