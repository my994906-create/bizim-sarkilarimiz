const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;

export function assertAudioUpload({ mimeType, byteLength }: { mimeType: string; byteLength: number }) {
  if (!mimeType.toLowerCase().startsWith("audio/")) throw new Error("Yalnızca ses dosyaları yüklenebilir.");
  if (!Number.isFinite(byteLength) || byteLength <= 0) throw new Error("Ses dosyası boş veya geçersiz.");
  if (byteLength > MAX_AUDIO_BYTES) throw new Error("Her ses dosyası en fazla 25 MB olabilir.");
}

export function assertCoverUpload({ mimeType, byteLength }: { mimeType: string; byteLength: number }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType.toLowerCase())) {
    throw new Error("Kapak görseli JPEG, PNG veya WebP olmalıdır.");
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) throw new Error("Kapak görseli boş veya geçersiz.");
  if (byteLength > MAX_COVER_BYTES) throw new Error("Kapak görseli en fazla 5 MB olabilir.");
}

export function safeAudioFilename(filename: string) {
  const normalized = filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  return normalized.replace(/^[-.]+|[-.]+$/g, "").slice(0, 150) || "sarki.mp3";
}

export function safeCoverFilename(filename: string) {
  const value = safeAudioFilename(filename);
  return /\.(jpe?g|png|webp)$/i.test(value) ? value : "kapak.jpg";
}

export function cleanTrackTitle(value: string) {
  return value.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[._-]+/g, " ").trim().slice(0, 255) || "Adsız şarkı";
}
