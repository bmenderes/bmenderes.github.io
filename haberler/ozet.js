/* Günlük özet verisi. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   tarih:    "YYYY-AA-GG" (özetin günü)
   haberler: sırayla yazılır, kategori ilk göründüğü yerde bölüm açar.
   Her haber: { kategori, metin, kaynak, url }  (kaynak ve url isteğe bağlı)
*/
window.OZET = {
  tarih: "2026-10-29",
  haberler: [
    { kategori: "Dünya", metin: "İspanya'da Madrid-Endülüs seferini yapan iki hızlı tren çarpıştı: 68 kişi öldü, üç günlük yas ilan edildi.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce" },
    { kategori: "Dünya", metin: "İsrail seçimlerinde Netanyahu'nun sağcı bloku 53 sandalyede kaldı; 19 sandalye kazanan Arap partileri muhalefete koalisyon çağrısı yaptı.", kaynak: "bianet", url: "https://bianet.org/" },
    { kategori: "Dünya", metin: "Brezilya'da seçimi kaybeden Bolsonaro ailesiyle birlikte ABD'ye gitti; BM Genel Kurulu ABD'nin Küba ambargosunu bitirmesini istedi.", kaynak: "dw türkçe", url: "https://www.dw.com/tr" },

    { kategori: "Siyaset", metin: "29 Ekim mesajlarında Erdoğan \"Türkiye Yüzyılı\" hedefini yinelerken Özgür Özel \"Yarın milletindir\", İmamoğlu ise Atatürk'ün \"Yörük çadırı\" sözleriyle bayramı kutladı.", kaynak: "birgün", url: "https://www.birgun.net/" },
    { kategori: "Siyaset", metin: "Özgür Özel, fon soruşturmasında 60'a yakın AKP'li vekil ya da yakınının adının geçtiğini söyleyip Erdoğan'dan listeyi açıklamasını istedi.", kaynak: "kısa dalga", url: "https://kisadalga.net/" },
    { kategori: "Siyaset", metin: "Sarıgül soruşturmasında berberi dahil 10 kişi hakkında gözaltı kararı verildi; Sarıgül YENİ Parti üyeliğini askıya aldırdı, parti \"ilişkisi yok\" dedi.", kaynak: "artı gerçek", url: "https://artigercek.com/" },
    { kategori: "Siyaset", metin: "Erdoğan, Trump ile telefonda görüştü; Hürmüz Boğazı, Yemen ve Ukrayna gündeme geldi.", kaynak: "evrensel", url: "https://www.evrensel.net/" },

    { kategori: "Ekonomi", metin: "Fon krizinde Fon Koordinasyon Kurulu 68 milyar liralık ödeme yaptı; AKP'nin fon teklifi Meclis Genel Kurulu'na sunuldu.", kaynak: "kısa dalga", url: "https://kisadalga.net/" },
    { kategori: "Ekonomi", metin: "ABD Merkez Bankası politika faizini yüzde 3,75-4,00 aralığında sabit tuttu.", kaynak: "artı gerçek", url: "https://artigercek.com/" },
    { kategori: "Ekonomi", metin: "2027 bütçesi komisyonda: Gençlik ve Spor Bakanlığı bütçesi 10 Kasım'da görüşülecek, gençlere günlük 86 lira öngörülüyor.", kaynak: "evrensel", url: "https://www.evrensel.net/" },
    { kategori: "Ekonomi", metin: "Emekli maaşlarına iyileştirmede yaş ve hane geliri kriterleri tartışılırken 820 hekim ve 45 özel hastaneye vergi denetimi başlatıldı.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce" },

    { kategori: "Toplum", metin: "Meteoroloji 29 il için sarı, 4 il için turuncu kodlu uyarı verdi; İstanbul'da 12 ilçede elektrik kesintisi yaşanacak.", kaynak: "evrensel", url: "https://www.evrensel.net/" },
    { kategori: "Toplum", metin: "Soma'dan Ankara'ya yürüyen İmbat Madencilik işçilerine polis müdahale etti: \"Bizi kimse yolumuzdan çeviremez.\"", kaynak: "sendika.org", url: "https://sendika.org/" },
    { kategori: "Toplum", metin: "\"Yusuf Tekin istifa\" pankartı nedeniyle tutuklanan iki öğrenci tahliye edildi.", kaynak: "bianet", url: "https://bianet.org/" },
    { kategori: "Toplum", metin: "Silivri açıklarında batan gemide arama çalışmalarında bir cansız bedene daha ulaşıldı.", kaynak: "kısa dalga", url: "https://kisadalga.net/" },

    { kategori: "Yerel", metin: "İstanbul'da 29 Ekim kutlamaları nedeniyle 3 ilçede bazı yollar kapatıldı, Vatan Caddesi'ndeki kortej geçişi ertelendi.", kaynak: "diken", url: "https://www.diken.com.tr/" },
    { kategori: "Yerel", metin: "İstanbul Boğazı'nda makine arızası yapan gemi nedeniyle gemi trafiği geçici olarak askıya alındı.", kaynak: "birgün", url: "https://www.birgun.net/" },
    { kategori: "Yerel", metin: "İstanbul Barosu seçimlerini Ümit Kocasakal kazandı.", kaynak: "medyascope", url: "https://medyascope.tv/" },

    { kategori: "Spor", metin: "Fenerbahçe'de İsmail Kartal dönemi sona erdi; takım geçici olarak Dirk Kuyt'a emanet edildi.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce" },
    { kategori: "Spor", metin: "Ballon d'Or 2026'yı Harry Kane ve Alexia Putellas kazandı.", kaynak: "diken", url: "https://www.diken.com.tr/" }
  ]
};
