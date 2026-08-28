# Bizim Şarkılarımız — Tasarım Yönü

## Üç Tasarım Yaklaşımı

| Tema Adı | Çok Kısa Giriş | Olasılık |
| --- | --- | --- |
| Gece Vinyli | Koyu mürekkep zeminde vinil dokuları ve sıcak mercan vurgularıyla, kişisel bir müzik arşivi hissi yaratır. Duygu yoğun ama gösterişsizdir. | 0.07 |
| Analog Mektup | Krem kâğıt, bordo mürekkep ve küçük el yazısı izleriyle albüm notu estetiğini dijitale taşır. Daha sakin, gündüz ışığında bir koleksiyon deneyimidir. | 0.04 |
| Sessiz Kaset | Yumuşak sis mavisi, soluk lavanta ve yarı saydam katmanlarla nostaljik ama ferah bir ses arşivi hissi verir. Arayüz sade, içeriğin kendisi ön plandadır. | 0.09 |

## Seçilen Yaklaşım: Gece Vinyli

### Tasarım Hareketi

**Gece Vinyli**, 1970’lerin analog plak kapaklarından ve çağdaş editoryal müzik uygulamalarından beslenen, **neo-analog editorial** bir yaklaşımdır. Romantizmi kalp, hediye veya karşılama ritüelleriyle değil; parçaları saklanan kişisel bir arşiv gibi sunarak taşır.

### Temel İlkeler

1. **Koleksiyon önce gelir:** Ana ekran bir tanıtım alanı değil, doğrudan müzik kütüphanesidir.
2. **Analog izler, dijital berraklık:** Vinil olukları, hafif gren ve geniş renk lekeleri modern kontrol yüzeyleriyle dengelenir.
3. **Asimetrik odak:** Sabit sol ray, akışkan parça listesi ve sağda baskın “şimdi çalıyor” alanı dinleme eylemini katmanlı kılar.
4. **Sessiz duygusallık:** Kopyalar kısa, kişisel ve işlevsel olur; abartılı romantik sloganlara yer verilmez.

### Renk Felsefesi

Temel zemin **mürekkep siyahı** ve koyu erik tonudur; bu koyuluk gece dinleme deneyiminin mahremiyetini taşır. İmza rengi olan **plak mercanı**, odak, ses seviyesi ve oynatma durumlarında sıcak bir enerji verir. Soluk kemik beyazı metinlerde ve arka plan parçacıklarında kullanılarak ekranın yorucu olmayan, basılı bir albüm kapağı hissi korunur.

### Yerleşim Paradigması

Uygulama, klasik ortalanmış bir ana sayfa yerine **müzik stüdyosu masası** gibi tasarlanır: geniş ekranda sol tarafta dar araç rayı, ortada değişken kütüphane alanı, sağ tarafta sabitçe görülebilen kayıt/çalma ünitesi bulunur. Mobilde ray üstte ince bir bilgi bandına dönüşür; oynatıcı ekranın altına fiziksel bir kontrol modülü gibi yerleşir.

### İmza Öğeleri

1. **Vinil halo:** Çalmakta olan parça kapağının çevresinde dönen, ince oluk çizgilerinden oluşan halka.
2. **Ses şeridi:** Alt oynatıcıda, ilerlemeyi vurgulayan mercan renkli kavisli dalga formu.
3. **Köşe notları:** Tarih, parça sayısı ve yükleme ipucunu taşıyan küçük, tek satırlı editoryal etiketler.

### Etkileşim Felsefesi

Etkileşimler bir ses masasının netliğini yansıtır: parça satırına basmak doğrudan çalar; büyük oynat düğmesi anında tepki verir; ses ve ilerleme çubukları görsel olarak belirgin ama sakin davranır. İşlevi olmayan sosyal, favori ya da liste oluşturma kontrolleri eklenmez.

### Animasyon

Oynat düğmesi basıldığında 140 ms’lik hafif bir sıkışma uygular. Etkin parça satırı 180 ms içinde mercan çizgiye ve koyu yüzeye geçer. Vinil halo yalnızca parça çalarken yavaşça döner; hareket tercihini azaltan kullanıcılar için bu efekt devre dışı kalır. Sayfa girişlerinde kısa, 40–60 ms kademeli opaklık geçişleri kullanılır; uzun ya da dikkat dağıtan animasyonlardan kaçınılır.

### Tipografi Sistemi

Başlıklar için **DM Serif Display**, analog kapak estetiğini zarif ama okunaklı şekilde taşır. Arayüz metinleri ve sayısal bilgiler için **Manrope** kullanılır. Parça adları 500–600 ağırlıkta, sanatçı ve teknik bilgiler daha dar harf aralığı ile küçük puntoda konumlanır. Uygulama genelinde Inter kullanılmaz.

### Marka Özü

**Bizim Şarkılarımız, yalnızca sizin eklediğiniz parçaları sakin ve özenli bir arşiv deneyiminde dinletmek için tasarlanmış kişisel bir PWA’dır.**

Kişilik: **mahrem, seçkin, sıcak**.

### Marka Sesi

Başlıklar kısa ve içerik odaklıdır; çağrılar komut verir ama acele ettirmez. Mikro kopyalar sahiplik hissini güçlendirir, ancak romantik klişelerden kaçınır.

Örnekler:

> “Arşiv açık.”

> “Bir parçaya dokun; gerisini ses halletsin.”

### Sözcük İşareti ve Logo

Logo, minik bir **plak oluğu ve iğne izi** birleşiminden oluşan metinsiz, sağlam bir semboldür. Sözcük işareti DM Serif Display’in özelleştirilmiş karakter oranlarıyla, uygulama adı için ayrı bir marka varlığı olarak kullanılacaktır.

### İmza Marka Rengi

**Plak Mercanı — `#F06B5E`**. Sıcak ama parlak olmayan bu renk, yalnızca oynatma, ilerleme ve seçili durumları işaretler.

## Style Decisions

### Verdant Pulse Güncellemesi

Canlı uygulama, kişisel arşiv odağını koruyarak daha **ferah ve uygulama tabanlı** bir görsel sisteme geçti. Kireç yeşili, yumuşak nane, soluk lila ve sıcak beyaz yüzeyler; yalnızca aktif durumlarda koyu orman yeşiliyle dengelenir. Geniş ekranlarda kalıcı sol uygulama menüsü, mobilde ise üç öğeli alt gezinme kullanılır. Arama, kategori filtreleri ve beğenilen şarkılar arayüzün ana düzeydeki, erişilebilir işlevleridir.
