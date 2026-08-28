import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKFZjNfpn0fTu1wP5BXECio4MiY3Rkx0w",
  authDomain: "sarkilar-arsivi-nxkfoc.firebaseapp.com",
  projectId: "sarkilar-arsivi-nxkfoc",
  appId: "1:164724212145:web:f297cbab90759fc635fd90",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
export const archiveEditorEmail = "nxkfoc@gmail.com";

export type ArchiveTrack = {
  id: string;
  title: string;
  artist: string;
  category: string;
  genre: string;
  lyrics: string;
  audioUrl: string;
  coverUrl: string | null;
  published: boolean;
  durationSeconds: number;
  createdAtMs: number;
};

export function toArchiveTrack(id: string, value: Record<string, unknown>): ArchiveTrack {
  return {
    id,
    title: typeof value.title === "string" ? value.title : "Adsız şarkı",
    artist: typeof value.artist === "string" ? value.artist : "Bizim Şarkılarımız",
    category: typeof value.category === "string" ? value.category : "diger",
    genre: typeof value.genre === "string" ? value.genre : "",
    lyrics: typeof value.lyrics === "string" ? value.lyrics : "",
    audioUrl: typeof value.audioUrl === "string" ? value.audioUrl : "",
    coverUrl: typeof value.coverUrl === "string" ? value.coverUrl : null,
    published: typeof value.published === "boolean" ? value.published : true,
    durationSeconds: typeof value.durationSeconds === "number" ? value.durationSeconds : 0,
    createdAtMs: typeof value.createdAtMs === "number" ? value.createdAtMs : 0,
  };
}

export async function ensureArchiveEditor() {
  if (firebaseAuth.currentUser?.email === archiveEditorEmail) return firebaseAuth.currentUser;
  if (firebaseAuth.currentUser) await signOut(firebaseAuth);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(firebaseAuth, provider);

  if (result.user.email !== archiveEditorEmail) {
    await signOut(firebaseAuth);
    throw new Error("Yalnızca nxkfoc@gmail.com hesabı arşivi düzenleyebilir.");
  }

  return result.user;
}
