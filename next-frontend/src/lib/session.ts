export type UserIntent = "network" | "sell" | "buy";

export interface BareaSession {
  companyId: string;
  email: string;
  companyName: string;
  intent?: UserIntent;
  industry?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
}

export function loadSession(): BareaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw) as BareaSession;
  } catch {
    return null;
  }
}

export function saveSession(session: BareaSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("barea_session", JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("barea_session");
}
