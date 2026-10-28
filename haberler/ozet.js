/* Günlük özet verisi. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   tarih:    "YYYY-AA-GG" (özetin günü)
   haberler: sırayla yazılır, kategori ilk göründüğü yerde bölüm açar.
   Her haber: { kategori, metin, kaynak, url }  (kaynak ve url isteğe bağlı)
*/
window.OZET = {
  tarih: "2026-10-28",
  haberler: [
    { kategori: "Dünya", metin: "İspanya'da iki hızlı tren çarpıştı: 64 kişi hayatını kaybetti.", kaynak: "bbc türkçe" },
    { kategori: "Dünya", metin: "Brezilya'da seçimleri kaybeden Bolsonaro ülkeden kaçtı.", kaynak: "dw türkçe" },

    { kategori: "Siyaset", metin: "İsrail seçimlerinde Netanyahu önde, Arap partileri kilit rol oynuyor.", kaynak: "diken" },
    { kategori: "Siyaset", metin: "Fon soruşturmasında AKP'li vekilin eşinin şirketlerine konulan tedbir kararı kaldırıldı.", kaynak: "artı gerçek" },

    { kategori: "Ekonomi", metin: "Fon Koordinasyon Kurulu 68 milyar lira ödeme yaptı.", kaynak: "evrensel" },
    { kategori: "Ekonomi", metin: "Kademeli emeklilik teklifi Meclis Komisyonu'na sevk edildi.", kaynak: "birgün" },

    { kategori: "Toplum", metin: "Soma madencilerine polis saldırısı: \"Bizi kimse yolumuzdan çeviremez.\"", kaynak: "sendika.org" },
    { kategori: "Toplum", metin: "Bakırköy Belediyesi'ne operasyon: 62 kişi hakkında gözaltı kararı.", kaynak: "evrensel" },

    { kategori: "Yerel", metin: "Üsküdar'da 2 İETT otobüsü çarpıştı: 4 yolcu yaralandı.", kaynak: "birgün" },
    { kategori: "Yerel", metin: "RTÜK'ten Sözcü TV ve Koza TV'ye idari para cezası.", kaynak: "bianet" }
  ]
};
