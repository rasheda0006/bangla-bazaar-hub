import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser, useIsAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "এডমিন প্যানেল | আমার দোকান" },
      { name: "description", content: "সাইটের পণ্য, অর্ডার ও সেটিংস পরিচালনা করুন।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "এডমিন প্যানেল | আমার দোকান" },
      { property: "og:description", content: "সাইটের পণ্য, অর্ডার ও সেটিংস পরিচালনা করুন।" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "পণ্য", icon: Package, exact: false },
  { to: "/admin/orders", label: "অর্ডার", icon: ShoppingBag, exact: false },
  { to: "/admin/categories", label: "ক্যাটাগরি", icon: FolderTree, exact: false },
  { to: "/admin/content", label: "কনটেন্ট", icon: Images, exact: false },
  { to: "/admin/settings", label: "সেটিংস", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const { user, loading } = useAuthUser();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (loading) {
    return <CenterMessage title="লোড হচ্ছে..." />;
  }

  if (!user) return <AdminLogin />;

  if (roleLoading) return <CenterMessage title="অনুমতি যাচাই হচ্ছে..." />;

  if (!isAdmin) {
    return (
      <CenterMessage
        title="আপনার এডমিন অনুমতি নেই"
        description="এই প্যানেলে ঢুকতে এডমিন অ্যাকাউন্ট প্রয়োজন।"
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={async () => {
              await supabase.auth.signOut();
              qc.clear();
            }}
          >
            সাইন আউট
          </Button>
        }
      />
    );
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: item.exact }}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary [&.active]:bg-primary [&.active]:text-primary-foreground"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetTitle className="px-4 font-display">এডমিন প্যানেল</SheetTitle>
                <div className="mt-6">{nav}</div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="truncate font-display text-lg font-extrabold">
              এডমিন প্যানেল
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">সাইট দেখুন</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
              onClick={async () => {
                await qc.cancelQueries();
                qc.clear();
                await supabase.auth.signOut();
                void navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">সাইন আউট</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-3 shadow-soft">
            {nav}
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function CenterMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-xl font-bold">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}

function AdminLogin() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) toast.error("ইমেইল বা পাসওয়ার্ড ভুল");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      setBusy(false);
      if (error) toast.error(error.message);
      else toast.success("অ্যাকাউন্ট তৈরি হয়েছে, এখন লগইন করুন");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lift"
      >
        <h1 className="text-center font-display text-2xl font-bold">এডমিন লগইন</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          প্যানেলে ঢুকতে আপনার তথ্য দিন
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>ইমেইল</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>পাসওয়ার্ড</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary"
          >
            {mode === "login"
              ? "প্রথমবার? অ্যাকাউন্ট তৈরি করুন"
              : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
