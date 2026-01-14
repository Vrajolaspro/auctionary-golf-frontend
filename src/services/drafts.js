const KEY = "auction_drafts_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(drafts) {
  localStorage.setItem(KEY, JSON.stringify(drafts));
}

export function listDrafts() {
  // newest first
  return readAll().sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
}

export function getDraft(id) {
  const drafts = readAll();
  return drafts.find((d) => d.id === id) || null;
}

export function upsertDraft(draft) {
  const drafts = readAll();
  const now = Date.now();

  const normalized = {
    id: draft.id || crypto.randomUUID(),
    name: draft.name || "",
    description: draft.description || "",
    starting_bid: Number.isFinite(Number(draft.starting_bid))
      ? Math.floor(Number(draft.starting_bid))
      : "",
    end_date_local: draft.end_date_local || "", // store exactly as datetime-local
    createdAt: draft.createdAt || now,
    updatedAt: now,
  };

  const idx = drafts.findIndex((d) => d.id === normalized.id);
  if (idx >= 0) drafts[idx] = normalized;
  else drafts.push(normalized);

  writeAll(drafts);
  return normalized;
}

export function deleteDraft(id) {
  const drafts = readAll().filter((d) => d.id !== id);
  writeAll(drafts);
}

export function clearDrafts() {
  writeAll([]);
}
