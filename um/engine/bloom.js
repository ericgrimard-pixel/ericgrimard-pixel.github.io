/* Bloom layers for the Finance hub only. Deeper floors are real series,
   placed by the engine, and kept out of the World aggregate (nz0). */
(function(){
  const world=LIB.find(function(s){return s.id==='world';});
  const by=window.UM_FLOOR_BY||{};
  if(!world||!world.data||!world.data.t) return;
  /* One bloom step per generation under Finance. The depth is the
     distance to World, so a deeper floor is another double-click. */
  function depth(id){
    let d=0, f=by[id], n=0;
    const seen={};
    while(f&&n++<16){
      if(f.id==='art'||f.id==='sports') return 0;
      if(f.id==='world') return d;
      if(seen[f.id]) break;
      seen[f.id]=1;
      d++;
      f=by[f.parent];
    }
    return d;
  }
  function underFinance(id){
    let f=by[id], n=0;
    while(f&&n++<8){
      if(f.id==='art'||f.id==='sports') return false;
      if(f.id==='world') return true;
      f=by[f.parent];
    }
    return false;
  }
  function series(sys){
    const rows=sys.data&&sys.data.t;
    if(!rows||!rows.length||!rows[0]||!rows[0].c) return null;
    let n0=0,n1=0,s0=0,s1=0,v0=0,v1=0,nv0=0,nv1=0;
    rows.forEach(function(t){
      if(!t||!t.c) return;
      let a=null,b=null;
      for(let i=0;i<t.c.length;i++){
        const x=t.c[i];
        if(x!=null&&isFinite(x)&&x>0){ if(a==null)a=i; b=i; }
      }
      if(a==null) return;
      s0+=Math.log(t.c[a]); n0++;
      if(b!=null&&b>a&&t.c[b]>0){ s1+=Math.log(t.c[b]/t.c[a]); n1++; }
      const va=t.v&&t.v[a], vb=t.v&&t.v[b];
      if(va>0){ v0+=va; nv0++; }
      if(vb>0){ v1+=vb; nv1++; }
    });
    if(!n0) return null;
    const base=Math.exp(s0/n0);
    return {c:[base, base*(n1?Math.exp(s1/n1):1)], v:[nv0?v0/nv0:1, nv1?v1/nv1:(nv0?v0/nv0:1)]};
  }
  world.data.t.forEach(function(t){
    if(!t.floor||!underFinance(t.floor)) return;
    t.bloom=depth(t.floor);
  });
  const have={};
  world.data.t.forEach(function(t){ if(t.floor) have[t.floor]=1; });
  (window.UM_FLOORS||[]).forEach(function(f){
    if(!f||have[f.id]) return;
    if(f.level!=='country'&&f.level!=='sector'&&f.level!=='industry') return;
    if(!underFinance(f.id)) return;
    const sys=LIB.find(function(s){return s.id===f.id;});
    const ser=sys&&series(sys);
    if(!ser) return;
    world.data.t.push({
      s:f.name, sec:f.sec||f.level, ind:f.name, cty:f.cty||f.level, o:0,
      c:ser.c, v:ser.v, floor:f.id, bloom:depth(f.id), nz0:1
    });
    have[f.id]=1;
  });
  const WORD={zone:'zones',index:'indices',country:'pays',sector:'secteurs',industry:'industries'};
  const kinds=[];
  let max=0;
  world.data.t.forEach(function(t){
    if(!t.bloom) return;
    if(t.bloom>max) max=t.bloom;
    const f=by[t.floor];
    if(!f) return;
    (kinds[t.bloom]||(kinds[t.bloom]={}))[f.level]=1;
  });
  const labels=[''];
  const order=['zone','index','country','sector','industry'];
  for(let d=1;d<=max;d++){
    const parts=[];
    order.forEach(function(level){ if(kinds[d]&&kinds[d][level]) parts.push(WORD[level]); });
    labels[d]=parts.join(' et ')||('couche '+d);
  }
  /* Class 1 to the limit (Éric, 14 nov 2026): past the floors, the bloom
     keeps opening until every Class 1 title of every Finance floor is out.
     Titles pop in the order of their floors: a title arrives one floor-depth
     below the last floor layer, at the depth of the shallowest floor that
     holds it. Each title appears once (one object per symbol) and dives to
     that floor. Real closes only: first and last valid close of its floor,
     with the volumes of those sessions. Kept out of Z-ZERO (nz0). */
  const floorMax=max;
  const pick={};
  LIB.forEach(function(sys){
    if(!sys||sys.id==='world'||sys.kind||!sys.data||!sys.data.t) return;
    if(!underFinance(sys.id)) return;
    const d=depth(sys.id);
    if(!d) return;
    const n=(sys.data.dates&&sys.data.dates.length)||0;
    sys.data.t.forEach(function(t){
      if(!t||!t.c||!t.s) return;
      let a=null,b=null;
      for(let i=0;i<t.c.length;i++){
        const x=t.c[i];
        if(x!=null&&isFinite(x)&&x>0){ if(a==null)a=i; b=i; }
      }
      if(a==null) return;
      const p=pick[t.s];
      if(p&&(p.d<d||(p.d===d&&p.n>=n))) return;
      pick[t.s]={d:d,n:n,sys:sys,t:t,a:a,b:b};
    });
  });
  /* No empty layer: the floor depths that hold titles get consecutive steps. */
  const used=[];
  Object.keys(pick).forEach(function(s){ if(used.indexOf(pick[s].d)<0) used.push(pick[s].d); });
  used.sort(function(x,y){ return x-y; });
  /* The titles are prepared now but joined to World only when the bloom
     first reaches them, so the Hub opens as fast as before. */
  const rowsC1=[];
  let attached=false;
  let noVol=0;
  Object.keys(pick).forEach(function(s){
    const p=pick[s], t=p.t;
    const va=t.v&&t.v[p.a], vb=t.v&&t.v[p.b];
    if(!(va>0)||!(vb>0)) noVol++;
    const v0=va>0?va:(vb>0?vb:1), v1=vb>0?vb:v0;
    rowsC1.push({
      s:t.s, sec:t.sec, ind:t.ind, cty:t.cty, o:0,
      c:[t.c[p.a], t.c[p.b]], v:[v0, v1],
      floor:p.sys.id, bloom:floorMax+1+used.indexOf(p.d), nz0:1, c1:1
    });
  });
  used.forEach(function(d,i){
    const k=floorMax+1+i;
    if(k>max) max=k;
    labels[k]='titres des '+(labels[d]||('couche '+d));
  });
  window.UM_BLOOM_C1={titles:Object.keys(pick).length, from:floorMax+1, noVolume:noVol,
    note:'[INCOMPLET] devises non converties entre places ; un titre sans volume garde le volume de l\'autre prise (ou 1).'};
  const n=[];
  for(let d=0;d<=max;d++) n[d]=0;
  world.data.t.forEach(function(t){ if(t.bloom) n[t.bloom]++; });
  rowsC1.forEach(function(t){ n[t.bloom]++; });
  window.UM_BLOOM_FLOORMAX=floorMax;
  window.UM_BLOOM_ATTACH=function(){
    if(attached||!rowsC1.length) return false;
    rowsC1.forEach(function(t){ world.data.t.push(t); });
    attached=true;
    return true;
  };
  window.UM_BLOOM_COUNTS=n;
  window.UM_BLOOM_MAX=max;
  window.UM_BLOOM_LAYER=labels;
})();
