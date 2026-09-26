import { parseLeadInput } from "@/lib/zoho/validation";
import {
  createLead,
  getAccessToken,
  ZohoApiError,
  ZohoAuthError,
  ZohoConfigError,
} from "@/lib/zoho/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { ok: false, error: "bad_json" });
  }

  const parsed = parseLeadInput(raw);
  if (!parsed.ok) {
    return json(400, {
      ok: false,
      error: "validation",
      message: parsed.reason,
    });
  }

  try {
    const token = await getAccessToken();
    const recordId = await createLead(parsed.data, token);
    return json(200, { ok: true, zohoRecordId: recordId });
  } catch (e: unknown) {
    if (e instanceof ZohoConfigError) {
      return json(503, {
        ok: false,
        error: "not_configured",
        message: "CRM not configured on server",
      });
    }
    if (e instanceof ZohoAuthError) {
      return json(502, {
        ok: false,
        error: "auth",
        message: "CRM auth failed",
      });
    }
    if (e instanceof ZohoApiError) {
      console.error("[zoho/leads] api error", e.message);
      return json(502, {
        ok: false,
        error: "zoho",
        message: "CRM refused the submission",
      });
    }
    console.error("[zoho/leads] unexpected error", e);
    return json(500, { ok: false, error: "internal" });
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
