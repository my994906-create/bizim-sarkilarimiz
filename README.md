# Bizim Şarkılarımız

**Bizim Şarkılarımız**, yalnızca arşiv sahibinin eklediği parçaları gösteren; telefon ana ekranına kurulabilen, kişisel bir dinleme PWA’sıdır. Dinleme yüzeyi Spotify’dan esinlenen, ferah ve uygulama odaklı bir arayüz sunar. Merkezi katalog Firestore’dan canlı okunur; bu nedenle yeni yayımlanan parçalar dinleme sayfasında yenileme gerektirmeden görünür.

| Alan | Davranış |
| --- | --- |
| Dinleme | Parça oynatma, 15 saniye ileri/geri sarma, arama, kategori filtreleri ve cihazda saklanan beğeniler bulunur. |
| Parça detayları | Kapak görseli, tür etiketi ve sözler için erişilebilir bir ayrıntı penceresi sağlanır. |
| Yayın kontrolü | Yönetimde yayımlanmamış olarak bırakılan parçalar ortak katalogda korunur ancak dinleme PWA’sında gösterilmez. |
| Yönetim | Kullanıcıya açık yükleme alanı yoktur. Ayrı yönetim kaynağı yalnızca `nxkfoc@gmail.com` Firebase hesabıyla açılır. |
| PWA | Uygulama ana ekrana eklenebilir; mobil alt gezinme ve yatay taşmayı önleyen yerleşim kullanır. |

## Ücretsiz hibrit mimari

> Bu uygulama **Firebase Storage kullanmaz** ve **Blaze planı ya da ücretli Firebase özelliği gerektirmez**. Firestore yalnızca ortak katalog verisini tutar; ses ve kapak dosyaları güvenli uygulama depolamasına yüklenir.

| Katman | Kullanım |
| --- | --- |
| Firestore | Başlık, sanatçı, kategori, tür, söz, yayın durumu ve medya bağlantıları. |
| Firebase Authentication | Yönetim arayüzünde yalnızca `nxkfoc@gmail.com` hesabı için ücretsiz Google girişi. |
| Güvenli medya depolaması | Ses dosyaları en fazla 25 MB, kapak görselleri en fazla 5 MB. |
| GitHub Pages | Kullanıcıya açık dinleme PWA’sı: [canlı bağlantı](https://my994906-create.github.io/bizim-sarkilarimiz/). |

## Ayrı yönetim uygulaması

Yönetim uygulamasının kaynak kodu ayrı depoda tutulur: [bizim-sarkilarimiz-yonetim](https://github.com/my994906-create/bizim-sarkilarimiz-yonetim). Bu kaynak, ses dosyası, kapak, şarkı adı, sanatçı, tür, söz ve yayın durumu girişlerini ortak Firestore kataloğuna güvenli biçimde gönderir.

## Yerelde çalıştırma

```bash
pnpm install
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

## Ana ekrana ekleme

| Cihaz | Yol |
| --- | --- |
| Android / Chrome | Dinleme uygulamasındaki **Uygulamayı yükle** düğmesini kullanın. Görünmezse tarayıcı menüsünden **Ana ekrana ekle** seçeneğini seçin. |
| iPhone / Safari | Paylaş simgesinden **Ana Ekrana Ekle** seçeneğini kullanın. |
| Masaüstü Chrome/Edge | Adres çubuğundaki yükleme simgesini veya uygulamadaki **Uygulamayı yükle** düğmesini kullanın. |
