// Builds the filename used when exporting a CV to PDF (via the browser print
// dialog, which uses document.title as the default file name).
//
// Format: <fullName>_<timestamp>_<encodedId>
//   - fullName:  the CV owner's name (personalInfo.fullName), sanitized
//   - timestamp: the moment of export, YYYYMMDD-HHmmss
//   - encodedId: a short, stable base36 hash derived from the resumeId

/** Deterministic 32-bit djb2 hash → short base36 string (stable per resumeId). */
function encodeId(id: string | null | undefined): string {
  if (!id) return 'draft';
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(36).padStart(7, '0').slice(0, 8);
}

/** Two-digit zero padding for date parts. */
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** YYYYMMDD-HHmmss in local time. */
function formatTimestamp(date: Date): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** Make a name safe for use as a filename: drop illegal chars, collapse spaces to '_'. */
function sanitizeName(name: string | null | undefined): string {
  const cleaned = (name || '')
    .trim()
    .replace(/[/\\:*?"<>|]/g, '') // strip filesystem-illegal characters
    .replace(/\s+/g, '_'); // spaces → underscores
  return cleaned || 'CV';
}

export interface ExportFilenameParams {
  fullName?: string | null;
  resumeId?: string | null;
  /** Defaults to the current time; injectable for testing. */
  date?: Date;
}

export function buildExportFilename({ fullName, resumeId, date }: ExportFilenameParams): string {
  const name = sanitizeName(fullName);
  const timestamp = formatTimestamp(date ?? new Date());
  const encodedId = encodeId(resumeId);
  return `${name}_${timestamp}_${encodedId}`;
}
