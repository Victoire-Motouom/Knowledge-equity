import { Link } from "react-router-dom";
import { Zap, Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary hidden sm:inline">Knowledge Equity</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
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
              to="/leaderboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Leaderboard
            </Link>
            <Link
              to="/domains"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Domains
            </Link>
            <Link
              to="/my-contributions"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              My Work
            </Link>

            {/* Learn Dropdown */}
            <div className="relative group">
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Learn ▼
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  to="/onboarding"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors first:rounded-t-lg"
                >
                  Alice's Story (Walkthrough)
                </Link>
                <Link
                  to="/how-it-works"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  How It Works & FAQ
                </Link>
                <Link
                  to="/examples"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Good vs Bad Examples
                </Link>
                <Link
                  to="/non-technical"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors last:rounded-b-lg"
                >
                  Beyond Code
                </Link>
              </div>
            </div>

            <Link
              to="/profile/me"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Profile
            </Link>
          </nav>

          {/* CTA Button + Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              to="/contribute"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors hidden sm:block"
            >
              Share Knowledge
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            <Link
              to="/feed"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feed
            </Link>
            <Link
              to="/contribute"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contribute
            </Link>
            <Link
              to="/leaderboard"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              to="/domains"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Domains
            </Link>
            <Link
              to="/my-contributions"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Work
            </Link>
            <Link
              to="/how-it-works"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>
            <Link
              to="/profile/me"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
