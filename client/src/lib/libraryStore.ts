/** Gece Vinyli: kişisel arşiv verisi yalnızca kullanıcının cihazındaki IndexedDB'de tutulur. */
export type LibraryTrack = {
  id: string;
  title: string;
  artist: string;
  createdAt: number;
  duration: number;
  mimeType: string;
  blob: Blob;
  objectUrl: string;
};

type StoredTrack = Omit<LibraryTrack, "objectUrl">;

const DB_NAME = "bizim-sarkilarimiz";
const STORE_NAME = "tracks";
const DB_VERSION = 1;

function openLibrary() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[._-]+/g, " ").trim() || "Adsız kayıt";
}

async function durationFromFile(file: File) {
  return new Promise<number>((resolve) => {
    const probe = document.createElement("audio");
    const temporaryUrl = URL.createObjectURL(file);
    const cleanUp = () => URL.revokeObjectURL(temporaryUrl);
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration) ? probe.duration : 0;
      cleanUp();
      resolve(duration);
    };
    probe.onerror = () => {
      cleanUp();
      resolve(0);
    };
    probe.src = temporaryUrl;
  });
}

export async function addToLibrary(file: File): Promise<LibraryTrack> {
  const duration = await durationFromFile(file);
  const storedTrack: StoredTrack = {
    id: crypto.randomUUID(),
    title: titleFromFilename(file.name),
    artist: "Kişisel kayıt",
    createdAt: Date.now(),
    duration,
    mimeType: file.type || "audio/mpeg",
    blob: file,
  };
  const database = await openLibrary();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(storedTrack);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();

  return { ...storedTrack, objectUrl: URL.createObjectURL(storedTrack.blob) };
}

export async function readLibrary(): Promise<LibraryTrack[]> {
  const database = await openLibrary();
  const storedTracks = await new Promise<StoredTrack[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as StoredTrack[]);
    request.onerror = () => reject(request.error);
  });
  database.close();

  return storedTracks
    .sort((first, second) => second.createdAt - first.createdAt)
    .map((track) => ({ ...track, objectUrl: URL.createObjectURL(track.blob) }));
}

export async function removeFromLibrary(id: string) {
  const database = await openLibrary();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
