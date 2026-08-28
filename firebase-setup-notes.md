# Firebase Kurulum Notu

Ortak şarkı arşivi için Firebase Console’da **Nxkföc (nxkfoc@gmail.com)** hesabı doğrulandı. Bu hesap altında oluşturulacak ortak projenin görünen adı **Sarkilar Arsivi NXKFOC**, benzersiz proje kimliği ise **sarkilar-arsivi-nxkfoc** olarak belirlendi.

Bu proje, dinleme uygulaması ile ayrı yönetim uygulamasının kullanacağı ortak şarkı metadatası, kapak görselleri, ses dosyaları ve sözler için tasarlanacaktır.

Kurulum sırasında bu müzik arşivi için gerekli olmayan Firebase’de Gemini seçeneği kapatıldı. Google Analytics seçeneği de yalnızca gerekli hizmetler etkin kalacak şekilde değerlendirilmektedir.

Cloud Firestore üretim modunda oluşturuldu ve `eur3` çoklu bölgesinde çalışmaktadır. Dinleme uygulamasına katalog okuma izni, yönetim tarafına ise yalnızca `nxkfoc@gmail.com` hesabı için yazma yetkisi veren kurallar kullanıcı tarafından yayımlandı.

Firebase Storage, Spark ücretsiz planında ses veya kapak dosyası depolamayı desteklemediği için kullanılmayacaktır. Ses ve kapak dosyaları, mevcut korumalı proje depolamasında; katalog, söz ve tür verileri ise ücretsiz Firestore katmanında tutulacaktır.

Dinleme ve yönetim uygulamalarında ortak kullanılmak üzere **Bizim Şarkılarımız Ortak Katalog** adlı Firebase web uygulaması kaydedildi. Firebase Hosting özellikle etkinleştirilmedi; yayın GitHub Pages akışı üzerinden sürdürülecektir.

Web uygulaması yapılandırması: proje kimliği `sarkilar-arsivi-nxkfoc`, yetkilendirme alan adı `sarkilar-arsivi-nxkfoc.firebaseapp.com`, mesajlaşma gönderici kimliği `164724212145`, uygulama kimliği `1:164724212145:web:f297cbab90759fc635fd90` ve genel istemci API anahtarı `AIzaSyAKFZjNfpn0fTu1wP5BXECio4MiY3Rkx0w` olarak doğrulandı.

Firebase Authentication altında ücretsiz Google sağlayıcısı etkinleştirildi. Kullanıcıya görünen proje adı `Bizim Şarkılarımız`, proje destek e-postası `nxkfoc@gmail.com` olarak kaydedildi; Firebase konsolu sağlayıcı durumunu `Enabled` olarak gösteriyor. Bu adımda Blaze, Firebase Storage veya ücretli bir özellik açılmadı.

Google ile girişin çalışması için Firebase Authentication > Ayarlar > Yetkilendirilmiş alanlar listesi doğrulandı. Varsayılan olarak `localhost`, `sarkilar-arsivi-nxkfoc.firebaseapp.com` ve `sarkilar-arsivi-nxkfoc.web.app` listeleniyor; GitHub Pages dinleme alan adı `my994906-create.github.io` özel yetkili alan adı olarak eklendi.
