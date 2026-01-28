import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary">Knowledge Equity</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/feed"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Feed
            </Link>
            <Link
              to="/contribute"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Contribute
            </Link>
            <Link
              to="/profile/me"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Profile
            </Link>
          </nav>

          {/* CTA Button */}
          <Link
            to="/contribute"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Share Knowledge
          </Link>
        </div>
      </div>
    </header>
  );
}
