import { describe, expect, it } from "vitest";
import { isFirebaseArchiveOwner } from "./firebaseAuth";

describe("Firebase arşiv sahibi doğrulaması", () => {
  it("yalnızca doğrulanmış nxkfoc hesabına yönetim izni verir", () => {
    expect(isFirebaseArchiveOwner({ email: "nxkfoc@gmail.com", email_verified: true })).toBe(true);
    expect(isFirebaseArchiveOwner({ email: "nxkfoc@gmail.com", email_verified: false })).toBe(false);
    expect(isFirebaseArchiveOwner({ email: "baska@example.com", email_verified: true })).toBe(false);
  });
});
