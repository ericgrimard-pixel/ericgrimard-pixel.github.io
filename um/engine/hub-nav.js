/* Hub navigation sits outside the chamber. The engine keeps its own
   double-click: Class 4 opens Plan, Class 1 or 2 focuses. */
(function(){
  const css=document.createElement('style');
  css.textContent='#hub-nav{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center;max-height:34vh;overflow:auto;padding-top:2px}'
    +'#hub-nav button{font:500 12px/1.3 system-ui,sans-serif}'
    +'#hub-center{background:#1a160b;border-color:#4a3f22;color:#e8c872}'
    +'#hub-nav .hub-c2{background:#101826}'
    +'#hub-gap{flex:1 1 100%;color:#e8c872;font:600 12px/1.35 system-ui,sans-serif}';
  document.head.appendChild(css);
  const nav=document.createElement('nav');
  nav.id='hub-nav';
  nav.setAttribute('aria-label','Navigation du Hub');
  const header=document.querySelector('header');
  if(header) header.appendChild(nav);
  function floor(id){ return (window.UM_FLOOR_BY&&UM_FLOOR_BY[id])||null; }
  function render(id){
    const f=floor(id);
    const name=f?f.name:(id==='world'?'World':id);
    const parent=f&&f.parent;
    const kids=(f&&f.children)||[];
    const bits=['<button type="button" id="hub-center" data-up="'+(parent||'')+'">'+esc(name)+'</button>'];
    kids.forEach(cid=>{
      const c=floor(cid); if(!c) return;
      bits.push('<button type="button" class="hub-c2" data-down="'+esc(cid)+'">'+esc(c.name)+'</button>');
    });
    nav.innerHTML=bits.join('');
    const center=document.getElementById('hub-center');
    if(center) center.addEventListener('dblclick',()=>{ if(parent) switchSys(parent); });
    nav.querySelectorAll('[data-down]').forEach(btn=>{
      btn.addEventListener('dblclick',()=>switchSys(btn.getAttribute('data-down')));
    });
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
  switchSys=function(id,keep){
    orig(id,keep);
    const gap=document.getElementById('hub-gap'); if(gap) gap.remove();
    render(id);
  };
  render(typeof CURSYS==='string'&&CURSYS?CURSYS:'world');
  const raw=(location.hash||'').replace(/^#/,'').replace(/^\//,'');
  if(raw && window.UM_RESOLVE && !UM_RESOLVE(raw)) mark(raw);
})();
