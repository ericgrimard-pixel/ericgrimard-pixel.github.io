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
  const VERSION='v20.97';
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
    scan:null, q:'', wasOn:false, sub:null, dirty:false, err3:null};
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
    const q=S.q.trim().toUpperCase(); if(!q) return '<div class="sub">Taper un code REF_AREA (ex. CAN, FRA, NGA, UNICEF_SSA, WB_LI) — ou choisir dans les classements, les zones ou un nœud 3D de la chambre.</div>';
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
    g.push('étage Santé de floors.js : n = 0 inchangé ; objets 3D de Classe 1/2 non construits — les objets 3D Santé (v20.97, groupe um-sante-3d, ancrés et découpés dans la chambre) occupent la scène en attendant');
    return '<div class="lvl">INDEX DES LACUNES</div><ul>'+g.map(x=>'<li>'+GAP+' '+esc(x)+'</li>').join('')+'</ul>';
  }

  /* ---------- panneau : sections mises à jour séparément (la recherche garde le focus) ---------- */
  const SECS=['st','pl','hd','sr','dr','rk','zn','sb','gp'];
  function frame(){
    return '<button type="button" class="x" data-x="1" title="Replier (revient à la prochaine entrée sur Santé)">×</button>'
      +'<h3>Santé · mortalité des moins de 5 ans · paquet réel UN IGME <span class="ver">'+VERSION+'</span></h3>'
      +'<div data-s="st"></div><div data-s="pl"></div><div data-s="hd"></div>'
      +'<div class="lvl">RECHERCHE</div><input type="search" class="um-sh-q" placeholder="Code REF_AREA : CAN, FRA, WORLD…" aria-label="Chercher un code REF_AREA" value="'+esc(S.q)+'">'
      +'<div data-s="sr"></div><div data-s="dr"></div><div data-s="rk"></div><div data-s="zn"></div><div data-s="sb"></div><div data-s="gp"></div>';
  }
  function secHTML(k){
    switch(k){
      case 'st': return statusHTML()+'<details class="um-sh-meta"><summary>Métadonnées du paquet</summary>'+headHTML()+'</details>';
      case 'pl': return playHTML();
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
      d.innerHTML=secHTML(k); wire(d); if(k==='pl') wirePlay(d);
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

  /* ---------- v20.97 : objets Santé en 3D, ancrés et découpés dans la chambre du Hub ----------
     Signalement vocal d'Éric, 19 h 46 (Toronto) : le calque 2D (v20.95) restait un plan plat, non intégrable à l'espace 3D.
     Il est remplacé par un groupe Three.js « um-sante-3d » ajouté au groupe WORLD de la vraie scène du moteur (crochet
     additif window.UM_ENGINE3D, une ligne dans engine.js), visible seulement sur l'étage Santé. Il tourne, s'incline,
     zoome et suit le bouton Volume avec la chambre. Couche n-dimensionnelle additive : rien du moteur n'est modifié.

     Géométrie de la chambre (engine.js) : tore cuboïdal, rayon intérieur 1 (centre réservé à l'objet de Classe 4),
     rayon extérieur 3, plancher y = −1, plafond y = +1 ; W3(a, r, y) = (r·sin a, y, −r·cos a) ; a = 0 = méridien d'or.

     Trois variables de placement (inspectables : window.UM_SANTE_3D) :
       SANTE_RADIAL    — rayon : taux réel u5mr (‰, échelle log 1,5–350) → r dans l'enveloppe [1 + PAD, 3 − PAD], borné.
       SANTE_ANGULAR   — angle : six secteurs de 60° depuis le méridien d'or (a = 0), un par zone, codes répartis
                         dans le secteur de leur zone, marges aux murs de secteur.
       SANTE_ELEVATION — hauteur : baisse réelle du taux depuis 1990 (ou la première année de la série) → y dans la
                         dalle [−1 + PAD, +1 − PAD] ; chaque nœud est relié au plancher (y = −1) par une tige verticale
                         et un pied posé sur le plancher.
     Découpe : (1) bornage de chaque position par les trois variables ; (2) plans de découpe Three.js réels
     (renderer.localClippingEnabled = true) : plancher y ≥ −1, plafond y ≤ +1 et enveloppe extérieure r ≤ 3 (24 plans
     tangents), recalculés à chaque image depuis WORLD.matrixWorld, donc justes quand le Volume change l'échelle.
     Le centre r < 1 n'est jamais atteint (bornage radial) : l'objet central reste seul dans son espace réservé.
     Survol : étiquette ; clic : ouvre le forage du pays dans le panneau (lancer de rayon sur les nœuds Santé seulement). */
  function col(v){ /* vert → or → rouge, selon le taux réel (‰) */
    const t=Math.max(0,Math.min(1,(Math.log(Math.max(2,v))-Math.log(2))/(Math.log(150)-Math.log(2))));
    const A=[95,214,144], B=[232,200,114], C=[255,92,92];
    const m=(a,b,u)=>a.map((x,i)=>Math.round(x+(b[i]-x)*u));
    const c=t<.5?m(A,B,t*2):m(B,C,(t-.5)*2); return 'rgb('+c.join(',')+')';
  }
  const SANTE_RADIAL={R_IN:1, R_OUT:3, PAD:0.1, V_MIN:1.5, V_MAX:350,
    r(v){ const t=(Math.log(Math.max(this.V_MIN,Math.min(this.V_MAX,v)))-Math.log(this.V_MIN))/(Math.log(this.V_MAX)-Math.log(this.V_MIN));
      return Math.max(this.R_IN+this.PAD,Math.min(this.R_OUT-this.PAD,this.R_IN+this.PAD+t*(this.R_OUT-this.R_IN-2*this.PAD))); }};
  const SANTE_ANGULAR={ORIGIN:0, SECTOR:Math.PI/3, MARGIN:0.08, ZONES:ZONES,
    sector(z){ return ZONES.indexOf(z); },
    a(z,k,n){ const zi=this.sector(z); if(zi<0) return null; const u=n<2?.5:k/(n-1); return this.ORIGIN+zi*this.SECTOR+this.SECTOR*(this.MARGIN+(1-2*this.MARGIN)*u); },
    mid(z){ return this.ORIGIN+(this.sector(z)+.5)*this.SECTOR; }};
  const SANTE_ELEVATION={FLOOR_Y:-1, CEIL_Y:1, PAD:0.06, BASE_YEAR:1990,
    base(rec){ if(rec.byY.has(this.BASE_YEAR)) return rec.byY.get(this.BASE_YEAR); const p=rec.ser.find(q=>q.y>=this.BASE_YEAR)||rec.ser[0]; return p?p.v:null; },
    frac(rec,v){ const b=this.base(rec); if(!b||!(v>=0)) return 0; return Math.max(0,Math.min(1,(b-v)/b)); },
    y(rec,v){ return this.FLOOR_Y+this.PAD+this.frac(rec,v)*(this.CEIL_Y-this.FLOOR_Y-2*this.PAD); }};
  function layoutAngles(){
    const per={}; S.index.shards.forEach(m=>{ if(ZONES.includes(m.zone)) (per[m.zone]=per[m.zone]||[]).push(m.geo); });
    S.angles={};
    ZONES.forEach(z=>{ const L=(per[z]||[]).sort(); L.forEach((g,k)=>{ S.angles[g]=SANTE_ANGULAR.a(z,k,L.length); }); });
  }
  const W3=(a,r,y,T)=>new T.Vector3(r*Math.sin(a),y,-r*Math.cos(a));
  const P3={playing:!REDUCED, year:null, t0:0, last:0, scene:null};
  function yearRange(){ let yMax=1990; Object.values(S.scan?S.scan.by:{}).forEach(r=>{ if(r.last&&r.last.y>yMax) yMax=r.last.y; }); return [1990,yMax]; }
  function sprite3(T,text,color,h,weight){
    const c=document.createElement('canvas'), g=c.getContext('2d'), fs=44; g.font=(weight||600)+' '+fs+'px system-ui,sans-serif';
    const w=Math.ceil(g.measureText(text).width)+20; c.width=w; c.height=fs+20; g.font=(weight||600)+' '+fs+'px system-ui,sans-serif';
    g.fillStyle='rgba(5,8,13,.55)'; g.fillRect(0,0,w,c.height); g.fillStyle=color; g.textBaseline='middle'; g.fillText(text,10,c.height/2+2);
    const tx=new T.CanvasTexture(c); tx.minFilter=T.LinearFilter;
    const sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthWrite:false})); sp.scale.set(h*w/c.height,h,1); sp.renderOrder=6; sp.userData.text=text; return sp;
  }
  function setSpriteText(T,sp,text,color,h){ if(sp.userData.text===text) return; const n=sprite3(T,text,color,h); sp.material.map.dispose(); sp.material.dispose(); sp.material=n.material; sp.scale.copy(n.scale); sp.userData.text=text; }
  function build3D(E){
    const T=E.THREE||window.THREE; if(!T) return null;
    const grp=new T.Group(); grp.name='um-sante-3d';
    /* plans de découpe, exprimés dans le repère de WORLD puis portés en coordonnées du monde à chaque image */
    const local=[new T.Plane(new T.Vector3(0,1,0),1), new T.Plane(new T.Vector3(0,-1,0),1)];
    const NP=24, D=SANTE_RADIAL.R_OUT+0.02;
    for(let k=0;k<NP;k++){ const a=k/NP*Math.PI*2; const u=new T.Vector3(Math.sin(a),0,-Math.cos(a)); local.push(new T.Plane(u.clone().negate(),D)); }
    const planes=local.map(p=>p.clone());
    E.renderer.localClippingEnabled=true;
    const mk=(o)=>Object.assign(o,{clippingPlanes:planes});
    /* repères au plancher : arcs et rayons de secteurs, cercles de lecture du taux */
    const guides=new T.Group(); guides.name='um-sante-guides'; grp.add(guides);
    const FY=SANTE_ELEVATION.FLOOR_Y+0.004;
    ZONES.forEach(z=>{ const zi=SANTE_ANGULAR.sector(z), a0=SANTE_ANGULAR.ORIGIN+zi*SANTE_ANGULAR.SECTOR, pts=[];
      for(let s=0;s<=32;s++) pts.push(W3(a0+SANTE_ANGULAR.SECTOR*(.02+.96*s/32),SANTE_RADIAL.R_OUT-0.03,FY,T));
      guides.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial(mk({color:new T.Color(ZCOL[z]),transparent:true,opacity:.95}))));
      guides.add(new T.Line(new T.BufferGeometry().setFromPoints([W3(a0,SANTE_RADIAL.R_IN,FY,T),W3(a0,SANTE_RADIAL.R_OUT,FY,T)]),new T.LineBasicMaterial(mk({color:0x5fd690,transparent:true,opacity:.35}))));
      const lb=sprite3(T,z,ZCOL[z],.15); lb.position.copy(W3(SANTE_ANGULAR.mid(z),SANTE_RADIAL.R_OUT-0.32,FY+0.1,T)); guides.add(lb); });
    [2,5,10,25,50,100,200].forEach(v=>{ const r=SANTE_RADIAL.r(v), pts=[]; for(let s=0;s<=96;s++) pts.push(W3(s/96*Math.PI*2,r,FY,T));
      const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial(mk({color:0x8b98ad,transparent:true,opacity:.4,dashSize:.05,gapSize:.05}))); l.computeLineDistances(); guides.add(l);
      if(v===5||v===25||v===100){ const s=sprite3(T,v+' ‰','#9fb0c6',.09,500); s.position.copy(W3(Math.PI-0.05,r,FY+0.05,T)); guides.add(s); } });
    /* Monde : anneau d'or autour du cœur (r = 1,03, hors de l'espace réservé), hauteur = SANTE_ELEVATION, six attaches au plancher */
    const world=new T.Group(); world.name='um-sante-world'; grp.add(world);
    const wt=new T.Mesh(new T.TorusGeometry(SANTE_RADIAL.R_IN+0.03,0.014,8,96),new T.MeshStandardMaterial(mk({color:0xe8c872,emissive:0x6b5520,metalness:.5,roughness:.35})));
    wt.rotation.x=Math.PI/2; world.add(wt);
    const wteth=[]; for(let k=0;k<6;k++){ const a=SANTE_ANGULAR.ORIGIN+k*SANTE_ANGULAR.SECTOR, g=new T.BufferGeometry().setFromPoints([W3(a,SANTE_RADIAL.R_IN+0.03,-1,T),W3(a,SANTE_RADIAL.R_IN+0.03,-1,T)]);
      const l=new T.Line(g,new T.LineBasicMaterial(mk({color:0xe8c872,transparent:true,opacity:.55}))); grp.add(l); wteth.push({l,a}); }
    const wlab=sprite3(T,'Monde','#f3e3b0',.14); grp.add(wlab);
    const ylab=sprite3(T,'1990','#e8c872',.22,600); grp.add(ylab);
    /* nœuds pays : sphère + tige + pied (créés à mesure que les paquets sont lus et vérifiés) */
    const SG=new T.SphereGeometry(0.045,16,12), HG=new T.SphereGeometry(0.1,8,6), FG=new T.RingGeometry(0.02,0.045,20);
    const HM=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}); HM.colorWrite=false;
    const nodes={}, hits=[];
    const sel=sprite3(T,' ','#ffffff',.13); sel.visible=false; grp.add(sel);
    const halo=new T.Mesh(new T.TorusGeometry(0.085,0.006,8,32),new T.MeshBasicMaterial(mk({color:0xffffff})));
    halo.visible=false; grp.add(halo);
    function node(rec){
      const c=new T.Color(col(rec.last?rec.last.v:10));
      const m=new T.Mesh(SG,new T.MeshStandardMaterial(mk({color:c,emissive:c.clone().multiplyScalar(.35),roughness:.45,metalness:.1})));
      const h=new T.Mesh(HG,HM); h.userData.geo=rec.geo; m.add(h); hits.push(h);
      const sg=new T.BufferGeometry(); sg.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));
      const st=new T.Line(sg,new T.LineBasicMaterial(mk({color:c,transparent:true,opacity:.5})));
      const ft=new T.Mesh(FG,new T.MeshBasicMaterial(mk({color:c,transparent:true,opacity:.7,side:T.DoubleSide}))); ft.rotation.x=-Math.PI/2;
      grp.add(m); grp.add(st); grp.add(ft);
      return nodes[rec.geo]={rec,m,st,ft,c,born:performance.now()};
    }
    E.WORLD.add(grp);
    const ray=new T.Raycaster(), mouse=new T.Vector2();
    const tip=document.createElement('div'); tip.id='um-sante-tip'; E.stage.appendChild(tip);
    function pick(e){ const r=E.renderer.domElement.getBoundingClientRect(); mouse.x=(e.clientX-r.left)/r.width*2-1; mouse.y=-(e.clientY-r.top)/r.height*2+1;
      ray.setFromCamera(mouse,E.camera); const vis=hits.filter(h=>h.parent&&h.parent.visible); const hs=ray.intersectObjects(vis,false);
      return hs.length?hs[0].object.userData.geo:null; }
    const cv=E.renderer.domElement; let down=null;
    cv.addEventListener('pointermove',e=>{ if(!grp.visible) return; const g=pick(e); const n=g&&nodes[g];
      if(!n){ tip.style.display='none'; return; } cv.style.cursor='pointer';
      const v=n.cur; tip.innerHTML='<b>'+esc(g)+'</b> · '+esc(n.rec.zone)+'<br>'+(v!=null?v1(v)+' ‰ en '+P3.year:'—')+'<br><small>clic : forage dans le panneau</small>';
      const r=E.stage.getBoundingClientRect(); tip.style.left=Math.min(r.width-180,e.clientX-r.left+14)+'px'; tip.style.top=Math.max(4,e.clientY-r.top-10)+'px'; tip.style.display='block'; });
    cv.addEventListener('pointerleave',()=>{ tip.style.display='none'; });
    cv.addEventListener('pointerdown',e=>{ down=[e.clientX,e.clientY]; });
    cv.addEventListener('pointerup',e=>{ if(!grp.visible||!down) return; const mv=Math.hypot(e.clientX-down[0],e.clientY-down[1]); down=null; if(mv>6) return;
      const g=pick(e); if(g){ S.closed=false; tick(); selectGeo(g); } });
    return {T,E,grp,guides,world,wt,wteth,wlab,ylab,nodes,hits,node,local,planes,sel,halo,tip,offset:null};
  }
  function frame3D(now){
    const E=window.UM_ENGINE3D;
    if(!E||!E.scene||E.sys!=='health'){ return; }
    if(!P3.scene||P3.scene.E!==E){ if(P3.scene&&P3.scene.tip) P3.scene.tip.remove(); P3.scene=build3D(E); if(!P3.scene) return; P3.t0=now; }
    const D=P3.scene, T=D.T; D.grp.visible=true;
    E.WORLD.updateMatrixWorld(true);
    D.local.forEach((p,i)=>{ D.planes[i].copy(p).applyMatrix4(E.WORLD.matrixWorld); });
    /* panneau ouvert sur grand écran : la chambre est recentrée dans l'espace libre (décalage de vue, caméra de Santé seulement) */
    const W=E.stage.clientWidth, H=E.stage.clientHeight; let off=0;
    if(S.el&&!S.el.hidden&&W>=700){ const sr=E.stage.getBoundingClientRect(), pr=S.el.getBoundingClientRect(); off=Math.round((pr.right-sr.left)/2); }
    const key=W+'x'+H+':'+off;
    if(D.offset!==key){ D.offset=key; if(off) E.camera.setViewOffset(W,H,-off,0,W,H); else E.camera.clearViewOffset(); }
    /* année : lecture 1990 → dernière année réelle (0,6 s par année, pause 3 s) */
    const [Y0,Y1]=yearRange(), per=.6, cyc=(Y1-Y0)*per+3;
    let yf;
    if(P3.playing){ const el=((now-P3.t0)/1000)%cyc; yf=Math.min(Y1,Y0+el/per); }
    else yf=P3.year!=null?P3.year:Y1;
    const yi=Math.floor(yf), fr=yf-yi, sm=fr*fr*(3-2*fr);
    if(P3.year!==yi){ P3.year=yi; syncPlay(); }
    const by=S.scan?S.scan.by:{};
    Object.values(by).forEach(rec=>{ if(!ZONES.includes(rec.zone)||!rec.ser.length||!S.angles||S.angles[rec.geo]==null) return; if(!D.nodes[rec.geo]) D.node(rec); });
    Object.values(D.nodes).forEach(n=>{
      const rec=n.rec, va=rec.byY.has(yi)?rec.byY.get(yi):null;
      if(va==null){ n.m.visible=n.st.visible=n.ft.visible=false; n.cur=null; return; }
      const vb=rec.byY.has(yi+1)&&yi+1<=Y1?rec.byY.get(yi+1):va, v=va+(vb-va)*sm; n.cur=va;
      const a=S.angles[rec.geo], r=SANTE_RADIAL.r(v), y=SANTE_ELEVATION.y(rec,v);
      const fade=Math.min(1,(now-n.born)/900);
      n.m.visible=n.st.visible=n.ft.visible=true;
      n.m.position.copy(W3(a,r,y,T)); n.m.scale.setScalar((S.geo===rec.geo?1.7:1)*(.3+.7*fade));
      const p=n.st.geometry.attributes.position; p.setXYZ(0,n.m.position.x,SANTE_ELEVATION.FLOOR_Y,n.m.position.z); p.setXYZ(1,n.m.position.x,y,n.m.position.z); p.needsUpdate=true; n.st.geometry.computeBoundingSphere();
      n.ft.position.set(n.m.position.x,SANTE_ELEVATION.FLOOR_Y+0.003,n.m.position.z);
      const c=col(v); if(n.lastC!==c){ n.lastC=c; n.m.material.color.set(c); n.m.material.emissive.set(c).multiplyScalar(.35); n.st.material.color.set(c); n.ft.material.color.set(c); }
    });
    /* sélection */
    const sn=S.geo&&D.nodes[S.geo];
    if(sn&&sn.m.visible){ D.halo.visible=D.sel.visible=true; D.halo.position.copy(sn.m.position); D.halo.quaternion.copy(E.camera.quaternion);
      setSpriteText(T,D.sel,S.geo+' '+v1(sn.cur)+' ‰','#ffffff',.13); D.sel.position.copy(sn.m.position).add(new T.Vector3(0,.16,0)); }
    else D.halo.visible=D.sel.visible=false;
    /* Monde */
    const w=by.WORLD, wv=w&&w.byY.has(yi)?w.byY.get(yi):null;
    if(wv!=null){ const wy=SANTE_ELEVATION.y(w,wv); D.wt.position.y=wy; D.wt.visible=true;
      D.wteth.forEach(t=>{ const p=t.l.geometry.attributes.position; p.setY(1,wy); p.needsUpdate=true; t.l.geometry.computeBoundingSphere(); });
      setSpriteText(T,D.wlab,'Monde '+v1(wv)+' ‰','#f3e3b0',.14); D.wlab.position.copy(W3(Math.PI,SANTE_RADIAL.R_IN+0.03,wy+0.13,T)); D.wlab.visible=true; }
    else { D.wt.visible=false; D.wlab.visible=!!w; if(!w) setSpriteText(T,D.wlab,'Monde : lecture…','#f3e3b0',.14); D.wlab.position.copy(W3(Math.PI,SANTE_RADIAL.R_IN+0.03,-0.8,T)); }
    setSpriteText(T,D.ylab,String(yi),'#e8c872',.22); D.ylab.position.copy(W3(SANTE_ANGULAR.ORIGIN,SANTE_RADIAL.R_OUT-0.3,SANTE_ELEVATION.CEIL_Y-0.15,T)); /* sur le méridien d'or, hors de l'espace réservé r < 1 */
  }
  function syncPlay(){
    const el=S.el&&S.el.querySelector('[data-s="pl"]'); if(!el) return;
    const b=el.querySelector('.um-sh-play'), r=el.querySelector('.um-sh-yr'), t=el.querySelector('.um-sh-yv');
    if(b) b.textContent=P3.playing?'⏸ Pause':'▶ Lecture'; if(t) t.textContent=P3.year!=null?P3.year:'—';
    if(r&&document.activeElement!==r&&P3.year!=null) r.value=P3.year;
  }
  function playHTML(){
    const [Y0,Y1]=yearRange(), E=window.UM_ENGINE3D, D=P3.scene, n=D?Object.values(D.nodes).filter(x=>x.m.visible).length:0;
    return '<div class="lvl">3D · CHAMBRE SANTÉ · année <span class="um-sh-yv">'+(P3.year||'—')+'</span></div>'
      +'<div class="um-sh-pl"><button type="button" class="um-sh-play">'+(P3.playing?'⏸ Pause':'▶ Lecture')+'</button>'
      +'<input type="range" class="um-sh-yr" min="'+Y0+'" max="'+Y1+'" step="1" value="'+(P3.year||Y1)+'" aria-label="Année"></div>'
      +'<div class="sub">'+(E&&E.sys==='health'&&D?'Groupe Three.js <code>um-sante-3d</code> dans la scène : '+Object.keys(D.nodes).length+' pays, '+n+' visibles en '+(P3.year||'—')+' · ':'')+'rayon = taux réel (bas près du cœur, élevé près du mur extérieur) · secteur = zone · hauteur = baisse depuis 1990, tige jusqu\u2019au plancher. Faire glisser pour tourner, molette pour zoomer, clic sur un nœud pour le forage.</div>';
  }
  function wirePlay(d){
    const b=d.querySelector('.um-sh-play'), r=d.querySelector('.um-sh-yr');
    if(b) b.onclick=()=>{ if(P3.playing){ P3.playing=false; } else { const [Y0]=yearRange(); P3.playing=true; P3.t0=performance.now()-((P3.year||Y0)-Y0)*600; } syncPlay(); };
    if(r) r.oninput=()=>{ P3.playing=false; P3.year=+r.value; syncPlay(); };
  }
  let raf3=0;
  function loop3(now){ try{ frame3D(now); }catch(e){ if(!S.err3){ S.err3=String(e&&e.message||e); } } raf3=requestAnimationFrame(loop3); }
  window.UM_SANTE_3D={version:VERSION, SANTE_RADIAL, SANTE_ANGULAR, SANTE_ELEVATION,
    get group(){ return P3.scene&&P3.scene.grp; }, get nodes(){ return P3.scene?Object.keys(P3.scene.nodes).length:0; },
    get visibleNodes(){ return P3.scene?Object.values(P3.scene.nodes).filter(n=>n.m.visible).length:0; },
    get year(){ return P3.year; }, get planes(){ return P3.scene?P3.scene.planes:null; }, get error(){ return S.err3||null; },
    play(){ P3.playing=true; syncPlay(); }, pause(){ P3.playing=false; syncPlay(); }, setYear(y){ P3.playing=false; P3.year=y; syncPlay(); }};

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
    if(on){ if(!S.opening) open(); } else if(P3.scene&&P3.scene.grp){ P3.scene.grp.visible=false; if(P3.scene.tip) P3.scene.tip.style.display='none'; }
    const c=on&&S.closed?chip():$('um-sante-real-chip'); if(c) c.hidden=!(on&&S.closed);
  }
  function pump(){ if(S.dirty&&S.el&&!S.el.hidden&&S.index){ S.dirty=false; upd(['st','pl','hd','rk','sb','sr','zn']); } }
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
    /* v20.95 : lisibilité (caractères plus grands), cartes, classements (l'observatoire 2D est remplacé en v20.97 par le groupe 3D) */
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
    +'#um-sante-tip{position:absolute;display:none;z-index:6;pointer-events:none;background:rgba(9,14,22,.95);border:1px solid #5fd690;border-radius:5px;padding:6px 9px;font:13px/1.4 system-ui,sans-serif;color:#e6e9ee}#um-sante-tip small{color:#9fb0c6}'
    +'.um-sh-pl{display:flex;gap:8px;align-items:center;margin:4px 0}.um-sh-pl .um-sh-play{font:600 13px system-ui,sans-serif;padding:4px 10px}.um-sh-pl input{flex:1}'
    +'@media (max-width:760px){#um-sante-real{top:auto;bottom:10px;max-height:56%;font-size:13.5px}.um-sh-cards,.um-sh-kpis{grid-template-columns:1fr}#um-sante-real td.barc{display:none}}';
  (document.head||document.documentElement).appendChild(css);
  setInterval(tick,1200);
  setInterval(pump,700);
  raf3=requestAnimationFrame(loop3);
  setTimeout(tick,0);
})();
