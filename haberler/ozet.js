/* Günlük özet verisi. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   tarih:    "YYYY-AA-GG" (özetin günü)
   haberler: sırayla yazılır, kategori ilk göründüğü yerde bölüm açar.
   Her haber: { kategori, metin, kaynak, url }  (kaynak ve url isteğe bağlı)
*/
window.OZET = {
  tarih: "",
  haberler: []
};
