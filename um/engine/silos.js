/* Art and Sports are sibling Class 4s. They are built after Finance,
   so their floors never enter the World aggregate. */
(function(){
  function colMean(rows, take, col){
    let s=0,n=0;
    (rows||[]).forEach(function(t){
      const st=t.st&&t.st[take];
      if(!st) return;
      const x=st[col];
      if(x!=null&&isFinite(x)){ s+=x; n++; }
    });
    return n?s/n:null;
  }
  const nhl=LIB.find(function(s){return s.id==='nhl'&&s.data;});
  const music=LIB.find(function(s){return s.id==='music'&&s.data;});
  if(nhl){
    const rows=nhl.data.t||[];
    const pts0=colMean(rows,0,3), pts1=colMean(rows,1,3);
    const gp0=colMean(rows,0,0), gp1=colMean(rows,1,0);
    if(pts0>0&&pts1>0){
      LIB.push({
        id:'sports',
        silo:'Sports',
        name:'Sports',
        source:'Sports — Classe 4 à côté de Finance. Étage : LNH, points moyens et matchs joués, T₀ 2024-25 → T₁ 2025-26. Hors de l\'agrégat finance.',
        data:{dates:['T₀','T₁'], t:[{
          s:nhl.name, sec:'Sport', ind:'Points moyens · matchs joués', cty:'Sports', o:0,
          c:[pts0, pts1], v:[(gp0>0)?gp0:1, (gp1>0)?gp1:1], floor:'nhl'
        }]}
      });
    }
  }
  if(music){
    const rows=music.data.t||[];
    const pop=colMean(rows,0,0), dur=colMean(rows,0,1);
    if(pop>0){
      const vol=(dur>0)?dur:1;
      LIB.push({
        id:'art',
        silo:'Art',
        name:'Art',
        source:'Art — Classe 4 à côté de Finance. Étage : Musique · Spotify 2021. [INCOMPLET] un seul instantané, T₀ = T₁, donc aucune dérive. Hors de l\'agrégat finance.',
        data:{dates:['T₀','T₁'], t:[{
          s:music.name, sec:'Art', ind:'[INCOMPLET] dérive — T₀ = T₁', cty:'Art', o:0,
          c:[pop, pop], v:[vol, vol], floor:'music'
        }]}
      });
    }
  }
})();
