export type RegistrationDraft = {
  name: string;
  email: string;
  password: string;
  intent: "network" | "sell" | "buy";
};

const STORAGE_KEY = "barea_registration_draft";

export function saveRegistrationDraft(data: RegistrationDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadRegistrationDraft(): RegistrationDraft | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as RegistrationDraft;
  } catch {
    return null;
  }
}

export function clearRegistrationDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
