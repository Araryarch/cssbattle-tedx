import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary/20">404</h1>
        <h2 className="text-2xl font-bold text-white -mt-8 mb-4">Page Not Found</h2>
        <p className="text-white/40 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/socials"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Users
          </Link>
        </div>
      </div>
    </div>
  );
}
