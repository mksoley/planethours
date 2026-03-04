/**
 * Netlify Serverless Function — Prayer & Ritual Guidance
 * OpenAI SSE Streaming endpoint
 */

const SYSTEM_PROMPT = `Sen "Manevi Danışman" adında derin bir manevi rehbersin. Aşağıdaki tüm kurallara eksiksiz uymalısın:

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
- Yanıtlarını Markdown formatında yaz. Başlıklar için #, ##, ### kullan. Listeler için - veya 1. kullan. Önemli yerleri **kalın** yap.`;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check API key
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'OPENAI_API_KEY environment variable not set in Netlify' })
    };
  }

  // Parse request
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { planet, planetTr, start, end, religion, purpose, segment, date } = body;
  const segLabel = segment === 'day' ? 'Gündüz' : 'Gece';

  const userMessage = `Şu anki gezegen saati bilgileri:
- Tarih: ${date}
- Saat aralığı: ${start} – ${end}
- Gezegen: ${planetTr} (${planet})
- Dilim: ${segLabel}
- Bu saatin dua amacı: ${purpose}
- Kullanıcının din tercihi: ${religion}

Bu ${planetTr} (${planet}) gezegeninin etkisi altındaki ${start}–${end} saat dilimine özel, ${religion} inanç çerçevesinde en az 10 kapsamlı dua ve ritüel önerisi hazırla. Her öneriyi çok detaylı ve ayrıntılı açıklamalarla ver.`;

  // Call OpenAI streaming API
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        stream: true,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `OpenAI API error: ${errText}` })
      };
    }

    // Stream response as SSE
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    // Netlify Functions don't support true streaming responses yet
    // So we collect all chunks and return as one response
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        
        try {
          const chunk = JSON.parse(data);
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) fullText += delta;
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: fullText })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
