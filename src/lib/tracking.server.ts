import { createHash } from "crypto";

export type CapiConfig = { enabled: boolean; pixelId: string | null; testEventCode: string | null };

export async function getCapiConfig(): Promise<CapiConfig> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("fb_pixel_id,fb_capi_enabled,fb_test_event_code,tracking_enabled")
    .eq("id", 1)
    .maybeSingle();
  const row = data as
    | {
        fb_pixel_id: string | null;
        fb_capi_enabled: boolean | null;
        fb_test_event_code: string | null;
        tracking_enabled: boolean | null;
      }
    | null;
  return {
    enabled: Boolean(row?.tracking_enabled ?? true) && Boolean(row?.fb_capi_enabled),
    pixelId: row?.fb_pixel_id ?? null,
    testEventCode: row?.fb_test_event_code || null,
  };
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export function hashUserData(input: { email?: string; phone?: string; fbp?: string; fbc?: string }) {
  const user: Record<string, unknown> = {};
  if (input.email) user.em = [sha256(input.email.trim().toLowerCase())];
  if (input.phone) {
    const digits = input.phone.replace(/\D/g, "");
    const intl = digits.startsWith("880") ? digits : `88${digits.replace(/^0?/, "0")}`;
    user.ph = [sha256(intl)];
  }
  if (input.fbp) user.fbp = input.fbp;
  if (input.fbc) user.fbc = input.fbc;
  return user;
}

export async function postCapi(args: {
  token: string;
  config: CapiConfig;
  event: {
    event_name: string;
    event_id: string;
    event_source_url?: string;
    value?: number;
    currency?: string;
    contents?: { id: string; quantity: number }[];
  };
  user: Record<string, unknown>;
}) {
  const { token, config, event, user } = args;
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.event_id,
        event_source_url: event.event_source_url,
        action_source: "website",
        user_data: user,
        custom_data: {
          currency: event.currency ?? "BDT",
          value: event.value ?? 0,
          contents: event.contents?.map((c) => ({
            id: c.id,
            quantity: c.quantity,
})),
          content_type: "product",
        },
      },
    ],
  };
  if (config.testEventCode) body.test_event_code = config.testEventCode;

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${config.pixelId}/events?access_token=${encodeURIComponent(token)}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) {
    const text = await res.text();
    console.error("CAPI error", res.status, text);
    return { sent: false, reason: "api_error" as const };
  }
  return { sent: true as const };
}
