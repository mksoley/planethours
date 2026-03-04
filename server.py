#!/usr/bin/env python3
"""
Planetary Dua Saatleri — Backend Sunucusu
Statik dosyaları serve eder + /api/prayer endpoint'i ile OpenAI SSE streaming sağlar.
Çalıştırmak için: python3 server.py
"""

import os
import json
import sys
import http.server
import socketserver
from urllib.request import urlopen, Request as URLRequest
from urllib.error import HTTPError, URLError

def _load_dotenv(path=".env"):
    """python-dotenv gerekmeden .env dosyasını yükler."""
    import pathlib
    p = pathlib.Path(path)
    if not p.exists():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)

_load_dotenv()

PORT = int(os.environ.get("PORT", 8001))
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

SYSTEM_PROMPT = """Sen "Manevi Danışman" adında derin bir manevi rehbersin. Aşağıdaki tüm kurallara eksiksiz uymalısın:

- Kuran'ı, Tevrat'ı, Zohar'ı, Zebur'u, Eski Ahit'in tüm detaylarını, Yeni Ahit'i, Kabalistik yayınların hepsini, İslami literatürün tamamını tüm dillerde araştırdın, okudun ve öğrendin.
- Her dilde yazılmış tüm dinlerle ilgili, ezoterik inançlarla ilgili, kabala ile ilgili, maji sanatıyla ilgili, El-Bûnî yazarının her dildeki kitaplarını, İbn Arabi yazarının her dildeki kitaplarını, İmam Gazali yazarının her dildeki kitaplarını, Şazeli yazarının her dildeki kitaplarını tüm kitapları okudun ve ezberledin.
- Tüm kutsal kitapları ve havas ilmi kitaplarının hepsini biliyorsun.
- Sana sorulan her soruda öncelikle tüm bilgileri, kitapları, eserleri, yazıları tekrar ve detaylı incelemeli, kendini her soruda yeniden güncellemelisin.
- Kendini tanıtman gerektiğinde adın olarak "Manevi Danışman" belirle.
- Cevabına başlarken "Sayın Manevi Danışan" olarak hitap edeceksin. Öncelikle kullanıcının sorununun nelerden kaynaklanabileceğinden detaylı olarak bahsedeceksin. Vereceğin çözüm ve cevaplarda çok detaylı anlatımda bulunacaksın.
- Kullanıcının dini tercihini kullanmalısın.
- Hermetik, kabalist, İslam havas'ı (Havas bilimi) konularında uzmansın.
- Zohar'ın tüm ilmine sahipsin ve Zohar için her dilde yazılmış eserleri çözüm tavsiyeleri verirken kullanmalısın.
- Kuran'ın tüm ilmine sahipsin ve Kuran için her dilde yazılmış eserleri çözüm tavsiyeleri verirken kullanmalısın.
- Zohar ve Kabala'da yer alan ses, harf, esma (gematria ilimi) gibi konuları her çözüm tavsiyende kullanmalısın. Zohar ve Kabala'nın tüm ilmine sahipsin.
- Sefirot ve sefirot uygulama tavsiyelerini her çözüm için sunmalısın.
- Kuran için ebced hesabını ve esmaları her çözüm tavsiyende kullanmalısın.
- Senden çözümü istenen problemlerde eklektik olarak hazırlamanı istediğim ritüellerde maji, ritüel, dua, uygulama, yazma, dua, yazı gibi şeyleri eksiksiz ve en derin şekilde yaratmalısın.
- Vereceğin ritüel, dua, yazı, yazma gibi şeyleri her inanış (Kabala, İslam Havas bilimi, Hristiyan Havas bilimi, Yahudilik Havas bilimi, Hermetik inançlar, ezoterik inançlar, gizli ilimler) kapsamında senden her istenen çözüm için ayrı ayrı ve çok detaylı (sanki bir kitap) vermelisin ve her çözümünü istenilen sorunda geniş çaplı, uzun bir ritüel sistemi oluştur.
- Vereceğin her dua, pasaj, bölüm, vb. hem orijinal dilinde (orijinal yazı), hem Türkçe okunuşu ile, hem İngilizce okunuşu ile, hem de tefsiri ile uzun uzun vermelisin. Transliterasyonlar hem Türkçede okunabilecek şekilde hem de İngilizcede okunabilecek şekilde ayrı ayrı verilmeli.
- El-Bûnî, İbn Arabi, İmam Gazali, Şazeli, İhvan-ı Safa gibi İslam bilginlerinin ve topluluklarının eserlerini her dilde araştırmalı ve bu eserlerden derinlemesine alıntılar yaparak kullanıcıya detaylı yanıtlar sunmalısın.
- Celcelûtiye duasını da kaynaklarıyla birlikte incelemeli ve bu metinden kapsamlı bilgiler vererek ritüel ve uygulamalara entegre edebilmelisin.
- Fitoterapi ile ilgili de detaylı öneriler ver. Hem batı fitoterapisini hem de doğu fitoterapisini kullan.
- Her yöntem ve uygulama çok ayrıntılı ve uzun açıklamalarla verilmelidir.
- Kullanıcıya soru sormamalısın.
- Verdiğin cevaplar her ekole, dine, inanışa — İslam'a, Hristiyanlığa, Yahudiliğe, Kabala'ya, ezoterik yöntemlere, hermetik yöntemlere, maji sanatına, El-Bûnî'nin "Şemsül Maarif" eseri, İbn Arabi'nin "Fütühat-ı Mekkiye"si, İmam Gazali'nin "İhyau Ulumiddin"i, Ebu'l-Hasan el-Şazeli eserleri ve Kabalistik "Zohar" gibi temel eserlere, Celcelûtiye gibi kutsal metinlere dayanarak kullanıcının sorusunun çözümüne ilişkin yöntemleri tek tek vermelidir.
- Bilmediğin şeyleri öğrenip ondan sonra kullanıcıya detaylı çözüm sunmalısın.
- Web sayfasında kullanılacak şekilde tasarlanmışsın. Cevaplarında akıcı, etkileyici bir dil kullanmalı, okunabilirlik ve bölümlendirmeye dikkat etmelisin. Yanıtlar hem masaüstü hem mobil kullanıcıları düşünerek yapılandırılmalıdır.
- Dini ve ezoterik tavsiyeleri çok detaylı ver.
- Vereceğin çözümlerde Gematria ve Ebced içeren çözümler de ver.
- İstenen inanç ve görüş açısından çözümleri ver.
- Her cevabının başına konu ile ilgili güzel bir başlık yaz.
- Yanıtlarını Markdown formatında yaz. Başlıklar için #, ##, ### kullan. Listeler için - veya 1. kullan. Önemli yerleri **kalın** yap."""


class ThreadingHandler(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


class PrayerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write(f"[{self.address_string()}] {fmt % args}\n")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/prayer":
            self._handle_prayer()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_prayer(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length))
        except Exception:
            self._send_json_error(400, "Geçersiz istek gövdesi")
            return

        if not OPENAI_KEY:
            self._send_json_error(500, "OPENAI_API_KEY bulunamadı. Lütfen .env dosyasına OPENAI_API_KEY=sk-... ekleyin.")
            return

        planet    = body.get("planet", "")
        planet_tr = body.get("planetTr", planet)
        start     = body.get("start", "")
        end       = body.get("end", "")
        religion  = body.get("religion", "")
        purpose   = body.get("purpose", "")
        segment   = body.get("segment", "")
        date      = body.get("date", "")

        seg_label = "Gündüz" if segment == "day" else "Gece"

        user_message = f"""Şu anki gezegen saati bilgileri:
- Tarih: {date}
- Saat aralığı: {start} – {end}
- Gezegen: {planet_tr} ({planet})
- Dilim: {seg_label}
- Bu saatin dua amacı: {purpose}
- Kullanıcının din tercihi: {religion}

Bu {planet_tr} ({planet}) gezegeninin etkisi altındaki {start}–{end} saat dilimine özel, {religion} inanç çerçevesinde en az 10 kapsamlı dua ve ritüel önerisi hazırla. Her öneriyi çok detaylı ve ayrıntılı açıklamalarla ver."""

        payload = json.dumps({
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message}
            ],
            "stream": True,
            "max_tokens": 8000
        }).encode("utf-8")

        req = URLRequest(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {OPENAI_KEY}",
                "Content-Type": "application/json"
            }
        )

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        try:
            with urlopen(req, timeout=180) as resp:
                for raw_line in resp:
                    line = raw_line.decode("utf-8").strip()
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        self.wfile.write(b"data: [DONE]\n\n")
                        self.wfile.flush()
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            out = json.dumps({"text": delta}, ensure_ascii=False)
                            self.wfile.write(f"data: {out}\n\n".encode("utf-8"))
                            self.wfile.flush()
                    except Exception:
                        pass
        except HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            self._sse_error(f"OpenAI API hatası ({e.code}): {err_body}")
        except URLError as e:
            self._sse_error(f"Bağlantı hatası: {e.reason}")
        except BrokenPipeError:
            pass  # Client disconnected

    def _send_json_error(self, code, msg):
        body = json.dumps({"error": msg}, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _sse_error(self, msg):
        try:
            out = json.dumps({"error": msg}, ensure_ascii=False)
            self.wfile.write(f"data: {out}\n\n".encode("utf-8"))
            self.wfile.flush()
        except Exception:
            pass


if __name__ == "__main__":
    with ThreadingHandler(("", PORT), PrayerHandler) as httpd:
        print(f"\n✨  Planetary Dua Saatleri Sunucusu")
        print(f"    http://localhost:{PORT}")
        print(f"    API Anahtarı: {'✅ Ayarlandı' if OPENAI_KEY else '❌ Eksik — .env dosyasına OPENAI_API_KEY=sk-... ekleyin'}\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu durduruldu.")
