import { ArchiveTrack, firestore, toArchiveTrack } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query as firestoreQuery } from "firebase/firestore";
import { BookOpen, Download, Heart, Home as HomeIcon, Library, Loader2, Pause, Play, RotateCcw, RotateCw, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Mode = "home" | "search" | "liked";
type DeferredInstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const categories = [
  { value: "all", label: "Tümü" },
  { value: "sakin", label: "Sakin" },
  { value: "enerji", label: "Enerji" },
  { value: "gece", label: "Gece" },
  { value: "yol", label: "Yol" },
  { value: "diger", label: "Diğer" },
] as const;

const categoryLabels: Record<string, string> = {
  sakin: "Sakin",
  enerji: "Enerji",
  gece: "Gece",
  yol: "Yol",
  diger: "Diğer",
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("all");
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("bizim-sarkilarimiz-liked") ?? "[]").map(String) as string[]; } catch { return []; }
  });
  const [tracks, setTracks] = useState<ArchiveTrack[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [lyricsTrack, setLyricsTrack] = useState<ArchiveTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks.find(track => track.id === currentTrackId) ?? null;
  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return tracks.filter(track => {
      const matchesQuery = !normalized || `${track.title} ${track.artist} ${track.genre}`.toLocaleLowerCase("tr-TR").includes(normalized);
      const matchesCategory = category === "all" || track.category === category;
      const matchesMode = mode !== "liked" || likedIds.includes(track.id);
      return matchesQuery && matchesCategory && matchesMode;
    });
  }, [tracks, query, category, mode, likedIds]);

  useEffect(() => {
    localStorage.setItem("bizim-sarkilarimiz-liked", JSON.stringify(likedIds));
  }, [likedIds]);

  useEffect(() => {
    const unsubscribe = onSnapshot(firestoreQuery(collection(firestore, "tracks"), orderBy("createdAtMs", "desc")), snapshot => {
      setTracks(snapshot.docs.map(item => toArchiveTrack(item.id, item.data())).filter(track => track.published));
      setCatalogLoading(false);
      setCatalogError(false);
    }, () => {
      setCatalogLoading(false);
      setCatalogError(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const prompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as DeferredInstallPrompt); };
    window.addEventListener("beforeinstallprompt", prompt);
    return () => window.removeEventListener("beforeinstallprompt", prompt);
  }, []);

  useEffect(() => {
    if (mode === "search") requestAnimationFrame(() => searchRef.current?.focus());
  }, [mode]);

  useEffect(() => {
    if (!tracks.length) { setCurrentTrackId(null); return; }
    if (!currentTrackId || !tracks.some(track => track.id === currentTrackId)) setCurrentTrackId(tracks[0].id);
  }, [tracks, currentTrackId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const targetUrl = new URL(currentTrack.audioUrl, window.location.origin).href;
    if (audio.src !== targetUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }
    setCurrentTime(0);
  }, [currentTrack?.id]);

  function selectTrack(trackId: string) {
    const audio = audioRef.current;
    if (trackId === currentTrackId && audio) {
      if (audio.paused) void audio.play().catch(() => toast.error("Bu parça şu anda çalınamadı."));
      else audio.pause();
      return;
    }
    const targetTrack = tracks.find(track => track.id === trackId);
    if (!audio || !targetTrack) return;
    audio.src = targetTrack.audioUrl;
    audio.load();
    setCurrentTrackId(trackId);
    void audio.play().catch(() => toast.error("Bu parça şu anda çalınamadı."));
  }

  function toggleLiked(trackId: string) {
    setLikedIds(existing => existing.includes(trackId) ? existing.filter(id => id !== trackId) : [...existing, trackId]);
  }

  function seekBy(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
  }

  async function installApp() {
    if (!installPrompt) { toast.message("Tarayıcı menüsünden ‘Ana ekrana ekle’ seçeneğini kullanın."); return; }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") toast.success("Uygulama ana ekrana eklendi.");
    setInstallPrompt(null);
  }

  const pageTitle = mode === "liked" ? "Beğenilenler" : mode === "search" ? "Arama" : "Kütüphanen";
  const sectionTitle = mode === "liked" ? "Beğenilen şarkılar" : mode === "search" ? "Arama sonuçları" : "Tüm şarkılar";
  const progress = currentTrack?.durationSeconds ? Math.min((currentTime / currentTrack.durationSeconds) * 100, 100) : 0;

  return (
    <div className="music-app">
      <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { const index = tracks.findIndex(track => track.id === currentTrackId); if (index >= 0 && tracks.length > 1) setCurrentTrackId(tracks[(index + 1) % tracks.length].id); }} />
      <aside className="music-sidebar">
        <a className="music-brand" href="/" aria-label="Bizim Şarkılarımız ana sayfa"><span className="brand-record">◉</span><span><strong>Bizim Şarkılarımız</strong><small>Kişisel arşiv</small></span></a>
        <nav className="music-nav" aria-label="Uygulama navigasyonu">
          <button className={mode === "home" ? "is-active" : ""} onClick={() => setMode("home")}><HomeIcon size={18} /> Ana sayfa</button>
          <button className={mode === "search" ? "is-active" : ""} onClick={() => setMode("search")}><Search size={18} /> Arama</button>
          <button className={mode === "liked" ? "is-active liked-nav" : "liked-nav"} onClick={() => setMode("liked")}><Heart size={18} /> Beğenilen şarkılar</button>
        </nav>
        <div className="sidebar-footer"><span className="status-dot" /> Şarkıların uzaktan güncellenir</div>
      </aside>

      <main className="music-content">
        <header className="music-topbar"><div><p className="kicker">Müzik alanın</p><h1>{pageTitle}</h1></div><button className="install-button" type="button" onClick={() => void installApp()}><Download size={16} /><span>Uygulamayı yükle</span></button></header>

        {mode === "home" && <section className="library-hero"><div><p className="kicker">Günün akışı</p><h2>Dinlemek istediğin her şey, tek yerde.</h2><p>Parçalarını ara, ruh haline göre ayır ve sevdiklerini ayrı bir rafta tut.</p></div><div className="hero-count"><strong>{tracks.length}</strong><span>parça arşivde</span></div></section>}

        <section className="library-toolbar" aria-label="Kütüphane araçları"><label className="search-box"><Search size={18} /><input ref={searchRef} type="search" value={query} onChange={event => { setQuery(event.target.value); if (event.target.value && mode !== "search") setMode("search"); }} placeholder="Şarkılarda ara" aria-label="Şarkılarda ara" /></label></section>
        <div className="category-chips" aria-label="Kategoriler">{categories.map(item => <button key={item.value} className={category === item.value ? "is-active" : ""} onClick={() => setCategory(item.value)}>{item.label}</button>)}</div>

        <section className="library-section"><div className="section-header"><h2>{sectionTitle}</h2><span>{filteredTracks.length} parça</span></div>
          {catalogLoading ? <div className="empty-state"><Loader2 className="animate-spin" /><div><h3>Arşiv açılıyor</h3><p>Uzaktaki şarkılar hazırlanıyor.</p></div></div> : catalogError ? <div className="empty-state"><Library /><div><h3>Arşiv şu an açılamadı.</h3><p>Lütfen bağlantınızı kontrol edip sayfayı yenileyin.</p></div></div> : filteredTracks.length ? <div className="remote-track-list">{filteredTracks.map((track, index) => {
            const current = track.id === currentTrackId;
            const liked = likedIds.includes(track.id);
            return <article className={current ? "remote-track is-current" : "remote-track"} key={track.id}><button className={`track-cover cover-${index % 4}`} type="button" onClick={() => selectTrack(track.id)} aria-label={`${track.title} parçasını çal`}>{track.coverUrl ? <img src={track.coverUrl} alt="" /> : current && isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><button className="track-info" type="button" onClick={() => selectTrack(track.id)}><strong>{track.title}</strong><span>{track.artist} · {track.genre || categoryLabels[track.category]}</span></button>{track.lyrics ? <button className="lyrics-trigger" type="button" onClick={() => setLyricsTrack(track)} aria-label={`${track.title} sözlerini aç`}><BookOpen size={16} /></button> : null}<span className="track-duration">{formatTime(track.durationSeconds)}</span><button className={liked ? "like-button is-liked" : "like-button"} type="button" onClick={() => toggleLiked(track.id)} aria-label={`${track.title} parçasını beğen`}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button></article>;
          })}</div> : <div className="empty-state"><div className="empty-record">◉</div><div><h3>{mode === "liked" ? "Henüz beğenilen yok." : query ? "Sonuç bulunamadı." : "Arşiv hazırlanıyor."}</h3><p>{mode === "liked" ? "Bir parçadaki kalp simgesine dokun; burada her zaman ulaşabilirsin." : query ? "Farklı bir kelime veya kategori deneyebilirsin." : "Şarkılar yönetim alanından uzaktan eklendiğinde burada görünür."}</p></div></div>}
        </section>
      </main>

      <section className={currentTrack ? "mini-player" : "mini-player is-hidden"} aria-label="Şimdi çalıyor"><div className="mini-cover">{currentTrack?.coverUrl ? <img src={currentTrack.coverUrl} alt="" /> : "♪"}</div><div className="mini-details"><strong>{currentTrack?.title ?? "Bir parça seç"}</strong><span>{currentTrack?.artist ?? "Kişisel arşivin"}</span></div>{currentTrack?.lyrics ? <button className="lyrics-trigger mini-lyrics" type="button" onClick={() => setLyricsTrack(currentTrack)} aria-label="Şarkı sözlerini aç"><BookOpen size={16} /></button> : null}<div className="mini-seek"><span>{formatTime(currentTime)}</span><input type="range" min="0" max={Math.max(currentTrack?.durationSeconds ?? 0, 1)} step="0.1" value={Math.min(currentTime, currentTrack?.durationSeconds ?? 0)} onChange={event => { const next = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = next; setCurrentTime(next); }} style={{ "--progress": `${progress}%` } as React.CSSProperties} aria-label="Parça ilerlemesi" /><span>{formatTime(currentTrack?.durationSeconds ?? 0)}</span></div><div className="mini-controls"><button type="button" onClick={() => seekBy(-15)} aria-label="15 saniye geri"><RotateCcw size={16} /></button><button className="main-play" type="button" onClick={() => selectTrack(currentTrack?.id ?? "")} aria-label={isPlaying ? "Duraklat" : "Oynat"}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><button type="button" onClick={() => seekBy(15)} aria-label="15 saniye ileri"><RotateCw size={16} /></button></div></section>

      <nav className="mobile-music-nav" aria-label="Mobil navigasyon"><button className={mode === "home" ? "is-active" : ""} onClick={() => setMode("home")}><HomeIcon size={18} /><span>Ana sayfa</span></button><button className={mode === "search" ? "is-active" : ""} onClick={() => setMode("search")}><Search size={18} /><span>Arama</span></button><button className={mode === "liked" ? "is-active" : ""} onClick={() => setMode("liked")}><Heart size={18} /><span>Beğenilen</span></button></nav>
      {lyricsTrack ? <div className="lyrics-sheet" role="presentation" onClick={() => setLyricsTrack(null)}><section className="lyrics-dialog" role="dialog" aria-modal="true" aria-label={`${lyricsTrack.title} şarkı sözleri`} onClick={event => event.stopPropagation()}>{lyricsTrack.coverUrl ? <img src={lyricsTrack.coverUrl} alt="" /> : <div className="lyrics-record">♪</div>}<div className="lyrics-heading"><div><p className="kicker">{lyricsTrack.genre || categoryLabels[lyricsTrack.category]}</p><h2>{lyricsTrack.title}</h2><span>{lyricsTrack.artist}</span></div><button type="button" onClick={() => setLyricsTrack(null)} aria-label="Sözleri kapat"><X size={19} /></button></div><pre>{lyricsTrack.lyrics}</pre></section></div> : null}
    </div>
  );
}
