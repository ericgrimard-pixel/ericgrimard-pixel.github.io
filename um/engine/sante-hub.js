/* v20.92 — Claude, 22 nov 2026 (GO d'Éric 12 h 13, note 1GOKWIlf…). Pôle Santé branché sur loader-v2.js (SantePacks).
   Remplace le squelette de hub-nav.js (v20.91, l. 623) : window.UM_SANTE_LOADER est défini ici, de façon synchrone.
   Données réelles seulement : paquet v1g u5mr (UNICEF SDMX CME_MRY0T4, UN IGME), lu index d'abord, paquet à la demande,
   SHA-256 contrôlé par le chargeur. Rien n'est converti ni inventé ; toute lacune est marquée [INCOMPLET] (badge, % de
   couverture, index des lacunes). Aucun nœud du panneau de droite n'est touché (#um-rg-couches, #um-u-mine, #um-u-c2,
   #um-rg-fiche) ; aucune clé localStorage. Écouteurs posés par propriété (onclick), jamais par addEventListener, pour
   échapper au signal BOOT.ac du moteur (engine.js l. 3–6). Chemin du paquet : window.UM_SANTE_BASE, sinon DEFAULT_BASE.

   v20.95 — 23 nov 2026 (Toronto), signalement vocal d'Éric 18 h 43 : « l'étage Santé s'ouvre sur un vide ».
   Cause trouvée : l'étage Santé de floors.js a n = 0 (aucun enfant, aucun objet de Classe 1/2) ; le moteur 3D n'y dessine
   donc que l'anneau vide. Le seul contenu était ce panneau, qui (1) ne montrait que des métadonnées et des codes tant qu'on
   n'avait pas choisi une zone puis un code, et (2) une fois replié par ×, restait replié à chaque retour sur Santé : il ne
   restait alors que l'anneau vide et une petite pastille. Correctif (aucun fichier du moteur touché, rien de retiré) :
     a) OBSERVATOIRE : un calque 2D (canvas transparent, pointer-events:none) posé sur la scène, au-dessus de l'anneau 3D et
        sous le panneau, visible seulement sur l'étage Santé. Chaque pays apparaît quand son paquet est lu et vérifié
        (SHA-256) ; distance au centre = taux de mortalité des moins de 5 ans réel (échelle log), couleur selon la valeur ;
        balayage des années réelles 1990 → dernière année ; MONDE (WORLD) au centre. Rien n'est interpolé dans les données :
        seul le déplacement visuel entre deux années réelles est adouci.
     b) PANNEAU : vue d'ensemble immédiate (statut du paquet, 269 paquets, 67 210 lignes, couverture, lecture en direct),
        MONDE et Canada en tête, recherche par code, classements de la dernière année, puis forage jusqu'à la valeur
        année par année (bornes, statut, F / M, quintiles Q1–Q5 quand la source en a). Sous-domaines Santé non servis
        marqués [INCOMPLET] avec la couverture publiée du treillis v1.4. Caractères agrandis (lisibilité).
     c) Le panneau se rouvre à chaque nouvelle entrée sur Santé (le × ne vaut que pour la visite en cours).
     (Aucun lien direct vers l'étage : le Hub s'ouvre toujours sur Finance, canon engine.js.)
   v20.95.1 : la liste des sous-domaines lisait seulement les libellés entre guillemets (2 sur 7) ; elle les lit tous.
   Noms de pays : absents du paquet ; on n'en ajoute pas (codes REF_AREA seulement) [INCOMPLET]. */
(function(){
  'use strict';
  const VERSION='v20.95.1';
  const DEFAULT_BASE='/um/data/sante/u5mr/';
  const BASE=(typeof window.UM_SANTE_BASE==='string'&&window.UM_SANTE_BASE)||DEFAULT_BASE;
  const LAT='/plumb-dump-data/lattice/v1.4/';
  const ZONES=['Africa','America','East','Europe','Middle East','South Pacific'];
  const ZCOL={'Africa':'#e8c872','America':'#7fd1ff','East':'#b388ff','Europe':'#5fd6c8','Middle East':'#ff8a5c','South Pacific':'#9fd36b'};
  const UNATT='_NON_RATTACHE';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);
  const INC=t=>'<span class="inc">[INCOMPLET'+(t?' : '+esc(t):'')+']</span>';
  const GAP='<span class="um-gap-badge">LACUNE / GAP</span>';
  const pct=(a,b)=>b?(100*a/b):0;
  const f1=x=>x.toFixed(1).replace('.',',')+' %';
  const v1=x=>Number(x).toFixed(1).replace('.',',');
  const nfr=x=>Number(x).toLocaleString('fr-CA');
  const REDUCED=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  const S={packs:null, index:null, err:null, opening:null, zone:null, geo:null, shardView:null, closed:false, el:null,
    scan:null, q:'', wasOn:false, sub:null, dirty:false, obs:null};
  window.UM_SANTE_LOADER={version:VERSION, base:BASE,
    get state(){ return {open:!!S.index, error:S.err, zone:S.zone, geo:S.geo,
      scanned:S.scan?S.scan.done:0, total:S.index?S.index.shards.length:0, rows:S.scan?S.scan.rows:0, errors:S.scan?S.scan.err.length:0}; },
    get summary(){ return S.scan?S.scan.by:null; },
    show:()=>{ S.closed=false; tick(); }, hide:()=>{ S.closed=true; tick(); }, select:g=>selectGeo(g)};

  function open(){
    if(S.opening) return S.opening;
    if(typeof window.SantePacks!=='function'){ S.err='loader-v2.js absent (window.SantePacks non défini)'; render(); return Promise.resolve(null); }
    S.packs=new window.SantePacks(BASE,{maxResidentRows:20000,maxParallel:3});
    S.opening=S.packs.open().then(ix=>{ S.index=ix; S.err=null; render(); scan(); return ix; })
      .catch(e=>{ S.err=String(e&&e.message||e); render(); return null; });
    return S.opening;
  }

  /* ---------- lecture de tous les paquets (réels, SHA-256 vérifiés), résumé par code ---------- */
  function summarize(m,s){
    const by=S.scan.by; const rec=by[m.geo]||(by[m.geo]={geo:m.geo, zone:m.zone, path:m.path, rows:0, ser:[], lastF:null, lastM:null, q:{}, notes:''});
    rec.rows+=m.rows;
    for(const r of S.packs.rows(s)){
      if(r.OBS_VALUE==='') continue;
      const y=Number(r.TIME_PERIOD), v=Number(r.OBS_VALUE); if(!isFinite(y)||!isFinite(v)) continue;
      if(r.COUNTRY_NOTES&&!rec.notes) rec.notes=r.COUNTRY_NOTES;
      if(r.WEALTH_QUINTILE!=='_T'){ const k=r.WEALTH_QUINTILE; if(r.SEX==='_T'&&(!rec.q[k]||y>rec.q[k].y)) rec.q[k]={y,raw:r.OBS_VALUE}; continue; }
      if(r.SEX==='_T') rec.ser.push({y,v,raw:r.OBS_VALUE});
      else if(r.SEX==='F'){ if(!rec.lastF||y>rec.lastF.y) rec.lastF={y,raw:r.OBS_VALUE}; }
      else if(r.SEX==='M'){ if(!rec.lastM||y>rec.lastM.y) rec.lastM={y,raw:r.OBS_VALUE}; }
    }
    rec.ser.sort((a,b)=>a.y-b.y);
    rec.last=rec.ser.length?rec.ser[rec.ser.length-1]:null;
    rec.byY=new Map(rec.ser.map(p=>[p.y,p.v]));
    rec.first=rec.ser.length?rec.ser[0]:null;
    rec.angle=null;
    return rec;
  }
  function prio(m){ return m.geo==='WORLD'?0:m.geo==='CAN'?1:m.zone===UNATT?3:2; }
  function scan(){
    if(S.scan||!S.index) return;
    const order=S.index.shards.slice().sort((a,b)=>prio(a)-prio(b)||String(a.zone).localeCompare(String(b.zone))||String(a.geo).localeCompare(String(b.geo)));
    S.scan={done:0, rows:0, err:[], by:{}, total:order.length, t0:performance.now(), t1:null};
    let i=0;
    const next=()=>{
      if(i>=order.length){ if(S.scan.done>=S.scan.total&&!S.scan.t1){ S.scan.t1=performance.now(); S.dirty=true; } return; }
      const m=order[i++];
      S.packs.shard(m).then(s=>{ summarize(m,s); S.scan.rows+=m.rows; })
        .catch(e=>{ S.scan.err.push(m.geo+' : '+String(e&&e.message||e)); })
        .then(()=>{ S.scan.done++; S.dirty=true; next(); });
    };
    for(let k=0;k<3;k++) next();
    layoutAngles();
  }
  /* angle fixe de chaque pays dans le secteur de sa zone (ordre des codes) — positions stables pendant la lecture */
  function layoutAngles(){
    const per={}; S.index.shards.forEach(m=>{ if(ZONES.includes(m.zone)) (per[m.zone]=per[m.zone]||[]).push(m.geo); });
    S.angles={};
    ZONES.forEach((z,zi)=>{ const L=(per[z]||[]).sort(); const a0=-Math.PI/2+zi*Math.PI/3, span=Math.PI/3;
      L.forEach((g,k)=>{ S.angles[g]=a0+span*(0.07+0.86*(L.length<2?.5:k/(L.length-1))); }); });
  }

  /* ---------- sous-domaines Santé publiés par le treillis (couverture seulement, aucune valeur) ---------- */
  function loadSub(){
    if(S.sub) return;
    S.sub={state:'lecture'};
    Promise.all([fetch(LAT+'coverage_by_field_v1.4.csv').then(r=>r.ok?r.text():'').catch(()=>''), fetch(LAT+'gaps_v1.4.json').then(r=>r.ok?r.json():null).catch(()=>null)])
      .then(([csv,gj])=>{
        const F={}; csv.split('\n').slice(1).forEach(l=>{ const m=l.match(/^([^,]+),(?:"([^"]*)"|([^,"]*)),([^,]+),(\d+),(\d+),([\d.]+),/); if(!m) return; m.splice(2,2,m[2]!=null?m[2]:m[3]); /* v20.95.1 : libellés avec ou sans guillemets */
          const f=F[m[1]]||(F[m[1]]={id:m[1],label:m[2],cells:0,filled:0}); f.cells+=+m[4]; f.filled+=+m[5]; });
        S.sub={state:'ok', fields:Object.values(F), gaps:(gj&&gj.gaps)||[]}; S.dirty=true;
      });
  }

  /* ---------- HTML ---------- */
  function headHTML(){
    const ix=S.index, D=S.packs.dict||{};
    const tp=(D.TIME_PERIOD||[]).map(Number).filter(n=>isFinite(n));
    const span=tp.length?Math.min(...tp)+'–'+Math.max(...tp):'';
    return '<div class="lvl">PAQUET · '+esc(ix.format)+' · source '+esc(ix.source_file)+' · '+nfr(ix.source_rows)+' lignes · '+ix.shards.length+' paquets</div>'
      +'<div class="sub">Indicateur '+esc((D.INDICATOR||[]).join(', '))+' · unité '+esc((D.UNIT_MEASURE||[]).join(', '))+' · source '+esc((D.DATA_SOURCE||[]).join(', '))
      +' · sexe '+esc((D.SEX||[]).join(' / '))+' · quintiles '+esc((D.WEALTH_QUINTILE||[]).join(' / '))+(span?' · périodes '+esc(span)+' ('+tp.length+')':'')
      +' · SHA-256 source <code>'+esc(String(ix.source_sha256).slice(0,12))+'…</code> · chemin <code>'+esc(BASE)+'</code></div>';
  }
  function statusHTML(){
    const ix=S.index, sc=S.scan, D=S.packs.dict||{};
    const tp=(D.TIME_PERIOD||[]).map(Number).filter(n=>isFinite(n));
    const {total,z}=zoneStats(); const att=ZONES.reduce((a,k)=>a+(z[k]?z[k].rows:0),0);
    const nC=ix.shards.filter(m=>ZONES.includes(m.zone)).length, nA=ix.shards.length-nC;
    const done=sc?sc.done:0, prog=pct(done,ix.shards.length);
    const live=sc&&!sc.t1?'<span class="live">● lecture en direct</span>':'<span class="ok">✓ tous les paquets lus</span>';
    return '<div class="um-sh-kpis">'
      +'<div><b>'+ix.shards.length+'</b><span>paquets · territoires et agrégats</span></div>'
      +'<div><b>'+nfr(ix.source_rows)+'</b><span>lignes réelles UN IGME</span></div>'
      +'<div><b>'+(tp.length?Math.min(...tp)+'–'+Math.max(...tp):'?')+'</b><span>période couverte ('+tp.length+' années)</span></div>'
      +'<div><b>'+f1(pct(att,total))+'</b><span>lignes rattachées à une zone'+(att<total?' '+GAP:'')+'</span></div>'
      +'</div>'
      +'<div class="sub">'+live+' · paquets vérifiés SHA-256 : <b>'+done+' / '+ix.shards.length+'</b> ('+f1(prog)+') · lignes lues : <b>'+nfr(sc?sc.rows:0)+'</b> / '+nfr(ix.source_rows)
      +' · '+nC+' pays rattachés à 6 zones, '+nA+' codes non rattachés (agrégats régionaux, mondiaux et petits territoires)'
      +(sc&&sc.err.length?' · '+INC(sc.err.length+' paquet(s) refusé(s) : '+sc.err.slice(0,3).join(' ; ')):'')+'</div>'
      +'<div class="um-sh-bar"><i style="width:'+prog.toFixed(1)+'%"></i></div>';
  }
  function geoBtn(g,txt,extra){ return '<button type="button" data-geo="'+esc(g)+'"'+(S.geo===g?' aria-pressed="true"':'')+(extra||'')+'>'+txt+'</button>'; }
  function headlineHTML(){
    const by=S.scan?S.scan.by:{};
    const card=(g,label)=>{ const r=by[g];
      if(!r) return '<div class="um-sh-card">'+geoBtn(g,esc(label))+'<div class="sub">lecture du paquet…</div></div>';
      if(!r.last) return '<div class="um-sh-card">'+geoBtn(g,esc(label))+INC('aucune ligne sexe _T / quintile _T')+'</div>';
      const p90=r.byY.get(1990);
      return '<div class="um-sh-card">'+geoBtn(g,esc(label))
        +'<div class="big">'+v1(r.last.v)+' <small>décès / 1 000 naissances vivantes</small></div>'
        +'<div class="sub">'+r.last.y+(p90!=null?' · en 1990 : '+v1(p90)+' ('+(r.last.v<p90?'−':'+')+Math.abs(100*(r.last.v-p90)/p90).toFixed(0)+' %)':'')+' · '+r.ser.length+' années de série</div>'
        +spark(r.ser.map(p=>({y:p.y,v:p.v,lb:null,ub:null})),260,46)+'</div>';
    };
    return '<div class="lvl">EN TÊTE · mortalité des moins de 5 ans (dernière valeur réelle)</div><div class="um-sh-cards">'+card('WORLD','Monde · WORLD')+card('CAN','Canada · CAN')+'</div>';
  }
  function searchResultsHTML(){
    if(!S.index) return '';
    const q=S.q.trim().toUpperCase(); if(!q) return '<div class="sub">Taper un code REF_AREA (ex. CAN, FRA, NGA, UNICEF_SSA, WB_LI) — ou choisir dans les classements, les zones ou l\u2019observatoire.</div>';
    const by=S.scan?S.scan.by:{};
    const L=S.index.shards.filter(m=>String(m.geo).toUpperCase().includes(q)).slice(0,40);
    if(!L.length) return '<div class="sub">Aucun code ne contient « '+esc(q)+' ».</div>';
    return '<div class="um-sh-geos">'+L.map(m=>{ const r=by[m.geo]; return geoBtn(m.geo,esc(m.geo)+(r&&r.last?' <small>'+v1(r.last.v)+' ('+r.last.y+')</small>':'')); }).join('')+'</div>';
  }
  function rankHTML(){
    const by=S.scan?S.scan.by:{};
    const L=Object.values(by).filter(r=>ZONES.includes(r.zone)&&r.last).sort((a,b)=>b.last.v-a.last.v);
    if(L.length<2) return '<div class="lvl">CLASSEMENTS</div><div class="sub">Les classements se remplissent à mesure que les paquets sont lus…</div>';
    const max=L[0].last.v;
    const row=(r,i)=>'<tr><td>'+(i+1)+'</td><td>'+geoBtn(r.geo,esc(r.geo))+'</td><td><span class="zt" style="color:'+(ZCOL[r.zone]||'#9aa3ad')+'">'+esc(r.zone)+'</span></td><td class="n">'+v1(r.last.v)+'</td><td>'+r.last.y+'</td><td class="barc"><i style="width:'+Math.max(1,100*r.last.v/max).toFixed(1)+'%;background:'+col(r.last.v)+'"></i></td></tr>';
    const hi=L.slice(0,10), lo=L.slice(-10).reverse();
    const done=S.scan&&S.scan.t1?'':' · '+INC('classement partiel : lecture en cours');
    return '<div class="lvl">CLASSEMENTS · dernière année réelle de chaque pays · '+L.length+' pays lus'+done+'</div>'
      +'<div class="um-sh-two"><div><div class="sub"><b>Taux les plus élevés</b></div><table><tr><th>#</th><th>Code</th><th>Zone</th><th>‰</th><th>Année</th><th></th></tr>'+hi.map(row).join('')+'</table></div>'
      +'<div><div class="sub"><b>Taux les plus bas</b></div><table><tr><th>#</th><th>Code</th><th>Zone</th><th>‰</th><th>Année</th><th></th></tr>'+lo.map((r,i)=>row(r,L.length-1-i)).join('')+'</table></div></div>';
  }
  function zoneStats(){
    const ix=S.index, total=ix.source_rows||ix.shards.reduce((a,m)=>a+m.rows,0);
    const z={}; ix.shards.forEach(m=>{ const k=m.zone; (z[k]=z[k]||{geos:new Set(),rows:0,shards:0}); z[k].geos.add(m.geo); z[k].rows+=m.rows; z[k].shards++; });
    return {total, z};
  }
  function zonesHTML(){
    const {total,z}=zoneStats();
    const att=ZONES.reduce((a,k)=>a+(z[k]?z[k].rows:0),0);
    const rows=ZONES.map(k=>{ const r=z[k]; if(!r) return '<tr><td>'+esc(k)+'</td><td colspan="3">'+INC('aucun paquet')+' '+GAP+'</td></tr>';
      return '<tr><td><button type="button" data-zone="'+esc(k)+'"'+(S.zone===k?' aria-pressed="true"':'')+' style="border-left:4px solid '+ZCOL[k]+'">'+esc(k)+'</button></td><td>'+r.geos.size+'</td><td>'+nfr(r.rows)+'</td><td>'+f1(pct(r.rows,total))+'</td></tr>'; }).join('');
    const u=z[UNATT];
    const urow=u?'<tr><td><button type="button" data-zone="'+UNATT+'"'+(S.zone===UNATT?' aria-pressed="true"':'')+'>Non rattachés</button></td><td>'+u.geos.size+'</td><td>'+nfr(u.rows)+'</td><td>'+f1(pct(u.rows,total))+' '+GAP+' '+INC('agrégats et territoires sans zone dans la table cz.csv')+'</td></tr>':'';
    return '<div class="lvl">ZONES · couverture des lignes rattachées : '+f1(pct(att,total))+(att<total?' '+GAP:'')+'</div>'
      +'<table><tr><th>Zone</th><th>Codes</th><th>Lignes</th><th>% des lignes</th></tr>'+rows+urow+'</table>';
  }
  function geosHTML(){
    if(!S.zone) return '<div class="sub">Choisir une zone pour voir tous ses codes REF_AREA et leur dernière valeur.</div>';
    const by=S.scan?S.scan.by:{};
    const list=S.packs.find({zone:S.zone}).slice().sort((a,b)=>String(a.geo).localeCompare(String(b.geo)));
    return '<div class="lvl">'+esc(S.zone===UNATT?'NON RATTACHÉS':S.zone)+' · '+list.length+' code(s) REF_AREA '+INC('noms de pays non fournis par le paquet : codes seulement')+'</div><div class="um-sh-geos">'
      +list.map(m=>{ const r=by[m.geo]; return '<button type="button" data-geo="'+esc(m.geo)+'"'+(S.geo===m.geo?' aria-pressed="true"':'')+' title="'+m.rows+' lignes">'+esc(m.geo)+(r&&r.last?' <small>'+v1(r.last.v)+'</small>':'')+'</button>'; }).join('')+'</div>';
  }
  function spark(pts,W,H){
    if(pts.length<2) return '';
    W=W||520; H=H||90; const P=4, xs=pts.map(p=>p.y), lo=Math.min(...pts.map(p=>p.lb!=null?p.lb:p.v)), hi=Math.max(...pts.map(p=>p.ub!=null?p.ub:p.v));
    const x0=Math.min(...xs), x1=Math.max(...xs), X=y=>P+(W-2*P)*(x1===x0?0:(y-x0)/(x1-x0)), Y=v=>H-P-(H-2*P)*(hi===lo?.5:(v-lo)/(hi-lo));
    const band=pts.filter(p=>p.lb!=null&&p.ub!=null);
    const poly=band.length>1?'<polygon fill="rgba(95,214,144,.18)" points="'+band.map(p=>X(p.y)+','+Y(p.ub)).concat(band.slice().reverse().map(p=>X(p.y)+','+Y(p.lb))).join(' ')+'"/>':'';
    return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" role="img" aria-label="Série OBS_VALUE">'+poly
      +'<polyline fill="none" stroke="#5fd690" stroke-width="1.8" points="'+pts.map(p=>X(p.y)+','+Y(p.v)).join(' ')+'"/>'
      +'<text x="'+P+'" y="'+(H-2)+'" fill="#9fb0c6" font-size="11">'+x0+'</text><text x="'+(W-P)+'" y="'+(H-2)+'" fill="#9fb0c6" font-size="11" text-anchor="end">'+x1+'</text>'
      +'<text x="'+P+'" y="12" fill="#9fb0c6" font-size="11">'+esc(hi.toFixed(1))+'</text></svg>';
  }
  function shardHTML(){
    const v=S.shardView; if(!v) return '<div class="lvl">FORAGE</div><div class="sub">Cliquer un code (en tête, classements, recherche ou zones) : sa série complète s\u2019ouvre ici, jusqu\u2019à la valeur de chaque année.</div>';
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
    /* année par année : _T, F, M (quintile _T) */
    const sexY={F:{},M:{}}; all.forEach(r=>{ if(r.WEALTH_QUINTILE==='_T'&&(r.SEX==='F'||r.SEX==='M')&&r.OBS_VALUE!=='') sexY[r.SEX][r.TIME_PERIOD]=r.OBS_VALUE; });
    const yrows=pts.slice().reverse().map(p=>'<tr><td>'+esc(p.raw.TIME_PERIOD)+'</td><td class="n" title="'+esc(p.raw.OBS_VALUE)+'"><b>'+v1(p.v)+'</b></td><td class="n">'+(p.lb!=null?v1(p.lb):'—')+'</td><td class="n">'+(p.ub!=null?v1(p.ub):'—')+'</td><td class="n">'+(sexY.F[p.raw.TIME_PERIOD]!=null?v1(sexY.F[p.raw.TIME_PERIOD]):'—')+'</td><td class="n">'+(sexY.M[p.raw.TIME_PERIOD]!=null?v1(sexY.M[p.raw.TIME_PERIOD]):'—')+'</td><td>'+esc(p.raw.OBS_STATUS||'')+'</td></tr>').join('');
    /* quintiles : toutes les années où la source en a (sexe _T) */
    const qY={}; all.forEach(r=>{ if(r.WEALTH_QUINTILE!=='_T'&&r.SEX==='_T'&&r.OBS_VALUE!=='') (qY[r.TIME_PERIOD]=qY[r.TIME_PERIOD]||{})[r.WEALTH_QUINTILE]=r.OBS_VALUE; });
    const qYears=Object.keys(qY).sort().reverse();
    const QS=['Q1','Q2','Q3','Q4','Q5'];
    const qtab=qYears.length?'<details><summary>Quintiles de richesse Q1–Q5 · '+qYears.length+' année(s) de la source</summary><table><tr><th>Année</th>'+QS.map(q=>'<th>'+q+'</th>').join('')+'</tr>'
      +qYears.map(y=>'<tr><td>'+esc(y)+'</td>'+QS.map(q=>'<td class="n">'+(qY[y][q]!=null?v1(qY[y][q]):'—')+'</td>').join('')+'</tr>').join('')+'</table></details>':'';
    return '<div class="lvl">FORAGE · '+esc(v.geo)+' · '+all.length+' lignes · paquet '+esc(v.path)+' · SHA-256 vérifié</div>'
      +(last?'<div class="big">'+v1(last.v)+' <small>'+esc(last.raw.UNIT_MEASURE)+' (décès / 1 000 naissances vivantes) en '+esc(last.raw.TIME_PERIOD)+'</small></div><div class="sub">Valeur brute : '+esc(last.raw.OBS_VALUE)
        +(last.lb!=null?' · intervalle '+v1(last.lb)+' – '+v1(last.ub):' '+INC('bornes absentes'))+(last.raw.OBS_STATUS?' · statut '+esc(last.raw.OBS_STATUS):'')+'</div>':INC('aucune ligne sexe _T / quintile _T')+' '+GAP)
      +spark(pts)
      +'<div class="sub">Couverture des périodes (sexe _T, quintile _T) : '+pts.length+' / '+yrs+' périodes du dictionnaire = '+f1(cov)+(cov<25?' '+GAP:'')
        +' · lignes F : '+nF+' · M : '+nM+' · quintiles Q1–Q5 : '+nQ+(nQ?'':' '+INC('aucune ventilation par quintile'))+'</div>'
      +(notes.length?'<div class="sub">Note de pays (source) : '+notes.map(esc).join(' · ')+'</div>':'')
      +'<details open><summary>Année par année · '+pts.length+' valeurs (arrondies à 0,1 ; valeur brute au survol)</summary><div class="um-sh-yt"><table><tr><th>Année</th><th>Total ‰</th><th>Borne inf.</th><th>Borne sup.</th><th>Filles</th><th>Garçons</th><th>Statut</th></tr>'+yrows+'</table></div></details>'
      +qtab;
  }
  function subHTML(){
    const s=S.sub; let b='<div class="lvl">AUTRES SOUS-DOMAINES SANTÉ · '+INC('paquets non servis sur le Hub')+'</div>';
    b+='<div class="sub">Servi ici : un seul indicateur (CME_MRY0T4, mortalité des moins de 5 ans). Les sous-domaines ci-dessous existent dans le treillis Santé v1.4 publié (<a href="/plumb-dump-data/lattice/" target="_blank" rel="noopener">treillis ↗</a>), mais leurs valeurs ne sont pas encore servies au Hub. Couverture = cellules remplies / cellules cibles du treillis.</div>';
    if(!s||s.state!=='ok') return b+'<div class="sub">Lecture du treillis…</div>';
    if(!s.fields.length&&!s.gaps.length) return b+INC('coverage_by_field_v1.4.csv et gaps_v1.4.json non lus')+' '+GAP;
    b+='<table><tr><th>Sous-domaine</th><th>Couverture (treillis)</th><th>Hub</th></tr>'+s.fields.map(f=>{ const p=pct(f.filled,f.cells);
      return '<tr><td>'+esc(f.label)+'</td><td class="n">'+f1(p)+(p<25?' '+GAP:'')+'</td><td>'+INC('en attente')+'</td></tr>'; }).join('')+'</table>';
    const sub=s.gaps.filter(g=>/subnat/.test(g.id||''));
    if(sub.length) b+='<div class="sub">Infranational : '+sub.map(g=>esc(g.section)+' '+v1(g.coverage_pct_all)+' %').join(' · ')+' '+INC('PROVISIONAL')+'</div>';
    return b;
  }
  function gapsHTML(){
    const {total,z}=zoneStats(); const g=[];
    if(z[UNATT]) g.push(z[UNATT].geos.size+' codes non rattachés à une zone ('+f1(pct(z[UNATT].rows,total))+' des lignes)');
    ZONES.forEach(k=>{ if(!z[k]) g.push('zone '+k+' : aucun paquet'); });
    g.push('noms de pays : absents du paquet (codes REF_AREA seulement)');
    g.push('un seul indicateur servi (CME_MRY0T4) ; paquet v1 values-v1.3 non servi sous /um/');
    g.push('étage Santé de floors.js : n = 0 inchangé ; objets 3D de Classe 1/2 non construits — l\u2019observatoire 2D (v20.95) occupe la scène en attendant');
    return '<div class="lvl">INDEX DES LACUNES</div><ul>'+g.map(x=>'<li>'+GAP+' '+esc(x)+'</li>').join('')+'</ul>';
  }

  /* ---------- panneau : sections mises à jour séparément (la recherche garde le focus) ---------- */
  const SECS=['st','hd','sr','dr','rk','zn','sb','gp'];
  function frame(){
    return '<button type="button" class="x" data-x="1" title="Replier (revient à la prochaine entrée sur Santé)">×</button>'
      +'<h3>Santé · mortalité des moins de 5 ans · paquet réel UN IGME <span class="ver">'+VERSION+'</span></h3>'
      +'<div data-s="st"></div><div data-s="hd"></div>'
      +'<div class="lvl">RECHERCHE</div><input type="search" class="um-sh-q" placeholder="Code REF_AREA : CAN, FRA, WORLD…" aria-label="Chercher un code REF_AREA" value="'+esc(S.q)+'">'
      +'<div data-s="sr"></div><div data-s="dr"></div><div data-s="rk"></div><div data-s="zn"></div><div data-s="sb"></div><div data-s="gp"></div>';
  }
  function secHTML(k){
    switch(k){
      case 'st': return statusHTML()+'<details class="um-sh-meta"><summary>Métadonnées du paquet</summary>'+headHTML()+'</details>';
      case 'hd': return headlineHTML();
      case 'sr': return searchResultsHTML();
      case 'dr': return shardHTML();
      case 'rk': return rankHTML();
      case 'zn': return zonesHTML()+geosHTML();
      case 'sb': return subHTML();
      case 'gp': return gapsHTML();
    }
    return '';
  }
  function upd(keys){
    if(!S.el||!S.index) return;
    (keys||SECS).forEach(k=>{ const d=S.el.querySelector('[data-s="'+k+'"]'); if(!d) return;
      const keepOpen=[...d.querySelectorAll('details')].map(x=>x.open);
      d.innerHTML=secHTML(k); wire(d);
      const ds=d.querySelectorAll('details'); keepOpen.forEach((o,i)=>{ if(ds[i]) ds[i].open=o; }); });
  }
  function render(){
    if(!S.el) return; const top=S.el.scrollTop;
    if(S.err){ S.el.innerHTML='<button type="button" class="x" data-x="1" title="Replier">×</button><h3>Santé · mortalité des moins de 5 ans · paquet réel</h3><div class="sub">'+INC('paquet non lu à '+BASE+' — '+S.err)+' '+GAP+'</div><div class="sub">Le chargeur v2 est en place ; il attend index.json, dict.json.gz et shards/ servis à ce chemin.</div>'; wire(S.el); return; }
    if(!S.index){ S.el.innerHTML='<button type="button" class="x" data-x="1" title="Replier">×</button><h3>Santé · mortalité des moins de 5 ans · paquet réel</h3><div class="sub">Lecture de '+esc(BASE)+'index.json…</div>'; wire(S.el); return; }
    if(!S.el.querySelector('[data-s]')){ S.el.innerHTML=frame(); wire(S.el);
      const q=S.el.querySelector('.um-sh-q'); if(q) q.oninput=()=>{ S.q=q.value; upd(['sr']); }; }
    upd(); S.el.scrollTop=top;
  }
  function selectGeo(g){
    if(!S.index) return;
    const m=S.index.shards.find(x=>x.geo===g); if(!m) return;
    S.geo=m.geo; S.zone=m.zone; S.shardView={geo:m.geo, path:m.path, loading:true}; upd(['dr','zn','hd','rk','sr']);
    const d=S.el&&S.el.querySelector('[data-s="dr"]'); if(d&&S.el){ S.el.scrollTop=Math.max(0,d.offsetTop-8); }
    S.packs.shard(m).then(s=>{ if(S.geo===m.geo){ S.shardView={geo:m.geo, path:m.path, s}; upd(['dr']); } })
      .catch(e=>{ if(S.geo===m.geo){ S.shardView={geo:m.geo, path:m.path, err:String(e&&e.message||e)}; upd(['dr']); } });
  }
  function wire(el){
    el.querySelectorAll('[data-x]').forEach(x=>{ x.onclick=()=>{ S.closed=true; tick(); }; });
    el.querySelectorAll('[data-zone]').forEach(b=>{ b.onclick=()=>{ S.zone=b.dataset.zone; upd(['zn']); }; });
    el.querySelectorAll('[data-geo]').forEach(b=>{ b.onclick=()=>selectGeo(b.dataset.geo); });
  }

  /* ---------- observatoire (calque 2D au-dessus de l'anneau 3D vide de l'étage Santé) ---------- */
  const LMIN=Math.log(1.5), LMAX=Math.log(350);
  function rr(v){ const t=(Math.log(Math.max(1.5,Math.min(350,v)))-LMIN)/(LMAX-LMIN); return .16+.84*t; }
  function col(v){ /* vert → or → rouge, selon le taux réel (‰) */
    const t=Math.max(0,Math.min(1,(Math.log(Math.max(2,v))-Math.log(2))/(Math.log(150)-Math.log(2))));
    const A=[95,214,144], B=[232,200,114], C=[255,92,92];
    const m=(a,b,u)=>a.map((x,i)=>Math.round(x+(b[i]-x)*u));
    const c=t<.5?m(A,B,t*2):m(B,C,(t-.5)*2); return 'rgb('+c.join(',')+')';
  }
  function valAt(r,y){ /* valeur réelle de l'année y ; sinon rien (aucune invention) */
    return r.byY.has(y)?r.byY.get(y):null;
  }
  function obsEnsure(st){
    let c=$('um-sante-obs');
    if(!c){ c=document.createElement('canvas'); c.id='um-sante-obs'; c.setAttribute('aria-hidden','true');
      const wgl=st.querySelector('canvas'); if(wgl&&wgl.nextSibling) st.insertBefore(c,wgl.nextSibling); else st.appendChild(c); }
    return c;
  }
  function obsStart(){
    const st=$('stage'); if(!st) return;
    const c=obsEnsure(st); c.hidden=false;
    if(S.obs) return;
    S.obs={t0:performance.now(), prev:{}, raf:0};
    const loop=now=>{ if(!S.obs) return; drawObs(c,st,now); S.obs.raf=requestAnimationFrame(loop); };
    S.obs.raf=requestAnimationFrame(loop);
  }
  function obsStop(){ if(S.obs){ cancelAnimationFrame(S.obs.raf); S.obs=null; } const c=$('um-sante-obs'); if(c) c.hidden=true; }
  function drawObs(c,st,now){
    const dpr=Math.min(2,window.devicePixelRatio||1), W=st.clientWidth, H=st.clientHeight;
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){ c.width=Math.round(W*dpr); c.height=Math.round(H*dpr); }
    const g=c.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,W,H);
    /* zone libre : à droite du panneau, ou au-dessus de lui (écran étroit) */
    let x0=0,y0=0,x1=W,y1=H-70;
    if(S.el&&!S.el.hidden){ const sr=st.getBoundingClientRect(), pr=S.el.getBoundingClientRect();
      const right=pr.right-sr.left, top=pr.top-sr.top;
      if(W-right>=Math.max(200,top)) { x0=right+4; } else if(top>120){ y1=top-4; } }
    const narrow=(x1-x0)<420; g.font='600 12px system-ui,sans-serif'; const lw=Math.max(...ZONES.map(z=>g.measureText(z).width));
    const cx=(x0+x1)/2, cy=(y0+y1)/2+(narrow?14:22), R=Math.max(40,Math.min((x1-x0)/2-(narrow?22:lw+22),(y1-y0)/2-(narrow?30:40)));
    g.save();
    /* fond doux pour lire les nœuds sur l'anneau */
    const bg=g.createRadialGradient(cx,cy,R*.1,cx,cy,R*1.15); bg.addColorStop(0,'rgba(5,8,13,.78)'); bg.addColorStop(1,'rgba(5,8,13,0)');
    g.fillStyle=bg; g.beginPath(); g.arc(cx,cy,R*1.15,0,Math.PI*2); g.fill();
    /* anneaux de lecture (‰) */
    g.font='11px system-ui,sans-serif'; g.textAlign='left'; g.textBaseline='middle';
    [2,5,10,25,50,100,200].forEach(v=>{ const r=R*rr(v); g.strokeStyle='rgba(159,176,198,.16)'; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.stroke();
      g.fillStyle='rgba(159,176,198,.55)'; g.fillText(v+' ‰',cx+3,cy-r-6); });
    /* secteurs de zones */
    ZONES.forEach((z,zi)=>{ const a=-Math.PI/2+zi*Math.PI/3;
      g.strokeStyle='rgba(232,200,114,.22)'; g.beginPath(); g.moveTo(cx+Math.cos(a)*R*.12,cy+Math.sin(a)*R*.12); g.lineTo(cx+Math.cos(a)*R*1.02,cy+Math.sin(a)*R*1.02); g.stroke();
      const am=a+Math.PI/6, lx=cx+Math.cos(am)*(R+14), ly=cy+Math.sin(am)*(R+14);
      g.fillStyle=ZCOL[z]; g.font='600 12px system-ui,sans-serif'; const tw=g.measureText(z).width;
      let tx=Math.cos(am)>.25?lx+tw/2:Math.cos(am)<-.25?lx-tw/2:lx; tx=Math.max(x0+tw/2+4,Math.min(x1-tw/2-4,tx)); g.textAlign='center'; g.fillText(z,tx,ly); });
    /* année balayée : 1990 → dernière année réelle, puis pause */
    const by=S.scan?S.scan.by:{}; const recs=Object.values(by);
    let yMax=1990; recs.forEach(r=>{ if(r.last&&r.last.y>yMax) yMax=r.last.y; });
    const Y0=1990, span=Math.max(1,yMax-Y0), per=REDUCED?1e9:0.55, cyc=span*per+5;
    const el=(now-S.obs.t0)/1000, ph=REDUCED?cyc:el%cyc, yf=Math.min(yMax,Y0+ph/per);
    const yi=Math.floor(yf), fr=yf-yi;
    let shown=0, sum=0;
    recs.forEach(r=>{
      if(!ZONES.includes(r.zone)||!r.ser.length) return; const a=S.angles&&S.angles[r.geo]; if(a==null) return;
      const va=valAt(r,yi); if(va==null) return;
      const vb=valAt(r,Math.min(yMax,yi+1)); const v=vb==null?va:va+(vb-va)*(fr*fr*(3-2*fr)); /* adoucissement visuel entre deux années réelles */
      const rad=R*rr(v), x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; shown++; sum++;
      const born=S.obs.prev[r.geo]||(S.obs.prev[r.geo]=now); const fade=Math.min(1,(now-born)/900);
      const sel=S.geo===r.geo;
      g.globalAlpha=.25+.75*fade; g.fillStyle=col(v); g.beginPath(); g.arc(x,y,sel?5.5:3.2,0,Math.PI*2); g.fill();
      if(sel){ g.strokeStyle='#ffffff'; g.lineWidth=1.5; g.beginPath(); g.arc(x,y,9+2*Math.sin(now/250),0,Math.PI*2); g.stroke();
        g.fillStyle='#ffffff'; g.font='600 12px system-ui,sans-serif'; g.textAlign='left'; g.fillText(r.geo+' '+v1(v),x+11,y); }
      g.globalAlpha=1;
    });
    /* centre : MONDE */
    const w=by.WORLD, wv=w?valAt(w,yi):null;
    g.textAlign='center'; g.fillStyle='#e8c872'; g.font='600 '+Math.max(18,Math.min(30,R*.16))+'px Georgia,serif'; g.fillText(String(yi),cx,cy-R*.05-8);
    g.font='12px system-ui,sans-serif'; g.fillStyle='#c9f5da';
    g.fillText(wv!=null?'Monde '+v1(wv)+' ‰':'Monde : lecture…',cx,cy+R*.05+6);
    /* légende */
    const sc=S.scan, tot=S.index?S.index.shards.length:269;
    g.textAlign='right'; g.font=(narrow?'11px':'12.5px')+' system-ui,sans-serif'; g.fillStyle='rgba(232,200,114,.95)';
    const lx=x1-10, ly=y0+16, lh=narrow?14:17;
    g.fillText('OBSERVATOIRE SANTÉ · mortalité < 5 ans (‰)',lx,ly);
    g.fillStyle='rgba(190,200,212,.9)';
    g.fillText((sc?sc.done:0)+' / '+tot+' paquets vérifiés · '+shown+' pays en '+yi,lx,ly+lh);
    if(!narrow) g.fillText('centre = faible · bord = élevé · source UN IGME',lx,ly+2*lh);
    g.restore();
  }

  /* ---------- pastille, entrée et sortie de l'étage ---------- */
  function centerName(){ const c=$('hub-center'); return c?c.textContent.trim():''; }
  function chip(){ let c=$('um-sante-real-chip'); const st=$('stage'); if(!st) return null;
    if(!c){ c=document.createElement('button'); c.type='button'; c.id='um-sante-real-chip'; c.className='um-skel-chip'; c.textContent='Santé · paquet réel ▸'; c.onclick=()=>{ S.closed=false; tick(); }; st.appendChild(c); } return c; }
  function tick(){
    const st=$('stage'); if(!st) return;
    const on=centerName()==='Santé';
    if(on&&!S.wasOn) S.closed=false; /* v20.95 : chaque entrée sur Santé rouvre le panneau */
    S.wasOn=on;
    if(on&&!S.closed){
      if(!S.el||!S.el.isConnected){ S.el=document.createElement('div'); S.el.id='um-sante-real'; S.el.className='um-skel um-sante-real'; st.appendChild(S.el); render(); open(); loadSub(); }
      S.el.hidden=false;
    } else if(S.el) S.el.hidden=true;
    if(on){ obsStart(); if(!S.opening) open(); } else obsStop();
    const c=on&&S.closed?chip():$('um-sante-real-chip'); if(c) c.hidden=!(on&&S.closed);
  }
  function pump(){ if(S.dirty&&S.el&&!S.el.hidden&&S.index){ S.dirty=false; upd(['st','hd','rk','sb','sr','zn']); } }
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
    +'.um-sante-real code{font:10px ui-monospace,monospace;color:#bfe8ff}'
    /* v20.95 : lisibilité (caractères plus grands), observatoire, cartes, classements */
    +'#um-sante-real{box-sizing:border-box;width:min(470px,calc(100% - 20px));font:14px/1.5 system-ui,sans-serif;padding:12px 14px;background:linear-gradient(180deg,rgba(10,16,22,.95),rgba(7,11,16,.95));box-shadow:0 14px 44px rgba(0,0,0,.55),inset 0 1px 0 rgba(232,200,114,.18)}'
    +'#um-sante-real h3{font:600 17px/1.3 Georgia,serif;color:#e8c872;margin:0 0 8px;padding-right:30px}#um-sante-real h3 .ver{font:500 11px ui-monospace,monospace;color:#8b98ad;margin-left:6px}'
    +'#um-sante-real .lvl{font:600 12.5px/1.4 ui-monospace,monospace;color:#bfe8ff;margin-top:14px;letter-spacing:.02em}'
    +'#um-sante-real .sub{font-size:13px;color:#b3bcc7}#um-sante-real .inc{font-size:12px}'
    +'#um-sante-real td,#um-sante-real th{font-size:13px;padding:4px 5px}#um-sante-real th{color:#8b98ad;font-weight:600}#um-sante-real td.n{text-align:right;font-variant-numeric:tabular-nums}'
    +'#um-sante-real button[data-zone],#um-sante-real button[data-geo]{font:500 13px/1.25 system-ui,sans-serif;padding:3px 8px}'
    +'#um-sante-real button small{color:#9fb0c6;font-size:11.5px}'
    +'#um-sante-real .x{font:700 16px system-ui;padding:1px 9px}'
    +'#um-sante-real code{font-size:12px}#um-sante-real a{color:#7fd1ff}'
    +'#um-sante-real details{margin:6px 0}#um-sante-real summary{cursor:pointer;color:#c9f5da;font-size:13px}'
    +'.um-sh-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:4px 0}'
    +'.um-sh-kpis>div{background:rgba(13,26,38,.85);border:1px solid #26303b;border-radius:6px;padding:6px 8px}.um-sh-kpis b{display:block;font:600 19px/1.2 Georgia,serif;color:#e8c872}.um-sh-kpis span{font-size:12px;color:#9fb0c6}'
    +'.um-sh-bar{height:5px;background:#18222d;border-radius:3px;overflow:hidden;margin:4px 0 2px}.um-sh-bar i{display:block;height:100%;background:linear-gradient(90deg,#5fd690,#e8c872);transition:width .5s}'
    +'#um-sante-real .live{color:#5fd690}#um-sante-real .ok{color:#c9f5da}'
    +'.um-sh-cards{display:grid;grid-template-columns:1fr 1fr;gap:6px}.um-sh-card{background:rgba(13,26,38,.85);border:1px solid #26303b;border-radius:6px;padding:6px 8px}'
    +'#um-sante-real .big{font:600 24px/1.2 Georgia,serif;color:#f3e3b0;margin:4px 0 0}#um-sante-real .big small{font:12px system-ui,sans-serif;color:#9fb0c6}'
    +'.um-sh-q{width:100%;box-sizing:border-box;font:14px system-ui,sans-serif;padding:6px 9px;margin:4px 0;background:#0d1a26;color:#e6e9ee;border:1px solid #33405a;border-radius:5px}'
    +'.um-sh-two{display:grid;grid-template-columns:1fr;gap:4px}'
    +'#um-sante-real td.barc{width:28%}#um-sante-real td.barc i{display:block;height:7px;border-radius:3px}'
    +'#um-sante-real .zt{font-size:12px}'
    +'.um-sh-yt{max-height:260px;overflow:auto;border:1px solid #26303b;border-radius:5px}'
    +'#um-sante-obs{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}'
    +'@media (max-width:760px){#um-sante-real{top:auto;bottom:10px;max-height:56%;font-size:13.5px}.um-sh-cards,.um-sh-kpis{grid-template-columns:1fr}#um-sante-real td.barc{display:none}}';
  (document.head||document.documentElement).appendChild(css);
  setInterval(tick,1200);
  setInterval(pump,700);
  setTimeout(tick,0);
})();
