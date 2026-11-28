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
    try{ history.pushState({bloom:0},'',location.pathname+location.search+'#/finance'); }catch(e){}
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
    try{ history.pushState({bloom:next},'',location.pathname+location.search+'#/finance'); }catch(e){}
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
    if(nav){
      nav.innerHTML=bits.join('');
      const center=document.getElementById('hub-center');
      if(center&&(parent||blooming)) center.addEventListener('click',()=>{ if(!collapseBloom()&&parent) switchSys(parent); });
      nav.querySelectorAll('[data-down]').forEach(btn=>{
        btn.addEventListener('click',()=>switchSys(btn.getAttribute('data-down')));
      });
    }
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
    if(!el){ if(!nav) return; el=document.createElement('p'); el.id='hub-gap'; nav.appendChild(el); }
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
        if(!stated){ try{ history.replaceState({bloom:b},'',location.pathname+location.search+'#/finance'); }catch(e){} }
      }else window.UM_BLOOM=0;
      render(id);
    }
    finally{ navigating=false; }
  };
  function onRoute(){
    if(navigating) return;
    const raw=rawHash();
    if(!raw||raw==='menu'||raw==='accueil'){ document.body.classList.add('um-menu'); return; }
    const id=resolve(raw);
    if(!id) return;
    document.body.classList.remove('um-menu');
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
  /* v21.09 — do not force #/world. The blank menu stays until a universe is chosen. */
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
  let li=['<li><span class="um-gap-badge">LACUNE / GAP</span><b>SANTÉ / Health</b> : deux coupes Classe 2 sont branchées (villes du monde, provinces du Canada). Leurs lacunes sont sur le système. Le treillis santé reste publié : <a id="um-gaps-health" href="'+LAT+'">SANTÉ / Health lattice ↗</a> <span class="um-gap-tag">[À CONFIRMER]</span><ul id="um-gaps-lat"><li>Chargement des lacunes du treillis…</li></ul></li>'];
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
      const dS=wrap('um-rg-sante','Santé · lacunes',false,R);
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
      const dF=wrap('um-rg-fiche','Fiche · lecture',false,R);
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
      const have=[...R.children].filter(n=>want.indexOf(n)>=0);
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
  const fpReady=window.UM_ADMIN?Promise.resolve():new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='/um/door/admin/fingerprints.js?v=21.07'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
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
  return; /* 27 nov 22:37 : « la porte » retirée de l'écran. */
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

/* v20.90 — Éric, 22 nov 2026 10:57 (Toronto, voix) : les boutons d'objets Classe 2 (nav#hub-nav, autrefois dans la barre du haut)
   passent dans le menu de droite, juste sous les cases « ☑ Couches · N/20 cochées », pour dégager la barre du haut au profit du
   champ de visualisation. Déplacement seulement : le même élément nav#hub-nav est déplacé (render() continue d'y écrire, mêmes
   gestionnaires de clic, rien n'est réimplémenté ni supprimé). Inséré à l'intérieur du groupe Couches (pas comme enfant direct
   de #right) pour ne pas déclencher le réordonnancement v20.86–v20.88. */
(function(){
  let tries=0;
  function move(){
    const nav=document.getElementById('hub-nav');
    const dC=document.getElementById('um-rg-couches');
    if(!nav||!dC){ if(++tries<40) setTimeout(move,250); return; }
    if(!document.getElementById('um-c2-css')){
      const css=document.createElement('style'); css.id='um-c2-css';
      css.textContent='#um-rg-couches #hub-nav{flex:none;max-height:none;overflow:visible;margin-top:8px;padding-top:6px;border-top:1px solid rgba(200,205,212,.18)}'
        +'#um-rg-couches #hub-nav::before{content:"Classe 2 · objets";flex:1 1 100%;font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8b98ad}';
      document.head.appendChild(css);
    }
    if(nav.parentNode!==dC||nav!==dC.lastElementChild) dC.appendChild(nav);
  }
  move();
  /* si un ancien script remet la nav dans l'en-tête, on la ramène sous les cases */
  const hd=document.querySelector('header');
  if(hd) new MutationObserver(()=>{ const n=document.getElementById('hub-nav'); if(n&&n.parentNode===hd) move(); }).observe(hd,{childList:true});
})();

/* v20.91 — Éric, 22 nov 2026 12:45–12:49 (Toronto, voix) : panneau de droite UNIFIÉ.
   1. En haut : toutes les cases (Couches + Kobayashi Maru, déplacée de la barre du haut).
   2. Juste dessous : « Classe 2 · objets » — un bouton par objet de Classe 2 visible dans le moteur ; un clic = sélection
      (crochet public __umSelect du moteur), deux clics = plonger (switchSys(class2Floor), comme le moteur). Rien de réimplémenté.
   3. « Pôles · zones · systèmes » : le sélecteur Classe 4 (#sys), le bouton HUB et la nav des étages (#hub-nav), déplacés
      de la barre du haut (mêmes nœuds DOM, mêmes gestionnaires), précédés du lien d'invitation.
   Le pied collant devient compact et ne recouvre plus la rangée Classe 2. Santé · lacunes est replié sur une ligne.
   Squelettes non fonctionnels : Santé (en attente de loader-v2, Claude) et Football (EN CONSTRUCTION).
   Rien n'est supprimé : déplacements, replis, masquage d'un titre en double. Aucune requête réseau ajoutée sauf la
   lecture des fichiers publics du treillis pour le squelette Santé. */
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const INVITE='/um/door/um-invite-demo-v2.html', CARD='/um/door/card/', FORM='/um/door/form-draft/';
  const css=document.createElement('style'); css.id='um-v2091-css';
  css.textContent=''
    /* bloc des cases, compact */
    +'#um-rg-couches>section.panel{padding:6px 8px}'
    +'#um-rg-couches>section.panel>h2{display:none}' /* titre « Couches » en double avec le résumé */
    +'#um-rg-couches .layers{grid-template-columns:1fr 1fr;gap:1px 8px;font-size:11px;line-height:1.25}'
    +'#um-rg-couches .layers label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'
    +'#um-rg-couches .layers input{margin:1px 4px 1px 0;vertical-align:-2px}'
    +'.um-u-row{padding:5px 8px 6px;border-top:1px solid rgba(200,205,212,.18);display:flex;flex-wrap:wrap;gap:4px;align-items:center}'
    +'.um-u-row>.um-u-h{flex:1 1 100%;font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8b98ad}'
    +'.um-u-row button,.um-u-row a.um-u-a{font:500 11px/1.25 system-ui,sans-serif;padding:3px 7px}'
    +'#um-u-chk label{font-size:11px}'
    +'#um-u-c2 .um-u-empty{font:11px/1.35 system-ui,sans-serif;color:#9aa3ad}'
    +'#um-u-c2 button[aria-pressed=true]{border-color:#5fd690;color:#c9f5da}'
    +'#um-u-sys .take{font-size:11px}#um-u-sys select{max-width:170px;font-size:11px}'
    +'#um-u-sys #hub-nav{flex:1 1 100%;margin:2px 0 0;padding:0;border:0;gap:4px}'
    +'#um-u-sys #hub-nav::before{content:none!important}'
    +'#um-u-sys #hub-nav button,#um-u-sys #hub-nav a{font:500 11px/1.25 system-ui,sans-serif;padding:3px 7px}'
    +'a.um-u-a{display:inline-block;border:1px solid #7fd1ff;border-radius:4px;color:#bfe8ff;text-decoration:none;background:#0d1a26}'
    +'#um-invite-first{border-color:#e8c872;color:#ffe9a8;background:#1a160b;font-weight:700!important}'
    /* pied compact : une ligne de groupes repliés + une ligne de boutons */
    +'#um-rg-foot{flex-direction:row!important;flex-wrap:wrap;gap:4px!important;padding:4px 0 2px!important}'
    +'#um-rg-foot>details{flex:1 1 45%;min-width:0}'
    +'#um-rg-foot>details>summary{padding:4px 7px!important;font-size:10px!important}'
    +'#um-rg-foot>details[open]{flex-basis:100%}'
    +'#um-rg-btns{flex:1 1 100%;gap:3px!important}#um-rg-btns button{font-size:10px!important;padding:2px 6px!important}'
    /* lien d'invitation en tête de la colonne de gauche */
    +'#um-invite-left{display:block;margin:0 0 6px;padding:5px 2px;border:1px solid #e8c872;border-radius:5px;background:#1a160b;color:#ffe9a8;text-decoration:none;font:700 10px/1.2 system-ui,sans-serif;text-align:center}'
    /* squelettes */
    +'.um-skel{position:absolute;left:10px;top:10px;z-index:7;width:min(600px,calc(100% - 20px));max-height:calc(100% - 130px);overflow:auto;background:rgba(9,13,18,.96);border:2px dashed #e8c872;border-radius:8px;color:#e6e9ee;font:12px/1.45 system-ui,sans-serif;padding:10px 12px;box-shadow:0 12px 40px rgba(0,0,0,.6)}'
    +'.um-skel h3{margin:0 0 4px;font:600 14px/1.3 system-ui,sans-serif;color:#ffe9a8}'
    +'.um-skel .sub{color:#9aa3ad;font-size:11px;margin-bottom:6px}'
    +'.um-skel table{border-collapse:collapse;width:100%;margin:4px 0 8px}.um-skel td,.um-skel th{border-bottom:1px solid #26303b;padding:3px 4px;text-align:left;vertical-align:top;font-size:11px}'
    +'.um-skel th{color:#8b98ad;font-weight:600}'
    +'.um-skel .lvl{font:600 11px ui-monospace,monospace;color:#bfe8ff;margin-top:8px}'
    +'.um-skel .x{position:sticky;top:0;float:right;font:700 13px system-ui;padding:0 7px}'
    +'.um-skel .inc{font:600 10px ui-monospace,monospace;color:#e8c872}'
    +'.um-skel .ex{display:inline-block;background:#33405a;color:#dbe6ff;font:700 9px/1.2 system-ui;padding:1px 4px;border-radius:3px}'
    +'.um-ribbon{position:sticky;top:-10px;margin:-10px -12px 8px;background:repeating-linear-gradient(45deg,#e8c872 0 14px,#1a160b 14px 28px);color:#000;font:800 12px/1 system-ui,sans-serif;letter-spacing:.2em;text-align:center;padding:6px}'
    +'.um-ribbon span{background:#e8c872;padding:2px 10px}'
    +'@media (max-width:700px){#um-rg-foot{position:static!important}.um-skel{max-height:calc(100% - 20px)}}'
    +'.um-skel-chip{position:absolute;left:10px;top:10px;z-index:7;font:600 11px system-ui;padding:4px 9px;border:1px dashed #e8c872;background:#1a160b;color:#ffe9a8;border-radius:5px;cursor:pointer}';
  document.head.appendChild(css);

  /* ---------- 1–3 : panneau unifié ---------- */
  function row(id,title,parent,after){
    let r=$(id);
    if(!r){ r=document.createElement('div'); r.id=id; r.className='um-u-row'; r.innerHTML='<span class="um-u-h">'+esc(title)+'</span>'; }
    if(after){ if(after.nextSibling!==r) after.parentNode.insertBefore(r,after.nextSibling); }
    else if(r.parentNode!==parent) parent.appendChild(r);
    return r;
  }
  let tries=0;
  function unify(){
    const dC=$('um-rg-couches'), nav=$('hub-nav'), lay=$('layers');
    if(!dC||!nav||!lay){ if(++tries<60) setTimeout(unify,250); return; }
    const rC2=row('um-u-c2','Classe 2 · objets — un clic : sélection · deux clics : plonger',dC);
    const rSys=row('um-u-sys','Pôles · zones · systèmes',dC,rC2);
    /* 27 nov 22:37 : invitations retirées. #sys et #hubHome restent dans la barre (v21.07/v21.09). */
    if(nav.parentNode!==rSys) rSys.appendChild(nav);
    const dS=$('um-rg-sante'); if(dS&&!dS.dataset.u91){ dS.open=false; dS.dataset.u91='1'; }
    c2();
  }
  /* Classe 2 : boutons depuis les objets visibles du moteur */
  let sig='';
  function ensureAct(r){
    if(!r) return;
    let b=document.getElementById('um-act-c2');
    if(!b){
      b=document.createElement('button'); b.type='button'; b.id='um-act-c2'; b.textContent='Activer toute la Classe 2';
      b.addEventListener('click',function(e){ e.stopPropagation(); if(window.__umActivateAllC2) window.__umActivateAllC2(); });
    }
    const h=r.querySelector('.um-u-h');
    if(b.parentNode!==r||b.previousSibling!==h) r.insertBefore(b, h?h.nextSibling:r.firstChild);
  }
  function c2(){
    const r=$('um-u-c2'); if(!r||typeof window.__umProbe!=='function') return;
    let p; try{ p=__umProbe(); }catch(e){ return; }
    const list=(p.visible||[]).filter(v=>v.kind===2);
    const s=p.sys+'|'+list.map(v=>v.idx).join(',');
    const fi=p.sel&&p.sel.kind===2?p.sel.idx:(p.focus&&p.focus.kind===2?p.focus.idx:-1);
    if(s===sig){ r.querySelectorAll('[data-c2]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.c2===fi?'true':'false')); ensureAct(r); return; } sig=s;
    const h=r.firstChild; r.innerHTML=''; r.appendChild(h);
    if(!list.length){ r.insertAdjacentHTML('beforeend','<span class="um-u-empty">Aucun objet de Classe 2 visible à ce niveau ('+list.length+') — les pôles et les zones sont juste dessous. <span class="inc">[INCOMPLET]</span></span>'); ensureAct(r); return; }
    list.forEach(v=>{ const b=document.createElement('button'); b.type='button'; b.dataset.c2=v.idx; b.dataset.floor=v.floor||''; b.textContent=v.name+(v.floor?' ↧':'');
      b.setAttribute('aria-pressed',v.idx===(p.sel&&p.sel.kind===2?p.sel.idx:-1)?'true':'false'); b.title='Un clic : sélection · deux clics : plonger'+(v.floor?' (étage '+v.floor+')':' (pas d\u2019étage en dessous)'); b.addEventListener('click',act); b.addEventListener('dblclick',act); r.appendChild(b); });
    ensureAct(r);
  }
  /* Un clic : sélection de l'objet par le crochet public du moteur (window.__umSelect = select() : carte, fiche, surbrillance).
     Deux clics : plonger, même appel que le moteur pour une Classe 2 (ascendOrEnter → switchSys(class2Floor(idx))).
     Le geste n'est pas rejoué sur le canevas : au centre d'une Classe 2, le moteur donne la priorité à la Classe 1 qu'elle
     contient (pickAt, v20.2), ce qui engagerait un autre objet. Le vol de caméra (enterFocus) n'est pas exposé : [INCOMPLET]. */
  function act(e){
    const b=e.currentTarget; const idx=+b.dataset.c2;
    const clicks=(e.type==='dblclick'||e.detail>=2)?2:1;
    if(window.__umAct) window.__umAct({clicks:clicks,kind:2,idx:idx});
    else if(clicks===2){ const floor=b.dataset.floor; if(floor) switchSys(floor); }
    else if(typeof window.__umSelect==='function') window.__umSelect({kind:2,idx:idx});
    setTimeout(c2,300);
  }
  unify();
  setInterval(()=>{ c2(); skel(); },1200);
  const hn=$('hub-nav'); if(hn) new MutationObserver(()=>{ setTimeout(()=>{ sig=''; c2(); skel(); },700); }).observe(hn,{childList:true});

  /* ---------- 4 : squelette Santé (remplaçable par loader-v2 de Claude) ---------- */
  const SMETA={"v1g": {"format": "sante-pack-index/1g", "source_file": "u5mr.csv", "rows": 67210, "shards": 269, "header": ["REF_AREA", "INDICATOR", "SEX", "WEALTH_QUINTILE", "DATA_SOURCE", "COUNTRY_NOTES", "UNIT_MEASURE", "TIME_PERIOD", "OBS_VALUE", "REF_PERIOD", "LOWER_BOUND", "UPPER_BOUND", "OBS_STATUS"], "dict_columns": {"INDICATOR": 1, "SEX": 3, "WEALTH_QUINTILE": 6, "DATA_SOURCE": 1, "COUNTRY_NOTES": 9, "UNIT_MEASURE": 1, "TIME_PERIOD": 94, "REF_PERIOD": 1, "OBS_STATUS": 2}, "indicator": ["CME_MRY0T4"], "unit": ["D_PER_1000_B"], "sex": ["_T", "F", "M"], "quintile": ["Q1", "Q2", "Q3", "Q4", "Q5", "_T"], "time": ["1931", "2024"], "data_source": ["UN_IGME"], "zones": {"America": 37, "Middle East": 20, "East": 29, "South Pacific": 14, "Africa": 48, "_NON_RATTACHE": 73, "Europe": 48}, "pack_file": "sante-paquets-v1g_u5mr.zip (ÉCHANGE 1gUthN6-…)"}, "v13": {"levels": ["world", "zone", "country", "region (NUTS2 / US state / CA province / AU SA4 & state / NZ regional council / BR UF / JP prefecture / ZA province / DHS survey region / OPHI region)", "district / municipality / county (IN district – NITI; MX municipio – INEGI code; US county – FIPS)", "city (US Census place – PLACES; AU LGA 2021; GB local authority; Urban Audit city; US MSA; CA CMA)", "ward (GB electoral ward – ONS code) — NEW v1.3, sub-city"], "cell_key": "INDICATOR|SEX|AGE|QUINTILE", "value_record": ["value", "unit", "year", "flag", "source", "table", "url"], "gap": {"status": "OPEN", "tag": "[INCOMPLET]"}}};
  const LAT='/plumb-dump-data/lattice/';
  let santeEl=null, santeClosed=false, fbEl=null, fbClosed=false;
  function badge(p){ return p<25?'<span class="um-gap-badge">LACUNE / GAP</span>':''; }
  function santeHTML(cov,gaps){
    const byF={}; (cov||[]).forEach(r=>{ (byF[r.field]=byF[r.field]||{label:r.label,z:{}}).z[r.zone]=r.pct; });
    const zones=['Africa','America','East','Europe','Middle East','South Pacific'];
    const ftab=Object.keys(byF).map(f=>'<tr><td>'+esc(byF[f].label)+'</td>'+zones.map(z=>{ const p=byF[f].z[z]; return '<td>'+(p==null?'<span class="inc">[INCOMPLET]</span>':p.toFixed(1)+' %'+badge(p))+'</td>'; }).join('')+'</tr>').join('');
    const g=(gaps||[]).map(x=>'<li><span class="um-gap-badge">LACUNE / GAP</span>'+esc(x.section)+' : '+Number(x.coverage_pct_all).toFixed(1)+' % <span class="inc">'+esc(x.tag||'')+'</span></li>').join('');
    const v=SMETA.v1g, t=SMETA.v13;
    return '<button type="button" class="x" data-x="sante" title="Replier">×</button>'
      +'<div class="um-ribbon"><span>SQUELETTE, EN ATTENTE DE LOADER-V2 (CLAUDE)</span></div>'
      +'<h3>Santé · squelette de ce qui est représentable</h3>'
      +'<div class="sub">Structure et forme des données seulement, tirées des sources déjà en main : treillis v1.4 (<a href="'+LAT+'" target="_blank" rel="noopener">'+LAT+'</a>, gaps_v1.4.json, coverage_by_field_v1.4.csv) et schémas des paquets de Claude (values_v1.3 = v1 ; '+esc(v.pack_file)+' = v1g ; chargeur v2). Aucune valeur affichée : les cases vides sont <span class="inc">[INCOMPLET]</span>. Non fonctionnel.</div>'
      +'<div class="lvl">ÉTAGES (cell-schema v1.3)</div><ol>'+t.levels.map(l=>'<li>'+esc(l)+' <span class="inc">[INCOMPLET]</span></li>').join('')+'</ol>'
      +'<div class="lvl">CELLULE · clé '+esc(t.cell_key)+' · enregistrement : '+t.value_record.map(esc).join(', ')+' · lacune : '+esc(t.gap.status)+' '+esc(t.gap.tag)+'</div>'
      +'<div class="lvl">CHAMPS × ZONES · couverture (seuil 25 %)</div><table><tr><th>Champ</th>'+zones.map(z=>'<th>'+esc(z)+'</th>').join('')+'</tr>'+(ftab||'<tr><td colspan="7"><span class="inc">coverage_by_field_v1.4.csv non lu [INCOMPLET]</span></td></tr>')+'</table>'
      +'<div class="lvl">LACUNES (gaps_v1.4.json)</div><ul>'+(g||'<li><span class="inc">[INCOMPLET]</span></li>')+'</ul>'
      +'<div class="lvl">PAQUET v1g · '+esc(v.format)+' · source '+esc(v.source_file)+' · '+v.rows.toLocaleString('fr-CA')+' lignes · '+v.shards+' paquets</div>'
      +'<table><tr><th>Colonne</th><th>Forme</th><th>Valeur</th></tr>'+v.header.map(c=>'<tr><td>'+esc(c)+'</td><td>'+(v.dict_columns[c]!=null?'dictionnaire · '+v.dict_columns[c]+' modalité(s)':'valeur brute')+'</td><td><span class="inc">[INCOMPLET]</span></td></tr>').join('')+'</table>'
      +'<div class="sub">Indicateur '+esc(v.indicator.join(', '))+' · unité '+esc(v.unit.join(', '))+' · sexe '+esc(v.sex.join(' / '))+' · quintiles '+esc(v.quintile.join(' / '))+' · période '+esc(v.time[0])+'–'+esc(v.time[1])+' · source '+esc(v.data_source.join(', '))+' · paquets par zone : '+Object.keys(v.zones).map(z=>esc(z)+' '+v.zones[z]).join(', ')+'.</div>'
      +'<div class="sub">Remplaçable : window.UM_SANTE_SKELETON.hide() ; ne s\u2019affiche pas si window.UM_SANTE_LOADER existe.</div>';
  }
  let santeData=null;
  function loadSante(){
    if(santeData) return Promise.resolve(santeData);
    return Promise.all([fetch(LAT+'v1.4/coverage_by_field_v1.4.csv').then(r=>r.ok?r.text():'').catch(()=>''), fetch(LAT+'v1.4/gaps_v1.4.json').then(r=>r.ok?r.json():null).catch(()=>null)])
      .then(([csv,gj])=>{ const rows=[]; csv.split('\n').slice(1).forEach(l=>{ const m=l.match(/^([^,]+),"([^"]*)",([^,]+),\d+,\d+,([\d.]+),/); if(m) rows.push({field:m[1],label:m[2],zone:m[3],pct:+m[4]}); });
        santeData={cov:rows,gaps:gj&&gj.gaps}; return santeData; });
  }
  function centerName(){ const c=$('hub-center'); return c?c.textContent.trim():''; }
  function chip(id,label,onclick){ let c=$(id); const st=$('stage'); if(!st) return null; if(!c){ c=document.createElement('button'); c.type='button'; c.id=id; c.className='um-skel-chip'; c.textContent=label; c.onclick=onclick; st.appendChild(c); } return c; }
  window.UM_SANTE_SKELETON={show:()=>{santeClosed=false;skel();},hide:()=>{santeClosed=true;skel();},get el(){return santeEl;}};
  window.UM_FOOTBALL_SKELETON={show:()=>{fbClosed=false;skel();},hide:()=>{fbClosed=true;skel();},get el(){return fbEl;}};
  function skel(){
    const st=$('stage'); if(!st) return;
    const onSante=centerName()==='Santé'&&!window.UM_SANTE_LOADER;
    if(onSante&&!santeClosed){
      if(!santeEl){ santeEl=document.createElement('div'); santeEl.id='um-sante-skel'; santeEl.className='um-skel'; santeEl.innerHTML=santeHTML([],[]); st.appendChild(santeEl);
        loadSante().then(d=>{ if(santeEl){ santeEl.innerHTML=santeHTML(d.cov,d.gaps); wireX(santeEl); } }); }
      wireX(santeEl); santeEl.hidden=false;
    } else if(santeEl) santeEl.hidden=true;
    const sc=onSante&&santeClosed?chip('um-sante-chip','Santé · squelette ▸',()=>{santeClosed=false;skel();}):$('um-sante-chip'); if(sc) sc.hidden=!(onSante&&santeClosed);
    const onFb=typeof CURSYS==='string'&&/^(football|fb-)/.test(CURSYS)&&centerName()!=='Santé';
    if(onFb&&!fbClosed){ if(!fbEl){ fbEl=document.createElement('div'); fbEl.id='um-football-skel'; fbEl.className='um-skel'; fbEl.innerHTML=fbHTML(); st.appendChild(fbEl); } wireX(fbEl); fbEl.hidden=false; }
    else if(fbEl) fbEl.hidden=true;
    const fc=onFb&&fbClosed?chip('um-football-chip','Football · squelette ▸',()=>{fbClosed=false;skel();}):$('um-football-chip'); if(fc) fc.hidden=!(onFb&&fbClosed);
  }
  function wireX(el){ const x=el.querySelector('[data-x]'); if(x&&!x.dataset.w){ x.dataset.w='1'; x.addEventListener('click',()=>{ if(x.dataset.x==='sante') santeClosed=true; else fbClosed=true; skel(); },{signal:new AbortController().signal}); } } /* v20.91.1 : signal propre, survit à switchSys */

  /* ---------- 5 : squelette Football (EN CONSTRUCTION) ---------- */
  function fbHTML(){
    const fb=(typeof LIB!=='undefined')&&LIB.find(x=>x.id==='football'); const d=fb&&fb.data;
    const n=d&&d.t?d.t.length:0, cols=d&&d.cols||[];
    const confs={}, leagues={}; (d&&d.t||[]).forEach(t=>{ if(t.g&&t.g[1]) confs[t.g[1]]=1; if(t.a) leagues[String(t.a).split(' → ')[0]]=1; });
    const has=k=>cols.indexOf(k)>=0;
    const L=[
      ['Confédération','nom, sigle',Object.keys(confs).length?100:0,Object.keys(confs).length+' dans les données du Hub'],
      ['Ligue / compétition','nom, pays, niveau, saison',Object.keys(leagues).length?100:0,Object.keys(leagues).length+' ligues (saison T₀) dans les données du Hub'],
      ['Club / sélection','nom, sigle, pays, confédération',n?100:0,n+' clubs (données du Hub)'],
      ['Sélection nationale','nom, confédération, classement',0,''],
      ['Effectif / joueurs','nom, poste, numéro, nationalité, âge',0,''],
      ['Matchs / calendrier','date, domicile, extérieur, stade, compétition',0,''],
      ['Résultats','score, buteurs, cartons',0,''],
      ['Classements','rang, points, joués, G/N/P, buts pour/contre',['pos','pts','pld','wp','dp','lp','gfm','gam'].filter(has).length/8*100,'colonnes présentes : '+['pos','pts','pld','wp','dp','lp','gfm','gam'].filter(has).join(', ')],
      ['Stats équipe','points par match, différence de buts',['ppg','gdm'].filter(has).length/2*100,'colonnes présentes : '+['ppg','gdm'].filter(has).join(', ')],
      ['Stats joueur','buts, passes, minutes, cartons',0,''],
      ['Transferts','joueur, de, vers, date, montant',0,''],
      ['Stades','nom, ville, capacité',0,'']];
    const rows=L.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td>'+Math.round(x[2])+' %'+badge(x[2])+'</td><td>'+(x[2]>0?esc(x[3]):'<span class="ex">EXEMPLE</span> <span class="inc">[INCOMPLET]</span>')+'</td></tr>').join('');
    const ex='<table><tr><th>Joueur</th><th>Poste</th><th>N°</th><th>Nationalité</th><th>Âge</th></tr>'+[1,2,3].map(i=>'<tr><td><span class="ex">EXEMPLE</span> Joueur '+i+'</td><td><span class="inc">[INCOMPLET]</span></td><td><span class="inc">[INCOMPLET]</span></td><td><span class="inc">[INCOMPLET]</span></td><td><span class="inc">[INCOMPLET]</span></td></tr>').join('')+'</table>';
    return '<button type="button" class="x" data-x="fb" title="Replier">×</button>'
      +'<div class="um-ribbon"><span>EN CONSTRUCTION</span></div>'
      +'<h3>Football · squelette de tout ce que le système contiendra</h3>'
      +'<div class="sub">Confédération → ligue / compétition → club / sélection → effectif / joueurs, puis matchs, résultats, classements, statistiques, transferts, stades. Non fonctionnel, à raffiner. Couverture calculée sur les données du Hub déjà servies (classements finaux, '+n+' clubs, colonnes : '+esc(cols.join(', '))+'). Aucun nom ni chiffre inventé : tout exemple est marqué <span class="ex">EXEMPLE</span>, tout manque <span class="inc">[INCOMPLET]</span>.</div>'
      +'<table><tr><th>Étage / bloc</th><th>Champs</th><th>Couverture</th><th>État</th></tr>'+rows+'</table>'
      +'<div class="lvl">EFFECTIF · forme d\u2019une ligne</div>'+ex
      +'<div class="lvl">MATCH · forme d\u2019une ligne</div><table><tr><th>Date</th><th>Domicile</th><th>Score</th><th>Extérieur</th><th>Stade</th></tr><tr><td><span class="ex">EXEMPLE</span></td><td>Club A</td><td><span class="inc">[INCOMPLET]</span></td><td>Club B</td><td><span class="inc">[INCOMPLET]</span></td></tr></table>';
  }
})();

/* 28 nov 9:19 — agrégats au-dessus des couches déjà là. Classe 3 exclue de cette liste (bornes). Trois états : visible, fantôme, masqué. */
(function(){
  const st=new Map();
  const vol=new Map();
  const NEXT={on:'ghost',ghost:'off',off:'on'};
  const WORD={on:'visible',ghost:'fantôme',off:'masqué'};
  let mines=[];
  function loadMines(){ try{ const a=JSON.parse(localStorage.getItem('um.myClass2.v1')||'[]'); mines=Array.isArray(a)?a:[]; }catch(e){ mines=[]; } return mines; }
  function sys(){ try{ return window.__umAggSys?window.__umAggSys():''; }catch(e){ return ''; } }
  function keyOf(key){ return key.indexOf('mine:')===0?key:sys()+'|'+key; }
  function of(kind,idx){
    const s=sys();
    if((kind===1||kind===2)&&st.has(s+'|'+kind+':'+idx)) return st.get(s+'|'+kind+':'+idx);
    if(kind===1||kind===2){
      for(let i=0;i<mines.length;i++){
        const m=mines[i], v=st.get('mine:'+m.id);
        if(!v||!m.parts) continue;
        if(m.parts.some(p=>p.kind===kind&&p.idx===idx&&(!p.sys||p.sys===s))) return v;
      }
    }
    if(st.has(s+'|'+kind)) return st.get(s+'|'+kind);
    return 'on';
  }
  function volKey(key,which){ return (key.indexOf('mine:')===0?key:keyOf(key))+'|'+which; }
  function volOwn(key,which){ const v=vol.get(volKey(key,which)); return v==null?1:v; }
  function volSet(key,which,v){
    const k=volKey(key,which);
    if(Math.abs(v-1)<0.02) vol.delete(k); else vol.set(k,v);
  }
  function volOf(kind,idx,which){
    loadMines();
    const s=sys();
    let v=vol.get(s+'|'+kind+':'+idx+'|'+which);
    if(v==null) v=1;
    for(let i=0;i<mines.length;i++){
      const m=mines[i], mv=vol.get('mine:'+m.id+'|'+which);
      if(mv==null||!m.parts) continue;
      if(m.parts.some(function(p){ return p.kind===kind&&p.idx===idx&&(!p.sys||p.sys===s); })) v*=mv;
    }
    return v;
  }
  window.__umAgg={
    of:of,
    vol:volOf,
    any:function(s){
      const pre=sys()+'|';
      for(const [k,v] of st){ if(v===s&&(k.indexOf('mine:')===0||k.indexOf(pre)===0)) return true; }
      return false;
    }
  };
  function activateAllC2(){
    const s=sys();
    for(const k of [...st.keys()]){
      if(k===s+'|2'||k.indexOf(s+'|2:')===0||k.indexOf('mine:')===0) st.delete(k);
    }
    loadMines();
    if(window.__umActivateC2) window.__umActivateC2();
    if(window.__umAggRefresh) window.__umAggRefresh();
    render();
  }
  window.__umActivateAllC2=activateAllC2;
  const css=document.createElement('style'); css.id='um-agg-css';
    css.textContent='#um-c2-pin{flex:0 0 auto;display:flex;flex-direction:column;height:min(56vh,460px);min-height:220px;max-height:min(56vh,460px);overflow:hidden;border:1px solid #e8c872;border-radius:8px;background:#0a1019}'
    +'#um-agg{display:flex;flex-wrap:wrap;gap:4px 8px;padding:6px 9px;overflow:auto;flex:1 1 auto;min-height:0;border-bottom:1px solid #2a3340}'
    +'#um-c2-pin #um-u-mine{flex:0 0 auto;background:#0a1019}'
    +'#um-act-c2,#um-act-c2b{flex:1 1 100%;font:700 12px/1.25 system-ui,sans-serif;color:#05080d;background:#e8c872;border:2px solid #fff;border-radius:6px;padding:6px 8px;cursor:pointer}'
    +'#um-agg .um-u-h{flex:1 1 100%;font:700 11px/1.3 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#e8c872}'
    +'#um-agg label{font:600 12px/1.3 system-ui,sans-serif}'
    +'#um-agg .um-gset{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}'
    +'#um-agg input:indeterminate{accent-color:#b388ff}'
    +'#um-agg .um-row{flex:1 1 100%;display:flex;align-items:center;gap:4px;min-width:0}'
    +'#um-agg .um-row>.chk{flex:1 1 auto;min-width:0}'
    +'#um-agg .um-c1head{position:sticky;top:0;z-index:2;background:#0a1019}'
    +'#um-c1-open{flex:0 0 auto;padding:0 7px;font:700 14px/1.2 system-ui,sans-serif}'
    +'#um-agg .um-v{display:inline-flex;align-items:center;gap:2px;flex:0 0 auto}'
    +'#um-agg .um-v input[type=range]{width:52px;margin:0;accent-color:#e8c872}'
    +'#um-agg .um-v[data-w=gv] input{accent-color:#b388ff}'
    +'#um-agg .um-v b{font:600 10px/1 ui-monospace,monospace;min-width:38px}'
    +'@media (max-width:980px){#um-c2-pin{position:fixed;z-index:42;left:8px;right:8px;bottom:8px;width:auto;height:46vh;min-height:0;max-height:46vh;box-shadow:0 12px 32px rgba(0,0,0,.55)}}';
  document.head.appendChild(css);
  function paint(input,state,label){
    input.indeterminate=state==='ghost';
    input.checked=state!=='off';
    input.setAttribute('aria-checked',state==='ghost'?'mixed':state==='on'?'true':'false');
    input.setAttribute('aria-label',label+', '+WORD[state]);
  }
  function stateOf(key){
    const k=keyOf(key);
    if(st.has(k)) return st.get(k);
    if(key.indexOf('2:')===0 && st.has(sys()+'|2')) return st.get(sys()+'|2');
    if(key.indexOf('1:')===0 && st.has(sys()+'|1')) return st.get(sys()+'|1');
    return 'on';
  }
  function cycle(key){
    const k=keyOf(key);
    const n=NEXT[stateOf(key)];
    if(n==='on') st.delete(k); else st.set(k,n);
    loadMines();
    if(window.__umAggRefresh) window.__umAggRefresh();
    const gv=document.getElementById('gvBox');
    if(gv&&window.__umAgg.any('ghost')) gv.hidden=false;
    render();
  }
  let c1open=false;
  function volControls(parent,key){
    ['ov','gv'].forEach(function(which){
      const wrap=document.createElement('span'); wrap.className='um-v'; wrap.dataset.w=which;
      wrap.title=which==='ov'?'Volume':'Volume du fantôme';
      const range=document.createElement('input'); range.type='range'; range.min='-200'; range.max='200'; range.step='1';
      const cur=volOwn(key,which);
      range.value=String(Math.round(Math.log(cur)/Math.LN2*100));
      range.dataset.vol=which; range.dataset.key=key;
      range.setAttribute('aria-label',(which==='ov'?'Volume':'Volume du fantôme')+', '+key);
      const b=document.createElement('b'); b.textContent='×'+cur.toFixed(2);
      range.addEventListener('input',function(){ b.textContent='×'+Math.pow(2,+range.value/100).toFixed(2); });
      range.addEventListener('change',function(){
        volSet(key,which,Math.pow(2,+range.value/100));
        b.textContent='×'+volOwn(key,which).toFixed(2);
        if(window.__umVolApply) window.__umVolApply();
      });
      wrap.appendChild(range); wrap.appendChild(b); parent.appendChild(wrap);
    });
  }
  function row(parent,key,label,withVol){
    const hold=withVol?document.createElement('div'):null;
    if(hold){ hold.className='um-row'; if(key==='1') hold.classList.add('um-c1head'); parent.appendChild(hold); }
    const lab=document.createElement('label'); lab.className='chk';
    const input=document.createElement('input'); input.type='checkbox'; input.dataset.agg=key;
    paint(input,stateOf(key),label);
    input.addEventListener('click',function(e){ e.preventDefault(); cycle(key); });
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(' '+label));
    const item=key.indexOf('2:')===0||key.indexOf('1:')===0;
    if(item||key==='1'||key==='4'){
      lab.draggable=true;
      lab.addEventListener('dragstart',function(e){
        const kind=key.indexOf('1')===0?1:key==='4'?4:2;
        const idx=item?+key.slice(2):0;
        e.dataTransfer.setData('text/plain',JSON.stringify({kind:kind,idx:idx,name:label}));
        e.dataTransfer.effectAllowed='copy';
      });
    }
    (hold||parent).appendChild(lab);
    if(key==='1'){
      const tog=document.createElement('button'); tog.type='button'; tog.id='um-c1-open';
      tog.textContent=c1open?'▾':'▸';
      tog.setAttribute('aria-expanded',c1open?'true':'false');
      tog.setAttribute('aria-label','Classe 1');
      tog.addEventListener('click',function(){ c1open=!c1open; render(); });
      hold.appendChild(tog);
    }
    if(withVol&&key!=='1') volControls(hold,key);
  }
  let sig='';
  function pinHost(){
    const right=document.getElementById('right');
    if(!right) return null;
    let host=document.getElementById('um-c2-pin');
    if(!host){ host=document.createElement('div'); host.id='um-c2-pin'; }
    if(right.firstChild!==host) right.insertBefore(host, right.firstChild);
    return host;
  }
  function render(){
    const host=pinHost();
    if(!host||typeof window.__umAggregates!=='function') return;
    let data; try{ data=__umAggregates(); }catch(e){ return; }
    let box=document.getElementById('um-agg');
    if(!box){ box=document.createElement('div'); box.id='um-agg'; box.setAttribute('aria-label','Agrégats, trois états : visible, fantôme, masqué'); }
    if(box.parentNode!==host) host.insertBefore(box, host.firstChild);
    box.textContent='';
    const h=document.createElement('span'); h.className='um-u-h'; h.textContent='Agrégats · visible / fantôme / masqué'; box.appendChild(h);
    const gset=document.createElement('div'); gset.className='um-gset';
    const gc=window.__umGhostClass?__umGhostClass.get():{on:{1:true,2:true,4:true},vol:{1:1,2:1,4:1}};
    [1,2,4].forEach(function(k){
      const lab=document.createElement('label'); lab.className='chk';
      const input=document.createElement('input'); input.type='checkbox'; input.id='um-g'+k; input.checked=gc.on[k]!==false;
      input.setAttribute('aria-label','Fantôme Classe '+k);
      input.addEventListener('change',function(){ if(window.__umGhostClass) __umGhostClass.setOn(k,input.checked); });
      lab.appendChild(input); lab.appendChild(document.createTextNode(' Fantôme Classe '+k));
      const range=document.createElement('input'); range.type='range'; range.id='um-gvol'+k; range.min='-200'; range.max='200'; range.step='1';
      range.value=String(Math.round(Math.log(gc.vol[k]||1)/Math.LN2*100));
      range.setAttribute('aria-label','Volume du fantôme, Classe '+k+', maître dans la barre');
      const b=document.createElement('b'); b.id='um-gvol'+k+'n'; b.textContent='×'+(gc.vol[k]||1).toFixed(2);
      range.addEventListener('input',function(){ b.textContent='×'+Math.pow(2,+range.value/100).toFixed(2); });
      range.addEventListener('change',function(){ if(window.__umGhostClass) __umGhostClass.setVol(k,Math.pow(2,+range.value/100)); });
      gset.appendChild(lab); gset.appendChild(range); gset.appendChild(b);
    });
    box.appendChild(gset);
    const t0=performance.now();
    row(box,'1','Classe 1',true);
    if(c1open) (data.c1Items||[]).forEach(function(t){ row(box,'1:'+t.idx,'Classe 1 · '+t.name,true); });
    row(box,'2','Classe 2');
    const act=document.createElement('button'); act.type='button'; act.id='um-act-c2b'; act.textContent='Activer toute la Classe 2';
    act.addEventListener('click', activateAllC2);
    box.appendChild(act);
    (data.c2||[]).forEach(function(c){ row(box,'2:'+c.idx,'Classe 2 · '+c.name,true); });
    row(box,'4','Classe 4 · '+(data.c4||'objet central'));
    loadMines().forEach(function(c){ if(c&&c.id&&c.name) row(box,'mine:'+c.id,'Agrégat · '+c.name,true); });
    window.__umAggRenderMs=Math.round(performance.now()-t0);
  }
  function tick(){
    if(typeof window.__umAggregates!=='function') return;
    pinHost();
    let data; try{ data=__umAggregates(); }catch(e){ return; }
    const s=sys()+'|'+(data.c1Items||[]).length+'|'+(data.c2||[]).map(function(c){ return c.idx+':'+c.name; }).join('|')+'|'+(localStorage.getItem('um.myClass2.v1')||'');
    if(s!==sig){ sig=s; render(); }
  }
  setInterval(tick,800);
  tick();
})();

/* v20.91.1 — Éric, 22 nov 2026 13:59 (Toronto, voix) : « ＋ Créer / Create » au bas de la rangée « Classe 2 · objets ».
   Le compositeur liste les objets RÉELS du moteur au niveau affiché (window.__umProbe().visible : Classe 1 et Classe 2,
   avec leur indice moteur) ; rien n'est inventé. On nomme une Classe 2 à soi, rangée dans le sous-groupe visible
   « Mes créations · Classe 2 » (badge ✦). Un clic : sélection par le crochet public du moteur (__umSelect) du premier
   composant présent au niveau affiché ; deux clics : sa fiche (composants) dans « Fiche ». Stockage : localStorage
   seulement (clé um.myClass2.v1) — aucune requête réseau, aucun serveur, aucun courriel. Seules les créations de
   l'utilisateur ont un « × » ; les objets du moteur ne sont jamais retirés. Bloc autonome : #um-u-mine, placé juste
   sous #um-u-c2 dans #um-rg-couches. loader-v2 ne doit pas l'écraser. */
(function(){
  /* 28 nov 9:19 : Éric rétablit la création d'agrégat (v20.91.1, 5b78f91). Pas de glisser-déposer dans l'historique : le compositeur coche les objets. */
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY='um.myClass2.v1';
  /* engine.js (l.3–6) attache à chaque écouteur le signal d'abandon du boot en cours, coupé à chaque switchSys ;
     un signal à nous, jamais coupé, garde ces écouteurs vivants d'un niveau à l'autre. */
  const KEEP={signal:new AbortController().signal};
  const load=()=>{ try{ const a=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } };
  const save=a=>{ try{ localStorage.setItem(KEY,JSON.stringify(a)); return true; }catch(e){ return false; } };
  const css=document.createElement('style'); css.id='um-v20911-css';
  css.textContent='#um-u-mine{padding-top:3px}'
    +'#um-u-mine .um-mine-item{display:inline-flex;align-items:stretch;border:1px solid #c9a7ff;border-radius:4px;background:#17112a;overflow:hidden}'
    +'#um-u-mine .um-mine-item>button{border:0;border-radius:0;background:none;color:#e4d6ff;font:500 11px/1.25 system-ui,sans-serif;padding:3px 7px}'
    +'#um-u-mine .um-mine-item>button.rm{border-left:1px solid #4a3a6e;color:#ffb4a6;padding:3px 6px}'
    +'#um-u-mine .um-mine-item[aria-pressed=true]{border-color:#5fd690}'
    +'#um-mine-new{border:1px dashed #c9a7ff!important;color:#e4d6ff!important;background:#120d20!important;font-weight:700!important}'
    +'#um-mine-comp{flex:1 1 100%;border:1px solid #4a3a6e;border-radius:6px;padding:6px;background:#0e0a18;display:flex;flex-direction:column;gap:5px;font:11px/1.35 system-ui,sans-serif}'
    +'#um-mine-comp input[type=text],#um-mine-comp input[type=search]{width:100%;box-sizing:border-box;font:12px system-ui;padding:4px 6px;border-radius:4px;border:1px solid #3a4756;background:#0b1117;color:#e6e9ee}'
    +'#um-mine-list{max-height:150px;overflow:auto;border:1px solid #26303b;border-radius:4px;padding:2px 4px}'
    +'#um-mine-list label{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    +'#um-mine-list .k{font:600 9px ui-monospace,monospace;color:#8b98ad;margin-right:3px}'
    +'#um-mine-comp .inc{font:600 10px ui-monospace,monospace;color:#e8c872}'
    +'#um-mine-comp .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}'
    +'#um-mine-go:disabled{opacity:.45;cursor:not-allowed}'
    +'#um-mine-fiche{margin:6px 9px;padding:6px 8px;border:1px solid #c9a7ff;border-radius:6px;background:#120d20;color:#e4d6ff;font:12px/1.4 system-ui,sans-serif}'
    +'#um-mine-fiche h4{margin:0 0 4px;font:600 12px system-ui}#um-mine-fiche ul{margin:2px 0 2px 16px;padding:0}';
  document.head.appendChild(css);

  let sel=new Map(); /* clé kind:sys:idx → {kind,idx,name,sys} */
  let open=false, pressed=null;
  const probe=()=>{ try{ return window.__umProbe?__umProbe():null; }catch(e){ return null; } };
  const sysName=id=>{ const f=window.UM_FLOOR_BY&&UM_FLOOR_BY[id]; return f?f.name:id; };
  function compsText(c){ return c.parts.map(p=>'Classe '+p.kind+' · '+p.name+' ('+sysName(p.sys)+')').join('\n'); }

  function place(){
    const pin=document.getElementById('um-c2-pin');
    const c2=$('um-u-c2'); if(!pin&&!c2) return null;
    let r=$('um-u-mine');
    if(!r){ r=document.createElement('div'); r.id='um-u-mine'; r.className='um-u-row';
      /* délégation sur la rangée elle-même : survit aux re-rendus */
      r.addEventListener('click',e=>{
        const nb=e.target.closest('#um-mine-new'); if(nb){ open=!open; render(); if(open){ const s=$('um-mine-q'); if(s) s.focus(); } return; }
        const it=e.target.closest('.um-mine-item'); if(!it) return; const id=it.dataset.id;
        if(e.target.closest('.rm')){ const c=load().find(x=>x.id===id); if(!c) return; if(!confirm('Retirer « '+c.name+' » de mes créations ? (Les objets du moteur ne sont pas touchés.)')) return; save(load().filter(x=>x.id!==id)); if(pressed===id) pressed=null; const f=$('um-mine-fiche'); if(f&&f.dataset.id===id) f.remove(); render(); return; }
        if(e.target.closest('.nm')){ if(e.detail>=2) fiche(id); else pick(id); }
      },KEEP);
      r.addEventListener('dblclick',e=>{ const it=e.target.closest('.um-mine-item .nm'); if(it) fiche(it.parentNode.dataset.id); },KEEP);
      r.addEventListener('dragover',e=>{ e.preventDefault(); if(e.dataTransfer) e.dataTransfer.dropEffect='copy'; },KEEP);
      r.addEventListener('drop',e=>{
        e.preventDefault();
        let o; try{ o=JSON.parse(e.dataTransfer.getData('text/plain')); }catch(err){ return; }
        if(!o||o.kind==null) return;
        const p=probe(); const sys=p?p.sys:'';
        sel.set(o.kind+':'+sys+':'+o.idx,{kind:o.kind,idx:o.idx,name:o.name,sys:sys});
        open=true; render();
      },KEEP);
    }
    if(pin){ if(r.parentNode!==pin) pin.appendChild(r); }
    else if(c2.nextSibling!==r) c2.parentNode.insertBefore(r,c2.nextSibling);
    return r;
  }
  function render(){
    const r=place(); if(!r) return;
    const mine=load();
    let h='<span class="um-u-h">Mes créations · Classe 2 <span style="text-transform:none;letter-spacing:0">/ My creations ('+mine.length+')</span></span>';
    mine.forEach(c=>{ h+='<span class="um-mine-item" data-id="'+esc(c.id)+'" aria-pressed="'+(pressed===c.id?'true':'false')+'"><button type="button" class="nm" title="'+esc('✦ '+c.name+' — ma Classe 2\n'+compsText(c)+'\nUn clic : sélection · deux clics : fiche')+'">✦ '+esc(c.name)+'</button><button type="button" class="rm" title="Retirer ma création / Remove my creation" aria-label="Retirer '+esc(c.name)+'">×</button></span>'; });
    h+='<button type="button" id="um-mine-new" aria-expanded="'+open+'">＋ Créer <span style="font-weight:400;opacity:.8">/ Create</span></button>';
    r.innerHTML=h;
    if(open) r.appendChild(composer());
  }
  let q='';
  function composer(){
    const p=probe(); const d=document.createElement('div'); d.id='um-mine-comp';
    let objs=p?p.visible.filter(v=>v.kind===1||v.kind===2).map(v=>({kind:v.kind,idx:v.idx,name:v.name,sys:p.sys})):null;
    if(objs&&!objs.length&&window.__umAggregates){
      try{
        const a=__umAggregates();
        const extra=[];
        (a.c1Items||[]).forEach(t=>extra.push({kind:1,idx:t.idx,name:t.name,sys:p.sys}));
        (a.c2||[]).forEach(c=>extra.push({kind:2,idx:c.idx,name:c.name,sys:p.sys}));
        if(extra.length) objs=extra;
      }catch(e){}
    }
    let list;
    if(!objs) list='<span class="inc">Liste du moteur non lisible (__umProbe absent) [INCOMPLET]</span>';
    else if(!objs.length) list='<span class="inc">Aucun objet de Classe 1 ou 2 affiché à ce niveau ('+esc(sysName(p.sys))+') — ouvrez un système ou une zone ; la sélection est gardée d\u2019un niveau à l\u2019autre. [INCOMPLET]</span>';
    else list=objs.sort((a,b)=>b.kind-a.kind||a.name.localeCompare(b.name)).map(o=>{ const k=o.kind+':'+o.sys+':'+o.idx; return '<label data-n="'+esc(o.name.toLowerCase())+'"><input type="checkbox" data-k="'+esc(k)+'"'+(sel.has(k)?' checked':'')+'><span class="k">C'+o.kind+'</span>'+esc(o.name)+'</label>'; }).join('');
    d.innerHTML='<div><b>Composer une Classe 2</b> / Compose a Class 2 — objets réels du moteur, niveau : '+esc(p?sysName(p.sys):'?')+(objs?' ('+objs.filter(o=>o.kind===1).length+' Classe 1 · '+objs.filter(o=>o.kind===2).length+' Classe 2)':'')+'</div>'
      +'<input type="search" id="um-mine-q" placeholder="Chercher / Search…" value="'+esc(q)+'">'
      +'<div id="um-mine-list">'+list+'</div>'
      +'<div id="um-mine-sel" class="row"></div>'
      +'<input type="text" id="um-mine-name" maxlength="60" placeholder="Nom / Name">'
      +'<div class="row"><button type="button" id="um-mine-go" disabled>Créer ma Classe 2 <span style="font-weight:400;opacity:.8">/ Create my Class 2</span></button><button type="button" id="um-mine-cancel">Annuler / Cancel</button></div>'
      +'<div style="color:#8b98ad">Gardé dans ce navigateur seulement (localStorage). Rien n\u2019est envoyé.</div>';
    const m=new Map(); (objs||[]).forEach(o=>m.set(o.kind+':'+o.sys+':'+o.idx,o));
    const upd=()=>{ const n=d.querySelector('#um-mine-name').value.trim(); d.querySelector('#um-mine-go').disabled=!(n&&sel.size);
      d.querySelector('#um-mine-sel').innerHTML=sel.size?('Choisis ('+sel.size+') : '+[...sel.values()].map(o=>'C'+o.kind+' '+esc(o.name)).join(' · ')):'<span style="color:#8b98ad">Aucun objet choisi / none selected</span>'; };
    const filt=()=>{ const s=q.toLowerCase(); d.querySelectorAll('#um-mine-list label').forEach(l=>{ l.style.display=!s||l.dataset.n.indexOf(s)>=0?'':'none'; }); };
    d.querySelector('#um-mine-q').addEventListener('input',e=>{ q=e.target.value; filt(); },KEEP);
    d.querySelectorAll('#um-mine-list input').forEach(i=>i.addEventListener('change',()=>{ const o=m.get(i.dataset.k); if(i.checked) sel.set(i.dataset.k,o); else sel.delete(i.dataset.k); upd(); },KEEP));
    d.querySelector('#um-mine-name').addEventListener('input',upd,KEEP);
    d.querySelector('#um-mine-cancel').addEventListener('click',()=>{ open=false; render(); },KEEP);
    d.querySelector('#um-mine-go').addEventListener('click',()=>{ const n=d.querySelector('#um-mine-name').value.trim(); if(!n||!sel.size) return;
      const c={id:'mc'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:n,created:new Date().toISOString(),parts:[...sel.values()].map(o=>({kind:o.kind,idx:o.idx,name:o.name,sys:o.sys}))};
      const a=load(); a.push(c); save(a); sel=new Map(); q=''; open=false; render(); },KEEP);
    setTimeout(()=>{ filt(); upd(); },0);
    return d;
  }
  function pick(id){
    const c=load().find(x=>x.id===id); if(!c) return;
    pressed=id; const p=probe();
    const here=p?c.parts.filter(x=>x.sys===p.sys):[];
    if(here.length&&typeof window.__umSelect==='function') window.__umSelect({kind:here[0].kind,idx:here[0].idx});
    render(); fiche(id,true);
  }
  function fiche(id,quiet){
    const c=load().find(x=>x.id===id); if(!c) return;
    const dF=$('um-rg-fiche'); if(!dF) return;
    if(!quiet) dF.open=true;
    let f=$('um-mine-fiche'); if(!f){ f=document.createElement('div'); f.id='um-mine-fiche'; }
    const sm=dF.querySelector('summary'); if(f.parentNode!==dF||f.previousSibling!==sm) dF.insertBefore(f,sm?sm.nextSibling:dF.firstChild);
    const p=probe();
    f.dataset.id=id;
    f.innerHTML='<h4>✦ '+esc(c.name)+' — ma Classe 2 / my Class 2</h4><div style="color:#9aa3ad">Créée le '+esc(new Date(c.created).toLocaleString('fr-CA'))+' · '+c.parts.length+' composant(s)</div><ul>'
      +c.parts.map((x,i)=>'<li>Classe '+x.kind+' · '+(p&&p.sys===x.sys?'<a href="#" data-i="'+i+'">'+esc(x.name)+'</a>':esc(x.name))+' <span style="color:#8b98ad">('+esc(sysName(x.sys))+')</span></li>').join('')+'</ul>'
      +'<div style="color:#8b98ad">Surbrillance de tous les composants à la fois : le moteur n\u2019expose qu\u2019une sélection à la fois [INCOMPLET]. Composants d\u2019un autre niveau : visibles en ouvrant ce niveau.</div>';
    f.querySelectorAll('a[data-i]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const x=c.parts[+a.dataset.i]; if(window.__umSelect) __umSelect({kind:x.kind,idx:x.idx}); },KEEP));
    if(!quiet) f.scrollIntoView({block:'nearest'});
  }
  let t=0; (function boot(){ if($('um-u-c2')||document.getElementById('um-c2-pin')){ render(); return; } if(++t<80) setTimeout(boot,250); })();
  /* le compositeur suit le niveau affiché ; la rangée reste visible avec les cases */
  let lastSys='';
  setInterval(()=>{
    const pin=document.getElementById('um-c2-pin');
    if(pin){ if(!$('um-u-mine')||$('um-u-mine').parentNode!==pin) render(); }
    else if(!$('um-u-c2')) return;
    else if(!$('um-u-mine')||$('um-u-c2').nextSibling!==$('um-u-mine')) render();
    const p=probe(); const s=p?p.sys:''; if(s!==lastSys){ lastSys=s; if(open){ const f=document.activeElement; if(!(f&&f.closest&&f.closest('#um-mine-comp'))) render(); } } },1000);
})();

/* v20.91.2 — Éric, 22 nov 2026 17:18 (Toronto, appel) : « il doit toujours y avoir quelque chose à afficher ».
   Correctif d'affichage seulement : le « × » des squelettes (Football, Santé) était recouvert par le bandeau collant
   EN CONSTRUCTION / SQUELETTE, donc impossible à cliquer ; le squelette restait sur le canevas et cachait la vue 3D
   du football (tout le canevas sur mobile). Le « × » passe au-dessus du bandeau ; la puce « … · squelette ▸ » le rouvre. */
(function(){
  const css=document.createElement('style'); css.id='um-v20912-css';
  css.textContent='.um-skel .um-ribbon{z-index:2}'
    +'.um-skel .x{position:sticky;top:0;z-index:3;margin:-4px -6px 0 6px;background:#0b0f14;color:#ffe9a8;border:1px solid #e8c872;border-radius:4px;line-height:1.3;min-width:28px;min-height:26px;cursor:pointer}';
  document.head.appendChild(css);
})();


/* v21.05 — les accès documents (PDF, livres blancs) ont quitté le HUB.
   Il reste l'entrée « Santé · paquet réel », qui ouvre le pôle Santé
   (switchSys('health')) et le panneau réel (UM_SANTE_LOADER.show).
   Écouteurs en propriété onclick, pour échapper au signal BOOT.ac du moteur. */
(function(){
  return; /* 27 nov 22:37 : liens superflus. Guest et liens rapides restent comme sur main. */
  function openSanteReel(e){
    if(e) e.preventDefault();
    try{ if(typeof switchSys==='function') switchSys('health'); }catch(err){}
    try{ if(window.UM_SANTE_LOADER&&typeof window.UM_SANTE_LOADER.show==='function') window.UM_SANTE_LOADER.show(); }catch(err){}
  }
  let tries=0;
  function put(){
    const foot=document.getElementById('um-rg-foot');
    const door=document.getElementById('um-rg-door');
    const body=door&&door.querySelector('.um-rg-body');
    if(!foot||!body){ if(++tries<80) setTimeout(put,250); return; }
    if(!document.getElementById('um-door-sante-real')){
      body.insertAdjacentHTML('beforeend','<a id="um-door-sante-real" href="#sante-paquet-reel">Sant\u00e9 \u00b7 paquet r\u00e9el</a>');
      document.getElementById('um-door-sante-real').onclick=openSanteReel;
    }
    if(!document.getElementById('um-rg-docs-quick')){
      if(!document.getElementById('um-v2093-docs-css')){
        const css=document.createElement('style'); css.id='um-v2093-docs-css';
        css.textContent='#um-rg-docs-quick{display:flex;flex-wrap:wrap;gap:4px;flex:1 1 100%;align-items:center}'
          +'#um-rg-docs-quick a{font:500 11px/1.25 system-ui,sans-serif;padding:3px 7px;border:1px solid #7fd1ff;border-radius:4px;color:#bfe8ff;background:#0d1a26;text-decoration:none}'
          +'#um-sante-paquet-reel,#um-door-sante-real{border-color:#5fd690;color:#c9f5da}';
        document.head.appendChild(css);
      }
      const q=document.createElement('div'); q.id='um-rg-docs-quick';
      q.innerHTML='<a id="um-sante-paquet-reel" href="#sante-paquet-reel">Sant\u00e9 \u00b7 paquet r\u00e9el</a>';
      if(door.nextSibling) foot.insertBefore(q, door.nextSibling); else foot.appendChild(q);
      document.getElementById('um-sante-paquet-reel').onclick=openSanteReel;
    }
  }
  put();
})();


/* v20.94 — 23 nov 2026 (Toronto) : courriel d'invitation v2, fenêtre de rédaction prête à
   envoyer (/um/door/invite-email-v2/, aperçu inerte : aucun lien, envoi ni requête branché).
   Le clic « ✉ Invitation » (rangée Pôles et tête de la colonne de gauche) ouvre désormais ce
   modèle directement. L'ancien parcours (/um/door/um-invite-demo-v2.html) et le brouillon
   (/um/door/form-draft/) restent intacts et accessibles dans Porte · démo. Ajout d'une entrée
   « ✉ Modèle courriel · aperçu » en tête de Porte · démo et au pied, à côté de TURN IT ON et
   Santé · paquet réel. Rien n'est retiré. */
(function(){
  return; /* 27 nov 22:37 : « les invitations » retirées de l'écran. */
  const MAIL='/um/door/invite-email-v2/';
  const TIP='Courriel d\u2019invitation v2 \u2014 fen\u00eatre pr\u00eate \u00e0 envoyer (aper\u00e7u inerte). Ancien parcours : Porte \u00b7 d\u00e9mo';
  let tries=0;
  function put(){
    const first=document.getElementById('um-invite-first');
    const left=document.getElementById('um-invite-left');
    const door=document.getElementById('um-rg-door');
    const body=door&&door.querySelector('.um-rg-body');
    const quick=document.getElementById('um-rg-docs-quick');
    [first,left].forEach(a=>{ if(a&&a.getAttribute('href')!==MAIL){ a.href=MAIL; a.target='_blank'; a.rel='noopener'; a.title=TIP; } });
    if(body&&!document.getElementById('um-door-mail')){
      body.insertAdjacentHTML('afterbegin','<a id="um-door-mail" href="'+MAIL+'" target="_blank" rel="noopener">\u2709 Mod\u00e8le courriel \u00b7 aper\u00e7u / Invite email \u00b7 preview \u2197</a>');
    }
    if(quick&&!document.getElementById('um-invite-mail')){
      quick.insertAdjacentHTML('afterbegin','<a id="um-invite-mail" href="'+MAIL+'" target="_blank" rel="noopener">\u2709 Invite email \u00b7 preview \u2197</a>');
      if(!document.getElementById('um-v2094-css')){
        const css=document.createElement('style'); css.id='um-v2094-css';
        css.textContent='#um-invite-mail,#um-door-mail{border-color:#e8c872!important;color:#ffe9a8!important}';
        document.head.appendChild(css);
      }
    }
    const done=first&&left&&first.getAttribute('href')===MAIL&&left.getAttribute('href')===MAIL&&document.getElementById('um-door-mail')&&document.getElementById('um-invite-mail');
    if(!done&&++tries<120) setTimeout(put,250);
  }
  put();
})();


/* v20.96 — entrée « Agent » à côté de ✉ Invitation, derrière l'INTERRUPTEUR UNIQUE
   /um/engine/agent-switch.js (on:false) : tant qu'il est OFF, rien n'est affiché ni lié.
   v21.05 retire les liens vers les éditions document (Board Paper, White Paper). */
(function(){
  function on(){ const S=window.UM_AGENT_SWITCH; return !!(S&&S.on===true&&typeof S.entry==='string'); }
  let tries=0;
  function put(){
    if(!on()) return;                                  /* OFF : rien n'est affiché ni lié */
    const E=window.UM_AGENT_SWITCH.entry;
    const first=document.getElementById('um-invite-first'), left=document.getElementById('um-invite-left');
    const door=document.getElementById('um-rg-door'), body=door&&door.querySelector('.um-rg-body');
    function mk(id,cls){ const a=document.createElement('a'); a.id=id; if(cls) a.className=cls; a.href=E; a.target='_blank'; a.rel='noopener'; a.textContent='Agent'; a.title='Agent'; return a; }
    if(first&&!document.getElementById('um-agent-first')) first.insertAdjacentElement('afterend',mk('um-agent-first','um-u-a'));
    if(left&&!document.getElementById('um-agent-left')) left.insertAdjacentElement('afterend',mk('um-agent-left',''));
    if(body&&!document.getElementById('um-door-agent')){ const m=document.getElementById('um-door-mail'); const a=mk('um-door-agent',''); if(m) m.insertAdjacentElement('afterend',a); else body.insertBefore(a,body.firstChild); }
    if(!(document.getElementById('um-agent-first')&&document.getElementById('um-agent-left')&&document.getElementById('um-door-agent'))&&++tries<120) setTimeout(put,250);
  }
  if(window.UM_AGENT_SWITCH){ put(); return; }
  const s=document.createElement('script'); s.src='/um/engine/agent-switch.js?v=21.07'; s.onload=put; document.head.appendChild(s);
})();


/* v21.05 — lien un-clic « Dernière version » (HUB, moteur, Santé, Brigitte, graine APK).
   Page tenue à jour : /um/derniere-version.html. Les documents n'y sont plus. */
(function(){
  return; /* 27 nov 22:37 : liens superflus. Guest et liens rapides restent comme sur main. */
  const HREF='/um/derniere-version.html';
  const LABEL='Derni\u00e8re version';
  let tries=0;
  function put(){
    const quick=document.getElementById('um-rg-docs-quick');
    const door=document.getElementById('um-rg-door');
    const body=door&&door.querySelector('.um-rg-body');
    if(body&&!document.getElementById('um-door-derniere')){
      body.insertAdjacentHTML('afterbegin','<a id="um-door-derniere" href="'+HREF+'">'+LABEL+' \u2197</a>');
    }
    if(quick&&!document.getElementById('um-derniere')){
      quick.insertAdjacentHTML('afterbegin','<a id="um-derniere" href="'+HREF+'">'+LABEL+' \u2197</a>');
    }
    if(!(document.getElementById('um-door-derniere')&&document.getElementById('um-derniere'))&&++tries<120) setTimeout(put,250);
  }
  put();
})();
