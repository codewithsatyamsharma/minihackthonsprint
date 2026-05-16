import { ReactNode } from "react";
import { Navbar } from "./Navbar";
export function Layout({ children, narrow = false }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`flex-1 w-full mx-auto px-4 md:px-6 py-8 ${narrow ? "max-w-3xl" : "max-w-7xl"}`}>
        {children}
      </main>
    </div>
  );
}