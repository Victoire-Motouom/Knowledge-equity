import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Menu,
  Newspaper,
  PlusSquare,
  Trophy,
  Grid3X3,
  Bell,
  User,
  Settings,
  GraduationCap,
  BookOpen,
  Sparkles,
  Shield,
  FileText,
  Lock,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { haptic } from "@/lib/haptics";
import { IosDrawer } from "@/components/ui/ios-drawer";
import { useTheme } from "next-themes";
import EmojiAvatar from "@/components/EmojiAvatar";

export default function Header() {
  const createTarget = "/contribute";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      {/* Mobile top bar: hamburger + logo + theme toggle */}
      <header className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-3 sm:px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                type="button"
                aria-label="Menu"
                onClick={() => {
                  haptic("tap");
                  setMobileMenuOpen(true);
                }}
                className="p-2.5 hover:bg-secondary rounded-lg ios-transition ios-press"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link
                to="/feed"
                onClick={() => haptic("tap")}
                className="flex items-center"
                aria-label="Home"
              >
                <div className="p-2.5 bg-primary rounded-xl ios-press ios-transition">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <AuthControls />
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => {
                  haptic("tap");
                  setTheme(isDark ? "light" : "dark");
                }}
                className="p-2.5 hover:bg-secondary rounded-lg ios-transition ios-press"
              >
                {isDark ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/feed"
              className="flex items-center gap-2 font-bold text-xl flex-shrink-0"
            >
              <div className="p-2 bg-primary rounded-lg ios-press ios-transition">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </Link>

            {/* Navigation (desktop) */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/feed"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Feed
              </Link>
              <Link
                to={createTarget}
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
                <div className="absolute left-0 mt-0 w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible ios-transition">
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
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => {
                  haptic("tap");
                  setTheme(isDark ? "light" : "dark");
                }}
                className="p-2 hover:bg-secondary rounded-lg ios-transition ios-press"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <AuthControls />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom tabs ONLY */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur">
        <div className="px-2 sm:px-4">
          <div className="grid grid-cols-4 py-2">
            <MobileNavItem to="/feed" label="Feed" Icon={Newspaper} />
            <MobileNavItem to={createTarget} label="Post" Icon={PlusSquare} />
            <MobileNavItem to="/leaderboard" label="Leaders" Icon={Trophy} />
            <MobileNavItem to="/domains" label="Domains" Icon={Grid3X3} />
          </div>
        </div>
      </nav>

      {/* Mobile left drawer (secondary links) */}
      <IosDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
      >
        <div className="space-y-2">
          <div className="border-t border-border pt-2 mt-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
              Learn
            </div>
            <DrawerLink
              to="/onboarding"
              icon={GraduationCap}
              onDone={() => setMobileMenuOpen(false)}
            >
              Alice's Story
            </DrawerLink>
            <DrawerLink
              to="/how-it-works"
              icon={BookOpen}
              onDone={() => setMobileMenuOpen(false)}
            >
              How It Works
            </DrawerLink>
            <DrawerLink
              to="/examples"
              icon={Sparkles}
              onDone={() => setMobileMenuOpen(false)}
            >
              Examples
            </DrawerLink>
            <DrawerLink
              to="/non-technical"
              icon={Sparkles}
              onDone={() => setMobileMenuOpen(false)}
            >
              Beyond Code
            </DrawerLink>
          </div>

          <div className="border-t border-border pt-2 mt-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
              Account
            </div>
            <DrawerLink
              to="/settings"
              icon={Settings}
              onDone={() => setMobileMenuOpen(false)}
            >
              Settings
            </DrawerLink>
            <DrawerLink
              to="/my-contributions"
              icon={Shield}
              onDone={() => setMobileMenuOpen(false)}
            >
              My Contributions
            </DrawerLink>
          </div>

          <div className="border-t border-border pt-2 mt-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
              Legal
            </div>
            <DrawerLink
              to="/terms"
              icon={FileText}
              onDone={() => setMobileMenuOpen(false)}
            >
              Terms
            </DrawerLink>
            <DrawerLink
              to="/privacy"
              icon={Lock}
              onDone={() => setMobileMenuOpen(false)}
            >
              Privacy
            </DrawerLink>
          </div>
        </div>
      </IosDrawer>
    </>
  );
}

function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead, error } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "default"
          ) {
            Notification.requestPermission();
          }
          setOpen((prev) => !prev);
        }}
        className="relative p-2 rounded-lg hover:bg-secondary ios-transition ios-press"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-auto">
            {error ? (
              <div className="px-3 py-4 text-sm text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) {
                      navigate(n.link);
                      setOpen(false);
                    }
                  }}
                  className={`w-full text-left px-3 py-3 border-b border-border last:border-b-0 hover:bg-secondary/60 ${
                    n.read_at ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs mt-1">{n.body}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem(props: { to: string; label: string; Icon: any }) {
  return (
    <Link
      to={props.to}
      aria-label={props.label}
      title={props.label}
      onClick={() => haptic("tap")}
      className="flex flex-col items-center justify-center py-1.5 text-xs text-muted-foreground hover:text-foreground ios-transition ios-press"
    >
      <props.Icon className="h-6 w-6" />
      {/* Icons only on non-large screens (includes tablets). */}
    </Link>
  );
}

function DrawerLink(props: {
  to: string;
  onDone: () => void;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const Icon = props.icon;
  return (
    <Link
      to={props.to}
      className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors text-sm"
      onClick={props.onDone}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{props.children}</span>
    </Link>
  );
}

function AuthControls() {
  const { user, loading, signInWithProvider, signOut } = useSupabaseAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signInWithProvider("google")}
          className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
        aria-label="Profile menu"
      >
        <EmojiAvatar
          handle={
            user.user_metadata?.handle || user.user_metadata?.name || user.email
          }
          size="sm"
          className="h-5 w-5"
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg ios-transition">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
            {user.user_metadata?.handle ||
              user.user_metadata?.name ||
              user.email ||
              "Account"}
          </div>
          <Link
            to="/profile/me"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            Settings
          </Link>
          <Link
            to="/my-contributions"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            My Contributions
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
