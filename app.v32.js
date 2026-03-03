import '/app.js'; // keep main code for logic (if present)

// Fallback bootstrap: ensure dropdown, data, and render work even if fetches fail
(async ()=>{
  try{
    // Wait a tick so app.js can attach main(); if not, we attach a minimal bootstrap
    await new Promise(r=>setTimeout(r,100));
    if (!window.EMBEDDED_CITIES) window.EMBEDDED_CITIES=[];
    // If cities failed to load, inject them
    if (window.CITIES && Array.isArray(window.CITIES) && window.CITIES.length===0 && window.EMBEDDED_CITIES.length){
      window.CITIES = window.EMBEDDED_CITIES.slice();
    }
    // If references failed to render, render from embedded
    const refsBody = document.getElementById('refsBody');
    if (refsBody && refsBody.childElementCount===0 && window.EMBEDDED_REFERENCES){
      refsBody.innerHTML = "";
      for (const line of window.EMBEDDED_REFERENCES){
        const div=document.createElement('div'); div.className='ref-item'; div.textContent='• '+line; refsBody.append(div);
      }
    }
    // Ensure language dropdown has options
    const sel=document.getElementById('langSelect');
    if (sel && sel.options.length===0){
      for (const code of ['tr','en']){ const opt=document.createElement('option'); opt.value=code; opt.textContent=code.toUpperCase(); sel.append(opt); }
    }
    // If no render happened yet (empty table), try to call global render if exists
    const tbody=document.querySelector('#hoursTable tbody');
    if (tbody && tbody.childElementCount===0 && window.render){
      try{ window.render(); }catch(e){ console.warn('render() failed, will attempt minimal render', e); }
    }
    // Minimal render if still empty
    if (tbody && tbody.childElementCount===0){
      const city=(window.CITIES&&window.CITIES[0]) || {name:'Istanbul, Türkiye', lat:41.0082, lon:28.9784, tz:'Europe/Istanbul'};
      document.getElementById('citySearch').value = city.name;
      const tr=document.createElement('tr'); tr.innerHTML='<td colspan=\"6\">Veriler yüklenemedi. Yeniden yükleyin veya ağ izinlerini kontrol edin.</td>'; tbody.append(tr);
    }
    console.log('[v3.2] Bootstrap fallback executed');
  }catch(err){
    console.error('[v3.2] Bootstrap error', err);
  }
})();
