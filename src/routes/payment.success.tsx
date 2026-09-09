import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useEffect } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { taka, toBn } from "@/lib/format";
import { verifyZiniPayPayment } from "@/lib/zinipay.functions";

export const Route = createFileRoute("/payment/success")({
  head: () => ({
    meta: [
      { title: "পেমেন্ট নিশ্চিতকরণ | আমার ডিজিটাল স্টোর" },
      { name: "description", content: "আপনার অনলাইন পেমেন্ট যাচাই করা হচ্ছে।" },
      { property: "og:title", content: "পেমেন্ট নিশ্চিতকরণ" },
      { property: "og:description", content: "আপনার অনলাইন পেমেন্ট যাচাই করা হচ্ছে।" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    val_id: typeof search["val_id"] === "string" ? search["val_id"] : "",
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { val_id: valId } = Route.useSearch();
  const { clear } = useCart();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["zinipay-verify", valId],
    queryFn: () => verifyZiniPayPayment({ data: { val_id: valId } }),
    enabled: Boolean(valId),
    retry: 2,
    refetchInterval: (q) => (q.state.data?.status === "PENDING" ? 4000 : false),
  });

  useEffect(() => {
    if (data?.status === "COMPLETED") clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status]);

  return (
    <SiteLayout>
      <div className="container-page py-12 sm:py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lift sm:p-8">
          {!valId || isError ? (
            <>
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <h1 className="mt-4 font-display text-2xl font-bold">পেমেন্ট যাচাই করা যায়নি</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                কিছুক্ষণ পর আবার চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।
              </p>
            </>
          ) : isLoading || data?.status === "PENDING" ? (
            <>
              <Loader2 className="mx-auto h-14 w-14 animate-spin text-primary" />
              <h1 className="mt-4 font-display text-2xl font-bold">পেমেন্ট যাচাই করা হচ্ছে…</h1>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm font-bold text-warning-foreground">
                <Clock className="h-4 w-4" />
                একটু অপেক্ষা করুন
              </div>
            </>
          ) : data?.status === "COMPLETED" ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
              <h1 className="mt-4 font-display text-2xl font-bold">পেমেন্ট সফল হয়েছে!</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                অর্ডার নম্বর{" "}
                <span className="font-bold text-primary">#{toBn(data.order_no ?? 0)}</span> — মোট{" "}
                <span className="font-bold">{taka(data.total)}</span>। ডিজিটাল প্রোডাক্টের
                অ্যাক্সেস/ডাউনলোড লিংক আপনার ইমেইলে পাঠানো হচ্ছে।
              </p>
              <Button className="mt-6 rounded-full px-8" onClick={() => void navigate({ to: "/shop" })}>
                আরও কেনাকাটা করুন
              </Button>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <h1 className="mt-4 font-display text-2xl font-bold">পেমেন্ট সম্পন্ন হয়নি</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                পেমেন্ট বাতিল বা ব্যর্থ হয়েছে। আপনার কার্ট ঠিক আছে, আবার চেষ্টা করতে পারেন।
              </p>
              <Button asChild className="mt-6 rounded-full px-8">
                <Link to="/checkout">আবার চেষ্টা করুন</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
