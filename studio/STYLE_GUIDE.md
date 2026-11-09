# Glowi Video Style Guide

Bu rehber References klasöründeki 4 videonun analizinden çıkarıldı. Referanslar ilham kaynağıdır; görselleri, metinleri ve kompozisyonları kopyalanmaz.

## Format
- 9:16, 1080×1920, 30 fps, 50–65 sn
- Baştan sona kesintisiz seslendirme, -14 LUFS civarı
- Sona Glowi kapanış kartı eklenir (+2,5–3 sn)

## Pacing
- Konuşma hızı yaklaşık 2,6–2,8 kelime/sn
- Her cümlede yeni bir görsel fikir gelir; sahneler 3–7 sn sürer
- Sahne içinde kamera hep yavaşça hareket eder (push-in ya da pull-out); ekran hiç durmaz
- Sahne geçişleri sert kesme değil, "zoom-through" (ölçek + blur + crossfade, yaklaşık 0,4 sn) ve whoosh sesiyle yapılır
- Kurgu: hook sorusu → yanlış inanışı çürütme ("not just time") → mekanizma (2–3 sahne) → sayısal kanıt → uygulanabilir çözüm → açılış görseline dönen döngü → marka

## Seslendirme
- Varsayılan ses: Kokoro (yerel, ücretsiz, ticari kullanıma uygun). Alternatifi ElevenLabs (Jessica); ElevenLabs yayın için ücretli plan gerektirir.
- Her cümle ayrı üretilir. Cümle arasında 0,32 sn, paragraf arasında 0,5 sn duraklama bırakılır; kısaltmalar (UV, UVB) birbirine yapışmamalı.
- Render öncesinde check_pauses.py ile cümle sonlarında en az 0,25 sn nefes payı olduğu kontrol edilir.
- 0,38 sn'den uzun duraklamalar kısaltılır (tighten.py).
- Kısaltmalar seslendirme metninde tireyle yazılır (U-V-A, S-P-F); marka adı "Glowee" olarak okutulur.
- Caption metni senaryodan gelir, Whisper yalnızca zamanlama için kullanılır (align.py). Böylece Whisper'ın yazım hataları ekrana yansımaz.

- Hook cümlesi (ilk paragraf) daha yüksek, parlak ve biraz hızlı okunur: tools/hook_boost.py (+6 dB, +1 yarım ton, ~%15 hızlı). (Gurkan, 9 Kasım 2026)

## Caption
- Ekranın üst bölümünde (y ≈ 270 px), ortalı, satır başına 2–5 kelime, en fazla 2 satır
- Kelimeler konuşmayla birlikte tek tek belirir: aktif kelime beyaz, önceki kelimeler %60 beyaz
- Her satırda en fazla 1–2 anahtar kelime vurgulanır: blush (#EEDDE2) zemin ve plum (#4B2E39) yazı ile hafif büyüyen bir pill
- Font: Poppins Bold, 50 px; okunabilirlik için yumuşak gölge
- Zamanlama Whisper word timestamps ile alınır

## Renk
- Zemin: plum gece tonları (#170A10 → #4B2E39 → #6A3A4A)
- Cilt: sıcak blush/pembe (#F0C9C6 → #B9737F)
- Işık ve vurgu: altın (#F2C879, #FFE3A8)
- Veri vurguları: UVB mercan (#FF7468), UVA lila (#C7B2FF)
- Glow, bokeh ve sığ alan derinliği (blur) her sahnede kullanılır

## Motion dili
- Soyut fikirler fiziksel metaforlara dönüştürülür: kolajen = yay, UV = dalga ışını, güneş kremi = parlak film
- Kesit (cross-section) anatomi sahneleri: epidermis / dermis / yağ katmanları
- Sayısal veriler pill rozetinde, sayaç animasyonuyla (0 → 80%) ve chime sesiyle verilir
- Kaynak gösterilen bir veri varsa sahnenin altında küçük puntoyla yazılır

- Cilt gösterilen her sahnede gerçekçi cilt kullanılır (src/realskin.tsx): hücreli kesit, dokulu yüzey yakın çekimi, karo ızgarasız cilt zemini. Düz pembe bloklar kullanılmaz. (Gurkan, 9 Kasım 2026)

## Marka
- Sağ üst köşede filigran: Glowi logosu + Lora yazısı, %60 opaklık, videonun tamamında
- Kapanış: logo, dönen tarama halkası (Glowi'nin analiz motifi), "Glowi" (Lora), tagline ve "AI SKIN SCAN · DAILY ROUTINE"
- Son cümle markaya köprü kurar ("Glowi helps you read it.")
