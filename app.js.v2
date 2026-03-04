const rad=Math.PI/180, dayMs=86400000, J1970=2440588, J2000=2451545, J0=0.0009, e=rad*23.4397;
const CHALDEAN=["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"];
const WEEKDAY_RULER={0:"Sun",1:"Moon",2:"Mars",3:"Mercury",4:"Jupiter",5:"Venus",6:"Saturn"};
const PLANET_TR={Sun:"Güneş", Moon:"Ay", Mars:"Mars", Mercury:"Merkür", Jupiter:"Jüpiter", Venus:"Venüs", Saturn:"Satürn"};
const PLANET_WEIGHTS={Jupiter:5,Venus:4,Sun:3,Mercury:2,Moon:2,Mars:1,Saturn:1};
function toJulian(date){return date.valueOf()/dayMs-0.5+J1970;} function fromJulian(j){return new Date((j+0.5-J1970)*dayMs);} function toDays(date){return toJulian(date)-J2000;}
function rightAscension(l,b){return Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l));}
function declination(l,b){return Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));}
function solarMeanAnomaly(d){return rad*(357.5291+0.98560028*d);} function eclipticLongitude(M){const C=rad*(1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M)); const P=rad*102.9372; return M+C+P+Math.PI;}
function sunCoords(d){const M=solarMeanAnomaly(d), L=eclipticLongitude(M); return {dec:declination(L,0), ra:rightAscension(L,0)};}
function julianCycle(d,lw){return Math.round(d - J0 - lw/(2*Math.PI));} function approxTransit(Ht,lw,n){return J0 + (Ht+lw)/(2*Math.PI) + n;}
function solarTransitJ(ds,M,L){return J2000 + ds + 0.0053*Math.sin(M) - 0.0069*Math.sin(2*L);} function hourAngle(h,phi,dec){return Math.acos((Math.sin(h)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec)));}
function getSunTimes(dateUTC, lat, lon){ const lw=rad*-lon, phi=rad*lat, d=toDays(dateUTC); const n=julianCycle(d,lw), ds=approxTransit(0,lw,n); const M=solarMeanAnomaly(ds), L=eclipticLongitude(M), {dec}=sunCoords(ds); const Jnoon=solarTransitJ(ds,M,L); const h0=-0.833*rad; const H=hourAngle(h0,phi,dec); if(Number.isNaN(H)) return {sunrise:null,sunset:null,solarNoon:fromJulian(Jnoon)}; const Jset=solarTransitJ(approxTransit(H,lw,n),M,L); const Jrise=solarTransitJ(approxTransit(-H,lw,n),M,L); return {sunrise:fromJulian(Jrise), sunset:fromJulian(Jset), solarNoon:fromJulian(Jnoon)};}
function getZonedDateParts(date,tz){ const fmt=new Intl.DateTimeFormat("en-GB",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}); return Object.fromEntries(fmt.formatToParts(date).map(p=>[p.type,p.value])); }
function makeDateInTZ(y,m,d,hh=0,mm=0,ss=0,tz="UTC"){ const dtf=new Intl.DateTimeFormat("en-GB",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}); const utc=Date.UTC(y,m-1,d,hh,mm,ss), guess=new Date(utc); const p=Object.fromEntries(dtf.formatToParts(guess).map(q=>[q.type,q.value])); const diff=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-utc; return new Date(utc - diff); }
function nowInTZ(tz){ const now=new Date(); const p=getZonedDateParts(now,tz); return makeDateInTZ(+p.year,+p.month,+p.day,+p.hour,+p.minute,+p.second,tz); }
function formatInTZ(date,tz,opts={}){ return new Intl.DateTimeFormat(currentLocaleCode(),{timeZone:tz,...opts}).format(date); }
function zonedWeekdayIndex(date,tz){ const wd=new Intl.DateTimeFormat("en-GB",{timeZone:tz,weekday:"short"}).format(date); return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(wd); }
function haversine(lat1,lon1,lat2,lon2){ const R=6371, dLat=rad*(lat2-lat1), dLon=rad*(lon2-lon1); const a=Math.sin(dLat/2)**2 + Math.cos(rad*lat1)*Math.cos(rad*lat2)*Math.sin(dLon/2)**2; return 2*Math.asin(Math.min(1,Math.max(-1,Math.sqrt(a)))); }
const I18N={
  tr:{ appTitle:"Gezegen Saatleri Dua Aracı", appSummary:"Otomatik konum, 100+ şehir, en yakın & en ideal dua saati",
      thIdx:"#", thStart:"Başlangıç", thEnd:"Bitiş", thPlanet:"Gezegen", thSegment:"Dilim", thPurpose:"Dua Amacı",
      today:"Bugün", sunrise:"Güneş doğuşu", solarnoon:"Güneş öğle", sunset:"Gün batımı",
      segmentDay:"Gündüz", segmentNight:"Gece", bestHeader:"En Yakın & En İdeal Dua Saati",
      testsHeader:"Dahili Testler", note:"Not: Gezegen saatleri, güneşin doğuşu ve batışına göre 12’şer dilime ayrılır.",
      footerLine:"Hesaplama: yerel güneş doğuş/batış + Chaldean sırası | Eğitsel/ruhsal kullanım içindir.",
      refsTitle:"Referanslar", customCityTitle:"Kendi Şehrini Ekle", customCityHelp:"Not: Ekledikleriniz tarayıcıda (localStorage) saklanır.",
      searchPlaceholder:"Şehir ara…", icsBtn:"ICS İndir"
  },
  en:{ appTitle:"Planetary Prayer Hours", appSummary:"Auto location, 100+ cities, nearest & most ideal time",
      thIdx:"#", thStart:"Start", thEnd:"End", thPlanet:"Planet", thSegment:"Segment", thPurpose:"Purpose",
      today:"Today", sunrise:"Sunrise", solarnoon:"Solar noon", sunset:"Sunset",
      segmentDay:"Day", segmentNight:"Night", bestHeader:"Nearest & Most Ideal Time",
      testsHeader:"Internal Tests", note:"Note: Planetary hours divide daylight and night into 12 parts each.",
      footerLine:"Computation: local sunrise/sunset + Chaldean order | For spiritual/educational use.",
      refsTitle:"References", customCityTitle:"Add Your City", customCityHelp:"Saved locally in your browser (localStorage).",
      searchPlaceholder:"Search city…", icsBtn:"Download ICS"
  }
};
const RTL_LANGS=new Set(["ar","fa","he"]);
const PURPOSES_TR={Sun:"Hayat gücü, liderlik, onur, başarı", Moon:"Aile, sezgi, şefkat, tefekkür", Mars:"Cesaret, korunma, kararlı adım", Mercury:"İlim, iletişim, ticaret, yazı", Jupiter:"Bereket, bolluk, cömertlik, büyüme", Venus:"Sevgi, uyum, güzellik, barışma", Saturn:"Disiplin, ahit, sabır, arınma"};
const PURPOSES_EN={Sun:"Vitality, leadership, honor, success", Moon:"Family, intuition, care, reflection", Mars:"Courage, protection, decisive action", Mercury:"Study, communication, trade, writing", Jupiter:"Blessing, abundance, generosity, growth", Venus:"Love, harmony, beauty, reconciliation", Saturn:"Discipline, vows, patience, purification"};
function supportedLangs(){ return Object.keys(I18N); }
function currentLang(){ const sel=document.getElementById("langSelect"); const code = sel && sel.value ? sel.value : ((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase().split('-')[0]; return supportedLangs().includes(code) ? code : "en"; }
function currentLocaleCode(){ const map={tr:"tr-TR",en:"en-US"}; const lang=currentLang(); return map[lang]||"en-US"; }
function t(key){ const lang=currentLang(); return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }
function purposeText(planet){ return currentLang()==="tr" ? PURPOSES_TR[planet] : PURPOSES_EN[planet]; }
let CITIES=[]; let currentCityIndex=0;
async function loadCities(){ 
  let core = await fetch("cities-core.json").then(r=>r.json()).catch(()=>[]); 
  if(core.length === 0 && window.EMBEDDED_CITIES && window.EMBEDDED_CITIES.length > 0) {
    core = window.EMBEDDED_CITIES;
  }
  let custom=[]; 
  try{ custom = await fetch("cities-custom.json").then(r=>r.json()); }catch(_){ custom=[]; } 
  const local = JSON.parse(localStorage.getItem("customCities")||"[]"); 
  CITIES=[...core, ...custom, ...local]; 
}
function fuzzyScore(hay, needle){ hay=hay.toLowerCase(); needle=needle.toLowerCase(); if(hay.includes(needle)) return 100 + (50 - hay.indexOf(needle)); let i=0,j=0,score=0; while(i<hay.length && j<needle.length){ if(hay[i]===needle[j]){ score+=2; j++; } i++; } return score; }
function searchCities(q, limit=10){ if(!q) return []; const scored=CITIES.map((c,i)=>({i,c,s:fuzzyScore(c.name,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s); return scored.slice(0,limit).map(x=>({index:x.i, name:x.c.name})); }
function nearestCity(lat,lon){ const toRad=(v)=>v*rad; let best=0, bestD=1e9; for(let i=0;i<CITIES.length;i++){ const c=CITIES[i]; const dLat=toRad(c.lat-lat), dLon=toRad(c.lon-lon); const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(c.lat))*Math.sin(dLon/2)**2; const d=2*Math.asin(Math.min(1,Math.max(-1,Math.sqrt(a)))); if(d<bestD){ bestD=d; best=i; } } return best; }
async function detectApproxCity(){ 
  if(CITIES.length === 0) return 0;
  try{ 
    const res = await fetch("https://ipapi.co/json/"); 
    if(!res.ok) throw new Error("ipapi"); 
    const j=await res.json(); 
    return nearestCity(+j.latitude, +j.longitude); 
  }catch(_){ 
    return new Promise((resolve)=>{ 
      if(navigator.geolocation && window.isSecureContext){ 
        navigator.geolocation.getCurrentPosition(
          p=> resolve(nearestCity(p.coords.latitude, p.coords.longitude)), 
          ()=>resolve(0), 
          {timeout:5000}
        ); 
      } else resolve(0); 
    }); 
  } 
}
function buildPlanetaryHoursForDate(dateInTZ, lat, lon, tz){
  const parts=getZonedDateParts(dateInTZ,tz);
  const baseLocalNoon=makeDateInTZ(+parts.year,+parts.month,+parts.day,12,0,0,tz);
  let {sunrise,sunset,solarNoon}=getSunTimes(baseLocalNoon,lat,lon);
  const nextDayLocalNoon=new Date(baseLocalNoon.getTime()+dayMs);
  const {sunrise:nextSunriseRaw}=getSunTimes(nextDayLocalNoon,lat,lon);
  if(!sunrise||!sunset||!(sunrise<sunset)||!nextSunriseRaw){
    sunrise=makeDateInTZ(+parts.year,+parts.month,+parts.day,6,0,0,tz);
    sunset=makeDateInTZ(+parts.year,+parts.month,+parts.day,18,0,0,tz);
    solarNoon=makeDateInTZ(+parts.year,+parts.month,+parts.day,12,0,0,tz);
  }
  const nextSunrise=nextSunriseRaw||new Date(sunrise.getTime()+12*3600000);
  const dayLen=(sunset-sunrise)/12, nightLen=(nextSunrise-sunset)/12;
  const weekday=zonedWeekdayIndex(sunrise,tz);
  const first=WEEKDAY_RULER[weekday];
  const idx0=CHALDEAN.indexOf(first);
  const hours=[];
  for(let i=0;i<12;i++){
    hours.push({start:new Date(sunrise.getTime()+i*dayLen), end:new Date(sunrise.getTime()+(i+1)*dayLen), planet:CHALDEAN[(idx0+i)%7], segment:"day"});
  }
  for(let i=0;i<12;i++){
    hours.push({start:new Date(sunset.getTime()+i*nightLen), end:new Date(sunset.getTime()+(i+1)*nightLen), planet:CHALDEAN[(idx0+12+i)%7], segment:"night"});
  }
  return {hours,sunrise,sunset,nextSunrise,solarNoon,weekday,dayRuler:first};
}
function pickWeightedBest(hours, now, dayRuler){
  let best=null, bestScore=-1;
  for(const h of hours){
    if(h.end <= now) continue;
    const w = PLANET_WEIGHTS[h.planet] || 0;
    const bonus = (h.planet===dayRuler) ? 1.0 : 0.0;
    const soon = 1 / Math.max(1, (h.start - now) / 60000);
    const score = w*10 + bonus*5 + Math.min(soon, 5);
    if(score>bestScore){ best=h; bestScore=score; }
  }
  return best || hours.find(h=>h.start>now) || hours[0];
}
function pad2(n){ return String(n).padStart(2,"0"); }
function fmtICSDate(d){ return d.getUTCFullYear()+pad2(d.getUTCMonth()+1)+pad2(d.getUTCDate())+"T"+pad2(d.getUTCHours())+pad2(d.getUTCMinutes())+pad2(d.getUTCSeconds())+"Z"; }
function downloadICS(city, tz, hours){
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MannaPath//PlanetaryHours//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";
  for(let i=0;i<hours.length;i++){
    const h=hours[i];
    const uid = `ph-${city.name.replace(/[^a-z0-9]/gi,'')}-${i}-${Date.now()}@mannapath`;
    const summary = `Planetary Hour: ${h.planet} — ${city.name}`;
    const desc = `Segment: ${h.segment}; Purpose: ${purposeText(h.planet)}; Timezone: ${tz}`;
    ics += "BEGIN:VEVENT\r\n";
    ics += "UID:"+uid+"\r\n";
    ics += "DTSTAMP:"+fmtICSDate(new Date())+"\r\n";
    ics += "DTSTART:"+fmtICSDate(new Date(h.start))+"\r\n";
    ics += "DTEND:"+fmtICSDate(new Date(h.end))+"\r\n";
    ics += "SUMMARY:"+summary+"\r\n";
    ics += "DESCRIPTION:"+desc+"\r\n";
    ics += "END:VEVENT\r\n";
  }
  ics += "END:VCALENDAR\r\n";
  const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "planetary-hours.ics";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 5000);
}
function supportedLanguages(){ return Object.keys(I18N); }
function setRTLIfNeeded(){ const lang=currentLang(); const root=document.getElementById("root"); if(["ar","fa","he"].includes(lang)) root.classList.add("rtl"); else root.classList.remove("rtl"); }
function populateLangs(){ const sel=document.getElementById("langSelect"); sel.innerHTML=""; for(const code of supportedLangs()){ const opt=document.createElement("option"); opt.value=code; opt.textContent=code.toUpperCase(); sel.append(opt); } sel.value=currentLang(); }
function applyI18n(){ document.getElementById("appTitle").textContent = t("appTitle"); document.getElementById("appSummary").textContent = t("appSummary"); document.getElementById("thIdx").textContent = t("thIdx"); document.getElementById("thStart").textContent = t("thStart"); document.getElementById("thEnd").textContent = t("thEnd"); document.getElementById("thPlanet").textContent = t("thPlanet"); document.getElementById("thSegment").textContent = t("thSegment"); document.getElementById("thPurpose").textContent = t("thPurpose"); document.getElementById("bestHeader").textContent = t("bestHeader"); document.getElementById("testsHeader").textContent = t("testsHeader"); document.getElementById("note").textContent = t("note"); document.getElementById("footerLine").textContent = t("footerLine"); document.getElementById("refsTitle").textContent = t("refsTitle"); document.getElementById("customCityTitle").textContent = t("customCityTitle"); document.getElementById("customCityHelp").textContent = t("customCityHelp"); document.getElementById("citySearch").placeholder = t("searchPlaceholder"); document.getElementById("icsBtn").textContent = t("icsBtn"); setRTLIfNeeded(); }
async function renderReferences(){ try{ const j=await fetch("references.json").then(r=>r.json()); const body=document.getElementById("refsBody"); body.innerHTML=""; for(const line of j.lines){ const div=document.createElement("div"); div.className="ref-item"; div.textContent="• "+line; body.append(div); } }catch(_){ document.getElementById("refsBody").textContent="(No references)"; } }
function bindSearch(){ const input=document.getElementById("citySearch"); const sug=document.getElementById("suggestions"); input.addEventListener("input", ()=>{ const q=input.value.trim(); const items=searchCities(q,10); sug.innerHTML=""; if(!q || items.length===0){ sug.style.display="none"; return; } for(const it of items){ const row=document.createElement("div"); row.textContent=it.name; row.addEventListener("click", ()=>{ currentCityIndex=it.index; input.value=CITIES[it.index].name; sug.style.display="none"; render(); }); sug.append(row); } sug.style.display="block"; }); document.addEventListener("click", (e)=>{ if(!sug.contains(e.target) && e.target!==input) sug.style.display="none"; }); }
function runSelfTests(){ const results=[]; const push=(n,p,d="")=>results.push({name:n,pass:p,detail:d}); try{ const tz="Europe/Istanbul", now=nowInTZ(tz); const {hours}=buildPlanetaryHoursForDate(now,41.0082,28.9784,tz); push("24 saat & sıralı", hours.length===24 && hours.every((h,i,a)=>i===0 || a[i-1].end<=h.start), `len=${hours.length}`);}catch(e){ push("24 saat & sıralı",false,e.message); } try{ const tz="Europe/Istanbul", today=nowInTZ(tz); const base=makeDateInTZ(today.getFullYear(), today.getMonth()+1, today.getDate(),12,0,0,tz); const {sunrise,sunset,solarNoon}=getSunTimes(base,41.0082,28.9784); const h=+getZonedDateParts(sunrise,tz).hour; push("Doğuş 04–08 aralığı", h>=4 && h<=8, `hour=${h}`); push("Doğuş<Öğle<Batı", sunrise<solarNoon && solarNoon<sunset);}catch(e){ push("Güneş kontrolleri",false,e.message); } return results; }
function render(){
  const city=CITIES[currentCityIndex]||CITIES[0];
  const nowTZ=nowInTZ(city.tz);
  const data=buildPlanetaryHoursForDate(nowTZ, city.lat, city.lon, city.tz);
  const {hours,sunrise,sunset,solarNoon,dayRuler}=data;
  const best=pickWeightedBest(hours, nowTZ, dayRuler);
  const todayStr=formatInTZ(nowTZ, city.tz, {year:"numeric",month:"long",day:"numeric",weekday:"long"});
  const titleEl=document.getElementById("title");
  const titleSpan=titleEl.querySelector('span');
  if(titleSpan) titleSpan.textContent=`${t("today")} — ${todayStr} (${city.tz})`;
  else titleEl.textContent=`🌍 ${t("today")} — ${todayStr} (${city.tz})`;
  const sunlineEl=document.getElementById("sunline");
  const sunlineSpan=sunlineEl.querySelector('span');
  const sunText=`${t("sunrise")}: ${formatInTZ(sunrise,city.tz,{hour:"2-digit",minute:"2-digit"})} • ${t("solarnoon")}: ${formatInTZ(solarNoon,city.tz,{hour:"2-digit",minute:"2-digit"})} • ${t("sunset")}: ${formatInTZ(sunset,city.tz,{hour:"2-digit",minute:"2-digit"})}`;
  if(sunlineSpan) sunlineSpan.textContent=sunText;
  else sunlineEl.textContent=`☀️ ${sunText}`;
  const tbody=document.querySelector("#hoursTable tbody"); tbody.innerHTML="";
  hours.forEach((h,idx)=>{
    const isDayRuler=(h.planet===dayRuler);
    const isCurrent=(nowTZ >= h.start && nowTZ < h.end);
    const tr=document.createElement("tr");
    let className = h.segment==="day"?"row-day ":"row-night ";
    if(isCurrent) className += "current ";
    else if(isDayRuler) className += "highlight";
    tr.className=className;
    const tdIdx=document.createElement("td"); tdIdx.textContent=idx+1;
    const tdStart=document.createElement("td"); tdStart.textContent=formatInTZ(h.start, city.tz, {hour:"2-digit",minute:"2-digit"});
    const tdEnd=document.createElement("td"); tdEnd.textContent=formatInTZ(h.end, city.tz, {hour:"2-digit",minute:"2-digit"});
    const tdPlanet=document.createElement("td"); tdPlanet.textContent=`${PLANET_TR[h.planet]||h.planet} (${h.planet})`; const pill=document.createElement("span"); pill.className="pill"; pill.textContent=isDayRuler?"★":""; tdPlanet.appendChild(pill);
    const tdSeg=document.createElement("td"); tdSeg.textContent=t(h.segment==="day"?"segmentDay":"segmentNight");
    const tdPur=document.createElement("td"); tdPur.textContent=purposeText(h.planet);
    tr.append(tdIdx, tdStart, tdEnd, tdPlanet, tdSeg, tdPur);
    tbody.append(tr);
  });
  const box=document.getElementById("bestBox");
  if(hours.length){
    const best = pickWeightedBest(hours, nowTZ, dayRuler);
    box.innerHTML=""; const star=(best.planet===dayRuler)?" ★":"";
    const div=document.createElement("div"); div.className="badge";
    div.textContent=`${PLANET_TR[best.planet]||best.planet} (${best.planet})${star} — ${formatInTZ(best.start,city.tz,{hour:"2-digit",minute:"2-digit"})}–${formatInTZ(best.end,city.tz,{hour:"2-digit",minute:"2-digit"})} • ${formatInTZ(nowTZ,city.tz,{year:"numeric",month:"2-digit",day:"2-digit"})}`;
    box.append(div);
  } else box.textContent="…";
  const tests=runSelfTests(); const ul=document.getElementById("testList"); ul.innerHTML="";
  for(const tcase of tests){ const li=document.createElement("li"); li.style.color=tcase.pass?"#16a34a":"#b91c1c"; li.textContent=`${tcase.pass?"✓":"✗"} ${tcase.name}${tcase.detail?` — ${tcase.detail}`:""}`; ul.append(li); }
  document.getElementById("icsBtn").onclick=()=> downloadICS(city, city.tz, hours);
}
function bindCustomCities(){ document.getElementById("ccAddBtn").addEventListener("click", ()=>{ const name=document.getElementById("ccName").value.trim(); const lat=parseFloat(document.getElementById("ccLat").value); const lon=parseFloat(document.getElementById("ccLon").value); const tz=document.getElementById("ccTz").value.trim(); if(!name || isNaN(lat) || isNaN(lon) || !tz) return alert("Eksik ya da hatalı değerler."); const list=JSON.parse(localStorage.getItem("customCities")||"[]"); list.push({name,lat,lon,tz}); localStorage.setItem("customCities", JSON.stringify(list)); alert("Eklendi. Arama kutusundan şehrinizi bulabilirsiniz."); }); }
async function main(){
  document.getElementById("year").textContent=new Date().getFullYear();
  const ICONS=[
    `<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M14 2a9 9 0 100 20 9 9 0 010-18z" stroke="#065f46" stroke-width="2"/><path d="M22 12a10 10 0 01-10 10 8 8 0 01-1-15A8 8 0 0022 12z" fill="#16a34a"/></svg>`,
    `<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M5 7h14" stroke="#065f46" stroke-width="2"/></svg>`,
    `<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 10-7 8-7-8 7-10z" stroke="#065f46" stroke-width="2"/><path d="M5 10h14M7 13h10" stroke="#16a34a" stroke-width="2"/></svg>`,
    `<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 12c0-3 3-5 6-5 2 0 4 1 5 3" stroke="#065f46" stroke-width="2"/><path d="M12 12c1 0 2 .5 2 1.5S13 15 12 15a2 2 0 110-4" stroke="#16a34a" stroke-width="2"/></svg>`,
    `<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#065f46" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke="#16a34a" stroke-width="2"/></svg>`
  ];
  const row=document.getElementById("iconsRow"); row.innerHTML=""; for(const svg of ICONS){ const span=document.createElement("span"); span.innerHTML=svg; row.append(span.firstChild); }
  const sel=document.getElementById("langSelect"); sel.innerHTML=""; for(const code of Object.keys(I18N)){ const opt=document.createElement("option"); opt.value=code; opt.textContent=code.toUpperCase(); sel.append(opt); } sel.value=currentLang(); sel.addEventListener("change", ()=>{ applyI18n(); render(); });
  applyI18n();
  await loadCities();
  const input=document.getElementById("citySearch"); const sug=document.getElementById("suggestions");
  input.addEventListener("input", ()=>{ const q=input.value.trim(); const items=searchCities(q,10); sug.innerHTML=""; if(!q||items.length===0){sug.style.display="none";return;} items.forEach(it=>{ const div=document.createElement("div"); div.textContent=it.name; div.onclick=()=>{ currentCityIndex=it.index; input.value=CITIES[it.index].name; sug.style.display="none"; render(); }; sug.append(div); }); sug.style.display="block"; });
  document.addEventListener("click",(e)=>{ if(!sug.contains(e.target) && e.target!==input) sug.style.display="none"; });
  bindCustomCities();
  try{ currentCityIndex = await detectApproxCity(); }catch(_){ currentCityIndex=0; }
  input.value = (CITIES[currentCityIndex]||CITIES[0]).name;
  renderReferences();
  render();
}
main();
