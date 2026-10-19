/**
 * Central HTTP boundary for CRM. No DB credentials or secrets are bundled.
 * TODO(API): Implement these routes in Node.js/Express backed by MySQL (XAMPP).
 * TODO(AUTH): Use httpOnly SameSite session cookies, CSRF validation on writes,
 * and verify organization + role/owner scope on EACH endpoint.
 * NEXT_PUBLIC_API_BASE_URL is a PUBLIC origin, never a secret.
 * In local development, leave it empty and proxy /api through a controlled server.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

export class CrmApiError extends Error {
  constructor(status, message) { super(message); this.name = "CrmApiError"; this.status = status; }
}

export async function crmRequest(path, { method = "GET", body, signal } = {}) {
  if (!path.startsWith("/api/")) throw new Error("CRM endpoints must be /api/* paths");
  const response = await fetch(`${API_BASE}${path}`, {
    method, signal, credentials: "include", cache: "no-store",
    headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new CrmApiError(response.status, payload.error || `CRM request failed (${response.status})`);
  return payload;
}

/** API envelopes: { leads: Lead[] }, { team: Member[] }, { viewer: User }. */
export const crmApi = {
  getSession: (signal) => crmRequest("/api/auth/me", { signal }),
  listLeads: (signal) => crmRequest("/api/leads", { signal }),
  listTeam: (signal) => crmRequest("/api/team", { signal }),
  createLead: (body) => crmRequest("/api/leads", { method: "POST", body }),
  updateLead: (id, body) => crmRequest(`/api/leads/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  deleteLeads: (ids) => crmRequest("/api/leads/bulk-delete", { method: "POST", body: { ids } }),
  updateMember: (id, body) => crmRequest(`/api/team/${encodeURIComponent(id)}`, { method: "PATCH", body }),
};
