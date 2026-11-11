/* MANŞET — TEKNOLOJİ. Otomasyon bu dosyayı yeniden yazar; sayfa bunu okur.
   Biçim:
   window.MANSET_TEKNOLOJI = {
     tarih: "YYYY-AA-GG",
     baslik: "Teknoloji",
     mansetler: [ { metin, detay, kaynak, url, tur, guven, dil, yayin_tarihi, dogrulama } ]
   };
   - İlk satır büyük manşet, kalanlar liste olarak basılır (en fazla 5 satır gösterilir).
   - metin  : ana sayfada görünen manşet (tek cümle, ~140 karakter)
   - detay  : manşete tıklanınca açılan ayrıntı (1-2 cümle, ~220 karakter)
   - kaynak : kısa kaynak adı (envanterdeki id)
   - url    : habere git linki, https://
   - tur    : hizli-haber, teknik-analiz, sektor-ekonomi, arastirma
   - guven  : bagimsiz veya uretici
   - dil    : tr veya en
   - yayin_tarihi: YYYY-AA-GG
   - dogrulama: tek-kaynak veya ikinci-kaynak
*/
window.MANSET_TEKNOLOJI = {
  tarih: "2026-10-30",
  baslik: "Teknoloji",
  mansetler: [
    {
      metin: "Binance, kripto tarihinin en büyük soygununda 6,3 milyar dolar çalındığını açıkladı.",
      detay: "Borsa para çekme işlemlerini durdurdu. Olay TechCrunch, The Verge ve Bloomberg'in ana sayfalarında yer alıyor.",
      kaynak: "techcrunch",
      url: "https://techcrunch.com/",
      tur: "hizli-haber",
      guven: "bagimsiz",
      dil: "en",
      yayin_tarihi: "2026-10-30",
      dogrulama: "ikinci-kaynak"
    },
    {
      metin: "Anthropic, halka arz için ABD SEC'e S-1 kaydı sundu.",
      detay: "Şirket, A sınıfı hisselerinin halka arzı için kayıt beyanını duyurdu. Bloomberg ve The Decoder da konuyu işliyor.",
      kaynak: "anthropic",
      url: "https://www.anthropic.com/news",
      tur: "resmi-duyuru",
      guven: "uretici",
      dil: "en",
      yayin_tarihi: "2026-10-30",
      dogrulama: "ikinci-kaynak"
    },
    {
      metin: "Google DeepMind, Argon'dan iki hafta sonra Gemini 4 Carbon modelini yayınladı.",
      detay: "Şirket Gemini 4 Carbon'u yeni öncü modeli olarak duyurdu; The Decoder'a göre Argon'a göre genel kazanımlar sunuyor.",
      kaynak: "deepmind",
      url: "https://deepmind.google/discover/blog/",
      tur: "arastirma",
      guven: "uretici",
      dil: "en",
      yayin_tarihi: "2026-10-30",
      dogrulama: "ikinci-kaynak"
    },
    {
      metin: "DoorDash, Instacart'ı 17 milyar dolara satın alacak.",
      detay: "TechCrunch'ın bildirdiği anlaşma, yemek ve market teslimat sektöründe büyük bir birleşme anlamına geliyor.",
      kaynak: "techcrunch",
      url: "https://techcrunch.com/",
      tur: "hizli-haber",
      guven: "bagimsiz",
      dil: "en",
      yayin_tarihi: "2026-10-30",
      dogrulama: "tek-kaynak"
    },
    {
      metin: "Mistral, kodlama odaklı Le Chonk modelini yayınladı; model Hugging Face'te de yer alıyor.",
      detay: "The Decoder, modelin güçlü olduğunu ancak genel olarak Çinli rakiplerin gerisinde kaldığını yazıyor. Hugging Face blogu da Mistral Large 4 olarak duyurdu.",
      kaynak: "decoder",
      url: "https://the-decoder.com/",
      tur: "hizli-haber",
      guven: "bagimsiz",
      dil: "en",
      yayin_tarihi: "2026-10-29",
      dogrulama: "ikinci-kaynak"
    }
  ]
};
