import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useSettings } from "@/lib/data";
import { setTrackConfig, track } from "@/lib/tracking";

function injectOnce(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.innerHTML = code;
  document.head.appendChild(s);
}

function injectSrc(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** সব থার্ড-পার্টি ট্র্যাকিং ট্যাগ লোড করে ও রুট পরিবর্তনে PageView পাঠায় */
export function TrackingScripts() {
  const { data: s } = useSettings();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const loaded = useRef(false);

  useEffect(() => {
    if (!s || typeof window === "undefined") return;
    const enabled = Boolean(s.tracking_enabled) && !pathname.startsWith("/admin");

    setTrackConfig({
      enabled,
      fbPixelId: s.fb_pixel_id || null,
      fbCapiEnabled: Boolean(s.fb_capi_enabled),
      ga4Id: s.ga4_id || s.ga_id || null,
      googleAdsId: s.google_ads_id || null,
      googleAdsLabel: s.google_ads_conversion_label || null,
      tiktokPixelId: s.tiktok_pixel_id || null,
    });

    if (!enabled || loaded.current) return;
    loaded.current = true;

    const gaId = s.ga4_id || s.ga_id;
    if (gaId || s.google_ads_id) {
      const primary = gaId || s.google_ads_id;
      injectSrc("gtag-src", `https://www.googletagmanager.com/gtag/js?id=${primary}`);
      injectOnce(
        "gtag-init",
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());` +
          (gaId ? `gtag('config','${gaId}',{send_page_view:false});` : "") +
          (s.google_ads_id ? `gtag('config','${s.google_ads_id}');` : ""),
      );
    }

    if (s.gtm_id) {
      injectOnce(
        "gtm-init",
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtm_id}');`,
      );
    }

    if (s.fb_pixel_id) {
      injectOnce(
        "fb-pixel-init",
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.fb_pixel_id}');`,
      );
    }

    if (s.tiktok_pixel_id) {
      injectOnce(
        "tiktok-init",
        `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${s.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');`,
      );
    }

    if (s.clarity_id) {
      injectOnce(
        "clarity-init",
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${s.clarity_id}");`,
      );
    }
  }, [s, pathname]);

  // প্রতিটি রুট পরিবর্তনে PageView
  useEffect(() => {
    if (!s?.tracking_enabled || pathname.startsWith("/admin")) return;
    const t = setTimeout(() => track("PageView"), 300);
    return () => clearTimeout(t);
  }, [pathname, s?.tracking_enabled]);

  return null;
}
