/* World is the finance Class 4 only. Hockey and music are not members:
   they have no common measure with prices, so they stay out of this
   aggregate, its zones and its drift. Art and Sports sit beside it. */
(function(){
  const REGION={
    ndx100:'Amérique du Nord', sp500y:'Amérique du Nord', djia:'Amérique du Nord', sp500:'Amérique du Nord',
    ftse100:'Europe', dax:'Europe', cac40:'Europe', sx5e:'Europe',
    n225:'Asie-Pacifique', hsi:'Asie-Pacifique', sti:'Asie-Pacifique', asx200:'Asie-Pacifique',
    tasi:'Moyen-Orient et Afrique', ibov:'Amérique latine'
  };
  const SHORT={
    ndx100:'Nasdaq-100', sp500y:'S&P 500', djia:'Dow Jones', sp500:'S&P 500 · deux séances',
    ftse100:'FTSE 100', dax:'DAX 40', cac40:'CAC 40', sx5e:'EURO STOXX 50',
    n225:'Nikkei 225', hsi:'Hang Seng', sti:'Straits Times', asx200:'S&P/ASX 200',
    tasi:'Tadawul', ibov:'Ibovespa'
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
  LIB.forEach(function(sys){
    if(!sys||!sys.data||sys.id==='world') return;
    if(sys.kind==='hockey'||sys.kind==='cols') return;
    if(sys.silo==='Art'||sys.silo==='Sports') return;
    const ser=financeSeries(sys);
    if(!ser){ missing.push(sys.id); return; }
    const sec=sys.zone||REGION[sys.id];
    if(!sec){ missing.push(sys.id); return; }
    const label=sys.short||SHORT[sys.id]||'Étage';
    pushFloor(sys, ser, sec, sys.gap?label+' · '+sys.gap:label);
  });
  window.__WORLD_INCOMPLET=missing;
  LIB.unshift({
    id:'world',
    silo:'Finance',
    name:'Finance',
    source:'Finance — Classe 4 du marché World. Seules les séries de prix entrent dans l\'agrégat, les zones et la dérive. Art et Sports sont deux Classes 4 à côté, hors de cette galaxie. Hockey et musique n\'y sont pas.'+(missing.length?(' [INCOMPLET] non placés : '+missing.join(', ')+'.'):''),
    data:{dates:['T₀','T₁'], t:titles}
  });
})();
