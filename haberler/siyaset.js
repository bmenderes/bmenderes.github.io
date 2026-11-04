/* MANŞET — SİYASET. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   Biçim:
   window.MANSET_SIYASET = {
     tarih: "YYYY-AA-GG",
     baslik: "Siyaset",
     mansetler: [ { metin, detay, kaynak, url, tur, guven, dil, yayin_tarihi, dogrulama } ]
   };
   - İlk satır büyük manşet, kalanlar liste olarak basılır (en fazla 5 satır gösterilir).
   - metin  : ana sayfada görünen manşet (tek cümle, ~140 karakter)
   - detay  : manşete tıklanınca açılan ayrıntı (1-2 cümle, ~220 karakter)
   - kaynak : kısa kaynak adı (envanterdeki id)
   - url    : habere git linki, https://
   - tur    : hizli-haber, teknik-analiz, sektor-ekonomi, arastirma, resm-kurum, veri-skor
   - guven  : bagimsiz veya uretici
   - dil    : tr veya en
   - yayin_tarihi: YYYY-AA-GG
   - dogrulama: tek-kaynak veya ikinci-kaynak
*/
window.MANSET_SIYASET = {
  tarih: "2026-10-29",
  baslik: "Siyaset",
  mansetler: [
    { metin: "Özgür Özel: Fon soruşturmasında 60'a yakın AKP'li vekil ya da yakınının adı geçiyor, Erdoğan listeyi açıklasın.", detay: "Özel, 'AKP içinde güç odaklarının çatışması var' diyerek fon krizinin iktidar içi bir hesaplaşmaya dönüştüğünü savundu.", kaynak: "kısa dalga", url: "https://kisadalga.net/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Erdoğan'ın 29 Ekim mesajı: 'Türkiye Yüzyılı' hedefi yinelendi.", detay: "Erdoğan mesajında Cumhuriyet'in 103. yılında birlik ve beraberlik vurgusu yaptı, Türkiye Yüzyılı programını öne çıkardı.", kaynak: "birgün", url: "https://www.birgun.net/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Bakırköy Belediyesi'ne operasyon: Beş başkan yardımcısı dahil 62-68 kişi hakkında gözaltı kararı.", detay: "Operasyon kapsamında belediyede aramalar yapıldı. CHP, soruşturmayı siyasi gerekçeli olarak nitelendirdi.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" },
    { metin: "Mustafa Sarıgül, YENİ Parti üyeliğini 'askıya aldı'; suçlamalar sürüyor.", detay: "Sarıgül'ün eski koruması, vekili cinsel saldırıyla suçladı. Soruşturma kapsamındaki ifadelerin sızdırılması tartışma yarattı.", kaynak: "bianet", url: "https://bianet.org/", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "ikinci-kaynak" },
    { metin: "Fon soruşturmasında eski AKP milletvekili Ertan Aydın yeniden gözaltına alınıp tutuklandı.", detay: "Aydın'ın daha önce de gözaltına alındığı soruşturmada tutuklama kararı verildi.", kaynak: "bbc türkçe", url: "https://www.bbc.com/turkce", tur: "hizli-haber", guven: "bagimsiz", dil: "tr", yayin_tarihi: "2026-10-29", dogrulama: "tek-kaynak" }
  ]
};
