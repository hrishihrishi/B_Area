export interface SavedLead {
  id: string;
  resultType: "company" | "product";
  name: string;
  companyName: string;
  category: string;
  meta: string;
  notes: string;
  savedAt: string;
}

const STORAGE_KEY = "barea_saved_leads";

function readAll(): SavedLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedLead[];
  } catch {
    return [];
  }
}

function writeAll(leads: SavedLead[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function listSavedLeads(): SavedLead[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function addSavedLead(
  lead: Omit<SavedLead, "savedAt" | "notes"> & { notes?: string },
): SavedLead {
  const existing = readAll();
  const entry: SavedLead = {
    ...lead,
    notes: lead.notes ?? "",
    savedAt: new Date().toISOString(),
  };
  const withoutDup = existing.filter((l) => l.id !== entry.id);
  writeAll([entry, ...withoutDup]);
  return entry;
}

export function updateSavedLeadNotes(id: string, notes: string): SavedLead | null {
  const all = readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], notes };
  writeAll(all);
  return all[idx];
}

export function removeSavedLead(id: string): void {
  writeAll(readAll().filter((l) => l.id !== id));
}

export function isLeadSaved(id: string): boolean {
  return readAll().some((l) => l.id === id);
}
