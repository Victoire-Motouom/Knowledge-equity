import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/auth/AuthContext";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { user, loading, signInWithProvider, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation() as any;
  const navigate = useNavigate();

  const fromPath = useMemo(() => {
    return location?.state?.from?.pathname || "/";
  }, [location]);

  // If already signed in, redirect after first render.
  // (Avoid calling navigate during render.)
  if (!loading && user) {
    queueMicrotask(() => navigate(fromPath, { replace: true }));
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to submit contributions, review, and view your profile.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <button
            onClick={() => signInWithProvider("google")}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            Continue with Google
          </button>

          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium text-foreground mb-2">
              Email magic link
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={async () => {
                  setError(null);
                  try {
                    if (!email.includes("@"))
                      throw new Error("Enter a valid email");
                    await signInWithEmail(email);
                    setSent(true);
                  } catch (e: any) {
                    setError(e?.message || "Failed to send link");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium sm:w-auto w-full"
              >
                Send
              </button>
            </div>
            {sent && (
              <div className="text-sm text-muted-foreground mt-2">
                Check your email for a sign-in link.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
