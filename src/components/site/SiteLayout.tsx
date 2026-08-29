import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { CartSheetProvider } from "./CartSheet";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartSheetProvider>
      <div className="flex min-h-screen flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </div>
    </CartSheetProvider>
  );
}
