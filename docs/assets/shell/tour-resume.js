/**
 * Carry an open tour across a page load. A step whose action navigates (for example to a tool
 * page) would otherwise end the tour. Before the action runs, the step is recorded with a
 * timestamp; the next page resumes it if the record is recent, and closing the tour clears it.
 * Storage failures (private mode, blocked storage) are ignored: the tour still works on one page.
 */

export const RESUME_KEY = 'exec-tour-resume';
export const RESUME_WINDOW_MS = 10000;

/** @param {Storage | null} storage @param {number} index @param {number} now */
export function saveResume(storage, index, now = Date.now()) {
  try {
    storage?.setItem(RESUME_KEY, JSON.stringify({ index, at: now }));
  } catch {
    /* storage unavailable */
  }
}

/** @param {Storage | null} storage */
export function clearResume(storage) {
  try {
    storage?.removeItem(RESUME_KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * The step to resume, or null. Always clears the record.
 * @param {Storage | null} storage @param {number} total @param {number} now
 * @returns {number | null}
 */
export function takeResume(storage, total, now = Date.now()) {
  let raw = null;
  try {
    raw = storage?.getItem(RESUME_KEY) ?? null;
  } catch {
    return null;
  }
  clearResume(storage);
  if (!raw) return null;
  let rec;
  try {
    rec = JSON.parse(raw);
  } catch {
    return null;
  }
  const { index, at } = rec ?? {};
  if (!Number.isInteger(index) || index < 0 || index >= total) return null;
  if (typeof at !== 'number' || now - at < 0 || now - at > RESUME_WINDOW_MS) return null;
  return index;
}

/** sessionStorage, or null where it cannot be reached. */
export function sessionStore() {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}
