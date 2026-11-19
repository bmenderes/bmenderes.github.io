/* MANŞET — SPOR. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   Biçim:
   window.MANSET_SPOR = {
     tarih: "YYYY-AA-GG",
     baslik: "Spor",
     mansetler: [ { metin, detay, kaynak, url, tur, guven, dil, yayin_tarihi, dogrulama } ]
   };
   - İlk satır büyük manşet, kalanlar liste olarak basılır (en fazla 5 satır gösterilir).
   - metin  : ana sayfada görünen manşet (tek cümle, ~140 karakter)
   - detay  : manşete tıklanınca açılan ayrıntı (1-2 cümle, ~220 karakter)
   - kaynak : kısa kaynak adı (envanterdeki id)
   - url    : habere git linki, https://
   - tur    : hizli-haber, teknik-analiz, magazin-kultur, resm-kurum, veri-skor
   - guven  : bagimsiz
   - dil    : tr veya en
   - yayin_tarihi: YYYY-AA-GG
   - dogrulama: tek-kaynak veya ikinci-kaynak
*/
window.MANSET_SPOR = {
  tarih: "2026-10-29",
  baslik: "Spor",
  mansetler: [
    { metin: "Fenerbahçe'de İsmail Kartal dönemi sona erdi; takım geçici olarak Dirk Kuyt'a emanet edildi.", detay: "Kulüp, yeni teknik direktör belirlenene kadar takımın Kuyt yönetiminde çalışacağını duyurdu.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Ballon d'Or 2026'yı Harry Kane ve Alexia Putellas kazandı.", detay: "Ödüller, erkekler ve kadınlar kategorilerinde yılın en iyi futbolcularına verildi.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Süper Lig'de 10'uncu hafta başlıyor; Galatasaray Konya deplasmanında.", detay: "Haftanın programı ve puan durumu, ligde üst sıraları yakından ilgilendiren maçlara işaret ediyor.", kaynak: "birgün", url: "https://www.birgun.net/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Derbi biter bitmez kavga çıktı: İki futbolcuya kırmızı kart.", detay: "Maç sonrası yaşanan gerginlik, disiplin kuruluna taşınabilir.", kaynak: "diken", url: "https://www.diken.com.tr/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Süper Lig'de puan durumu ve gelecek haftanın programı açıklandı.", detay: "Diken'in derlemesine göre ligde zirve yarışı ve alt sıralar arasındaki puan farkı dikkat çekiyor.", kaynak: "diken", url: "https://www.diken.com.tr/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" }
  ]
};
