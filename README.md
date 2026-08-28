# Bizim Şarkılarımız

**Bizim Şarkılarımız**, yalnızca seçtiğiniz ses dosyalarını çalan; telefon ana ekranına kurulabilen, kişisel bir PWA müzik arşividir. Tasarım dili, koyu mürekkep zemin, plak mercanı etkileşim rengi ve analog plak kapaklarından esinlenen **Gece Vinyli** yaklaşımıdır.

## Özellikler

| Alan | Davranış |
| --- | --- |
| Şarkı ekleme | `Parça ekle` düğmesiyle cihazdan MP3, M4A, WAV, OGG gibi desteklenen ses dosyaları seçilir. Birden fazla dosya aynı anda eklenebilir. |
| Saklama | Ses dosyaları yalnızca ilgili cihazın tarayıcısında saklanır; herhangi bir üçüncü taraf müzik kataloğuna bağlanılmaz. |
| Oynatma | Parça seçme, oynat/duraklat, 15 saniye ileri–geri alma, ses ayarı, parça süresi ve otomatik sıradaki parça geçişi vardır. |
| Yönetim | Her parça arşivden silinebilir. Favori, yorum, sosyal akış veya çalma listesi işlevi yoktur. |
| PWA | Uygulama ana ekrana eklenebilir ve tam ekran uygulama görünümünde açılır. |

> **Not:** Bu sürüm statik GitHub Pages mimarisindedir. Bu nedenle tarayıcıdan eklenen şarkılar yalnızca ekleyen kişinin cihazında görünür. Aynı arşivi başka bir cihazla otomatik paylaşmak için dosya depolama ve kullanıcı erişimi olan bir sunucu katmanı gerekir.

## Yerelde çalıştırma

Önce bağımlılıkları yükleyin, sonra geliştirme sunucusunu başlatın.

```bash
pnpm install
pnpm dev
```

Tür denetimi ve üretim derlemesi için aşağıdaki komutlar kullanılabilir.

```bash
pnpm check
pnpm build
```

## GitHub Pages’te yayınlama

Proje `main` dalına her gönderildiğinde `.github/workflows/deploy-pages.yml` iş akışı otomatik çalışır. GitHub’da depo ayarlarından **Settings → Pages** bölümünü açın ve dağıtım kaynağı olarak **GitHub Actions** seçeneğinin etkin olduğundan emin olun. İlk başarılı çalışmanın sonunda bağlantı, işlemin özet ekranında ve **Settings → Pages** bölümünde görünür.

## Ana ekrana ekleme

| Cihaz | Yol |
| --- | --- |
| Android / Chrome | Uygulamadaki `Uygulamayı yükle` düğmesine dokunun. Düğme görünmezse tarayıcı menüsünden **Ana ekrana ekle** seçeneğini kullanın. |
| iPhone / Safari | Paylaş simgesine, ardından **Ana Ekrana Ekle** seçeneğine dokunun. |
| Masaüstü Chrome/Edge | Adres çubuğundaki yükleme simgesini ya da uygulamadaki `Uygulamayı yükle` düğmesini kullanın. |

## Teknik yapı

Uygulama React 19, TypeScript, Vite ve Tailwind CSS ile hazırlanmıştır. Ses dosyaları tarayıcının IndexedDB deposunda saklanır; PWA kabuğu `manifest.webmanifest` ve `sw.js` ile sunulur. GitHub Pages dağıtımı, üretim klasörü olan `dist/public` dizininden yapılır.

