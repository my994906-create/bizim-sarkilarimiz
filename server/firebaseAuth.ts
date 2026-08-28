import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";

const FIREBASE_PROJECT_ID = "sarkilar-arsivi-nxkfoc";
const FIREBASE_OWNER_EMAIL = "nxkfoc@gmail.com";
const firebaseJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

export function isFirebaseArchiveOwner(payload: JWTPayload) {
  return payload.email === FIREBASE_OWNER_EMAIL && payload.email_verified === true;
}

export async function assertFirebaseArchiveOwner(idToken: string) {
  try {
    const { payload, protectedHeader } = await jwtVerify(idToken, firebaseJwks, {
      audience: FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      algorithms: ["RS256"],
    });
    if (protectedHeader.alg !== "RS256" || !isFirebaseArchiveOwner(payload)) {
      throw new Error("Bu Firebase hesabının arşiv yönetim izni yok.");
    }
    return payload;
  } catch (error) {
    throw new Error(error instanceof Error && error.message === "Bu Firebase hesabının arşiv yönetim izni yok." ? error.message : "Firebase oturumu doğrulanamadı. Lütfen nxkfoc@gmail.com ile yeniden giriş yapın.");
  }
}
