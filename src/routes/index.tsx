import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Boxes, Lock, Mail, ShieldPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — MediResQ AI" },
      {
        name: "description",
        content:
          "Sign in to MediResQ AI, the AI-powered healthcare supply chain resilience platform for hospital medicine inventory and shortage prediction.",
      },
      { property: "og:title", content: "Sign in — MediResQ AI" },
      {
        property: "og:description",
        content: "Predict shortages. Protect supplies. Strengthen healthcare.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, session, ready } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) navigate({ to: "/dashboard" });
  }, [ready, session, navigate]);

  const enter = (mail: string, demo: boolean) => {
    setLoading(true);
    setTimeout(() => {
      login(mail, demo);
      toast.success(demo ? "Signed in with demo data" : "Welcome back to MediResQ AI");
      navigate({ to: "/dashboard" });
    }, 500);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    enter(email, false);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="brand-gradient relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <ShieldPlus className="size-6" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">MediResQ AI</span>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Predict shortages. Protect supplies. Strengthen healthcare.
          </h2>
          <p className="text-sm text-primary-foreground/80">
            AI-powered demand forecasting, risk scoring and hospital-to-hospital redistribution for
            resilient medical supply chains.
          </p>
          <div className="grid gap-3">
            {[
              { icon: Activity, text: "Forecast 7 and 30-day medicine demand" },
              { icon: Boxes, text: "Detect stock-outs and expiry risk early" },
              { icon: Sparkles, text: "Recommend reorders and transfers automatically" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur"
              >
                <f.icon className="size-4 shrink-0" />
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/70">
          Supply chain &amp; logistics platform — not a medical diagnosis system.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="brand-gradient flex size-10 items-center justify-center rounded-xl">
              <ShieldPlus className="size-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-extrabold">MediResQ AI</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/12 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-warning" /> Demo Mode — no setup
            required
          </span>

          <h1 className="mt-4 text-2xl font-extrabold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Healthcare Supply Chain Resilience Platform
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="supply.lead@citycare.org"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Signing in…" : "Login"} <ArrowRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => enter("demo@mediresq.ai", true)}
            >
              Demo Login
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo login opens the full platform with realistic sample hospital data.
          </p>
        </div>
      </div>
    </div>
  );
}
