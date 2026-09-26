const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_FIELD = {
  name: 80,
  email: 120,
  phone: 30,
  message: 2000,
} as const;

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export type ParseResult =
  | { ok: true; data: LeadInput }
  | { ok: false; reason: string };

export function parseLeadInput(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, reason: "body must be a JSON object" };
  }
  const r = raw as Record<string, unknown>;

  const name = stringField(r.name, MAX_FIELD.name);
  if (!name) return { ok: false, reason: "name is required (≤80 chars)" };

  const email = stringField(r.email, MAX_FIELD.email);
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, reason: "valid email is required (≤120 chars)" };
  }

  const message = stringField(r.message, MAX_FIELD.message);
  if (!message) {
    return { ok: false, reason: "message is required (≤2000 chars)" };
  }

  const phoneRaw = stringField(r.phone, MAX_FIELD.phone) ?? "";

  return {
    ok: true,
    data: {
      name,
      email,
      phone: phoneRaw || undefined,
      message,
    },
  };
}

function stringField(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s || s.length > max) return undefined;
  return s;
}
