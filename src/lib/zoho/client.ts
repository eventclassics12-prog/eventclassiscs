import type { LeadInput } from "./validation";

const ACCOUNTS_DOMAIN =
  process.env.ZOHO_ACCOUNTS_DOMAIN ?? "https://accounts.zoho.in";
const API_DOMAIN = process.env.ZOHO_API_DOMAIN ?? "https://www.zohoapis.in";

const SKEW_MS = 30_000;
const AUTH_TIMEOUT_MS = 10_000;
const API_TIMEOUT_MS = 15_000;

let cached: { token: string; expiresAt: number } | null = null;

export class ZohoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoConfigError";
  }
}
export class ZohoAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoAuthError";
  }
}
export class ZohoApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoApiError";
  }
}

export async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + SKEW_MS) {
    return cached.token;
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refresh = process.env.ZOHO_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refresh) {
    throw new ZohoConfigError(
      "Zoho env vars are not set (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN)",
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refresh,
  });

  const res = await fetch(`${ACCOUNTS_DOMAIN}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new ZohoAuthError(`OAuth refresh HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (json.error || !json.access_token) {
    throw new ZohoAuthError(json.error ?? "missing access_token in response");
  }

  cached = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

const LEAD_SOURCE = "Website Contact Form";
const COMPANY = "Event Classics";

export async function createLead(
  input: LeadInput,
  accessToken: string,
): Promise<string> {
  const tokens = input.name.trim().split(/\s+/);
  const firstName = tokens[0] ?? "";
  const lastName = tokens.length > 1 ? tokens.slice(1).join(" ") : "—";

  const record = {
    First_Name: firstName,
    Last_Name: lastName,
    Email: input.email,
    Phone: input.phone ?? null,
    Description: input.message,
    Lead_Source: LEAD_SOURCE,
    Company: COMPANY,
  };

  const res = await fetch(`${API_DOMAIN}/crm/v8/Leads`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [record],
      trigger: [],
    }),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ZohoApiError(
      `Zoho refused ${res.status}: ${text.slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as {
    data?: Array<{ details?: { id?: string } }>;
  };
  const id = json.data?.[0]?.details?.id;
  if (!id) throw new ZohoApiError("Zoho response missing record id");
  return id;
}
