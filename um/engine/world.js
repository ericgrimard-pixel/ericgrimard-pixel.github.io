/* World Class 4: each finance floor is one constituent, placed from the mean of its own closes. */
(function(){
  const REGION={
    ndx100:'Amériques', sp500y:'Amériques', djia:'Amériques', sp500:'Amériques', ibov:'Amériques',
    ftse100:'Europe', dax:'Europe', cac40:'Europe', sx5e:'Europe',
    n225:'Asie-Pacifique', hsi:'Asie-Pacifique', sti:'Asie-Pacifique',
    tasi:'Moyen-Orient', asx200:'Océanie'
  };
  const missing=[];
  const titles=[];
  LIB.forEach(function(sys){
    if(!sys||!sys.data||sys.id==='world') return;
    const d=sys.data, rows=d.t;
    if(!rows||!rows.length||!rows[0]||!rows[0].c){ missing.push(sys.id); return; }
    let n0=0,n1=0,s0=0,s1=0,v0=0,v1=0,nv0=0,nv1=0;
    rows.forEach(function(t){
      if(!t||!t.c) return;
      const o=t.o||0;
      let a=null,b=null;
      for(let i=0;i<t.c.length;i++){ const x=t.c[i]; if(x!=null&&isFinite(x)&&x>0){ if(a==null)a=i; b=i; } }
      if(a==null) return;
      s0+=Math.log(t.c[a]); n0++;
      if(b!=null&&b>a&&t.c[b]>0){ s1+=Math.log(t.c[b]/t.c[a]); n1++; }
      const va=t.v&&t.v[a], vb=t.v&&t.v[b];
      if(va>0){ v0+=va; nv0++; }
      if(vb>0){ v1+=vb; nv1++; }
    });
    if(!n0){ missing.push(sys.id); return; }
    const base=Math.exp(s0/n0);
    const end=base*(n1?Math.exp(s1/n1):1);
    titles.push({s:sys.name, sec:REGION[sys.id]||'World', ind:'Étage', cty:sys.silo||'', o:0, c:[base,end], v:[nv0?v0/nv0:1, nv1?v1/nv1:(nv0?v0/nv0:1)], floor:sys.id});
  });
  window.__WORLD_INCOMPLET=missing;
  LIB.unshift({
    id:'world',
    silo:'World',
    name:'World',
    source:'World — Classe 4 du marché. Chaque étage est la moyenne des clôtures réelles de ses titres, de sa première séance à sa dernière. '+(missing.length?('[INCOMPLET] sans série de clôture : '+missing.join(', ')+'.'):'Étages à clôtures : tous présents.'),
    data:{dates:['2026-01-02','2026-11-04'], t:titles}
  });
})();
