import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveEditorEmail, ArchiveTrack, ensureArchiveEditor, firebaseAuth, firestore, toArchiveTrack } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { FileAudio, ImagePlus, Loader2, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;
const categories = [
  { value: "sakin", label: "Sakin" },
  { value: "enerji", label: "Enerji" },
  { value: "gece", label: "Gece" },
  { value: "yol", label: "Yol" },
  { value: "diger", label: "Diğer" },
] as const;

async function getAudioDuration(file: File) {
  return new Promise<number>(resolve => {
    const probe = document.createElement("audio");
    const url = URL.createObjectURL(file);
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration) ? Math.round(probe.duration) : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    probe.src = url;
  });
}

async function toBase64(file: File) {
  const data = await file.arrayBuffer();
  const bytes = new Uint8Array(data);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(index, index + 0x8000)));
  }
  return btoa(binary);
}

function titleFromFilename(filename: string) {
  return filename.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[._-]+/g, " ").trim();
}

export default function AdminLibrary() {
  const [tracks, setTracks] = useState<ArchiveTrack[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [editorEmail, setEditorEmail] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Bizim Şarkılarımız");
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("diger");
  const [genre, setGenre] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [published, setPublished] = useState(true);

  const upload = trpc.music.upload.useMutation({
    onSuccess: () => {
      setFile(null);
      setCoverFile(null);
      setTitle("");
      setGenre("");
      setLyrics("");
      setPublished(true);
    },
  });

  const uploadLabel = useMemo(() => file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : "Bir ses dosyası seçin", [file]);
  const coverLabel = useMemo(() => coverFile ? `${coverFile.name} · ${(coverFile.size / 1024 / 1024).toFixed(1)} MB` : "Bir kapak görseli seçin (isteğe bağlı)", [coverFile]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestore, "tracks"), orderBy("createdAtMs", "desc")), snapshot => {
      setTracks(snapshot.docs.map(item => toArchiveTrack(item.id, item.data())));
      setCatalogLoading(false);
    }, () => setCatalogLoading(false));
    return unsubscribe;
  }, []);

  useEffect(() => onAuthStateChanged(firebaseAuth, currentUser => {
    setEditorEmail(currentUser?.email === archiveEditorEmail ? currentUser.email : null);
    setFirebaseLoading(false);
  }), []);

  async function onFirebaseLogin() {
    try {
      const editor = await ensureArchiveEditor();
      setEditorEmail(editor.email);
      toast.success("Firebase yönetim oturumu açıldı.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Firebase girişi açılamadı.");
    }
  }

  function onSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!selected.type.startsWith("audio/")) {
      toast.error("Lütfen MP3, M4A, WAV veya benzeri bir ses dosyası seçin.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_AUDIO_BYTES) {
      toast.error("Her ses dosyası en fazla 25 MB olabilir.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setTitle(current => current || titleFromFilename(selected.name));
  }

  function onSelectCover(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error("Kapak JPEG, PNG veya WebP olmalıdır.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_COVER_BYTES) {
      toast.error("Kapak görseli en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }
    setCoverFile(selected);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast.error("Önce bir ses dosyası seçin.");
      return;
    }
    try {
      const editor = await ensureArchiveEditor();
      const firebaseIdToken = await editor.getIdToken(true);
      const [base64, durationSeconds, coverBase64] = await Promise.all([toBase64(file), getAudioDuration(file), coverFile ? toBase64(coverFile) : Promise.resolve(null)]);
      const result = await upload.mutateAsync({
        firebaseIdToken,
        mediaOrigin: window.location.origin,
        filename: file.name,
        mimeType: file.type || "audio/mpeg",
        base64,
        title,
        artist,
        category,
        genre,
        lyrics,
        published,
        cover: coverFile && coverBase64 ? { filename: coverFile.name, mimeType: coverFile.type, base64: coverBase64 } : undefined,
        durationSeconds,
      });
      const trackDocument = doc(collection(firestore, "tracks"));
      await setDoc(trackDocument, { ...result.track, createdAtMs: Date.now(), updatedAtMs: Date.now() });
      toast.success("Şarkı, kapağı ve bilgileri ortak arşive eklendi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Şarkı yüklenemedi. Lütfen tekrar deneyin.");
    }
  }

  async function onRemove(trackId: string, titleToRemove: string) {
    if (!window.confirm(`“${titleToRemove}” uzaktaki arşivden kaldırılsın mı?`)) return;
    try {
      await ensureArchiveEditor();
      await deleteDoc(doc(firestore, "tracks", trackId));
      toast.success("Şarkı katalogdan kaldırıldı.");
    } catch {
      toast.error("Şarkı kaldırılamadı.");
    }
  }

  if (firebaseLoading) {
    return <div className="admin-loading"><Loader2 className="animate-spin" /> Yönetim alanı açılıyor…</div>;
  }

  return (
    <section className="admin-page">
        <header className="admin-heading">
          <div>
            <p className="admin-kicker"><ShieldCheck size={14} /> Korumalı yönetim</p>
            <h1>Uzaktan şarkı arşivi</h1>
            <p>Buradan yüklenen parçalar dinleme uygulamasına otomatik olarak eklenir.</p>
          </div>
          <div className="admin-owner">{editorEmail ?? "Firebase girişi gerekli"}</div>
        </header>

        {!editorEmail ? (
          <div className="admin-access-note"><ShieldCheck size={20} /><div><strong>Bu alan yalnızca proje sahibine açıktır.</strong><p>Devam etmek için Firebase üzerinden `nxkfoc@gmail.com` hesabıyla giriş yapın.</p><Button type="button" className="admin-login" onClick={() => void onFirebaseLogin()}>Google ile güvenli giriş</Button></div></div>
        ) : (
          <>
            <form className="upload-card" onSubmit={onSubmit}>
              <div className="upload-card-heading"><UploadCloud size={20} /><div><h2>Yeni parça yükle</h2><p>Bu yönetim uygulamasına eklenen ses, kapak, söz ve tür bilgisi dinleme uygulamasında hemen görünür.</p></div></div>
              <div className="upload-grid">
                <label className="file-picker"><FileAudio size={18} /><span>{uploadLabel}</span><input type="file" accept="audio/*" onChange={onSelectFile} /></label>
                <label className="file-picker"><ImagePlus size={18} /><span>{coverLabel}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onSelectCover} /></label>
                <div className="field"><Label htmlFor="track-title">Şarkı adı</Label><Input id="track-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Örn. Gece Yolculuğu" /></div>
                <div className="field"><Label htmlFor="track-artist">Sanatçı / açıklama</Label><Input id="track-artist" value={artist} onChange={event => setArtist(event.target.value)} /></div>
                <div className="field"><Label htmlFor="track-category">Kategori</Label><select id="track-category" value={category} onChange={event => setCategory(event.target.value as typeof category)}>{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="field"><Label htmlFor="track-genre">Tür</Label><Input id="track-genre" value={genre} onChange={event => setGenre(event.target.value)} placeholder="Örn. Alternatif pop" /></div>
                <div className="field field-full"><Label htmlFor="track-lyrics">Şarkı sözleri</Label><textarea id="track-lyrics" value={lyrics} onChange={event => setLyrics(event.target.value)} placeholder="Sözleri buraya yazın…" rows={7} /></div>
                <label className="publish-row field-full"><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)} /><span><strong>Hemen yayımla</strong><small>Kapalı bırakırsanız kayıt yönetim kataloğunda saklanır; dinleme uygulamasında görünmez.</small></span></label>
              </div>
              <Button type="submit" disabled={!file || upload.isPending} className="admin-submit">{upload.isPending ? <Loader2 className="animate-spin" /> : <UploadCloud />} {upload.isPending ? "Yükleniyor…" : "Uzaktan arşive ekle"}</Button>
            </form>

            <section className="admin-catalog">
              <div className="admin-catalog-heading"><div><p className="admin-kicker">Ortak Firebase kataloğu</p><h2>Eklenen şarkılar</h2></div><span>{tracks.length} parça</span></div>
              {catalogLoading ? <p className="catalog-empty">Katalog yükleniyor…</p> : tracks.length ? <div className="catalog-list">{tracks.map(track => <article className="catalog-row" key={track.id}>{track.coverUrl ? <img className="catalog-cover" src={track.coverUrl} alt="" /> : <div className="catalog-icon"><FileAudio size={18} /></div>}<div><strong>{track.title}</strong><span>{track.artist} · {track.genre || track.category}</span></div><Button variant="ghost" size="icon" aria-label={`${track.title} şarkısını sil`} onClick={() => void onRemove(track.id, track.title)}><Trash2 size={17} /></Button></article>)}</div> : <p className="catalog-empty">Henüz uzaktan eklenmiş bir şarkı yok.</p>}
            </section>
          </>
        )}
    </section>
  );
}
