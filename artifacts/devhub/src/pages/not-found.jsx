import { Link } from "wouter";
import { Layout } from "@/components/shared/Layout";
export default function NotFound() {
  return (
    <Layout narrow>
      <div className="py-24 text-center space-y-4">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <button className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            Back to home
          </button>
        </Link>
      </div>
    </Layout>
  );
}