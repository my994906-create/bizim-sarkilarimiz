import { describe, expect, it } from "vitest";
import { assertAudioUpload, assertCoverUpload, cleanTrackTitle, safeAudioFilename, safeCoverFilename } from "./musicValidation";

describe("audio upload validation", () => {
  it("accepts a valid audio file within the supported size", () => {
    expect(() => assertAudioUpload({ mimeType: "audio/mpeg", byteLength: 1_024 })).not.toThrow();
  });

  it("rejects non-audio and oversized files", () => {
    expect(() => assertAudioUpload({ mimeType: "image/png", byteLength: 1_024 })).toThrow("Yalnızca ses dosyaları");
    expect(() => assertAudioUpload({ mimeType: "audio/mpeg", byteLength: 25 * 1024 * 1024 + 1 })).toThrow("25 MB");
  });

  it("normalizes storage file names and display titles", () => {
    expect(safeAudioFilename("Bir Şarkı!.mp3")).toBe("Bir-Sark-.mp3");
    expect(cleanTrackTitle("bir_sarki-demo.mp3")).toBe("bir sarki demo");
  });

  it("accepts safe cover images and rejects unsupported or oversized covers", () => {
    expect(() => assertCoverUpload({ mimeType: "image/webp", byteLength: 1_024 })).not.toThrow();
    expect(() => assertCoverUpload({ mimeType: "image/gif", byteLength: 1_024 })).toThrow("JPEG, PNG veya WebP");
    expect(() => assertCoverUpload({ mimeType: "image/png", byteLength: 5 * 1024 * 1024 + 1 })).toThrow("5 MB");
    expect(safeCoverFilename("Kapak Görseli!.webp")).toBe("Kapak-Gorseli-.webp");
  });
});
