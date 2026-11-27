# Ürün Vitrini ve Otomatik Yayınlama

Bu klasör `https://bmenderes.github.io/` ana sayfasında listelenen ürünleri ve otomatik yayın verisini içerir.

- `katalog.json`: Ürünler için isteğe bağlı iki dilli (TR/EN) başlık, açıklama, öne çıkarma (`featured`), kurulum notu ve kaynak kod link gizleme (`hideSourceLink`) ayarları.
- `urunler.js`: `.github/workflows/urunler.yml` tarafından `otomasyon/urunler.mjs` çalıştırılarak otomatik üretilir (elle düzenlemeyin).
- `app.js`: Ana sayfanın ürün kartlarını, platform filtrelerini ve indirme düğmelerini oluşturur.

## Yeni Ürün Ekleme
1. Açık (public) bir depoya `urun` (veya `aktapokus`) topic'i ekleyin ya da bir **GitHub Release** yayınlayın — sayfa otomatik algılar ve listeler.
2. Kaynağını gizli tutmak istediğiniz kapalı ürünler için ise derlenmiş paketi doğrudan `bmenderes/bmenderes.github.io` altında `<urun-adi>-v0.1.0` biçimli bir etiketle GitHub Release olarak yayınlayın (`hidude-v0.1.0` örneği gibi).
