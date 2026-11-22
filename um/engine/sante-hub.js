/* v20.92 — Claude, 22 nov 2026 (GO d'Éric 12 h 13, note 1GOKWIlf…). Pôle Santé branché sur loader-v2.js (SantePacks).
   Remplace le squelette de hub-nav.js (v20.91, l. 623) : window.UM_SANTE_LOADER est défini ici, de façon synchrone.
   Données réelles seulement : paquet v1g u5mr (UNICEF SDMX CME_MRY0T4, UN IGME), lu index d'abord, paquet à la demande,
   SHA-256 contrôlé par le chargeur. Rien n'est converti ni inventé ; toute lacune est marquée [INCOMPLET] (badge, % de
   couverture, index des lacunes). Aucun nœud du panneau de droite n'est touché (#um-rg-couches, #um-u-mine, #um-u-c2,
   #um-rg-fiche) ; aucune clé localStorage. Écouteurs posés par propriété (onclick), jamais par addEventListener, pour
   échapper au signal BOOT.ac du moteur (engine.js l. 3–6). Chemin du paquet : window.UM_SANTE_BASE, sinon DEFAULT_BASE. */
(function(){
  'use strict';
  const DEFAULT_BASE='/um/data/sante/u5mr/';
  const BASE=(typeof window.UM_SANTE_BASE==='string'&&window.UM_SANTE_BASE)||DEFAULT_BASE;
  const ZONES=['Africa','America','East','Europe','Middle East','South Pacific'];
  const UNATT='_NON_RATTACHE';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);
  const INC=t=>'<span class="inc">[INCOMPLET'+(t?' : '+esc(t):'')+']</span>';
  const GAP='<span class="um-gap-badge">LACUNE / GAP</span>';
  const pct=(a,b)=>b?(100*a/b):0;
  const f1=x=>x.toFixed(1).replace('.',',')+' %';

  const S={packs:null, index:null, err:null, opening:null, zone:null, geo:null, shardView:null, closed:false, el:null};
  window.UM_SANTE_LOADER={version:'v20.92', base:BASE, get state(){ return {open:!!S.index, error:S.err, zone:S.zone, geo:S.geo}; },
    show:()=>{ S.closed=false; tick(); }, hide:()=>{ S.closed=true; tick(); }};

  function open(){
    if(S.opening) return S.opening;
    if(typeof window.SantePacks!=='function'){ S.err='loader-v2.js absent (window.SantePacks non défini)'; return Promise.resolve(null); }
    S.packs=new window.SantePacks(BASE,{maxResidentRows:20000,maxParallel:2});
    S.opening=S.packs.open().then(ix=>{ S.index=ix; S.err=null; render(); return ix; })
      .catch(e=>{ S.err=String(e&&e.message||e); render(); return null; });
    return S.opening;
  }

  function zoneStats(){
    const ix=S.index, total=ix.source_rows||ix.shards.reduce((a,m)=>a+m.rows,0);
    const z={}; ix.shards.forEach(m=>{ const k=m.zone; (z[k]=z[k]||{geos:new Set(),rows:0,shards:0}); z[k].geos.add(m.geo); z[k].rows+=m.rows; z[k].shards++; });
    return {total, z};
  }

  function headHTML(){
    const ix=S.index, D=S.packs.dict||{};
    const tp=(D.TIME_PERIOD||[]).map(Number).filter(n=>isFinite(n));
    const span=tp.length?Math.min(...tp)+'–'+Math.max(...tp):'';
    return '<div class="lvl">PAQUET · '+esc(ix.format)+' · source '+esc(ix.source_file)+' · '+Number(ix.source_rows).toLocaleString('fr-CA')+' lignes · '+ix.shards.length+' paquets</div>'
      +'<div class="sub">Indicateur '+esc((D.INDICATOR||[]).join(', '))+' · unité '+esc((D.UNIT_MEASURE||[]).join(', '))+' · source '+esc((D.DATA_SOURCE||[]).join(', '))
      +' · sexe '+esc((D.SEX||[]).join(' / '))+' · quintiles '+esc((D.WEALTH_QUINTILE||[]).join(' / '))+(span?' · périodes '+esc(span)+' ('+tp.length+')':'')
      +' · SHA-256 source <code>'+esc(String(ix.source_sha256).slice(0,12))+'…</code> · chemin <code>'+esc(BASE)+'</code></div>';
  }

  function zonesHTML(){
    const {total,z}=zoneStats();
    const att=ZONES.reduce((a,k)=>a+(z[k]?z[k].rows:0),0);
    const rows=ZONES.map(k=>{ const r=z[k]; if(!r) return '<tr><td>'+esc(k)+'</td><td colspan="3">'+INC('aucun paquet')+' '+GAP+'</td></tr>';
      return '<tr><td><button type="button" data-zone="'+esc(k)+'"'+(S.zone===k?' aria-pressed="true"':'')+'>'+esc(k)+'</button></td><td>'+r.geos.size+'</td><td>'+r.rows.toLocaleString('fr-CA')+'</td><td>'+f1(pct(r.rows,total))+'</td></tr>'; }).join('');
    const u=z[UNATT];
    const urow=u?'<tr><td><button type="button" data-zone="'+UNATT+'"'+(S.zone===UNATT?' aria-pressed="true"':'')+'>Non rattachés</button></td><td>'+u.geos.size+'</td><td>'+u.rows.toLocaleString('fr-CA')+'</td><td>'+f1(pct(u.rows,total))+' '+GAP+' '+INC('agrégats et territoires sans zone dans la table cz.csv')+'</td></tr>':'';
    return '<div class="lvl">ZONES · couverture des lignes rattachées : '+f1(pct(att,total))+(att<total?' '+GAP:'')+'</div>'
      +'<table><tr><th>Zone</th><th>Codes</th><th>Lignes</th><th>% des lignes</th></tr>'+rows+urow+'</table>';
  }

  function geosHTML(){
    if(!S.zone) return '<div class="sub">Choisir une zone, puis un code REF_AREA : le paquet est chargé à la demande, SHA-256 contrôlé.</div>';
    const list=S.packs.find({zone:S.zone}).slice().sort((a,b)=>String(a.geo).localeCompare(String(b.geo)));
    return '<div class="lvl">'+esc(S.zone===UNATT?'NON RATTACHÉS':S.zone)+' · '+list.length+' code(s) REF_AREA '+INC('noms de pays non fournis par le paquet : codes seulement')+'</div><div class="um-sh-geos">'
      +list.map(m=>'<button type="button" data-geo="'+esc(m.geo)+'" data-path="'+esc(m.path)+'"'+(S.geo===m.geo?' aria-pressed="true"':'')+' title="'+m.rows+' lignes">'+esc(m.geo)+'</button>').join('')+'</div>';
  }

  function spark(pts){
    if(pts.length<2) return '';
    const W=520,H=90,P=4, xs=pts.map(p=>p.y), lo=Math.min(...pts.map(p=>p.lb!=null?p.lb:p.v)), hi=Math.max(...pts.map(p=>p.ub!=null?p.ub:p.v));
    const x0=Math.min(...xs), x1=Math.max(...xs), X=y=>P+(W-2*P)*(x1===x0?0:(y-x0)/(x1-x0)), Y=v=>H-P-(H-2*P)*(hi===lo?.5:(v-lo)/(hi-lo));
    const band=pts.filter(p=>p.lb!=null&&p.ub!=null);
    const poly=band.length>1?'<polygon fill="rgba(95,214,144,.18)" points="'+band.map(p=>X(p.y)+','+Y(p.ub)).concat(band.slice().reverse().map(p=>X(p.y)+','+Y(p.lb))).join(' ')+'"/>':'';
    return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" role="img" aria-label="Série OBS_VALUE">'+poly
      +'<polyline fill="none" stroke="#5fd690" stroke-width="1.6" points="'+pts.map(p=>X(p.y)+','+Y(p.v)).join(' ')+'"/>'
      +'<text x="'+P+'" y="'+(H-2)+'" fill="#8b98ad" font-size="10">'+x0+'</text><text x="'+(W-P)+'" y="'+(H-2)+'" fill="#8b98ad" font-size="10" text-anchor="end">'+x1+'</text>'
      +'<text x="'+P+'" y="11" fill="#8b98ad" font-size="10">'+esc(hi.toFixed(1))+'</text></svg>';
  }

  function shardHTML(){
    const v=S.shardView; if(!v) return '';
    if(v.err) return '<div class="lvl">'+esc(v.geo)+'</div>'+INC(v.err)+' '+GAP;
    if(!v.s) return '<div class="lvl">'+esc(v.geo)+' · lecture de '+esc(v.path)+' (SHA-256 contrôlé)…</div>';
    const all=[...S.packs.rows(v.s)];
    const tot=all.filter(r=>r.SEX==='_T'&&r.WEALTH_QUINTILE==='_T');
    const pts=tot.map(r=>({y:Number(r.TIME_PERIOD), v:Number(r.OBS_VALUE), lb:r.LOWER_BOUND===''?null:Number(r.LOWER_BOUND), ub:r.UPPER_BOUND===''?null:Number(r.UPPER_BOUND), raw:r}))
      .filter(p=>isFinite(p.y)&&isFinite(p.v)&&p.raw.OBS_VALUE!=='').sort((a,b)=>a.y-b.y);
    const yrs=(S.packs.dict.TIME_PERIOD||[]).length;
    const last=pts[pts.length-1];
    const nF=all.filter(r=>r.SEX==='F').length, nM=all.filter(r=>r.SEX==='M').length, nQ=all.filter(r=>r.WEALTH_QUINTILE!=='_T').length;
    const notes=[...new Set(all.map(r=>r.COUNTRY_NOTES).filter(Boolean))];
    const cov=pct(pts.length,yrs);
    return '<div class="lvl">'+esc(v.geo)+' · '+all.length+' lignes · paquet '+esc(v.path)+' · SHA-256 vérifié</div>'
      +(last?'<div class="sub">Dernière valeur (sexe _T, quintile _T) : <b>'+esc(last.raw.OBS_VALUE)+'</b> '+esc(last.raw.UNIT_MEASURE)+' en '+esc(last.raw.TIME_PERIOD)
        +(last.lb!=null?' · intervalle '+esc(last.raw.LOWER_BOUND)+' – '+esc(last.raw.UPPER_BOUND):' '+INC('bornes absentes'))+(last.raw.OBS_STATUS?' · statut '+esc(last.raw.OBS_STATUS):'')+'</div>':INC('aucune ligne sexe _T / quintile _T')+' '+GAP)
      +spark(pts)
      +'<div class="sub">Couverture des périodes (sexe _T, quintile _T) : '+pts.length+' / '+yrs+' périodes du dictionnaire = '+f1(cov)+(cov<25?' '+GAP:'')
        +' · lignes F : '+nF+' · M : '+nM+' · quintiles Q1–Q5 : '+nQ+(nQ?'':' '+INC('aucune ventilation par quintile'))+'</div>'
      +(notes.length?'<div class="sub">Note de pays (source) : '+notes.map(esc).join(' · ')+'</div>':'');
  }

  function gapsHTML(){
    const {total,z}=zoneStats(); const g=[];
    if(z[UNATT]) g.push(z[UNATT].geos.size+' codes non rattachés à une zone ('+f1(pct(z[UNATT].rows,total))+' des lignes)');
    ZONES.forEach(k=>{ if(!z[k]) g.push('zone '+k+' : aucun paquet'); });
    g.push('noms de pays : absents du paquet (codes REF_AREA seulement)');
    g.push('un seul indicateur servi (CME_MRY0T4) ; paquet v1 values-v1.3 non servi sous /um/');
    g.push('étage Santé de floors.js : n = 0 inchangé (floors.js est synchrone, le paquet arrive après) ; objets 3D de Classe 1/2 non construits');
    return '<div class="lvl">INDEX DES LACUNES</div><ul>'+g.map(x=>'<li>'+GAP+' '+esc(x)+'</li>').join('')+'</ul>';
  }

  function html(){
    let b='<button type="button" class="x" data-x="1" title="Replier">×</button><h3>Santé · mortalité des moins de 5 ans · paquet réel</h3>';
    if(S.err) return b+'<div class="sub">'+INC('paquet non lu à '+BASE+' — '+S.err)+' '+GAP+'</div><div class="sub">Le chargeur v2 est en place ; il attend index.json, dict.json.gz et shards/ servis à ce chemin.</div>';
    if(!S.index) return b+'<div class="sub">Lecture de '+esc(BASE)+'index.json…</div>';
    return b+headHTML()+zonesHTML()+geosHTML()+shardHTML()+gapsHTML();
  }

  function wire(el){
    el.querySelectorAll('[data-x]').forEach(x=>{ x.onclick=()=>{ S.closed=true; tick(); }; });
    el.querySelectorAll('[data-zone]').forEach(b=>{ b.onclick=()=>{ S.zone=b.dataset.zone; S.geo=null; S.shardView=null; render(); }; });
    el.querySelectorAll('[data-geo]').forEach(b=>{ b.onclick=()=>{
      const m=S.index.shards.find(x=>x.path===b.dataset.path); if(!m) return;
      S.geo=m.geo; S.shardView={geo:m.geo, path:m.path, loading:true}; render();
      S.packs.shard(m).then(s=>{ if(S.geo===m.geo){ S.shardView={geo:m.geo, path:m.path, s}; render(); } })
        .catch(e=>{ if(S.geo===m.geo){ S.shardView={geo:m.geo, path:m.path, err:String(e&&e.message||e)}; render(); } });
    }; });
  }
  function render(){ if(!S.el) return; const top=S.el.scrollTop; S.el.innerHTML=html(); wire(S.el); S.el.scrollTop=top; }

  function centerName(){ const c=$('hub-center'); return c?c.textContent.trim():''; }
  function chip(){ let c=$('um-sante-real-chip'); const st=$('stage'); if(!st) return null;
    if(!c){ c=document.createElement('button'); c.type='button'; c.id='um-sante-real-chip'; c.className='um-skel-chip'; c.textContent='Santé · paquet réel ▸'; c.onclick=()=>{ S.closed=false; tick(); }; st.appendChild(c); } return c; }
  function tick(){
    const st=$('stage'); if(!st) return;
    const on=centerName()==='Santé';
    if(on&&!S.closed){
      if(!S.el||!S.el.isConnected){ S.el=document.createElement('div'); S.el.id='um-sante-real'; S.el.className='um-skel um-sante-real'; st.appendChild(S.el); render(); open(); }
      S.el.hidden=false;
    } else if(S.el) S.el.hidden=true;
    const c=on&&S.closed?chip():$('um-sante-real-chip'); if(c) c.hidden=!(on&&S.closed);
  }
  const css=document.createElement('style'); css.id='um-v2092-sante-css';
  css.textContent='.um-sante-real{position:absolute;left:10px;top:10px;z-index:7;width:min(600px,calc(100% - 20px));max-height:calc(100% - 130px);overflow:auto;background:rgba(9,13,18,.96);color:#e6e9ee;font:12px/1.45 system-ui,sans-serif;padding:10px 12px;border-radius:8px;border:2px solid #5fd690!important}'
    +'.um-sante-real h3{margin:0 0 4px;font:600 14px/1.3 system-ui,sans-serif;color:#c9f5da}'
    +'.um-sante-real .lvl{font:600 11px ui-monospace,monospace;color:#bfe8ff;margin-top:8px}.um-sante-real .sub{color:#9aa3ad;font-size:11px;margin:4px 0}'
    +'.um-sante-real .inc{font:600 10px ui-monospace,monospace;color:#e8c872}.um-sante-real .x{float:right;font:700 13px system-ui;padding:0 7px}'
    +'.um-sante-real table{border-collapse:collapse;width:100%;margin:4px 0 8px}.um-sante-real td,.um-sante-real th{border-bottom:1px solid #26303b;padding:3px 4px;text-align:left;font-size:11px;color:inherit}'
    +'.um-sante-real button{background:#0d1a26;color:#dbe6ff;border:1px solid #33405a;border-radius:4px;cursor:pointer}'
    +'.um-sante-real button[data-zone],.um-sante-real button[data-geo]{font:500 11px/1.2 system-ui,sans-serif;padding:2px 6px;margin:1px}'
    +'.um-sante-real button[aria-pressed=true]{border-color:#5fd690;color:#c9f5da}'
    +'.um-sh-geos{display:flex;flex-wrap:wrap;gap:2px;margin:4px 0 8px}'
    +'.um-sante-real code{font:10px ui-monospace,monospace;color:#bfe8ff}';
  (document.head||document.documentElement).appendChild(css);
  setInterval(tick,1200);
  setTimeout(tick,0);
})();
