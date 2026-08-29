import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const capiSchema = z.object({
  event_name: z.string().min(1).max(60),
  event_id: z.string().min(1).max(120),
  event_source_url: z.string().max(500).optional(),
  email: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  contents: z
    .array(z.object({ id: z.string(), quantity: z.number().int().positive() }))
    .max(100)
    .optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(200).optional(),
});

/**
 * Meta Conversions API (server-side) — deduplicated with the browser pixel via event_id.
 * Pixel id / enable flag comes from site_settings, the access token from a secret.
 */
export const sendCapiEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => capiSchema.parse(data))
  .handler(async ({ data }) => {
    const token = process.env["FB_CAPI_ACCESS_TOKEN"];
    if (!token) return { sent: false, reason: "no_token" as const };

    const { getCapiConfig, hashUserData, postCapi } = await import("./tracking.server");
    const config = await getCapiConfig();
    if (!config.enabled || !config.pixelId) return { sent: false, reason: "disabled" as const };

    return postCapi({ token, config, event: data, user: hashUserData(data) });
  });
