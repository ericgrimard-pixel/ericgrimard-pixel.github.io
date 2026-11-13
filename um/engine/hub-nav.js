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
  function render(id){
    const f=floor(id);
    const name=f?f.name:(id==='world'?'Finance':id);
    const parent=f&&f.parent;
    const kids=(f&&f.children)||[];
    const bits=['<button type="button" id="hub-center" data-up="'+(parent||'')+'">'+esc(name)+'</button>'];
    kids.forEach(cid=>{
      const c=floor(cid); if(!c) return;
      bits.push('<button type="button" class="hub-c2" data-down="'+esc(cid)+'">'+esc(c.name)+'</button>');
    });
    nav.innerHTML=bits.join('');
    const center=document.getElementById('hub-center');
    if(center&&parent) center.addEventListener('click',()=>switchSys(parent));
    nav.querySelectorAll('[data-down]').forEach(btn=>{
      btn.addEventListener('click',()=>switchSys(btn.getAttribute('data-down')));
    });
    const parentName=parent?(floor(parent)?floor(parent).name:parent):'';
    const upLabel=parent?('↑ '+parentName):name;
    bar.innerHTML='<button type="button" id="hub-up-btn"'+(parent?'':' disabled')+'>'+esc(upLabel)+'</button>'
      +'<p class="hint">Descendre : un clic sur une porte ou sur un étage. Remonter : ↑ ou un clic sur la Classe 4.</p>';
    const up=document.getElementById('hub-up-btn');
    if(up&&parent) up.addEventListener('click',()=>switchSys(parent));
  }
  function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
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
    try{ orig(id,keep); render(id); }
    finally{ navigating=false; }
  };
  function onRoute(){
    if(navigating) return;
    const id=resolve(rawHash())||'world';
    if(id!==CURSYS) switchSys(id);
    else render(id);
  }
  /* These listeners must outlive a floor change. Listeners added while a
     system is running are aborted with that system, so this one carries
     its own signal and is never tied to a floor. */
  const keep=new AbortController();
  addEventListener('hashchange', onRoute, {signal:keep.signal});
  addEventListener('popstate', onRoute, {signal:keep.signal});
  render(typeof CURSYS==='string'&&CURSYS?CURSYS:'world');
  const raw=rawHash();
  if(raw && !resolve(raw)) mark(raw);
})();
