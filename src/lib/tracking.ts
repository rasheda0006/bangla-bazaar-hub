/**
 * ক্লায়েন্ট-সাইড ট্র্যাকিং হেল্পার।
 * Meta Pixel + Conversions API (event_id দিয়ে ডিডুপ্লিকেশন), GA4, GTM, Google Ads, TikTok, Clarity।
 */
import { sendCapiEvent } from "./tracking.functions";

type W = Window & {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
  ttq?: { track: (name: string, params?: Record<string, unknown>) => void };
  dataLayer?: Record<string, unknown>[];
};

export type TrackConfig = {
  enabled: boolean;
  fbPixelId: string | null;
  fbCapiEnabled: boolean;
  ga4Id: string | null;
  googleAdsId: string | null;
  googleAdsLabel: string | null;
  tiktokPixelId: string | null;
};

let config: TrackConfig = {
  enabled: false,
  fbPixelId: null,
  fbCapiEnabled: false,
  ga4Id: null,
  googleAdsId: null,
  googleAdsLabel: null,
  tiktokPixelId: null,
};

export function setTrackConfig(next: TrackConfig) {
  config = next;
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2] as string) : undefined;
}

/** GA4 ইভেন্ট নাম ম্যাপিং */
const GA_MAP: Record<string, string> = {
  PageView: "page_view",
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  Search: "search",
};

export type TrackInput = {
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number }[];
  contentName?: string;
  email?: string;
  phone?: string;
  extra?: Record<string, unknown>;
};

export function track(event: string, input: TrackInput = {}) {
  if (!config.enabled || typeof window === "undefined") return;
  const w = window as W;
  const eventId = uuid();
  const currency = input.currency ?? "BDT";
  const contents = input.contents ?? [];

  // Meta Pixel (browser)
  if (config.fbPixelId && w.fbq) {
    w.fbq(
      "track",
      event,
      {
        value: input.value ?? 0,
        currency,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents: contents.map((c) => ({ id: c.id, quantity: c.quantity })),
        content_name: input.contentName,
      },
      { eventID: eventId },
    );
  }

  // GA4 / Google Ads
  if (w.gtag) {
    const gaName = GA_MAP[event] ?? event;
    w.gtag("event", gaName, {
      currency,
      value: input.value ?? 0,
      items: contents.map((c) => ({ item_id: c.id, quantity: c.quantity })),
      ...input.extra,
    });
    if (event === "Purchase" && config.googleAdsId && config.googleAdsLabel) {
      w.gtag("event", "conversion", {
        send_to: `${config.googleAdsId}/${config.googleAdsLabel}`,
        value: input.value ?? 0,
        currency,
        transaction_id: eventId,
      });
    }
  }

  // TikTok
  if (config.tiktokPixelId && w.ttq) {
    w.ttq.track(event, { value: input.value ?? 0, currency });
  }

  // GTM dataLayer
  w.dataLayer?.push({ event: `lv_${event}`, value: input.value ?? 0, currency, contents });

  // Meta Conversions API (server-side, deduped by event_id)
  if (config.fbCapiEnabled && config.fbPixelId) {
    void sendCapiEvent({
      data: {
        event_name: event,
        event_id: eventId,
        event_source_url: window.location.href,
        ...(input.email ? { email: input.email } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.value != null ? { value: input.value } : {}),
        currency,
        contents,
        ...(cookie("_fbp") ? { fbp: cookie("_fbp") as string } : {}),
        ...(cookie("_fbc") ? { fbc: cookie("_fbc") as string } : {}),
      },
    }).catch(() => undefined);
  }
}
