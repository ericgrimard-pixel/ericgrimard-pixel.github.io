/* World Class 4. Finance floors use the mean of their own closes.
   Hockey uses the league's own points and games. Music uses its own popularity
   and duration. A second take that the source does not have is not invented. */
(function(){
  const REGION={
    ndx100:'Amériques', sp500y:'Amériques', djia:'Amériques', sp500:'Amériques', ibov:'Amériques',
    ftse100:'Europe', dax:'Europe', cac40:'Europe', sx5e:'Europe',
    n225:'Asie-Pacifique', hsi:'Asie-Pacifique', sti:'Asie-Pacifique',
    tasi:'Moyen-Orient', asx200:'Océanie'
  };
  const missing=[];
  const titles=[];
  function pushFloor(sys, ser, sec, ind){
    titles.push({
      s:sys.name, sec:sec, ind:ind, cty:sys.silo||'', o:0,
      c:ser.c, v:ser.v, floor:sys.id
    });
  }
  function financeSeries(sys){
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
  function colMean(rows, take, col){
    let s=0,n=0;
    rows.forEach(function(t){
      const st=t.st&&t.st[take];
      if(!st) return;
      const x=st[col];
      if(x!=null&&isFinite(x)){ s+=x; n++; }
    });
    return n?{n:n,v:s/n}:null;
  }
  LIB.forEach(function(sys){
    if(!sys||!sys.data||sys.id==='world') return;
    if(sys.kind==='hockey'){
      const rows=sys.data.t||[];
      const pts0=colMean(rows,0,3), pts1=colMean(rows,1,3);
      const gp0=colMean(rows,0,0), gp1=colMean(rows,1,0);
      if(!(pts0&&pts0.v>0&&pts1&&pts1.v>0)){ missing.push(sys.id); return; }
      pushFloor(sys, {
        c:[pts0.v, pts1.v],
        v:[(gp0&&gp0.v>0)?gp0.v:1, (gp1&&gp1.v>0)?gp1.v:1]
      }, 'Sport · Hockey', 'Points moyens · matchs joués');
      return;
    }
    if(sys.kind==='cols'){
      const rows=sys.data.t||[];
      const pop=colMean(rows,0,0), dur=colMean(rows,0,1);
      if(!(pop&&pop.v>0)){ missing.push(sys.id); return; }
      const vol=(dur&&dur.v>0)?dur.v:1;
      pushFloor(sys, {c:[pop.v, pop.v], v:[vol, vol]}, 'Société · Musique', '[INCOMPLET] dérive — T₀ = T₁');
      return;
    }
    const ser=financeSeries(sys);
    if(!ser){ missing.push(sys.id); return; }
    pushFloor(sys, ser, REGION[sys.id]||'World', 'Étage');
  });
  window.__WORLD_INCOMPLET=missing;
  LIB.unshift({
    id:'world',
    silo:'World',
    name:'World',
    source:'World — Classe 4. Finance : moyenne des clôtures réelles. Hockey : points moyens et matchs joués, T₀ 2024-25 → T₁ 2025-26. Musique : popularité et durée Spotify 2021 ; la dérive est [INCOMPLET] parce que la source n\'a qu\'un instantané.'+(missing.length?(' [INCOMPLET] non placés : '+missing.join(', ')+'.'):''),
    data:{dates:['T₀','T₁'], t:titles}
  });
})();
