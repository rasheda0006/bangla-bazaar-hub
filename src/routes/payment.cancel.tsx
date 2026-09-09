import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/cancel")({
  head: () => ({
    meta: [
      { title: "পেমেন্ট বাতিল | আমার ডিজিটাল স্টোর" },
      { name: "description", content: "আপনার পেমেন্ট বাতিল করা হয়েছে।" },
      { property: "og:title", content: "পেমেন্ট বাতিল" },
      { property: "og:description", content: "আপনার পেমেন্ট বাতিল করা হয়েছে।" },
    ],
  }),
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  return (
    <SiteLayout>
      <div className="container-page py-12 sm:py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lift sm:p-8">
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">পেমেন্ট বাতিল হয়েছে</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            আপনার কার্টের প্রোডাক্টগুলো ঠিক আছে। ইচ্ছে করলে আবার পেমেন্ট করতে পারেন।
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full px-8">
              <Link to="/checkout">আবার চেষ্টা করুন</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link to="/shop">শপে ফিরে যান</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
