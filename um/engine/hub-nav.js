/* Hub navigation sits on the chamber. One click on ↑ goes to the parent.
   The address remembers each step, so the browser Back button returns. */
(function(){
  const css=document.createElement('style');
  css.textContent='#hub-nav{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center;max-height:28vh;overflow:auto;padding-top:2px}'
    +'#hub-nav button{font:500 12px/1.3 system-ui,sans-serif}'
    +'#hub-center{background:#1a160b;border-color:#4a3f22;color:#e8c872}'
    +'#hub-nav .hub-c2{background:#101826}'
    +'#hub-gap{flex:1 1 100%;color:#e8c872;font:600 12px/1.35 system-ui,sans-serif}'
    +'#hub-up{position:absolute;left:10px;bottom:10px;z-index:5;display:flex;flex-direction:column;align-items:flex-start;gap:4px;max-width:min(460px,calc(100% - 20px));pointer-events:none}'
    +'#hub-up button{pointer-events:auto;font:600 15px/1.2 system-ui,sans-serif;background:#1a160b;color:#e8c872;border:1px solid #4a3f22;border-radius:6px;padding:8px 12px;text-align:left}'
    +'#hub-up button:disabled{opacity:.85}'
    +'#hub-up .hint{margin:0;font:11px/1.35 ui-monospace,monospace;color:#c5d4e4;text-shadow:0 1px 2px #000}';
  document.head.appendChild(css);
  const nav=document.createElement('nav');
  nav.id='hub-nav';
  nav.setAttribute('aria-label','Navigation du Hub');
  const header=document.querySelector('header');
  if(header) header.appendChild(nav);
  const stage=document.getElementById('stage');
  const bar=document.createElement('div');
  bar.id='hub-up';
  if(stage) stage.appendChild(bar);
  function floor(id){ return (window.UM_FLOOR_BY&&UM_FLOOR_BY[id])||null; }
  function rawHash(){ return (location.hash||'').replace(/^#/,'').replace(/^\//,''); }
  function resolve(raw){
    if(window.UM_RESOLVE) return UM_RESOLVE(raw)||'';
    if(!raw||raw==='world') return 'world';
    return (typeof LIB!=='undefined'&&LIB.some(x=>x.id===raw&&x.data))?raw:'';
  }
  function bloomNow(){ return (window.UM_BLOOM|0); }
  function bloomMax(){ return window.UM_BLOOM_MAX||0; }
  function layerName(depth){
    const names=window.UM_BLOOM_LAYER||[];
    return names[depth]||('couche '+depth);
  }
  function applyWorldBloom(b){
    /* Past the floor layers the Class 1 titles join World once, and World
       is rebuilt by the real engine with them (no substitute renderer). */
    const fm=window.UM_BLOOM_FLOORMAX;
    if(fm&&b>fm&&typeof CURSYS==='string'&&CURSYS==='world'&&window.UM_BLOOM_ATTACH&&UM_BLOOM_ATTACH()) orig('world');
    window.UM_BLOOM=b;
    window.UM_BLOOM_HOLD=b;
    if(window.__umSetBloom) window.__umSetBloom(b);
  }
  function collapseBloom(){
    if(typeof CURSYS==='string'&&CURSYS==='world'&&bloomNow()>0){ history.back(); return true; }
    return false;
  }
  window.UM_BLOOM=0;
  /* v20.81: the HUB home is Finance as it opens (bloom 0, home view), reached by two clicks on the central object. */
  window.UM_HUB_HOME=function(){
    window.UM_BLOOM_HOLD=0;
    try{ history.pushState({bloom:0},'',location.pathname+location.search+'#/world'); }catch(e){}
    switchSys('world');
  };
  window.UM_BLOOM_STEP=function(){
    if(typeof CURSYS!=='string'||CURSYS!=='world') return;
    const cur=bloomNow();
    const max=bloomMax();
    if(!max||cur>=max){ window.UM_HUB_HOME(); return; } /* v20.81: Finance complete, two more clicks go home */
    const next=cur+1;
    window.UM_BLOOM=next;
    window.UM_BLOOM_HOLD=next;
    try{ history.pushState({bloom:next},'',location.pathname+location.search+'#/world'); }catch(e){}
    applyWorldBloom(next);
    render('world');
  };
  function render(id){
    const f=floor(id);
    const name=f?f.name:(id==='world'?'Finance':id);
    const parent=f&&f.parent;
    let kids=(f&&f.children)||[];
    if(id==='world'){
      const special=['art','sports','health'];
      const head=special.filter(k=>kids.includes(k));
      const rest=kids.filter(k=>!special.includes(k));
      kids=head.concat(rest);
    }
    const blooming=id==='world'&&bloomNow()>0;
    const bits=['<button type="button" id="hub-center" data-up="'+(parent||'')+'">'+esc(shown(id,name))+'</button>'];
    function shown(cid, name){
      const card=window.UM_CARDINAL&&UM_CARDINAL[cid];
      return name; /* v20.72: no cardinal letters (Éric, 16 Nov 2026) */
    }
    kids.forEach(cid=>{
      const c=floor(cid); if(!c) return;
      bits.push('<button type="button" class="hub-c2" data-down="'+esc(cid)+'">'+esc(shown(cid,c.name))+'</button>');
    });
    nav.innerHTML=bits.join('');
    const center=document.getElementById('hub-center');
    if(center&&(parent||blooming)) center.addEventListener('click',()=>{ if(!collapseBloom()&&parent) switchSys(parent); });
    nav.querySelectorAll('[data-down]').forEach(btn=>{
      btn.addEventListener('click',()=>switchSys(btn.getAttribute('data-down')));
    });
    const parentName=parent?(floor(parent)?floor(parent).name:parent):'';
    const upLabel=blooming?(bloomNow()<=1?'↑ Finance':'↑ '+layerName(bloomNow()-1)):(parent?('↑ '+shown(parent,parentName)):name);
    const max=bloomMax();
    const hint=id==='world'
      ? (max&&bloomNow()>=max
        ? 'Vision complète. Un clic = focus. Deux clics sur une Classe 2 plongent. Deux clics sur la Classe 4 : accueil du HUB. ↑ ou Retour replie une couche.'
        : 'Un clic = focus. Deux clics sur la Classe 4 : couche suivante ('+bloomNow()+'/'+max+'). Deux clics sur une Classe 2 plongent. ↑ ou Retour replie.')
      : 'Un clic = focus. Deux clics sur une Classe 2 plongent. Deux clics sur la Classe 4 remontent avec les cousins, jusqu\'à l\'accueil du HUB. ↑ aussi.';
    bar.innerHTML='<button type="button" id="hub-up-btn"'+((parent||blooming)?'':' disabled')+'>'+esc(upLabel)+'</button>'
      +'<p class="hint">'+esc(hint)+'</p>';
    const up=document.getElementById('hub-up-btn');
    if(up&&(parent||blooming)) up.addEventListener('click',()=>{ if(!collapseBloom()&&parent) switchSys(parent); });
  }
  function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c])); }
  function mark(raw){
    const why=(window.UM_WHY&&UM_WHY[String(raw).replace(/\/(year|t0t1)$/,'')])||'Pas de série réelle pour cet étage.';
    let el=document.getElementById('hub-gap');
    if(!el){ el=document.createElement('p'); el.id='hub-gap'; nav.appendChild(el); }
    el.textContent='[INCOMPLET] '+raw+' — '+why;
  }
  window.UM_RENDER_NAV=render;
  window.UM_MARK_INCOMPLET=mark;
  const orig=switchSys;
  let navigating=false;
  switchSys=function(id,keep){
    if(navigating) return;
    navigating=true;
    try{
      if(typeof CURSYS==='string'&&CURSYS==='world'&&id!=='world') window.UM_BLOOM_HOLD=bloomNow();
      orig(id,keep);
      if(id==='world'){
        const stated=history.state&&typeof history.state.bloom==='number';
        const b=stated?history.state.bloom:(window.UM_BLOOM_HOLD||0);
        applyWorldBloom(b);
        if(!stated){ try{ history.replaceState({bloom:b},'',location.pathname+location.search+'#/world'); }catch(e){} }
      }else window.UM_BLOOM=0;
      render(id);
    }
    finally{ navigating=false; }
  };
  function onRoute(){
    if(navigating) return;
    const id=resolve(rawHash())||'world';
    if(id!==CURSYS){ switchSys(id); return; }
    if(id==='world'){
      const b=(history.state&&typeof history.state.bloom==='number')?history.state.bloom:(window.UM_BLOOM_HOLD||0);
      applyWorldBloom(b);
    }
    render(id);
  }
  /* These listeners must outlive a floor change. Listeners added while a
     system is running are aborted with that system, so this one carries
     its own signal and is never tied to a floor. */
  const keep=new AbortController();
  addEventListener('hashchange', onRoute, {signal:keep.signal});
  addEventListener('popstate', onRoute, {signal:keep.signal});
  try{ history.replaceState({bloom:0},'',location.pathname+location.search+'#/world'); }catch(e){}
  /* v20.60 — Éric, 14 nov 2026 13h55 (Toronto): PRIORITÉ ABSOLUE.
     Le HUB s'ouvre sur la couche 0 (HUB minimal, visible, prêt à éclore).
     Trois objets Classe 4 nets : Finance au centre, Art et Sports de part et d'autre.
     L'ouverture sur la vision complète est annulée. */
  // Previous full-vision opener removed.
  render(typeof CURSYS==='string'&&CURSYS?CURSYS:'world');
  const raw=rawHash();
  if(raw && !resolve(raw)) mark(raw);
})();

/* v20.86 — Éric, 22 nov 2026 00:27–00:28 (Toronto): entrée SANTÉ / Health vers le treillis,
   et règle des champs clairsemés (LACUNE / GAP). Ajout seulement : aucun calcul du moteur,
   aucune zone du protocole, ni Q1–Q5, ni anneau chronométrique, ni pièges λ, ni anneau Amérique ne sont touchés.
   Les comptes viennent uniquement de UM_FLOORS (données du Hub) et de gaps_v1.4.json (treillis). */
(function(){
  const LAT='/plumb-dump-data/lattice/';
  const MIN_KIDS=3, MIN_N=5, TH=25;
  const css=document.createElement('style');
  css.textContent='#um-gaps{flex:1 1 100%;order:-1;background:#2a0f0d;border:2px solid #e0533f;border-radius:6px;padding:4px 8px;margin:2px 0;color:#ffd9d2;font:12px/1.35 system-ui,sans-serif;max-height:24vh;overflow:auto}'
    +'#um-gaps summary{cursor:pointer;font-weight:700;color:#ffb4a6}'
    +'#um-gaps ul{margin:4px 0 2px 16px;padding:0}#um-gaps li{margin:1px 0}'
    +'#um-gaps button,#um-gaps a{font:600 12px system-ui,sans-serif;color:#ffe9a8;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline}'
    +'.um-gap-badge{display:inline-block;background:#e0533f;color:#fff;font:700 10px/1.2 system-ui,sans-serif;padding:1px 5px;border-radius:3px;margin-right:4px;white-space:nowrap}'
    +'.um-gap-tag{color:#e8c872;font:600 10px ui-monospace,monospace}'
    +'#hub-nav .um-thin{outline:2px dashed #e0533f;outline-offset:1px}'
    +'#hub-health-link{font:600 12px/1.3 system-ui,sans-serif;background:#0f2216;color:#9ff0bd;border:2px dashed #e0533f;border-radius:4px;padding:3px 8px;text-decoration:none}';
  document.head.appendChild(css);
  function by(id){ return (window.UM_FLOOR_BY&&UM_FLOOR_BY[id])||null; }
  function thin(f){
    if(!f||f.level==='world') return null;
    const kids=(f.children||[]).filter(by).length;
    if(f.level==='silo'||f.level==='zone'){
      if(kids<MIN_KIDS) return kids+' étage'+(kids>1?'s':'')+' enfant'+(kids>1?'s':'');
      return null;
    }
    if((f.n|0)===0) return '0 objet';
    if((f.n|0)<MIN_N) return (f.n|0)+' objets';
    return null;
  }
  const flagged=(window.UM_FLOORS||[]).map(f=>({f:f,why:thin(f)})).filter(x=>x.why);
  const FL={}; flagged.forEach(x=>{FL[x.f.id]=x.why;});
  function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function parentName(f){ const p=by(f.parent); return p?p.name:''; }
  const box=document.createElement('details');
  box.id='um-gaps'; box.open=true;
  let li=['<li><span class="um-gap-badge">LACUNE / GAP</span><b>SANTÉ / Health</b> : l’étage Santé du Hub a 0 étage enfant et 0 objet. Le treillis santé est publié ici : <a id="um-gaps-health" href="'+LAT+'">SANTÉ / Health lattice ↗</a> <span class="um-gap-tag">[À CONFIRMER]</span><ul id="um-gaps-lat"><li>Chargement des lacunes du treillis…</li></ul></li>'];
  flagged.forEach(x=>{
    if(x.f.id==='health') return;
    li.push('<li><span class="um-gap-badge">LACUNE / GAP</span><button type="button" data-gap="'+esc(x.f.id)+'">'+esc(x.f.name)+'</button>'
      +(x.f.parent?' <span style="opacity:.75">('+esc(parentName(x.f))+')</span>':'')+' : '+esc(x.why)+' <span class="um-gap-tag">[À CONFIRMER]</span></li>');
  });
  Object.keys(window.UM_WHY||{}).forEach(k=>{
    li.push('<li><span class="um-gap-badge">LACUNE / GAP</span>'+esc(k)+' : 0 série. '+esc(UM_WHY[k])+' <span class="um-gap-tag">[INCOMPLET]</span></li>');
  });
  box.innerHTML='<summary>Gaps / LACUNES : index ('+li.length+')</summary>'
    +'<div>Seuil : moins de '+TH+' % de couverture, ou moins de '+MIN_KIDS+' étages enfants (silo ou zone), ou moins de '+MIN_N+' objets (étage). Comptes réels du Hub, rien d’inventé.</div><ul>'+li.join('')+'</ul>';
  const header=document.querySelector('header');
  const navEl=document.getElementById('hub-nav');
  if(header){ if(navEl&&navEl.parentNode===header) header.insertBefore(box,navEl); else header.appendChild(box); }
  box.querySelectorAll('[data-gap]').forEach(b=>b.addEventListener('click',()=>{ try{ switchSys(b.getAttribute('data-gap')); }catch(e){} }));
  fetch(LAT+'v1.4/gaps_v1.4.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
    const ul=document.getElementById('um-gaps-lat'); if(!ul) return;
    if(!j||!j.gaps){ ul.innerHTML='<li>gaps_v1.4.json indisponible <span class="um-gap-tag">[INCOMPLET]</span></li>'; return; }
    ul.innerHTML=j.gaps.map(g=>'<li><span class="um-gap-badge">LACUNE / GAP</span><a href="'+LAT+'#'+(g.id.indexOf('gap-subnat')===0?'subnat':'field-'+g.id.slice(4))+'">'+esc(g.section)+'</a> : '+Number(g.coverage_pct_all).toFixed(1)+' % <span class="um-gap-tag">'+esc(g.tag||'[À CONFIRMER]')+'</span></li>').join('');
  }).catch(()=>{});
  function decorate(){
    const nav=document.getElementById('hub-nav'); if(!nav) return;
    nav.querySelectorAll('[data-down]').forEach(b=>{
      const id=b.getAttribute('data-down');
      if(FL[id]&&!b.classList.contains('um-thin')){ b.classList.add('um-thin'); b.title='LACUNE / GAP : '+FL[id]+' [À CONFIRMER]'; }
    });
    const c=document.getElementById('hub-center');
    const showHealth=nav.querySelector('[data-down="health"]')||(c&&c.textContent.trim()==='Santé');
    if(false&&showHealth&&!document.getElementById('hub-health-link')){ /* v20.86: le lien Santé vit maintenant dans le menu de droite (groupe Santé · lacunes) */
      const a=document.createElement('a');
      a.id='hub-health-link'; a.href=LAT;
      a.innerHTML='SANTÉ / Health lattice ↗ <span class="um-gap-badge">LACUNE / GAP</span>';
      nav.appendChild(a);
    }
  }
  const nav=document.getElementById('hub-nav');
  if(nav){ new MutationObserver(()=>decorate()).observe(nav,{childList:true}); }
  decorate();
})();

/* v20.86 — Éric, 22 nov 2026 01:04–01:05 (Toronto) : menu de droite réordonné.
   v20.87 — 01:11–01:14 : More et ses boutons forment un pied collant, toujours visible ; ligne Guest réservée aux administrateurs, tout en haut.
   Ses cases (Couches) en haut, puis l'utile (Santé · lacunes, Fiche), et le reste replié dans « ▸ Autres / More ».
   Sous More : un bouton par sous-groupe utile. Rien n'est supprimé : les sections sont déplacées telles quelles
   (le moteur les remplit par id), et le déplacement est réappliqué si le menu est redessiné. */
(function(){
  const R=document.getElementById('right'); if(!R) return;
  const css=document.createElement('style');
  css.textContent='.um-rg{border:1px solid var(--line,#2a3340);border-radius:5px;background:var(--panel,#0d1218);min-width:0}'
    +'.um-rg>summary{cursor:pointer;list-style:none;font:600 11px/1.3 var(--f-mono,ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase;color:#e8c872;padding:6px 9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    +'.um-rg>summary::-webkit-details-marker{display:none}'
    +'.um-rg>summary::before{content:"▸ ";color:#8b98ad}.um-rg[open]>summary::before{content:"▾ "}'
    +'.um-rg>section.panel{border:0;border-top:1px solid var(--line,#2a3340);border-radius:0 0 5px 5px}'
    +'#um-rg-couches{border-color:#e8c872}#um-rg-couches>summary{color:#ffe9a8;font-size:12px}'
    +'#um-rg-fiche>section.panel{max-height:46vh;overflow:auto}'
    +'#um-rg-more>summary{color:#8b98ad}#um-rg-more .um-rg{margin:6px}'
    +'.um-rg-body{padding:6px 9px;display:flex;flex-direction:column;gap:6px}'
    +'#um-rg-sante #um-gaps{max-height:40vh;margin:0}#um-gaps:not([open]){overflow:hidden}'
    +'#um-gaps>summary{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    +'#um-rg-sante #hub-health-link{align-self:flex-start}'
    +'#um-rg-btns{display:flex;flex-wrap:wrap;gap:5px}'
    +'#um-rg-btns button{font:600 11px/1.3 system-ui,sans-serif;padding:4px 8px}'
    +'#um-rg-btns button.um-first{border-color:#e8c872;color:#ffe9a8}'
    +'#um-rg-foot{position:sticky;bottom:0;z-index:6;margin-top:auto;display:flex;flex-direction:column;gap:6px;padding:6px 0 2px;background:var(--bg,#070a0e);box-shadow:0 -10px 14px -6px rgba(0,0,0,.85)}'
    +'#um-rg-more[open]{max-height:32vh;overflow:auto}'
    +'#um-rg-guest{border-color:#7fd1ff}#um-rg-guest>summary{color:#bfe8ff}'
    +'#um-guest-form{display:flex;flex-direction:column;gap:6px;font:12px/1.4 system-ui,sans-serif;color:#d9e2ec}'
    +'#um-guest-form input,#um-guest-form select{font:12px system-ui,sans-serif;padding:3px 5px}'
    +'#um-guest-draft{white-space:pre-wrap;font:11px/1.45 ui-monospace,monospace;background:#0b1118;border:1px solid #2a3340;padding:6px;margin:0}'
    +'.um-guest-blocked{background:#3a0e0b;border:2px solid #e0533f;color:#ffd9d2;font:700 12px/1.35 system-ui,sans-serif;padding:5px 7px;border-radius:4px}';
  document.head.appendChild(css);
  const LAT='/plumb-dump-data/lattice/';
  function sec(id){ const e=document.getElementById(id); return e?e.closest('section'):null; }
  function wrap(id,title,open,parent){
    let d=document.getElementById(id);
    if(!d){ d=document.createElement('details'); d.id=id; d.className='um-rg'; if(open) d.open=true;
      const s=document.createElement('summary'); s.textContent=title; d.appendChild(s); }
    if(d.parentNode!==parent) parent.appendChild(d);
    return d;
  }
  function couchesTitle(){
    const all=document.querySelectorAll('#layers input[type=checkbox]');
    const on=[...all].filter(i=>i.checked).length;
    return '☑ Couches · '+on+'/'+all.length+' cochées';
  }
  let busy=false;
  function apply(){
    if(busy) return; busy=true;
    try{
      const rclose=R.querySelector('.rclose');
      const sCou=sec('layers'), sFiche=document.getElementById('fiche'), sLeg=sec('legend'), sSrc=sec('srcText');
      /* 1. ses cases */
      const dC=wrap('um-rg-couches',couchesTitle(),true,R);
      if(sCou&&sCou.parentNode!==dC) dC.appendChild(sCou);
      dC.firstChild.textContent=couchesTitle();
      /* 2. Santé · lacunes : lien du treillis + index des lacunes (replié sur une ligne) */
      const dS=wrap('um-rg-sante','Santé · lacunes',true,R);
      let body=dS.querySelector('.um-rg-body');
      if(!body){ body=document.createElement('div'); body.className='um-rg-body'; dS.appendChild(body); }
      let a=document.getElementById('hub-health-link');
      if(!a){ a=document.createElement('a'); a.id='hub-health-link'; a.href=LAT; a.innerHTML='SANTÉ / Health lattice ↗ <span class="um-gap-badge">LACUNE / GAP</span>'; }
      if(a.parentNode!==body) body.insertBefore(a,body.firstChild);
      const g=document.getElementById('um-gaps');
      if(g&&g.parentNode!==body){ g.open=false; body.appendChild(g);
        const sm=g.querySelector('summary');
        if(sm&&!sm.querySelector('.um-gap-badge')) sm.insertAdjacentHTML('afterbegin','<span class="um-gap-badge">LACUNE / GAP</span>'); }
      /* 3. Fiche (lecture vivante) */
      const dF=wrap('um-rg-fiche','Fiche · lecture',true,R);
      if(sFiche&&sFiche.parentNode!==dF) dF.appendChild(sFiche);
      /* 4. pied collant : ▸ Autres / More (replié), puis les boutons des sous-groupes, toujours visibles */
      let foot=document.getElementById('um-rg-foot');
      if(!foot){ foot=document.createElement('div'); foot.id='um-rg-foot'; }
      const dM=wrap('um-rg-more','Autres / More',false,foot);
      const dL=wrap('um-rg-legende','Légende',false,dM);
      if(sLeg&&sLeg.parentNode!==dL) dL.appendChild(sLeg);
      const dX=wrap('um-rg-source','Source · bornes',false,dM);
      if(sSrc&&sSrc.parentNode!==dX) dX.appendChild(sSrc);
      /* 5. boutons des sous-groupes, sous More */
      let bt=document.getElementById('um-rg-btns');
      if(!bt){ bt=document.createElement('div'); bt.id='um-rg-btns';
        const B=[['um-rg-couches','☑ Couches','um-first']].concat(document.getElementById('um-rg-guest')?[['um-rg-guest','Guest','']]:[]).concat([['um-rg-sante','Santé · lacunes',''],['um-gaps','Lacunes · index',''],['um-rg-fiche','Fiche · lecture','']]);
        bt.innerHTML=B.map(b=>'<button type="button" class="'+b[2]+'" data-open="'+b[0]+'">'+b[1]+'</button>').join('');
        bt.addEventListener('click',e=>{
          const b=e.target.closest('[data-open]'); if(!b) return;
          const t=document.getElementById(b.getAttribute('data-open')); if(!t) return;
          for(let p=t;p&&p!==R;p=p.parentElement) if(p.tagName==='DETAILS') p.open=true;
          t.scrollIntoView({block:'nearest'});
        });
      }
      if(bt.parentNode!==foot||bt.previousElementSibling!==dM) foot.appendChild(bt);
      /* ordre final : Guest (administrateurs seulement) tout en haut, puis l'ordre v20.86 */
      const want=[rclose,document.getElementById('um-rg-guest'),dC,dS,dF,foot].filter(Boolean);
      const have=[...R.children];
      if(want.some((n,k)=>have[k]!==n)) want.forEach(n=>R.appendChild(n)); /* ne réordonne que si l'ordre a changé (pas de boucle) */
    } finally { busy=false; }
  }
  apply();
  window.UM_RIGHT_APPLY=apply;
  new MutationObserver(()=>{ if(!busy) apply(); }).observe(R,{childList:true});
  const lay=document.getElementById('layers');
  const upd=()=>{ const d=document.getElementById('um-rg-couches'); if(d&&d.firstChild) d.firstChild.textContent=couchesTitle(); };
  if(lay){ lay.addEventListener('change',upd); new MutationObserver(upd).observe(lay,{childList:true}); }
})();

/* v20.87 — Éric, 22 nov 2026 01:14 (Toronto) : ligne « Guest » tout en haut du menu de droite, administrateurs seulement
   (Éric, Gary, Samuel). La clé est déposée dans ce navigateur par le lien /um/door/#k=… (v20.88) ; ici on ne garde que
   les empreintes SHA-256, jamais une clé. Sans clé valide, la ligne n'existe pas. Sur un site statique, cela cache la ligne
   mais ne la protège pas vraiment. ENVOI BLOQUÉ : rien n'est envoyé d'ici, aucun courriel, aucune API. */
(function(){
  /* v20.88 : empreintes partagées dans /um/door/admin/fingerprints.js (une seule source ; rotation = remplacer une empreinte).
     Déverrouillage en un clic par /um/door/#k=<clé> ; la même clé déverrouille ici. ?guest=1 ouvre la ligne Guest. */
  /* Point d'entrée des invitations (Cloudflare Worker, um/door/tools/invite-worker/). Vide tant qu'il n'est pas déployé. */
  const UM_INVITE_ENDPOINT='';
  const R=document.getElementById('right'); if(!R) return;
  let tok=null; try{ tok=localStorage.getItem('um.hubGuestKey'); }catch(e){}
  if(!tok||!window.crypto||!crypto.subtle) return;
  const fpReady=window.UM_ADMIN?Promise.resolve():new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='/um/door/admin/fingerprints.js?v=20.88'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  fpReady.then(()=>UM_ADMIN.check(tok)).then(who=>{
    if(!who) return;
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const d=document.createElement('details'); d.id='um-rg-guest'; d.className='um-rg';
    d.innerHTML='<summary>Guest · inviter · '+esc(who.name)+'</summary>'
      +'<div class="um-rg-body"><form id="um-guest-form" autocomplete="off">'
      +'<div>Émetteur : <b>'+esc(who.name)+'</b> · expéditeur visible : <b>data@universalmetaphor.ca</b> · réponses : vers '+esc(who.name)+'.</div>'
      +'<label>Qui inviter (nom et courriel)<br><input id="um-guest-who" type="text" placeholder="Prénom Nom <courriel>" style="width:100%"></label>'
      +'<label>Langue <select id="um-guest-lang"><option>Français puis anglais</option><option>English then French</option></select></label>'
      +'<details><summary>Réunion (facultatif) : liens fournis par vous</summary>'
      +'<label>Zoom <input id="um-g-zoom" type="url" placeholder="https://…zoom.us/…" style="width:100%"></label>'
      +'<label>Google Meet <input id="um-g-meet" type="url" placeholder="https://meet.google.com/…" style="width:100%"></label>'
      +'<label>Teams <input id="um-g-teams" type="url" placeholder="https://teams.microsoft.com/…" style="width:100%"></label>'
      +'<label>Lien direct <input id="um-g-link" type="url" placeholder="https://…" style="width:100%"></label>'
      +'<label>Date et heure <input id="um-g-when" type="datetime-local"></label></details>'
      +'<button type="submit">Préparer l\'invitation</button>'
      +'<div class="um-guest-blocked" role="status">Envoi bloqué — en attente du feu vert d\'Éric sur les modèles</div>'
      +'<div id="um-guest-ep" class="um-gap-tag">'+(UM_INVITE_ENDPOINT?'Contrôle serveur : point d\'entrée configuré':'Contrôle serveur : endpoint non déployé [INCOMPLET]')+'</div>'
      +'<pre id="um-guest-draft" hidden></pre>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap"><a id="um-guest-card" href="/um/door/card/" target="_blank" rel="noopener">Aperçu de la carte d\'invitation ↗</a>'
      +'<a href="/um/door/admin/invites/" target="_blank" rel="noopener">Mes invités ↗</a>'
      +'<a href="/um/door/15c/" target="_blank" rel="noopener">Maquette 15c ↗</a></div>'
      +'</form></div>';
    const mt=()=>{ const o={}; ['zoom','meet','teams','link'].forEach(k=>{ const v=(d.querySelector('#um-g-'+k).value||'').trim(); if(v) o[k]=v; }); return o; };
    const cardHref=()=>{ const w=d.querySelector('#um-g-when').value; const p={issuer:who.name,meetings:mt(),when:w?new Date(w).toISOString():null,lang:/^English/.test(d.querySelector('#um-guest-lang').value)?'en':'fr'};
      return '/um/door/card/#preview='+btoa(unescape(encodeURIComponent(JSON.stringify(p)))); };
    d.addEventListener('input',()=>{ d.querySelector('#um-guest-card').href=cardHref(); });
    d.querySelector('#um-guest-card').addEventListener('click',()=>{ d.querySelector('#um-guest-card').href=cardHref(); });
    d.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();
      const to=d.querySelector('#um-guest-who').value.trim();
      const pre=d.querySelector('#um-guest-draft');
      pre.hidden=false;
      pre.textContent=to?('INVITATION PRÉPARÉE — NON ENVOYÉE\n'
        +'De (visible) : Universal Metaphor <data@universalmetaphor.ca>\n'
        +'Émetteur : '+who.name+'\n'
        +'Répondre à : '+who.name+' (adresse de l\'émetteur, ajoutée à l\'envoi)\n'
        +'À : '+to+'\n'
        +'Objet : Invitation — votre environnement privé Universal Metaphor\n'
        +'Langue : '+d.querySelector('#um-guest-lang').value+'\n'
        +'Corps : gabarit rév. 2 (version courte + lien vers le texte complet)\n\n'
        +'Envoi bloqué — en attente du feu vert d\'Éric sur les modèles.'):'Indiquez qui inviter.';
      const ep=d.querySelector('#um-guest-ep');
      if(!to) return;
      if(!UM_INVITE_ENDPOINT){ ep.textContent='Contrôle serveur : endpoint non déployé [INCOMPLET] — invitation préparée dans la page seulement, rien n\'est transmis.'; return; }
      ep.textContent='Contrôle serveur : vérification…';
      fetch(UM_INVITE_ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({to:to,lang:/^English/.test(d.querySelector('#um-guest-lang').value)?'en':'fr',meetings:mt(),when:(d.querySelector('#um-g-when').value?new Date(d.querySelector('#um-g-when').value).toISOString():null)})})
        .then(r=>r.json().then(j=>({r:r,j:j})))
        .then(x=>{ ep.textContent=x.r.status===202?('Contrôle serveur : '+x.j.status+' · émetteur '+x.j.issuer+' · réf. '+x.j.id+(x.j.card_token?' · carte : /um/door/card/#t='+x.j.card_token:'')):('Contrôle serveur : refusé ('+x.r.status+' · '+(x.j.error||'')+')'); })
        .catch(()=>{ ep.textContent='Contrôle serveur : injoignable [INCOMPLET]'; });
    });
    R.insertBefore(d,R.firstChild);
    if(window.UM_RIGHT_APPLY){ const b=document.getElementById('um-rg-btns'); if(b) b.remove(); UM_RIGHT_APPLY(); }
    if(/[?&]guest=1\b/.test(location.search)){ d.open=true; try{ d.scrollIntoView({block:'start'}); }catch(e){} }
  }).catch(()=>{});
})();

/* v20.89 — 22 nov 2026 (Toronto) : liens du Hub vers les livrables Claude servis (demande de Claude, passages 35–36 ;
   étape 3 de 1H3YsIEc… ; PUSH ORDER v2, point 2 « From a HUB link to the demo layer »). Un seul groupe replié, en tête du
   pied collant du menu de droite (toujours visible) : la porte, le parcours de l'invité v2, la maquette 15c, et le moteur
   Manifestation par sa copie gelée (bac DÉMO Finance a912f92cb325, jamais un lien claude.ai). Liens seulement : rien n'est
   envoyé, aucune API, um/index.html ne change que par sa version. Inséré dans #um-rg-foot (pas un enfant direct de #right),
   donc l'ordre de v20.86–v20.88 et son observateur ne bougent pas. */
(function(){
  const L=[['/um/door/','La porte / The door'],
           ['/um/door/um-invite-demo-v2.html','Parcours de l\u2019invité v2 / Invitee journey (démo lundi)'],
           ['/um/door/15c/','Maquette 15c'],
           ['/um/door/systems/a912f92cb325-finance-synthetique/','Moteur Manifestation \u2014 copie gelée (DÉMO Finance)']];
  let tries=0;
  function put(){
    const foot=document.getElementById('um-rg-foot');
    if(!foot){ if(++tries<40) setTimeout(put,250); return; }
    if(document.getElementById('um-rg-door')) return;
    const css=document.createElement('style');
    css.textContent='#um-rg-door{border-color:#e8c872}#um-rg-door>summary{color:#ffe9a8}'
      +'#um-rg-door .um-rg-body{display:flex;flex-direction:column;gap:4px;font:12px/1.4 system-ui,sans-serif}';
    document.head.appendChild(css);
    const d=document.createElement('details'); d.id='um-rg-door'; d.className='um-rg';
    d.innerHTML='<summary>Porte · démo / Door · demo \u2197</summary><div class="um-rg-body">'
      +L.map(x=>'<a href="'+x[0]+'" target="_blank" rel="noopener">'+x[1]+' \u2197</a>').join('')+'</div>';
    foot.insertBefore(d,foot.firstChild);
  }
  put();
})();
