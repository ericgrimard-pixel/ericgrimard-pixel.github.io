const esco=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Every listener added while a system runs is tied to that run, so switching systems leaves nothing behind. */
const _addEL=EventTarget.prototype.addEventListener;
let BOOT=null;
EventTarget.prototype.addEventListener=function(t,f,o){
  if(BOOT&&BOOT.ac){const opt=(o&&typeof o==='object')?Object.assign({},o):{capture:!!o};if(!opt.signal)opt.signal=BOOT.ac.signal;return _addEL.call(this,t,f,opt)}
  return _addEL.call(this,t,f,o);
};
let CURSYS=null, lastTouchNav=0;
function hubHash(id){return id==='world'?'/world':id}
function switchSys(id,keep){
  const SYSn=LIB.find(x=>x.id===id&&x.data);if(!SYSn)return;
  CURSYS=id;$o('sys').value=id;
  try{const want=hubHash(id);if(location.hash.slice(1)!==want)location.hash=want}catch(e){}
  boot(SYSn,keep||{});
}
function boot(SYS,keep){
if(BOOT)BOOT.destroy();
BOOT={ac:new AbortController(),destroy:()=>{}};
(function(){
const DATA = SYS.data;
const HK=SYS.kind==='hockey',GC=SYS.kind==='cols',UN=HK?'joueurs':GC?(DATA.unit||'objets'):'titres'; /* GC: column system (rev. 23.15) */
document.getElementById('srcText').innerHTML=SYS.source;
const PHI=(1+Math.sqrt(5))/2, TAU=Math.sqrt(PHI*PHI+5);
const F=DATA.dates.length, TK=DATA.t, N1=TK.length;
const TWO=F===2; /* a system delivered as two sessions only: each take is built from its own file */
const WL=TWO?'tv1':'tv20'; /* weight of a cardinal's members */
const ZN=['Ω','φ⁻','Σ','φ⁺','α'], ZNL=['Ω Oméga','φ⁻ phi moins','Σ Sigma','φ⁺ phi plus','α Alpha'];
const ZCOL=['#ff5c5c','#ffb347','#5fd690','#4fa7ff','#b388ff'];
const KN=[-1,-.6,-.2,.2,.6,1];
const zoneOf=v=>v<-.6?0:v<-.2?1:v<.2?2:v<.6?3:4;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SECCOL={'Technology':'#4fa7ff','Healthcare':'#5fd690','Financial Services':'#e8c872','Consumer Cyclical':'#ff8a5c','Industrials':'#9fb0c6','Communication Services':'#b388ff','Consumer Defensive':'#5fd6c8','Energy':'#ff5c5c','Utilities':'#ffd84a','Real Estate':'#e48fc0','Basic Materials':'#c9a06e'};
const secCol=x=>SECCOL[x]||'#8b98ad';

/* ---------------- LNH (Éric, 9 Nov., 22 h 14; YB1's deposit) ----------------
   The same body read on hockey: two takes = two seasons (T₀ 2024-25, T₁ 2025-26); Class 1 = the 1 187 players;
   Class 2 = YB1's 99 super-instanciateurs; Class 4 = the league. A player stays the same object: when he changes club,
   only the logo inside his object changes (the club's sigle; no official logo, no portrait). */
const HKC=HK?DATA.cols:[],HKI={};HKC.forEach((c,k)=>HKI[c]=k);
const HKLINES=[
  {id:'pts',label:'Points',fmt:'int'},
  {id:'gp',label:'Matchs joués',fmt:'int'},
  {id:'toi',label:'Temps de glace par match',fmt:'toi'},
  {id:'g',label:'Buts',fmt:'int'},
  {id:'a',label:'Passes',fmt:'int'},
  {id:'pm',label:'Plus-moins (patineurs)',fmt:'sint'},
  {id:'ppg',label:'Points par match (patineurs)',fmt:'dec2'},
  {id:'shots',label:'Tirs (patineurs)',fmt:'int'},
  {id:'shpct',label:'Pourcentage de réussite (patineurs)',fmt:'pctf'},
  {id:'evp',label:'Points à forces égales (patineurs)',fmt:'int'},
  {id:'ppp',label:'Points en avantage numérique (patineurs)',fmt:'int'},
  {id:'gwg',label:'Buts gagnants (patineurs)',fmt:'int'},
  {id:'fow',label:'Mises au jeu gagnées (patineurs)',fmt:'pctf'},
  {id:'pim',label:'Minutes de pénalité',fmt:'int'},
  {id:'age',label:'Âge au 1er octobre de la saison',fmt:'yrs'},
  {id:'ht',label:'Taille',fmt:'cm'},
  {id:'wt',label:'Poids',fmt:'kg'},
  {id:'dov',label:'Rang au repêchage (non repêché : n/d)',fmt:'int'},
  {id:'sv',label:"Pourcentage d'arrêts (gardiens)",fmt:'dec3'},
  {id:'gaa',label:'Moyenne de buts alloués (gardiens)',fmt:'dec2'},
  {id:'w',label:'Victoires (gardiens)',fmt:'int'},
  {id:'so',label:'Blanchissages (gardiens)',fmt:'int'}
];
const HKCTYPE={conf:{label:'Conférence'},div:{label:'Division'},club:{label:'Club'},nat:{label:'Nationalité'},pos:{label:'Position'},drnd:{label:'Ronde de repêchage'},dyr:{label:'Cohorte de repêchage'},age:{label:"Bande d'âge"},hand:{label:'Tir'}};
const HKLAY=[['c1','Classe 1 · joueurs'],['conf','Classe 2 · conférences'],['div','Classe 2 · divisions'],['club','Classe 2 · clubs'],['nat','Classe 2 · nationalités'],['pos','Classe 2 · positions'],['drnd','Classe 2 · rondes de repêchage'],['dyr','Classe 2 · cohortes de repêchage'],['age',"Classe 2 · bandes d'âge"],['hand','Classe 2 · tir'],['c3','Classe 3 · conteneurs'],['c4','Classe 4 · objet central'],['bounds','Bornes et cadran'],['trails','Traînées des cardinaux'],['xfer','Liens club ↔ club · mouvements T₀ → T₁'],['ptrail','Traînée du transfert (joueur qui change de club)'],['tlabels',"Logo du club dans l'objet (Classe 1)"],['links','Liens de la chaîne'],['labels','Étiquettes'],['spacing','Espacement (canon des tailles)'],['z0','Fil Z0 · moyenne de tout'],['z0c2','Z0 compte la Classe 2'],['z0c3','Z0 compte la Classe 3']];
const HKLEG=`<span class="brk"></span><span>logo dans l'objet : sigle du club, le dernier de la saison ; anneau bleu : Association de l'Est, ambre : de l'Ouest · liens club ↔ club : un trait par mouvement d'intersaison, de l'ancien club (ambre) au nouveau (bleu) · traînée du transfert : le joueur reste le même objet, seul son logo change, et sa traînée de T₀ reste visible</span>`;
const HKCL=HK?DATA.clubs:{};
const POSL={C:'centre',L:'ailier gauche',R:'ailier droit',D:'défenseur',G:'gardien'};
const PIX={};if(HK)TK.forEach((t,i)=>PIX[t.id]=i);
const clubAt=(i,d)=>{const c=TK[i].cl&&TK[i].cl[d];return c?c[c.length-1]:null};
function hkAge(bd,y){return (Date.UTC(y,9,1)-Date.parse(bd+'T00:00:00Z'))/(365.2425*864e5)}
function hkFill(){
  TK.forEach((t,i)=>{for(let d=0;d<F;d++){const s=t.st[d];if(!s)continue;const j=i*F+d;
    HKC.forEach((c,k)=>{if(LN[c]&&s[k]!=null)LN[c][j]=s[k]});
    LN.age[j]=hkAge(t.bd,+DATA.dates[d].slice(0,4));
    if(t.ht!=null)LN.ht[j]=t.ht;if(t.wt!=null)LN.wt[j]=t.wt;if(t.do!=null)LN.dov[j]=t.do}});
}
/* rev. 23.15 — column systems: each object carries its columns (one array per take; a single snapshot serves both takes)
   and the indices of its Class 2 cards. Members all weigh the same. */
function gcFill(){TK.forEach((t,i)=>{for(let d=0;d<F;d++){const s=t.st[Math.min(d,t.st.length-1)];if(!s)continue;const j=i*F+d;
  DATA.cols.forEach((c,k)=>{if(LN[c]&&s[k]!=null)LN[c][j]=s[k]})}})}
function gcCards(){const mem=DATA.c2.map(()=>[]);TK.forEach((t,i)=>t.c2.forEach(ci=>mem[ci].push(i)));
  DATA.c2.forEach((c,ci)=>CARDS.push({ty:c.ty,name:c.name,short:c.short,cid:c.id,members:mem[ci],mset:new Set(mem[ci])}))}
function hkCards(){
  const IX={};DATA.c2.forEach((c,ci)=>IX[c.id]=ci);
  const ids=t=>{const a=['nat:'+t.nat,'pos:'+t.pos,'draft_round:'+(t.dr==null?'undrafted':t.dr),'age:'+t.ab,'shoots:'+t.sh];if(t.dy!=null)a.push('draft_year:'+t.dy);return a};
  const mem=DATA.c2.map(()=>[]),tk=DATA.c2.map(c=>(c.ty==='conf'||c.ty==='div'||c.ty==='club')?new Uint8Array(NF):null);
  TK.forEach((t,i)=>{
    ids(t).forEach(id=>{const ci=IX[id];if(ci!=null)mem[ci].push(i)});
    for(let d=0;d<F;d++){const cl=t.cl[d];if(!cl)continue;
      cl.forEach(ab=>{const cc=HKCL[ab];['club:'+ab,'div:'+cc.div,'conf:'+cc.conf].forEach(id=>{const ci=IX[id];if(ci!=null)tk[ci][i*F+d]=1})})}
  });
  DATA.c2.forEach((c,ci)=>{let m=mem[ci];
    if(tk[ci]){m=[];for(let i=0;i<N1;i++){let on=0;for(let d=0;d<F;d++)on|=tk[ci][i*F+d];if(on)m.push(i)}}
    CARDS.push({ty:c.ty,name:c.name,short:c.short,cid:c.id,members:m,mset:new Set(m),tk:tk[ci]})});
}
function hkPhoto(t){const p=HKPH[t.id];
  if(!p||!p.src)return `<div class="ph" title="Photo de source libre seulement (Wikimedia Commons), licence et auteur indiqués ; aucun portrait officiel de la LNH. Aucune image n'est encore déposée."><span>Photo libre<br>Wikimedia Commons</span><b>[INCOMPLET]</b></div>`;
  return `<figure class="phf"><img src="${p.src}" alt="${esc(t.s)}"><figcaption>${p.page?`<a href="${esc(p.page)}" target="_blank" rel="noopener">Commons</a>`:'Commons'} · ${p.licUrl?`<a href="${esc(p.licUrl)}" target="_blank" rel="noopener">${esc(p.lic||'')}</a>`:esc(p.lic||'licence ?')} · ${esc(p.author||'auteur ?')}</figcaption></figure>`}
/* the logo: one texture per club, shared by every player of that club */
const BTX={};
function badgeTex(ab){
  if(BTX[ab])return BTX[ab];
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),east=HKCL[ab]&&HKCL[ab].conf==='east';
  /* ring and sigle only, no fill: the object's own shape and colour stay readable through its logo */
  g.beginPath();g.arc(64,64,56,0,Math.PI*2);g.lineWidth=6;g.strokeStyle=east?'#a6dcff':'#ffcf8a';g.globalAlpha=.85;g.stroke();g.globalAlpha=1;
  g.font='600 40px "IBM Plex Mono", ui-monospace, monospace';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=9;g.strokeStyle='rgba(5,8,13,.85)';g.strokeText(ab||'',64,67);g.fillStyle='#ffffff';g.fillText(ab||'',64,67);
  const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;return BTX[ab]=tx;
}
/* Photo pipeline (one skeleton for every sport and market): HKPH[player_id] = {src, file, page, lic, licUrl, author}.
   Free images only (Wikimedia Commons), licence and author kept in the fiche; no official NHL portrait.
   The photo sits inside the head object, with the club sigle; ghosts never carry it. Empty until YB1's deposit. */
const HKPH={};
const PTX={},PIMG={};
function photoImg(id){const p=HKPH[id];if(!p||!p.src)return null;if(PIMG[id])return PIMG[id];const im=new Image();im.onload=()=>{for(const k in PTX)if(k.startsWith(id+'|')){PTX[k].userData.draw();PTX[k].needsUpdate=true}dirty=true};im.src=p.src;return PIMG[id]=im}
function objTex(i,ab){
  const id=TK[i].id,im=photoImg(id);if(!im)return badgeTex(ab);
  const key=id+'|'+ab;if(PTX[key])return PTX[key];
  const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d'),east=HKCL[ab]&&HKCL[ab].conf==='east';
  const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;
  tx.userData={draw(){g.clearRect(0,0,192,192);
    if(im.complete&&im.naturalWidth){g.save();g.beginPath();g.arc(96,96,80,0,Math.PI*2);g.clip();const s=Math.max(160/im.naturalWidth,160/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;g.globalAlpha=.92;g.drawImage(im,96-w/2,96-h*.42,w,h);g.restore()}
    g.globalAlpha=1;g.beginPath();g.arc(96,96,82,0,Math.PI*2);g.lineWidth=7;g.strokeStyle=east?'#a6dcff':'#ffcf8a';g.stroke();
    g.font='600 30px "IBM Plex Mono", ui-monospace, monospace';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=8;g.strokeStyle='rgba(5,8,13,.9)';g.strokeText(ab||'',96,160);g.fillStyle='#ffffff';g.fillText(ab||'',96,160)}};
  tx.userData.draw();return PTX[key]=tx;
}
function badgeSprite(i,o){const ab=clubAt(i,TK[i].cl[F-1]?F-1:0);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:objTex(i,ab),transparent:true,depthWrite:false}));sp.scale.set(o.R*1.1,o.R*1.1,1);sp.userData.ab=ab;return sp}
/* zoom descendant (YB1, 22 h 11): each click rewrites the system at that level; the rest stays visible as Class 2 */
function hkParents(ci){
  const c=CARDS[ci];if(!c)return [];
  if(c.ty==='club'){const cc=HKCL[c.short];return [CIX['conf:'+cc.conf],CIX['div:'+cc.div],ci]}
  if(c.ty==='div'){const dv=c.cid.split(':')[1],cc=Object.values(HKCL).find(x=>x.div===dv);return [CIX['conf:'+cc.conf],ci]}
  return [ci];
}
function setScope(ci){
  if(ci==null||ci<0||!CARDS[ci]){SCOPE=null;SCOPEC=-1}
  else{const c=CARDS[ci];SCOPE=new Uint8Array(NF);for(const i of c.members)for(let d=0;d<F;d++){const j=i*F+d;SCOPE[j]=c.tk?c.tk[j]:1}SCOPEC=ci}
  S.focus=null;S.plan=false;$('banner').style.display='none';
  rebuild();select({kind:4});drawGauss();
}
/* small formatters */
const nf=(x,dg)=>Number.isFinite(x)?x.toFixed(dg==null?0:dg).replace('.',','):'—';
const sgI=x=>Number.isFinite(x)?(x>0?'+':x<0?'−':'')+nf(Math.abs(x)):'—';
const bdg=ab=>ab?`<span class="bdg ${HKCL[ab]&&HKCL[ab].conf==='east'?'e':'w'}">${esc(ab)}</span>`:'';
const chP=(i,extra)=>i==null?'':`<button type="button" data-sel="1:${i}">${esc(TK[i].s)}${extra?' '+esc(extra):''}</button>`;
const chC=(ci,txt)=>ci==null||ci<0?esc(txt||''):`<button type="button" data-sel="2:${ci}">${esc(txt||CARDS[ci].short)}</button>`;
const cCI=ab=>CIX['club:'+ab];
const stv=(i,d,c)=>{const s=TK[i].st[d];return s?s[HKI[c]]:null};
function hkFmtStat(c,x){
  if(x==null||!Number.isFinite(+x))return '—';
  if(c==='ppg'||c==='gaa')return nf(x,2);if(c==='sv')return nf(x,3);if(c==='shpct'||c==='fow')return nf(x*100,1)+' %';
  if(c==='toi'){const m=Math.floor(x/60),z=Math.floor(x-m*60);return m+':'+String(z).padStart(2,'0')}
  if(c==='pm')return sgI(x);return String(x);
}
function hkTipLine(i){const t=TK[i],a=clubAt(i,S.T0),b=clubAt(i,S.T1),nat=CARDS[CIX['nat:'+t.nat]];
  return esc([t.n!=null?'#'+t.n:null,POSL[t.pos],(a||'·')+' → '+(b||'·'),nat?nat.name:t.nat].filter(Boolean).join(' · '))}
function hkCardLines(i){
  const t=TK[i],d=PRES[i*F+S.T1]?S.T1:S.T0,ab=clubAt(i,d),s=t.st[d];
  const col=HKCL[ab]&&HKCL[ab].conf==='east'?'#a6dcff':'#ffcf8a';
  const l3=s?DATA.dates[d]+' · '+(t.pos==='G'?s[HKI.w]+' victoires · '+nf(s[HKI.sv],3)+' arrêts':s[HKI.pts]+' points en '+s[HKI.gp]+' matchs'):'';
  return [[t.s,[t.n!=null?'#'+t.n:null,POSL[t.pos],ab].filter(Boolean).join(' · '),l3],col];
}
function hkSortMembers(m){const p=i=>{const a=stv(i,1,'pts'),b=stv(i,0,'pts');return a!=null?a+1e4:(b!=null?b:0)};return m.slice().sort((x,y)=>p(y)-p(x))}
function hkRink(pos){
  const spots={L:[100,21],C:[100,42.5],R:[100,64],D:[66,42.5],G:[16,42.5]};
  const dots=Object.keys(spots).map(k=>{const [x,y]=spots[k];return k===pos?`<circle cx="${x}" cy="${y}" r="8" fill="#a6dcff" opacity=".22"/><circle cx="${x}" cy="${y}" r="3.8" fill="#eaf6ff"/>`:`<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#5c6a82" stroke-width=".9"/>`}).join('');
  return `<svg viewBox="0 0 200 85" class="rink" role="img" aria-label="Patinoire schématique, position nominale : ${esc(POSL[pos]||'')}">
<rect x="1" y="1" width="198" height="83" rx="26" fill="#0b1420" stroke="#5c6a82" stroke-width="1"/>
<line x1="100" y1="1" x2="100" y2="84" stroke="#ff5c5c" stroke-width="1.4" opacity=".65"/>
<line x1="75" y1="1" x2="75" y2="84" stroke="#4fa7ff" stroke-width="1.4" opacity=".65"/><line x1="125" y1="1" x2="125" y2="84" stroke="#4fa7ff" stroke-width="1.4" opacity=".65"/>
<line x1="11" y1="6" x2="11" y2="79" stroke="#ff5c5c" stroke-width=".7" opacity=".55"/><line x1="189" y1="6" x2="189" y2="79" stroke="#ff5c5c" stroke-width=".7" opacity=".55"/>
<path d="M11 36 a6.5 6.5 0 0 1 0 13" fill="#4fa7ff" fill-opacity=".16" stroke="#4fa7ff" stroke-width=".6"/><path d="M189 36 a6.5 6.5 0 0 0 0 13" fill="#4fa7ff" fill-opacity=".16" stroke="#4fa7ff" stroke-width=".6"/>
<circle cx="100" cy="42.5" r="11" fill="none" stroke="#4fa7ff" stroke-width=".7" opacity=".55"/>${dots}</svg>`;
}
const FWHY={single_season:'une seule saison dans les données',low_gp:'moins de 10 matchs dans une des deux saisons',goalie_no_ppg:'gardien : pas de points par match'};
const FLV=f=>f===1?'+1 · forte hausse':f===.5?'+0,5 · hausse':f===0?'0 · stable':f===-.5?'−0,5 · baisse':f===-1?'−1 · forte baisse':'—';
function hkFiche1(s){
  const i=s.idx,t=TK[i],j0=i*F+S.T0,j1=i*F+S.T1,v0=vals(s,S.T0),v1=vals(s,S.T1);
  const c0=t.cl[S.T0],c1=t.cl[S.T1],e0=c0?c0[c0.length-1]:null,s1=c1?c1[0]:null,e1=c1?c1[c1.length-1]:null;
  const nat=CARDS[CIX['nat:'+t.nat]];
  const meta=[t.n!=null?'#'+t.n:'dossard non renseigné',POSL[t.pos],nat?nat.name:t.nat,t.age+' ans au 9 nov. 2026',t.sh==='L'?'tire à gauche':t.sh==='R'?'tire à droite':'tir non renseigné',
    (t.ht?nf(t.ht)+' cm':'')+(t.wt?' · '+nf(t.wt,1)+' kg':''),t.dy?`repêché en ${t.dy}, ronde ${t.dr}, ${t.do}${t.do===1?'er':'e'} au total`:'non repêché',`né à ${t.city}${t.reg?' ('+t.reg+')':''}, ${t.bc}`].filter(Boolean).map(esc).join(' · ');
  let logo;
  if(c0&&c1){const moved=e0!==s1,changed=e0!==e1;
    logo=`${bdg(e0)}<i>→</i>${bdg(e1)}<span class="tx">${!changed&&!moved?'même club aux deux saisons : même objet, même logo':'même objet, le logo change : nouvelle appartenance'}${moved?` · à l'intersaison, le lien avec ${esc(e0)} se brise et le lien avec ${esc(s1)} se crée`:''}${c0.length>1?` · 2024-25 : ${esc(c0.join(' → '))}`:''}${c1.length>1?` · 2025-26 : ${esc(c1.join(' → '))}`:''}</span>`}
  else if(c0)logo=`${bdg(e0)}<i>→</i><span class="tx">seulement en 2024-25 : il quitte le champ à T₁${c0.length>1?' · '+esc(c0.join(' → ')):''}</span>`;
  else logo=`<i>→</i>${bdg(e1)}<span class="tx">seulement en 2025-26 : il entre dans le champ à T₁${c1.length>1?' · '+esc(c1.join(' → ')):''}</span>`;
  const ST=t.pos==='G'?[['Matchs','gp'],['Départs','gs'],['Victoires','w'],["% d'arrêts",'sv'],['Moyenne','gaa'],['Blanchissages','so'],['Points','pts']]
    :[['Matchs','gp'],['Buts','g'],['Passes','a'],['Points','pts'],['Points par match','ppg'],['Plus-moins','pm'],['Temps de glace','toi'],['Tirs','shots'],['% de réussite','shpct']];
  const tab=`<table class="zt"><tr><th></th><th>2024-25</th><th>2025-26</th></tr>${ST.map(([l,c])=>`<tr><td>${esc(l)}</td><td>${hkFmtStat(c,stv(i,0,c))}</td><td>${hkFmtStat(c,stv(i,1,c))}</td></tr>`).join('')}</table>`;
  const Fv=t.pos==='G'?t.Fsv:t.F,Fm=t.pos==='G'?"pourcentage d'arrêts, seuils ±0,008 et ±0,02":'points par match, seuils ±0,10 et ±0,25';
  const Ftxt=Fv!=null?`<b>${FLV(Fv)}</b> · ${Fm}, au moins 10 matchs par saison`:`[INCOMPLET] ${esc(FWHY[t.Fw]||t.Fw||'non calculable')}`;
  const cl=e1||e0,cc=cl?HKCL[cl]:null,dC=k=>CIX[k];
  const chips=[
    ...(c0?c0.map(ab=>[cCI(ab),HKCL[ab].name,'Classe 2 · club · 2024-25']):[]),
    ...(c1?c1.map(ab=>[cCI(ab),HKCL[ab].name,'Classe 2 · club · 2025-26']):[]),
    cc?[dC('div:'+cc.div),CARDS[dC('div:'+cc.div)].name,'Classe 2 · division']:null,
    cc?[dC('conf:'+cc.conf),CARDS[dC('conf:'+cc.conf)].name,'Classe 2 · conférence']:null,
    [dC('nat:'+t.nat),nat?nat.name:t.nat,'Classe 2 · nationalité'],
    [dC('pos:'+t.pos),POSL[t.pos],'Classe 2 · position'],
    [dC('draft_round:'+(t.dr==null?'undrafted':t.dr)),t.dr==null?'Non repêché':'Ronde '+t.dr,'Classe 2 · ronde'],
    t.dy!=null?[dC('draft_year:'+t.dy),'Cohorte '+t.dy,'Classe 2 · cohorte']:null,
    [dC('age:'+t.ab),t.ab+' ans','Classe 2 · âge'],
    [dC('shoots:'+t.sh),t.sh==='L'?'Gaucher':t.sh==='R'?'Droitier':'Tir inconnu','Classe 2 · tir']
  ].filter(x=>x&&x[0]!=null).map(([ci,nm,em])=>`<button class="chip" type="button" data-sel="2:${ci}"><span>${esc(nm)}</span><em>${esc(em)}</em></button>`).join('');
  const vz=v1||v0,z0=vz?boxOf(vz[0],vz[1],vz[2]):2;
  let h=`<div class="cls">Classe 1 · joueur</div><h3>${esc(t.s)}</h3><div class="meta">${meta}</div>
  <div class="hkid">${hkPhoto(t)}${hkRink(t.pos)}</div>
  <div class="hklogo">${logo}</div>${tab}
  <p class="note">Échelle F : ${Ftxt}.</p>
  <div class="chain">${chips}
    <button class="chip" type="button" data-sel="3:${z0}"><span style="color:${ZCOL[z0]}">${C3ON[z0]?esc(ZNL[z0]):'champ '+ZN[z0]+' ouvert · '+C3SYM[z0]+' non activé'}</span><em>${C3ON[z0]?'Classe 3 · conteneur à T₁':'Classe 3 · aucun'}</em></button>
    <button class="chip" type="button" data-sel="4:0"><span>${esc(SYS.name)}</span><em>Classe 4 · système</em></button></div>`;
  if(!v0&&!v1)h+=`<p class="note">Hors du champ aux deux prises${SCOPE?' du niveau affiché':''}.</p>`;
  else{
    const e0=PRES[j0]?VI[j0]-ZZ[S.T0]:null,e1=PRES[j1]?VI[j1]-ZZ[S.T1]:null,rel=e0!=null&&e1!=null?e1-e0:null;
    const r0=PRES[j0]?k2=>fmt(eff(k2),LN[eff(k2)][j0]):null,r1=PRES[j1]?k2=>fmt(eff(k2),LN[eff(k2)][j1]):null;
    h+=`<dl class="kv"><dt>D₄ vertical (÷ 9)</dt><dd>${PRES[j0]?f8(VI[j0]):'—'} → ${PRES[j1]?f8(VI[j1]):'—'}</dd>
    <dt>Mouvement relatif</dt><dd class="big">${rel!=null?((rel>=0?'+':'')+rel.toFixed(8)):'—'}</dd></dl>
    <p class="note">${rel!=null?(rel>=0?'Il gagne contre son propre système entre les deux saisons.':'Il perd contre son propre système entre les deux saisons.')+' ':''}${curveTxt(v0,v1)}</p>
    <div class="rows">${attrRows(v0,v1,r0,r1)}</div>`;
  }
  return h;
}
/* the diagnostics of a Class 2 object (club, division, conference) */
function hkFiche2(ci){
  const c=CARDS[ci],par=hkParents(ci).filter(x=>x!==ci&&x!=null);
  let h=`<div class="chain">${par.map(p=>`<button class="chip" type="button" data-sel="2:${p}"><span>${esc(CARDS[p].name)}</span><em>Classe 2 · ${esc(CTYPE[CARDS[p].ty].label.toLowerCase())}</em></button>`).join('')}
    <button class="chip hkz" type="button" data-scope="${SCOPEC===ci?(par.length?par[par.length-1]:-1):ci}"><span>${SCOPEC===ci?'Remonter d\'un niveau':'Réécrire le système à ce niveau'}</span><em>zoom descendant</em></button></div>`;
  return h+hkC2Diag(ci);
}
function hkC2Diag(ci){
  const c=CARDS[ci];
  if(c.ty==='club'){const ab=c.short,d=DATA.diag.club[ab],cl=HKCL[ab],dp=cl.pts[1]-cl.pts[0];
    const out=d.out.map(id=>{const i=PIX[id];return chP(i,'→ '+TK[i].cl[1][0])}).join(''),inn=d.in.map(id=>{const i=PIX[id];return chP(i,'← '+TK[i].cl[0][TK[i].cl[0].length-1])}).join('');
    return `<h2 style="margin-top:10px">Diagnostics du club <span>calculés depuis les CSV</span></h2>
    <dl class="kv"><dt>Points d'équipe</dt><dd>${cl.pts[0]} → ${cl.pts[1]} (${sgI(dp)})</dd>
    <dt>Continuité d'alignement</dt><dd>${nf(d.cont,2)} % (${d.kept} / ${d.n0})</dd>
    <dt>Fin T₀ → début T₁</dt><dd>${d.cont_edge!=null?nf(d.cont_edge,2)+' %':'—'}</dd>
    <dt>Partis · arrivés (apparitions)</dt><dd>${d.left} · ${d.came}</dd>
    <dt>Âge moyen au 1er oct.</dt><dd>${nf(d.age[0],2)} → ${nf(d.age[1],2)} ans</dd>
    <dt>Part du top 3 dans les points</dt><dd>${d.top3[0]!=null?nf(d.top3[0],2)+' %':'—'} → ${d.top3[1]!=null?nf(d.top3[1],2)+' %':'—'}</dd></dl>
    <p class="note">Top 3 en 2025-26 : ${d.top3ids[1].map(id=>chP(PIX[id])).join(' ')}${d.excl[1]?` · ${d.excl[1]} joueurs à plusieurs clubs exclus (points non ventilés)`:''}. Continuité : apparitions dans le champ team des deux saisons, pas l'alignement de 23. Âge en années révolues, club = premier sigle.</p>
    <h2 style="margin-top:10px">Liens brisés et créés à l'intersaison <span>${d.out.length} départs · ${d.in.length} arrivées</span></h2>
    <p class="note">Dernier club de 2024-25 contre premier club de 2025-26. Le joueur reste le même objet ; son logo change. Dans la chambre, ses liens club ↔ club s'allument quand le club est choisi.</p>
    <div class="members">${out}</div><div class="members">${inn}</div>`}
  if(c.ty==='div'){const dv=c.cid.split(':')[1],r=DATA.diag.div[dv],nats=Object.keys(r[1].nat).slice(0,5);
    return `<h2 style="margin-top:10px">Composition nationale <span>club = dernier sigle T₀, premier sigle T₁</span></h2>
    <table class="zt"><tr><th>nationalité</th><th>2024-25</th><th>2025-26</th></tr>${nats.map(n=>{const a=r[0].nat[n]||0,b=r[1].nat[n]||0,nm=CARDS[CIX['nat:'+n]];return `<tr><td>${chC(CIX['nat:'+n],nm?nm.name:n)}</td><td>${a} · ${nf(100*a/r[0].n,2)} %</td><td>${b} · ${nf(100*b/r[1].n,2)} %</td></tr>`}).join('')}<tr><td>joueurs</td><td>${r[0].n}</td><td>${r[1].n}</td></tr></table>
    <p class="note">Clubs : ${Object.keys(HKCL).filter(a=>HKCL[a].div===dv).sort().map(a=>chC(cCI(a),a)).join(' ')}</p>`}
  if(c.ty==='conf'){const cf=c.cid.split(':')[1];
    return `<p class="note">Divisions : ${['atlantic','metropolitan','central','pacific'].filter(dv=>Object.values(HKCL).some(x=>x.div===dv&&x.conf===cf)).map(dv=>chC(CIX['div:'+dv],CARDS[CIX['div:'+dv]].name)).join(' ')} · clubs : ${Object.keys(HKCL).filter(a=>HKCL[a].conf===cf).sort().map(a=>chC(cCI(a),a)).join(' ')}</p>`}
  return '';
}
/* the Class 4 reading: YB1's eight diagnostics, recomputed from the CSV, and one live reading of the engine */
let HKD6=null;
function hkD6(){
  if(HKD6)return HKD6;const r=[];
  TK.forEach((t,i)=>{if(t.pos==='G')return;const a=stv(i,0,'ppg'),b=stv(i,1,'ppg'),g0=stv(i,0,'gp'),g1=stv(i,1,'gp');if(a==null||b==null||g0<10||g1<10)return;r.push([i,b-a,a,b])});
  r.sort((x,y)=>y[1]-x[1]);return HKD6={up:r.slice(0,5),down:r.slice(-5).reverse(),n:r.length};
}
function hkRel(){
  const r=[];CARDS.forEach((c,ci)=>{if(c.ty!=='club')return;const q0=ci*F+S.T0,q1=ci*F+S.T1;if(!CP[q0]||!CP[q1])return;
    const m=q=>{let s=0;for(let k=0;k<9;k++)s+=CV[q*10+k];return TAU*(1+s/9)};const cl=HKCL[c.short];
    r.push({ci,ab:c.short,rel:(m(q1)-ZZ[S.T1])-(m(q0)-ZZ[S.T0]),dp:cl.pts[1]-cl.pts[0]})});
  const rk=key=>{const s=r.map((x,i)=>[x[key],i]).sort((p,q)=>p[0]-q[0]),R=new Array(r.length);let k=0;while(k<s.length){let e=k;while(e+1<s.length&&s[e+1][0]===s[k][0])e++;for(let z=k;z<=e;z++)R[s[z][1]]=(k+e)/2+1;k=e+1}return R};
  const n=r.length;let rho=NaN;
  if(n>2){const A=rk('rel'),B=rk('dp');let ma=0,mb=0;for(let i=0;i<n;i++){ma+=A[i];mb+=B[i]}ma/=n;mb/=n;let ab=0,aa=0,bb=0;for(let i=0;i<n;i++){const a=A[i]-ma,b=B[i]-mb;ab+=a*b;aa+=a*a;bb+=b*b}rho=ab/Math.sqrt(aa*bb)}
  return {rows:r.sort((a,b)=>b.rel-a.rel),rho,n};
}
function hkMeta4(){
  const cnt=ty=>CARDS.filter(c=>c.ty===ty).length,n=d=>{let k=0;for(let i=0;i<N1;i++)if(PRES[i*F+d])k++;return k};
  return `${n(S.T0).toLocaleString('fr-CA')} → ${n(S.T1).toLocaleString('fr-CA')} joueurs dans le champ (1 187 en tout) · ${cnt('conf')} conférences · ${cnt('div')} divisions · ${cnt('club')} clubs · ${cnt('nat')} nationalités · ${cnt('pos')} positions · ${cnt('drnd')} rondes · ${cnt('dyr')} cohortes · ${cnt('age')} bandes d'âge · ${cnt('hand')} tirs`;
}
function hkBlock4(){
  let h='';
  if(SCOPEC>=0){const p=hkParents(SCOPEC);
    h+=`<h2 style="margin-top:12px">Système réécrit à ce niveau <span>zoom descendant</span></h2>
    <div class="chain"><button class="chip hkz" type="button" data-scope="-1"><span>LNH entière</span><em>Classe 4 · remonter</em></button>${p.map(ci=>`<button class="chip${ci===SCOPEC?'':' hkz'}" type="button" ${ci===SCOPEC?`data-sel="2:${ci}"`:`data-scope="${ci}"`}><span>${esc(CARDS[ci].name)}</span><em>${ci===SCOPEC?'niveau affiché · ouvrir':'remonter à ce niveau'}</em></button>`).join('')}</div>
    <p class="note">Seuls les joueurs de ce niveau sont en Classe 1 ; les bornes, Z-ZERO et le fil Z0 sont recalculés sur eux. Le reste de la ligue demeure visible par ses objets de Classe 2.</p>`+hkC2Diag(SCOPEC);
  }
  return h+hkDiag4();
}
function hkDiag4(){
  const L=DATA.diag.league,C=DATA.diag.club,DV=DATA.diag.div,AB=Object.keys(C);
  const by=(f,asc)=>AB.filter(a=>Number.isFinite(f(a))).sort((x,y)=>asc?f(x)-f(y):f(y)-f(x));
  const cl=(arr,f)=>arr.map(a=>`<button type="button" data-sel="2:${cCI(a)}">${esc(a)} ${f(a)}</button>`).join('');
  const cont=a=>C[a].cont,dp=a=>HKCL[a].pts[1]-HKCL[a].pts[0],age1=a=>C[a].age[1],top=a=>C[a].top3[1];
  const pc=x=>nf(x,2)+' %';
  const fd=L.fdist,fs=L.fsv,FL=[['1','+1'],['0.5','+0,5'],['0','0'],['-0.5','−0,5'],['-1','−1']];
  const d6=hkD6(),nat=n=>{const c=CARDS[CIX['nat:'+n]];return c?c.name:n};
  const third=(r)=>{const k=Object.keys(r.nat).filter(n=>n!=='CAN'&&n!=='USA')[0];return k};
  const divRows=['atlantic','metropolitan','central','pacific'].map(dv=>{const r=DV[dv],t3=third(r[1]),f=(t,n)=>nf(100*(r[t].nat[n]||0)/r[t].n,2),g=n=>`${f(0,n)} → ${f(1,n)}`;
    return `<tr><td>${chC(CIX['div:'+dv],CARDS[CIX['div:'+dv]].name.slice(0,5)+'.')}</td><td>${g('CAN')}</td><td>${g('USA')}</td><td>${esc(nat(t3))}<br>${g(t3)}</td></tr>`}).join('');
  const PSH={C:'centre',L:'ailier g.',R:'ailier d.',D:'défense',G:'gardien'};
  const shp=['C','L','R','D','G'].map(p=>{const l=L.sh[p+':L']||0,r=L.sh[p+':R']||0,u=L.sh[p+':UNK']||0;return `<tr><td>${chC(CIX['pos:'+p],PSH[p])}</td><td>${l+r+u}</td><td>${l}</td><td>${r}${u?'*':''}</td><td>${nf(100*l/(l+r+u),1)}</td></tr>`}).join('');
  const rel=hkRel();
  const row=(a,big,n)=>`<div class="row"><span class="a">${a}</span><span class="big">${big}</span><span class="n">${n}</span></div>`;
  return `<h2 style="margin-top:12px">Diagnostics LNH T₀ → T₁ <span>depuis les CSV</span></h2>
  <div class="rows hkd">
  ${row('D1 · Mouvements à l\'intersaison',L.moves,`sur ${L.both} joueurs présents aux deux saisons ; ${L.stayed} restent (${pc(100*L.stayed/L.both)}). ${L.scope.inter_conf} changent de conférence, ${L.scope.intra_conf} de division dans la conférence, ${L.scope.intra_div} restent dans la division. ${L.pairs} paires de clubs ; aucune n'a plus de 2 joueurs. En cours de saison : ${L.mid0} joueurs à plusieurs clubs en T₀, ${L.mid1} en T₁. ${L.only0} seulement en T₀, ${L.only1} seulement en T₁. Dans la chambre, un trait par mouvement, de l'ancien club (ambre) au nouveau (bleu).`)}
  ${row('D2 · Continuité d\'alignement',`${pc(C.SJS.cont)} → ${pc(C.TBL.cont)}`,`les moins continus : ${cl(by(cont,true).slice(0,5),a=>pc(cont(a)))}<br>les plus continus : ${cl(by(cont).slice(0,5),a=>pc(cont(a)))}<br>apparitions des deux saisons ÷ apparitions de T₀ (pas l'alignement de 23)`)}
  <div class="row"><span class="a">D3 · Nationalités par division</span><span class="big"></span><span class="n"><table class="zt"><tr><th>div.</th><th>Canada %</th><th>États-Unis %</th><th>3ᵉ %</th></tr>${divRows}</table>T₀ → T₁ ; club = dernier sigle en T₀, premier sigle en T₁ ; ligue : Canada ${pc(100*L.nat[0].CAN/L.nat[0].n)} → ${pc(100*L.nat[1].CAN/L.nat[1].n)}, États-Unis ${pc(100*L.nat[0].USA/L.nat[0].n)} → ${pc(100*L.nat[1].USA/L.nat[1].n)}</span></div>
  ${row('D4 · Âges des clubs en T₁',`${nf(age1(by(age1,true)[0]),3)} → ${nf(age1(by(age1)[0]),3)}`,`plus jeunes : ${cl(by(age1,true).slice(0,3),a=>nf(age1(a),3))} · plus âgés : ${cl(by(age1).slice(0,3),a=>nf(age1(a),3))}<br>âge en années révolues au 1er octobre, club = premier sigle`)}
  ${row('D5 · Concentration des points en T₁',pc(top(by(top)[0])),`part des trois meilleurs, joueurs à un seul club : ${cl(by(top).slice(0,5),a=>pc(top(a)))}<br>${chP(PIX[8478402])} 138 points ; les points des joueurs à plusieurs clubs ne sont pas ventilés [INCOMPLET]`)}
  ${row('D6 · Échelle F des points par match',d6.n,`${FL.map(([k,l])=>`${l} : ${fd[k]||0}`).join(' · ')} (seuils ±0,10 et ±0,25 ; au moins 10 matchs par saison)<br>hausses : ${d6.up.map(x=>chP(x[0],nf(x[2],2)+' → '+nf(x[3],2))).join(' ')}<br>baisses : ${d6.down.map(x=>chP(x[0],nf(x[2],2)+' → '+nf(x[3],2))).join(' ')}<br>gardiens, sur le pourcentage d'arrêts : ${FL.map(([k,l])=>`${l} : ${fs[k]||0}`).join(' · ')} ; [INCOMPLET] pour 541 joueurs (gardiens, une seule saison, ou moins de 10 matchs)`)}
  <div class="row"><span class="a">D7 · Positions et tir</span><span class="big"></span><span class="n"><table class="zt"><tr><th>position</th><th>N</th><th>gauch.</th><th>droit.</th><th>% gauch.</th></tr>${shp}</table>un joueur, une fiche (dernière saison présente) ; * plus un défenseur au tir non renseigné</span></div>
  ${row('D8 · Points d\'équipe et continuité',`${sgI(dp(by(dp)[0]))} · ${sgI(dp(by(dp,true)[0]))}`,`hausses : ${cl(by(dp).slice(0,5),a=>sgI(dp(a))+' · '+pc(cont(a)))}<br>baisses : ${cl(by(dp,true).slice(0,5),a=>sgI(dp(a))+' · '+pc(cont(a)))}<br>San Jose renouvelle le plus et gagne le plus ; Winnipeg garde ses joueurs, concentre ses points et perd le plus.`)}
  ${row('D9 · Le moteur : clubs contre leur système',Number.isFinite(rel.rho)?'ρ '+nf(rel.rho,2):'—',`mouvement relatif de chaque club (Classe 2, D₄ − Z-ZERO, de T₀ à T₁) comparé à la variation de ses points d'équipe ; ρ de Spearman sur ${rel.n} clubs, avec les dix attributs en cours<br>gagnent le plus : ${rel.rows.slice(0,4).map(x=>`<button type="button" data-sel="2:${x.ci}">${esc(x.ab)} ${x.rel>=0?'+':''}${x.rel.toFixed(3)}</button>`).join('')}<br>perdent le plus : ${rel.rows.slice(-4).reverse().map(x=>`<button type="button" data-sel="2:${x.ci}">${esc(x.ab)} ${x.rel>=0?'+':''}${x.rel.toFixed(3)}</button>`).join('')}<br>PROPOSED : lecture de la règle, pas une prévision ; le chiffre change avec les attributs et les bornes choisis`)}
  </div>
  <p class="note">[INCOMPLET] photos libres (aucune déposée) ; équipe de repêchage absente du CSV (produit maison contre acquis impossible) ; colonne age vide (âges tirés de birth_date) ; matchs joués au-delà de 82 sur 8 lignes de joueurs à plusieurs clubs (anomalie de source, non corrigée).</p>`;
}
function hkStatus(){
  return `<li><span class="st g">GOVERNANCE</span>LNH (Éric, 9 nov., 22 h 14) : un seul système, les 1 187 joueurs en Classe 1, les 99 objets de Classe 2 de YB1 intégrés comme super-instanciateurs (conférences, divisions, clubs, nationalités, positions, rondes et cohortes de repêchage, bandes d'âge, tir), la LNH en Classe 4. T₀ = 2024-25, T₁ = 2025-26. Le joueur reste le même objet ; quand il change de club, seul le logo change dans son objet. Les liens club ↔ club sont les 154 mouvements d'intersaison. Le silo hockey reste étanche vis-à-vis de la finance.</li>
  <li><span class="st g">GOVERNANCE</span>Zoom descendant : chaque clic réécrit le système à ce niveau (ligue, conférence, division, club ou tout autre objet de Classe 2) ; le reste demeure visible comme super-instanciateurs de Classe 2. Fiche du joueur : patinoire schématique, point lumineux à la position nominale officielle (pas un suivi en match).</li>
  <li><span class="st p">PROPOSED</span>Poids des membres d'une Classe 2 et des conteneurs : matchs joués. Club d'une saison : chaque club inscrit dans le champ team (apparitions). Logo : le dernier club de la saison. Bornes calculées sur les joueurs du niveau affiché, aux deux saisons. Attributs par défaut : X points, Y matchs joués, Z temps de glace par match ; forme buts, étirement passes, couleur plus-moins, avant-arrière points par match, rotation tirs, centre-extérieur âge ; saturation, le collapse.</li>
  <li><span class="st o">OPEN</span>[INCOMPLET] Photos : seulement des images libres (Wikimedia Commons), licence et auteur indiqués, aucun portrait officiel de la LNH. Aucune n'est déposée ; cet espace de travail ne joint pas Wikimedia et la page ne charge pas d'image externe : chaque image doit être déposée dans ÉCHANGE puis intégrée au moteur.</li>
  <li><span class="st p">PROPOSED</span>Rév. 23.3 (10 nov.) : la place de la photo est prête dans l'objet de tête (photo au centre, sigle du club dessous ; les fantômes n'en portent pas) et dans la fiche (licence, auteur, lien Commons). Une photo déposée s'affiche sans autre changement : même squelette pour tous les sports et marchés. Traînée du transfert : les 154 joueurs qui changent de club gardent leur traînée de T₀, ambre vers bleu.</li>`;
}


/* ---------------- Data lines (computed here from the raw closes and volumes) ---------------- */
const LINES=HK?HKLINES:GC?DATA.lines:[
  {id:'ytd',label:'Rendement depuis janvier',fmt:'pct'},
  {id:'vol20',label:'Volatilité 20 séances, annualisée',fmt:'pct'},
  {id:'tv20',label:'Valeur échangée, moyenne 20 séances',fmt:'usdlog'},
  {id:'tv1',label:'Valeur échangée du jour',fmt:'usdlog'},
  {id:'ret1',label:'Rendement du jour',fmt:'pct'},
  {id:'ret5',label:'Rendement 5 séances',fmt:'pct'},
  {id:'mom20',label:'Momentum 20 séances',fmt:'pct'},
  {id:'dd',label:"Recul depuis le sommet de l'année",fmt:'pct'},
  {id:'lprice',label:'Cours de clôture',fmt:'pricelog'},
  {id:'lvol',label:'Volume du jour',fmt:'qtylog'}
];
const DERIVED={
  fs0:{label:'Fourier court (5 séances) · axe X',fmt:'num'},
  fs1:{label:'Fourier court (5 séances) · axe Y',fmt:'num'},
  fs2:{label:'Fourier court (5 séances) · axe Z',fmt:'num'},
  fl0:{label:'Fourier long (63 séances) · axe X',fmt:'num'},
  fl1:{label:'Fourier long (63 séances) · axe Y',fmt:'num'},
  fl2:{label:'Fourier long (63 séances) · axe Z',fmt:'num'},
  km:{label:'Kobayashi Maru · collapse des neuf D₄ contre Z-ZERO',fmt:'num'}
};
if(TWO&&!HK&&!GC)LINES.find(l=>l.id==='ytd').label='Rendement depuis T₀ (nul à T₀)';
const AVAIL=(HK||GC)?LINES.map(l=>l.id):TWO?['lprice','lvol','tv1','ytd']:LINES.map(l=>l.id);
const LINEINFO={};LINES.forEach(l=>LINEINFO[l.id]=l);Object.keys(DERIVED).forEach(k=>LINEINFO[k]=Object.assign({id:k},DERIVED[k]));
const NF=N1*F;
const LN={};
[...LINES.map(l=>l.id),...Object.keys(DERIVED)].forEach(id=>LN[id]=new Float64Array(NF).fill(NaN));
if(HK)hkFill();else if(GC)gcFill();else TK.forEach((t,i)=>{
  const o=t.o,n=t.c.length,c=d=>t.c[d-o],v=d=>t.v[d-o];
  let hi=-Infinity;
  for(let d=o;d<o+n;d++){
    const j=i*F+d,cd=c(d);hi=Math.max(hi,cd);
    LN.ytd[j]=cd/c(o)-1;
    LN.ret1[j]=d>o?cd/c(d-1)-1:0;
    LN.ret5[j]=cd/c(Math.max(o,d-5))-1;
    LN.mom20[j]=cd/c(Math.max(o,d-20))-1;
    LN.dd[j]=cd/hi-1;
    LN.lprice[j]=Math.log10(cd);
    LN.lvol[j]=Math.log10(Math.max(1,v(d)));
    LN.tv1[j]=Math.log10(Math.max(1,cd*v(d)));
    let s=0,k=0;for(let e=Math.max(o,d-19);e<=d;e++){s+=c(e)*v(e);k++}
    LN.tv20[j]=Math.log10(Math.max(1,s/k));
    const rs=[];for(let e=Math.max(o+1,d-19);e<=d;e++)rs.push(Math.log(c(e)/c(e-1)));
    if(rs.length>=2){const m=rs.reduce((a,b)=>a+b,0)/rs.length;const vv=rs.reduce((a,b)=>a+(b-m)*(b-m),0)/(rs.length-1);LN.vol20[j]=Math.sqrt(vv*252)}
  }
});
/* Ghost v19 (5 Nov., Éric, by voice): the universal rule. A ghost runs from the start point to the end point.
   The chosen column (volume first) only sets how often ghosts appear between the two: one ghost at each equal step of
   the column's cumulative amount, one step = the stock's own median session. Never one ghost per session.
   The column never touches the size or the brightness of anything: every ghost has the same size. Two ghosts never overlap.
   Ruler pinned at both ends: edge to edge (x1) at the tightest spot in the system, up to the longest gap reached in the system.
   CLK[id][j]: the column on session j divided by the stock's median over the period (0 when absent). RVOL = CLK.vol (fiche). */
const GCLK=[
  {id:'vol',label:'Volume du jour'},
  {id:'tv',label:'Valeur échangée du jour'},
  {id:'aret',label:'|Rendement du jour|'},
  {id:'vol20',label:'Volatilité 20 séances'},
  {id:'sess',label:'Séance (horloge du calendrier, témoin)'}
];
const GCLKL={};GCLK.forEach(c=>GCLKL[c.id]=c.label);
const CLK={};GCLK.forEach(c=>CLK[c.id]=new Float32Array(NF));
/* v20 (5 Nov., aligned with Grok's prototype v19, 20 h 15): the step is the stock's standard median (mean of the two middle
   values when the count is even), over the trail's own window [the stock's T0 = first session from T0 where it has a position, T1].
   Recomputed in place by buildGhost whenever T0 or T1 moves, so the clock is measured over the same span as the trail. */
const CLKMED={};GCLK.forEach(c=>CLKMED[c.id]=new Float64Array(TK.length));
const CLKZERO={vol:false,tv:false,aret:true,vol20:true,sess:false};
const median=xs=>{if(!xs.length)return 1;xs.sort((a,b)=>a-b);const h=xs.length>>1;return xs.length%2?xs[h]:(xs[h-1]+xs[h])/2};
function buildClk(T0,T1,usePres){
  TK.forEach((t,i)=>{
    const o=t.o,n=t.c.length;
    const raw={vol:k=>t.v[k],tv:k=>t.c[k]*t.v[k],aret:k=>k>0?Math.abs(Math.log(t.c[k]/t.c[k-1])):NaN,vol20:k=>LN.vol20[i*F+o+k],sess:()=>1};
    let d0=Math.max(T0,o);if(usePres)while(d0<=T1&&!PRES[i*F+d0])d0++;
    const k0=d0-o,k1=Math.min(n-1,T1-o);
    GCLK.forEach(c=>{
      /* a zero volume means no data and stays out; a flat session (|log return| = 0) is a real value and enters the median */
      const f=raw[c.id],z=CLKZERO[c.id],ok=x=>Number.isFinite(x)&&(x>0||(z&&x===0)),xs=[];
      for(let k=k0;k<=k1;k++){const x=f(k);if(ok(x))xs.push(x)}
      const med=median(xs)||1,A=CLK[c.id];CLKMED[c.id][i]=med;
      for(let k=0;k<n;k++){const x=f(k);A[i*F+o+k]=ok(x)&&x>0?x/med:0}
    });
  });
  CLK.win=[T0,T1];
}
if(!HK&&!GC)buildClk(0,F-1,false);
const RVOL=CLK.vol;
const wOf=HK?(j=>Math.max(1,LN.gp[j]||0)):GC?(j=>1):(j=>Math.pow(10,LN[WL][j])); /* weight of a member: traded value; for the LNH, games played */

/* ---------------- Attributes ---------------- */
/* Order fixed by Éric (6 Nov.): X, Y, Z ; shape, stretch-squash, colour ; the three triangular moments (forward-back on X,
   rotation on Y, centre-outside on Z) ; saturation. Each layer follows its axis. */
const ATTR=[
  {name:'X',tag:'position · la diagonale',levels:ZNL,desc:'La diagonale du bas vers le haut à droite. Sur le cadran : azimut horaire, 0 à 6 h, frontière de phase à midi.'},
  {name:'Y',tag:"position · l'altitude",levels:ZNL,desc:"L'altitude, la ligne verticale : −1 à +1."},
  {name:'Z',tag:'position · distance au centre',levels:ZNL,desc:"La distance au centre, sur la ligne horizontale : +1 à l'intérieur (rayon 1), −1 à l'extérieur (rayon 3)."},
  {name:'Forme',tag:'physique · axe X',levels:['merkaba','octaèdre','cube','tétraèdre','dodécaèdre']},
  {name:'Étirement-écrasement',tag:'physique · axe Y',levels:['écrasé','court','neutre','long','élancé']},
  {name:'Couleur',tag:'physique · axe Z',levels:['rouge','jaune','vert','bleu','violet']},
  {name:'Avant-arrière',tag:'angulaire · moment triangulaire X',levels:['recule fort','recule','droit','penche en avant','plonge en avant']},
  {name:'Rotation',tag:'angulaire · moment triangulaire Y',levels:['contre-horaire rapide','contre-horaire','immobile','horaire','horaire rapide']},
  {name:'Centre-extérieur',tag:'angulaire · moment triangulaire Z',levels:['vers le centre fort','vers le centre','droit',"vers l'extérieur","vers l'extérieur fort"]},
  {name:'Saturation',tag:'complément · 10ᵉ · collapse',levels:['gris','délavé','mi-saturé','vif','saturé']}
];
const FOURIER_LINES=['fs0','fs1','fs2','fl0','fl1','fl2'];
const S={
  mode:TWO?'free':'fourier',km:true,
  assign:HK?['pts','gp','toi','g','a','pm','ppg','shots','age','km']:GC?DATA.assign.slice():TWO?['lprice','lvol','tv1','ytd','ytd','lvol','ytd','lprice','tv1','km']:['ytd','vol20','tv20','dd','mom20','lvol','ret1','ret5','lprice','km'],
  cut:ATTR.map(()=>({auto:true,line:null,c:[0,0,0,0],lo:0,hi:1})),
  open:0,session:null,records:[],
  prog:0,playing:false,dur:60,exp:(window.__umExp||(()=>{try{return Math.max(.05,Math.min(1000,+localStorage.getItem('um.volume')||1))}catch(e){return 1}})()),
  sel:{kind:4},focus:null,plan:false,
  T0:0,T1:F-1,
  ghost:!TWO&&(window.__umGhost!=null?window.__umGhost:(()=>{try{return localStorage.getItem('um.fantome')!=='0'}catch(e){return true}})()),
  gclk:window.__umGclk||'vol',gtau:window.__umGtau!=null?window.__umGtau:0,
  layers:{c1:true,sec:true,cty:true,ind:false,genre:true,key:false,mode:false,expl:false,tsig:false,conf:true,div:true,club:true,nat:true,pos:true,drnd:false,dyr:false,age:false,hand:false,xfer:false,ptrail:false,c3:true,c4:true,bounds:true,trails:false,ghost:true,gpaths:false,tlabels:true,links:true,labels:true,spacing:true,z0:true,z0c2:true,z0c3:true,c4v:false,c3d:false,micro:false}, /* rev. 23.12 (Éric, 11 Nov., 13 h 38): on opening, no line between the objects; each one is a layer to switch on. Rev. 23.13: the LNH transfer trail too */
  thr:window.__umThr!=null?window.__umThr:10,thrW:window.__umThrW||'tv',
  gvol:window.__umGvol||1,gvolI:{} /* Volume du fantôme (Grok spec, 9 Nov.): global and per stock; never merged with the system Volume */
};
const eff=k=>{
  if(S.mode==='fourier'&&k>=3&&k<=8)return FOURIER_LINES[k-3];
  if(k===9&&(S.km||S.mode==='fourier'))return 'km';
  return S.assign[k];
};

/* ---------------- Pipeline ---------------- */
const PRES0=new Uint8Array(NF),PRES=new Uint8Array(NF), V=new Float32Array(NF*10), VI=new Float64Array(NF), ZZ=new Float64Array(F);
const POOL=new Array(10);
let SCOPE=null,SCOPEC=-1; /* zoom descendant (LNH): the players of the level shown; null = the whole system */
const quant=(P,q)=>{if(!P.length)return 0;const p=(P.length-1)*q,a=Math.floor(p),b=Math.ceil(p);return P[a]+(P[b]-P[a])*(p-a)};
function normFn(cu){
  const xs=[cu.lo,...cu.c,cu.hi];
  return x=>{
    if(!Number.isFinite(x))return 0;
    if(x<=xs[0])return -1; if(x>=xs[5])return 1;
    for(let z=0;z<5;z++){if(x<xs[z+1]){const w=xs[z+1]-xs[z];return KN[z]+(w>0?(x-xs[z])/w:.5)*.4}}
    return 1;
  };
}
function fixOrder(cu){
  const span=Math.max(1e-9,Math.abs(cu.hi-cu.lo))*1e-4;
  for(let z=1;z<4;z++)if(cu.c[z]<=cu.c[z-1])cu.c[z]=cu.c[z-1]+span;
  if(cu.lo>=cu.c[0])cu.lo=cu.c[0]-span;
  if(cu.hi<=cu.c[3])cu.hi=cu.c[3]+span;
}
function normalizeAttr(k){
  const id=eff(k),raw=LN[id],P=[];
  for(let i=0;i<N1;i++)for(const d of (TWO&&id==='ytd'?[S.T1]:[S.T0,S.T1])){const j=i*F+d;if(PRES[j]&&Number.isFinite(raw[j]))P.push(raw[j])}
  P.sort((a,b)=>a-b);POOL[k]=P;
  const cu=S.cut[k];
  if(!S.session&&(cu.auto||cu.line!==id)){cu.c=[.2,.4,.6,.8].map(q=>quant(P,q));cu.auto=true}
  if(!S.session){cu.lo=quant(P,.005);cu.hi=quant(P,.995)}
  cu.line=id;fixOrder(cu);
  const f=normFn(cu);
  for(let j=0;j<NF;j++)V[j*10+k]=PRES0[j]?f(raw[j]):0;
}
const SINT=[];for(let n=0;n<=64;n++){SINT[n]=new Float64Array(n);for(let m=0;m<n;m++)SINT[n][m]=Math.sin(2*Math.PI*m/n)}
function fourier(){
  const W=[5,63];
  for(let ax=0;ax<3;ax++)for(let w=0;w<2;w++){
    const out=LN[(w?'fl':'fs')+ax],Wn=W[w];out.fill(NaN);
    for(let i=0;i<N1;i++){
      const u=[];
      for(let d=0;d<F;d++){
        const j=i*F+d;
        if(!PRES[j]){u.length=0;continue}
        u.push(V[j*10+ax]);if(u.length>Wn)u.shift();
        if(!S.ghost&&d!==S.T0&&d!==S.T1)continue; /* only the two takes are read; every session in ghost mode */
        const n=u.length;if(n<3){out[j]=0;continue}
        let im=0;const sn=SINT[n];for(let m=0;m<n;m++)im-=u[m]*sn[m];
        out[j]=2*im/n;
      }
    }
  }
}
function collapse(){
  for(let d=0;d<F;d++){
    let s=0,n=0;
    for(let i=0;i<N1;i++){
      const j=i*F+d;if(!PRES0[j]){VI[j]=NaN;continue}
      let m=0;for(let k=0;k<9;k++)m+=TAU*(1+V[j*10+k]);
      VI[j]=m/9;if(PRES[j]){s+=VI[j];n++}
    }
    ZZ[d]=n?s/n:NaN;
  }
  const km=LN.km;
  for(let i=0;i<N1;i++)for(let d=0;d<F;d++){const j=i*F+d;km[j]=PRES0[j]?VI[j]-ZZ[d]:NaN}
}
/* Cardinals (Class 2): qualitative memberships, weighted by 20-session traded value */
const CTYPE=HK?HKCTYPE:GC?DATA.ctype:{sec:{label:'Secteur',key:'sec'},cty:{label:'Pays',key:'cty'},ind:{label:'Industrie',key:'ind'}};
const CTYS=Object.keys(CTYPE);
const CARDS=[];
if(HK)hkCards();else if(GC)gcCards();else ['sec','cty','ind'].forEach(ty=>{
  const g={};TK.forEach((t,i)=>{(g[t[CTYPE[ty].key]]=g[t[CTYPE[ty].key]]||[]).push(i)});
  Object.keys(g).sort((a,b)=>g[b].length-g[a].length||a.localeCompare(b)).forEach(nm=>CARDS.push({ty,name:nm,members:g[nm],mset:new Set(g[nm])}));
});
const NC=CARDS.length,CV=new Float32Array(NC*F*10),CP=new Uint8Array(NC*F),CW=new Float64Array(NC*F),CN=new Uint16Array(NC*F);
const cardOf=(i,ty)=>CARDS.findIndex(c=>c.ty===ty&&c.mset.has(i));
const CI=(HK||GC)?{}:{sec:TK.map((t,i)=>cardOf(i,'sec')),cty:TK.map((t,i)=>cardOf(i,'cty')),ind:TK.map((t,i)=>cardOf(i,'ind'))};
const CIX={};CARDS.forEach((c,ci)=>{if(c.cid)CIX[c.cid]=ci});
function cardinals(){
  const acc=new Float64Array(10);
  CARDS.forEach((c,ci)=>{for(let d=0;d<F;d++){
    acc.fill(0);let W=0,n=0;
    for(const i of c.members){const j=i*F+d;if(!PRES0[j]||(c.tk&&!c.tk[j]))continue;const w=wOf(j);W+=w;n++;for(let k=0;k<10;k++)acc[k]+=w*V[j*10+k]}
    const q=ci*F+d;CP[q]=n?1:0;CW[q]=W;CN[q]=n;
    for(let k=0;k<10;k++)CV[q*10+k]=n?acc[k]/W:0;
  }});
}
/* Class 3: each active container manifests the collapse of what it contains (same weighting as the cardinals) */
const C3V=new Float32Array(5*2*10),C3N=new Uint16Array(10);
const c3v=(z,ti)=>C3N[z*2+ti]?Array.from(C3V.subarray((z*2+ti)*10,(z*2+ti)*10+10)):null;
function containers(){
  C3V.fill(0);C3N.fill(0);
  [S.T0,S.T1].forEach((d,ti)=>{for(let z=0;z<5;z++){if(!C3ON[z])continue;const acc=new Float64Array(10);let W=0,n=0;
    for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j]||boxOf(V[j*10],V[j*10+1],V[j*10+2])!==z)continue;const w=wOf(j);W+=w;n++;for(let k=0;k<10;k++)acc[k]+=w*V[j*10+k]}
    C3N[z*2+ti]=n;for(let k=0;k<10;k++)C3V[(z*2+ti)*10+k]=n?acc[k]/W:0}});
}
/* Class 4 vivante (Éric, 10 Nov., 18 h 30, via YB1 v20.21: « in the core, everywhere »): one shared path for every system.
   rev. 23.9 — one set, one collapse (canon Z0, Éric 5 Nov.: « la moyenne de tout, calculée comme un seul ensemble »): the central
   object's ten attributes are the plain mean over the very set that gives its place, Z0 (Class 1 present; Class 2 of the active
   levels when « Z0 compte la Classe 2 » is ticked; the active, inhabited Class 3 containers when « Z0 compte la Classe 3 » is ticked).
   Its X, Y, Z are therefore Z0 itself: the body says what its place says. Before 23.9 the body used a traded-value weighting on
   Class 1 alone and could stand in Σ while showing φ⁻. Drift Δ = Z0(T₁) − Z0(T₀); centre-extérieur = mean distance of Class 1 to Z0. */
const C4V=new Float32Array(2*10),C4N=new Uint16Array(2),C4CE=new Float64Array(2);
function c4live(){
  C4V.fill(0);C4N.fill(0);C4CE.fill(NaN);
  [S.T0,S.T1].forEach((d,ti)=>{const acc=new Float64Array(10);let m=0,n=0,ce=0;const Z=ti?Z0B:Z0A;
    for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j])continue;n++;m++;for(let k=0;k<10;k++)acc[k]+=V[j*10+k];
      ce+=Math.hypot(V[j*10]-Z[0],V[j*10+1]-Z[1],V[j*10+2]-Z[2])}
    if(S.layers.z0c2)for(let c=0;c<NC;c++){if(!S.layers[CARDS[c].ty])continue;const q=c*F+d;if(!CP[q])continue;m++;for(let k=0;k<10;k++)acc[k]+=CV[q*10+k]}
    if(S.layers.z0c3)for(let z=0;z<5;z++){if(!(C3ON[z]&&C3N[z*2+ti]))continue;m++;for(let k=0;k<10;k++)acc[k]+=k<3?C3T[z]:C3V[(z*2+ti)*10+k]}
    C4N[ti]=n;for(let k=0;k<10;k++)C4V[ti*10+k]=m?acc[k]/m:0;C4CE[ti]=n?ce/n:NaN});
}
function rebuild(){
  const ax=[0,1,2].map(k=>LN[eff(k)]);
  for(let j=0;j<NF;j++){PRES0[j]=(Number.isFinite(ax[0][j])&&Number.isFinite(ax[1][j])&&Number.isFinite(ax[2][j]))?1:0;PRES[j]=PRES0[j]&&(!SCOPE||SCOPE[j])?1:0}
  for(let k=0;k<3;k++)normalizeAttr(k);
  if(S.mode==='fourier')fourier();
  for(let k=3;k<9;k++)normalizeAttr(k);
  collapse();
  normalizeAttr(9);
  cardinals();
  containers();
  z0Compute();
  c4live();
  spacingTakes();
  buildTrail();
  buildGhost();
  buildThrowWin();THR.d=-1;
  dirty=true;
}

/* ---------------- Formatting ---------------- */
const CUR=SYS.cur||'$'; /* display unit only: '$' for the Americas, '¥' for Tokyo */
function usd(x){return x>=1e9?(x/1e9).toFixed(2)+' G'+CUR:x>=1e6?(x/1e6).toFixed(1)+' M'+CUR:x.toFixed(0)+' '+CUR}
function qty(x){return x>=1e9?(x/1e9).toFixed(2)+' G':x>=1e6?(x/1e6).toFixed(2)+' M':x>=1e3?(x/1e3).toFixed(1)+' k':x.toFixed(0)}
function fmt(id,x){
  if(!Number.isFinite(x))return 'n/d';
  switch(LINEINFO[id].fmt){
    case 'pct':return (x*100).toFixed(2)+' %';
    case 'usdlog':return usd(Math.pow(10,x));
    case 'pricelog':return Math.pow(10,x).toFixed(2)+' '+CUR;
    case 'qtylog':return qty(Math.pow(10,x))+' titres';
    case 'int':return Math.round(x).toLocaleString('fr-CA');
    case 'sint':return (x>0?'+':x<0?'−':'')+Math.abs(Math.round(x));
    case 'dec2':return x.toFixed(2).replace('.',',');
    case 'dec3':return x.toFixed(3).replace('.',',');
    case 'pctf':return (x*100).toFixed(1).replace('.',',')+' %';
    case 'toi':{const m=Math.floor(x/60),z=Math.floor(x-m*60);return m+' min '+String(z).padStart(2,'0')+' s'}
    case 'yrs':return x.toFixed(1).replace('.',',')+' ans';
    case 'cm':return x.toFixed(0)+' cm';
    case 'kg':return x.toFixed(1).replace('.',',')+' kg';
    case 'db':return x.toFixed(1).replace('.',',').replace('-','−')+' dB';
    case 'bpm':return Math.round(x)+' BPM';
    default:return (x>=0?'+':'')+x.toFixed(5);
  }
}
const f8=x=>Number.isFinite(x)?x.toFixed(8):'—';
const sgn=x=>(x>=0?'+':'')+x.toFixed(3);

/* ---------------- Scene ---------------- */
const stage=$('stage');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setClearColor(0x05080d,1);
stage.insertBefore(renderer.domElement,stage.firstChild);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x05080d,10,24);
const WORLD=new THREE.Group();scene.add(WORLD); /* everything positional lives here; the Volume knob scales it */
scene.add(new THREE.AmbientLight(0xffffff,.55));{const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(3,7,5);scene.add(dl);const dl2=new THREE.DirectionalLight(0xa6dcff,.25);dl2.position.set(-4,-3,-5);scene.add(dl2);}
const camera=new THREE.PerspectiveCamera(40,1,.05,100);
const HOME={p:new THREE.Vector3(0,5.7,8.9),t:new THREE.Vector3(0,-.2,0)};
camera.position.copy(HOME.p);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.08;controls.target.copy(HOME.t);controls.minDistance=.8;controls.maxDistance=20;
/* A click or a double-tap must not orbit, and must not zoom the page.
   Rotation starts only after the pointer has actually moved. */
renderer.domElement.style.touchAction='none';
{
  let arm=null;
  renderer.domElement.addEventListener('pointerdown',e=>{
    if(e.button===0||e.pointerType==='touch') arm=[e.clientX,e.clientY,e.pointerId];
  },true);
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!arm||e.pointerId!==arm[2]) return;
    if(e.pointerType!=='touch'&&e.buttons===0){arm=null;return}
    if(Math.hypot(e.clientX-arm[0],e.clientY-arm[1])<10) e.stopImmediatePropagation();
  },true);
  const clear=()=>{arm=null};
  renderer.domElement.addEventListener('pointerup',clear,true);
  renderer.domElement.addEventListener('pointercancel',clear,true);
  renderer.domElement.addEventListener('contextmenu',e=>{e.preventDefault()});
}
function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
const ro=new ResizeObserver(resize);ro.observe(stage);resize();

const W3=(a,r,y)=>new THREE.Vector3(r*Math.sin(a),y,-r*Math.cos(a));
const DMIN=2*Math.PI/720; /* one minute of the 12-hour dial: +1 sits at 11:59, −1 at 12:01, noon is the phase boundary */
const AZ=X=>Math.PI+X*(Math.PI-DMIN);
const C3T=[-1,-.4,0,.4,1]; /* Class 3 containers on the diagonal X = Y = Z: Ω (−1,−1,−1), φ⁻, Σ (0,0,0), φ⁺, α (+1,+1,+1) */
const c3xyz=z=>{const t=C3T[z],f=v=>(v>0?'+':v<0?'−':'')+String(Math.abs(v)).replace('.',',');return '('+f(t)+', '+f(t)+', '+f(t)+')'};
const boxOf=(X,Y,Z)=>zoneOf((X+Y+Z)/3);
const C3ROLE=['queue du serpent','','ventre du système','','tête du serpent'];
const C3ON=[true,false,true,false,true],C3SYM=['Ω','λ⁻','Σ','λ⁺','α']; /* λ traps in the φ fields: placed, not activated */
function ring(r,y,col,op,dashed){
  const pts=[];for(let s=0;s<=192;s++)pts.push(W3(s/192*Math.PI*2,r,y));
  const g=new THREE.BufferGeometry().setFromPoints(pts);
  const m=dashed?new THREE.LineDashedMaterial({color:col,transparent:true,opacity:op,dashSize:.06,gapSize:.06}):new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op});
  const l=new THREE.Line(g,m);if(dashed)l.computeLineDistances();return l;
}
function seg(pts,col,op){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op}))}
function label(text,col,h,weight){
  const c=document.createElement('canvas'),g=c.getContext('2d'),fs=48;
  g.font=`${weight||500} ${fs}px "IBM Plex Mono", ui-monospace, monospace`;
  const w=Math.ceil(g.measureText(text).width)+16;c.width=w;c.height=fs+18;
  g.font=`${weight||500} ${fs}px "IBM Plex Mono", ui-monospace, monospace`;g.fillStyle=col;g.textBaseline='middle';g.fillText(text,8,c.height/2+2);
  const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));
  sp.scale.set(h*c.width/c.height,h,1);sp.renderOrder=5;return sp;
}

/* Boundaries of the cuboidal toroid */
const G={bounds:new THREE.Group(),c3:new THREE.Group(),c4:new THREE.Group(),trails:new THREE.Group(),links:new THREE.Group()};
Object.values(G).forEach(g=>WORLD.add(g));
[[1,1],[1,-1],[3,1],[3,-1]].forEach(([r,y])=>G.bounds.add(ring(r,y,0x3a5272,.75)));
G.bounds.add(ring(2,0,0x2b4466,.55));G.bounds.add(ring(2,1,0x1c2a3c,.5));G.bounds.add(ring(2,-1,0x1c2a3c,.5));
[-.6,-.2,.2,.6].forEach(y=>{G.bounds.add(ring(1,y,0x223349,.55,true));G.bounds.add(ring(3,y,0x223349,.55,true))});
[1.4,1.8,2.2,2.6].forEach(r=>G.bounds.add(ring(r,-1,0x223349,.55,true)));
function wall(X,col,op,aAbs){const a=aAbs!=null?aAbs:AZ(X);G.bounds.add(seg([W3(a,1,-1),W3(a,3,-1),W3(a,3,1),W3(a,1,1),W3(a,1,-1)],col,op))}
[-.6,-.2,.2,.6].forEach(X=>wall(X,0x2b4466,.7));
wall(0,0xe8c872,.9,0);
for(let h=1;h<=12;h++){const a=h/12*Math.PI*2,lb=label(String(h),h===12?'#e8c872':'#5c6a82',.2);lb.position.copy(W3(a,3.42,-1));G.bounds.add(lb);
  G.bounds.add(seg([W3(a,3.02,-1),W3(a,3.16,-1)],0x3a5272,.8));}
{

 const p=W3(Math.PI,2,0),s=.09;
 G.bounds.add(seg([p.clone().add(new THREE.Vector3(-s,0,0)),p.clone().add(new THREE.Vector3(s,0,0))],0xa6dcff,.9));
 G.bounds.add(seg([p.clone().add(new THREE.Vector3(0,-s,0)),p.clone().add(new THREE.Vector3(0,s,0))],0xa6dcff,.9));
 G.bounds.add(seg([p.clone().add(new THREE.Vector3(0,0,-s)),p.clone().add(new THREE.Vector3(0,0,s))],0xa6dcff,.9));}

/* Hit material: invisible but pickable */
const HITMAT=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});HITMAT.colorWrite=false;
const HITS=[];
function hitSphere(r,ref){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),HITMAT);m.userData.ref=ref;HITS.push(m);return m}

/* Class 4 — the central object (Éric, 10 Nov., 22 h 51: « we were supposed to create the central object »; YB1 v20.21:
   « push it everywhere, it has to be in the core »). Rev. 23.10 (Éric, 10 Nov., 23 h 17: « so far, we did not establish the position
   in space for our central object. It only reacts to the collapse of the physical and angular attributes »): it stays in its reserved
   space, the hollow centre of the chamber (radius < 1, where no Class 1, 2 or 3 object can go), carries Z-ZERO, and only reacts.
   Éric, 23 h 20: the reserved space is a microcosm of the entire space; a provisional space will be projected from it — not yet.
   Size 0,4 (canon). One path in the core: every anchor, every future floor. */
const core=new THREE.Group();G.c4.add(core);
/* rev. 23.11 (Éric, 11 Nov., 5 h 32: « the central object I see still has a shape around it. Correct it. Make sure it has four times
   the size of a class one object. Push it to the top »): no cage, no envelope. The body that manifests the collapse IS the central
   object; its size is four times that of a Class 1 object (set below, once the Class 1 size is known); it is drawn over everything. */
/* rev. 23.8 (Éric, 11 Nov.: « make sure you have it for the central object everywhere, pushed to the top »): the central object
   is drawn last, in its own pass after the depth is cleared, so nothing in the chamber (Σ, containers, objects) can hide it. Same path on every floor.
   Its hit sphere stays on layer 0 so the pointer still finds it. */
function coreTop(){
  core.traverse(o=>{if(o.material!==HITMAT)o.layers.set(1)});
  camera.layers.set(0);renderer.render(scene,camera);
  if(G.c4.visible){const ac=renderer.autoClear;renderer.autoClear=false;renderer.clearDepth();camera.layers.set(1);renderer.render(scene,camera);renderer.autoClear=ac;camera.layers.set(0)}
}
const C4O=(()=>{const orient=new THREE.Group(),spin=new THREE.Group(),body=new THREE.Group();core.add(orient);orient.add(spin);spin.add(body);
  return {kind:4,idx:0,R:.2,root:core,orient,spin,body,a:0,shape:-1,spinA:0,
    faceMat:new THREE.MeshBasicMaterial({color:0xe8c872,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}),
    edgeMat:new THREE.LineBasicMaterial({color:0xe8c872,transparent:true,opacity:.95})}})();


/* Class 3 — the five fixed containers, on the diagonal X = Y = Z (Ω at −1,−1,−1 · Σ at 0,0,0 · α at +1,+1,+1) */
/* rev. 23.16 — Microcosm (Éric, 10 Nov., 23 h 20: « the space given inside the reserved space for the central object is a microcosm
   of the entire space »; Canon: « tout s'emboîte dans tout », the same rule at every scale). The whole chamber is folded into the
   reserved space, between the central object (radius 0,4) and the inner wall: radius r → 0,46 + (r − 1) × 0,24, height × 0,3, same
   azimuth. Every rendered object is one point of its own colour; the five containers keep their zone colour. A mirror only: it places
   nothing and projects nothing yet (provisional space: OPEN). Its own layer, off on opening. */
const MICRO=new THREE.Group();G.c4.add(MICRO);MICRO.visible=false;
const mR=r=>.46+(r-1)*.24,mY=y=>y*.3;
const microGeo=new THREE.BufferGeometry();
{const nM=N1+64000;microGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array((N1+600)*3),3));microGeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array((N1+600)*3),3));}
const microPts=new THREE.Points(microGeo,new THREE.PointsMaterial({size:.05,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,sizeAttenuation:true}));
microPts.frustumCulled=false;MICRO.add(microPts);
[[1,1],[1,-1],[3,1],[3,-1]].forEach(([r,y])=>MICRO.add(ring(mR(r),mY(y),0x8a7434,.7)));
const MCOL=new THREE.Color();
function microFrame(){
  MICRO.visible=!!(S.layers.micro&&S.layers.c4);if(!MICRO.visible)return;
  const P=microGeo.attributes.position.array,Cc=microGeo.attributes.color.array,cap=P.length/3;let m=0;
  const put=(q,c)=>{if(m>=cap)return;const r=Math.hypot(q.x,q.z)||1,k=mR(Math.max(1,Math.min(3,r)))/r;
    P[m*3]=q.x*k;P[m*3+1]=mY(Math.max(-1,Math.min(1,q.y)));P[m*3+2]=q.z*k;Cc[m*3]=c.r;Cc[m*3+1]=c.g;Cc[m*3+2]=c.b;m++};
  O1.forEach(o=>{if(o.root.visible)put(o.root.position,o.faceMat.color)});
  O2.forEach(o=>{if(o.root.visible)put(o.root.position,o.faceMat.color)});
  if(S.layers.c3)C3.forEach((g,z)=>put(g.position,MCOL.set(ZCOL[z])));
  microGeo.setDrawRange(0,m);microGeo.attributes.position.needsUpdate=true;microGeo.attributes.color.needsUpdate=true;
  if(window.__C4LIVE)window.__C4LIVE.micro=m;
}
const C3=[],C3O=[];
let C3DIAG=null; /* rev. 23.12: the dashed diagonal Ω–Σ–α is a line between objects: its own layer, off on opening */
{const pts=[];for(let s=0;s<=240;s++){const t=-1+2*s/240;pts.push(W3(AZ(t),2-t,t))}
 const g=new THREE.BufferGeometry().setFromPoints(pts),l=C3DIAG=new THREE.Line(g,new THREE.LineDashedMaterial({color:0xa6dcff,transparent:true,opacity:.45,dashSize:.05,gapSize:.05}));l.computeLineDistances();G.c3.add(l);}
for(let z=0;z<5;z++){
  const t=C3T[z],p=W3(AZ(t),2-t,t),g=new THREE.Group();g.position.copy(p);
  if(C3ON[z]){
    const orient=new THREE.Group(),spin=new THREE.Group(),body=new THREE.Group();g.add(orient);orient.add(spin);spin.add(body);
    C3O[z]={kind:3,idx:z,R:.3,root:g,orient,spin,body,a:AZ(t),shape:-1,spinA:0,
      faceMat:new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}),
      edgeMat:new THREE.LineBasicMaterial({color:ZCOL[z],transparent:true,opacity:.85})};
    const id=ring(1,0,ZCOL[z],.7);id.scale.set(.4,1,.4);g.add(id);
  } else {const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(.3,1)),new THREE.LineDashedMaterial({color:0x8b98ad,transparent:true,opacity:.35,dashSize:.025,gapSize:.03}));e.computeLineDistances();g.add(e);}
  const lb=label(C3SYM[z],C3ON[z]?ZCOL[z]:'#8b98ad',C3ON[z]?.2:.16);lb.position.set(0,0,0);g.add(lb);
  g.add(hitSphere(.33,{kind:3,idx:z}));
  G.c3.add(g);C3.push(g);
}

/* Shapes by zone: Ω merkaba, φ⁻ octahedron, Σ cube, φ⁺ tetrahedron, α dodecahedron */
const GEO={};
const VTXM=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,1,1).normalize(),new THREE.Vector3(0,1,0)));
function geo(z,R){
  const key=z+':'+R;if(GEO[key])return GEO[key];
  let faces;
  if(z===0){const a=new THREE.TetrahedronGeometry(R),b=new THREE.TetrahedronGeometry(R);b.rotateZ(Math.PI/2);faces=[a,b]}
  else if(z===1)faces=[new THREE.OctahedronGeometry(R)];
  else if(z===2){const s=2*R/Math.sqrt(3);faces=[new THREE.BoxGeometry(s,s,s)]}
  else if(z===3)faces=[new THREE.TetrahedronGeometry(R)];
  else faces=[new THREE.DodecahedronGeometry(R)];
  /* Rotation axis (Éric, v20.2): through the vertices, never the faces. Dodecahedron α vertex to opposite vertex; merkaba Ω tip to tip;
     tetrahedron φ⁺ vertex up, rolling on its base; octahedron φ⁻ already vertex to vertex; cube Σ alone sits flat on a face. */
  if(z===0||z===3||z===4)faces.forEach(f=>f.applyMatrix4(VTXM));
  return GEO[key]={faces,edges:faces.map(f=>new THREE.EdgesGeometry(f))};
}
const LV={stretch:[.55,.78,1,1.28,1.6],pitch:[-32,-16,0,16,32].map(x=>x*Math.PI/180),roll:[-32,-16,0,16,32].map(x=>x*Math.PI/180),spin:[-2.4,-1,0,1,2.4],sat:[.06,.3,.55,.8,1]};
const DENS=(N1+NC+5)>1234?Math.sqrt(1234/(N1+NC+5)):1;
C4O.R=4*(.1*DENS); /* rev. 23.11: the central object = four times a Class 1 object (Class 1 = 0,1 × DENS) */
core.add(hitSphere(C4O.R*1.15,{kind:4}));
/* Finance stays the opening Class 4. Art and Sports are siblings beside the
   galaxy: they are not members, so they never enter its aggregate or its drift. */
if(SYS.id==='world'){
  const fin=label('Finance','#e8c872',.26,500);
  fin.position.set(0,C4O.R+.32,0);
  core.add(fin);
  function sibling(id,text,color,note,x,y,z){
    const g=new THREE.Group();g.position.set(x,y,z);
    const R=C4O.R;
    const face=new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide});
    const edge=new THREE.LineBasicMaterial({color:color,transparent:true,opacity:.95});
    const geo=new THREE.DodecahedronGeometry(R);
    g.add(new THREE.Mesh(geo,face));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),edge));
    const lb=label(text,'#e6f2ff',.3,500);lb.position.set(0,R+.28,0);g.add(lb);
    g.add(hitSphere(R*1.45,{kind:4,side:id,label:text,note:note}));
    WORLD.add(g);
  }
  /* Above the chamber (height stops at 1) so a narrow phone still shows them beside Finance. */
  sibling('art','Art',0xb388ff,'Musique · Spotify 2021 · [INCOMPLET] un seul instantané',-1.45,2.35,.2);
  sibling('sports','Sports',0x4fa7ff,'LNH · 2024-25 → 2025-26',1.45,2.35,.2);
}
function makeObj(kind,idx){
  const R=(kind===1?.1:.2)*DENS;
  const root=new THREE.Group(),orient=new THREE.Group(),spin=new THREE.Group(),body=new THREE.Group();
  root.add(orient);orient.add(spin);spin.add(body);
  const faceMat=kind===1?new THREE.MeshStandardMaterial({color:0xffffff,flatShading:true,metalness:.05,roughness:.55,transparent:true,opacity:1})
    :new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide});
  const edgeMat=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:1});
  const hit=hitSphere(R*1.55,{kind,idx});root.add(hit);
  const o={kind,idx,R,root,orient,spin,body,faceMat,edgeMat,hit,shape:-1,spinA:Math.random()*6.28,cur:null};
  if(kind===2){
    const c=CARDS[idx];
    o.halo=ring(1,0,0xa6dcff,.55);o.halo.scale.set(R*1.9,1,R*1.9);root.add(o.halo);
    /* the identifier sits inside the object, not beside it (règle commune 1) */
    const lb=label((HK||GC)?c.short:(c.ty==='sec'?'':c.ty==='cty'?'◇ ':'· ')+c.name,'#e6f2ff',.1,500),asp=lb.scale.x/lb.scale.y,hh=Math.min(R*.36,1.8*R/asp);
    lb.scale.set(hh*asp,hh,1);lb.position.set(0,0,0);lb.material.depthTest=false;lb.renderOrder=8;o.label=lb;root.add(lb);
  }
  WORLD.add(root);return o;
}
function setShape(o,z){
  if(o.shape===z)return;o.shape=z;
  while(o.body.children.length)o.body.remove(o.body.children[0]);
  const g=geo(z,o.R);
  g.faces.forEach(f=>o.body.add(new THREE.Mesh(f,o.faceMat)));
  g.edges.forEach(e=>o.body.add(new THREE.LineSegments(e,o.edgeMat)));
}
const O1=TK.map((t,i)=>makeObj(1,i));
const O2=CARDS.map((c,i)=>makeObj(2,i));

/* Cardinal trails (they lead the dance) */
const TRL=48;
const trails=CARDS.map(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRL*3),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xa6dcff,transparent:true,opacity:.32}));G.trails.add(l);return l});
/* Links: chain from a selection to its cardinals or members */
const LCAP=(HK||GC)?Math.max(260,(N1+NC)*2+4):260;
const linkGeo=new THREE.BufferGeometry();linkGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(LCAP*3),3));
const links=new THREE.LineSegments(linkGeo,new THREE.LineBasicMaterial({color:0xe8c872,transparent:true,opacity:.4}));G.links.add(links);
/* LNH: club ↔ club links, one per off-season move (last club of T₀ → first club of T₁), from the old club (amber) to the new (blue) */
const XF=[];if(HK)TK.forEach((t,i)=>{if(t.cl[0]&&t.cl[1]){const a=t.cl[0][t.cl[0].length-1],b=t.cl[1][0];if(a!==b)XF.push({i,a:CIX['club:'+a],b:CIX['club:'+b]})}});
const xGeo=new THREE.BufferGeometry();xGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(Math.max(2,XF.length*2)*3),3));
{const col=new Float32Array(Math.max(2,XF.length*2)*3),A=new THREE.Color('#ffb347'),B=new THREE.Color('#a6dcff');for(let k=0;k<XF.length;k++){col.set([A.r,A.g,A.b],k*6);col.set([B.r,B.g,B.b],k*6+3)}xGeo.setAttribute('color',new THREE.BufferAttribute(col,3))}
const xhGeo=xGeo.clone();
const xLines=new THREE.LineSegments(xGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.22,depthWrite:false}));xLines.visible=false;G.links.add(xLines);
const xHi=new THREE.LineSegments(xhGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,depthWrite:false}));xHi.visible=false;G.links.add(xHi);
function applyXfer(){
  if(!HK||!S.layers.xfer){xLines.visible=xHi.visible=false;return}
  const P=xGeo.attributes.position.array,Ph=xhGeo.attributes.position.array,s=S.sel;let n=0,m=0;
  for(const x of XF){const oa=O2[x.a],ob=O2[x.b];if(!oa.root.visible||!ob.root.visible)continue;
    const hi=s&&((s.kind===2&&(s.idx===x.a||s.idx===x.b))||(s.kind===1&&s.idx===x.i)),pa=oa.root.position,pb=ob.root.position,A=hi?Ph:P,k=hi?m++:n++;
    A[k*6]=pa.x;A[k*6+1]=pa.y;A[k*6+2]=pa.z;A[k*6+3]=pb.x;A[k*6+4]=pb.y;A[k*6+5]=pb.z}
  xGeo.setDrawRange(0,n*2);xhGeo.setDrawRange(0,m*2);xGeo.attributes.position.needsUpdate=true;xhGeo.attributes.position.needsUpdate=true;
  xLines.visible=n>0;xHi.visible=m>0;xLines.material.opacity=s&&(s.kind===1||s.kind===2)?.08:.22;
}
/* LNH: the transfer trail (Éric, 10 Nov.). A player who changes club stays the same object; only the logo inside it changes,
   and his trail from T₀ stays drawn behind him, amber at the old club's take, blue toward the new one. */
const PTS=14,PTR=XF.map(x=>x.i),PTC=XF.map(x=>[x.a,x.b]);
function ptMake(op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(Math.max(1,PTR.length)*PTS*6),3));
  const col=new Float32Array(Math.max(1,PTR.length)*PTS*6),A=new THREE.Color('#ffb347'),B=new THREE.Color('#a6dcff'),c=new THREE.Color();
  for(let k=0;k<PTR.length;k++)for(let s=0;s<PTS;s++){c.copy(A).lerp(B,s/PTS);col.set([c.r,c.g,c.b],(k*PTS+s)*6);c.copy(A).lerp(B,(s+1)/PTS);col.set([c.r,c.g,c.b],(k*PTS+s)*6+3)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:op,depthWrite:false}));l.visible=false;G.links.add(l);return l}
const ptLines=ptMake(.42),ptHi=ptMake(1);
const _pp={x:0,y:0,z:0};
function hkPosAt(i,d0,d1,u,out){const b=i*F;if(!PRES[b+d0]||!PRES[b+d1])return false;const A=(b+d0)*10,B=(b+d1)*10;
  const X=zp(V,A,B,d0,d1,u,0),Y=zp(V,A,B,d0,d1,u,1),Z=zp(V,A,B,d0,d1,u,2),a=AZ(X),r=2-Z;out.x=r*Math.sin(a);out.y=Y;out.z=-r*Math.cos(a);
  if(S.layers.spacing&&!S.ghost){const q=i*6;out.x+=OFF1[q]*(1-u)+OFF1[q+3]*u;out.y+=OFF1[q+1]*(1-u)+OFF1[q+4]*u;out.z+=OFF1[q+2]*(1-u)+OFF1[q+5]*u}return true}
function applyPTrail(){
  if(!HK||!S.layers.ptrail||!PTR.length){ptLines.visible=ptHi.visible=false;return}
  const d0=S.T0,d1=S.T1,t=S.ghost?Math.max(0,Math.min(1,gCur()-d0)):S.prog,s=S.sel;
  const P=ptLines.geometry.attributes.position.array,Q=ptHi.geometry.attributes.position.array;let n=0,m=0;
  if(t>0)for(let k=0;k<PTR.length;k++){const i=PTR[k],o=O1[i];if(!o.root.visible)continue;
    const hi=s&&((s.kind===1&&s.idx===i)||(s.kind===2&&(s.idx===PTC[k][0]||s.idx===PTC[k][1])));
    const A=hi?Q:P;let q=hi?m:n,ok=true,px,py,pz;
    for(let j=0;j<=PTS&&ok;j++){ok=hkPosAt(i,d0,d1,t*j/PTS,_pp);if(!ok)break;
      if(j===PTS){_pp.x=o.root.position.x;_pp.y=o.root.position.y;_pp.z=o.root.position.z}
      if(j>0){const b=(q*PTS+j-1)*6;A[b]=px;A[b+1]=py;A[b+2]=pz;A[b+3]=_pp.x;A[b+4]=_pp.y;A[b+5]=_pp.z}px=_pp.x;py=_pp.y;pz=_pp.z}
    if(ok){if(hi)m++;else n++}}
  ptLines.geometry.setDrawRange(0,n*PTS*2);ptHi.geometry.setDrawRange(0,m*PTS*2);
  ptLines.geometry.attributes.position.needsUpdate=ptHi.geometry.attributes.position.needsUpdate=true;
  ptLines.visible=n>0;ptHi.visible=m>0;ptLines.material.opacity=s&&(s.kind===1||s.kind===2)?.12:.42;
}
/* Year path of the selection */
const pathGeo=new THREE.BufferGeometry();pathGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(F*3),3));
const yearPath=new THREE.Line(pathGeo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.35}));WORLD.add(yearPath);
let pathN=0,pathD0=0;
/* Ghost (Fantôme) v19: ghosts laid at equal steps of the clock column's cumulative amount, all of one size; cardinal trails drawn session by session. */
const GHOST={};
{
  const g=new THREE.BufferGeometry();
  GHOST.cap=0;
  g.setDrawRange(0,0);
  const m=new THREE.ShaderMaterial({
    uniforms:{uCur:{value:0},uT0:{value:0},uTau:{value:0},uGain:{value:.5},uScale:{value:600},uSel:{value:-1},uD:{value:.01},uPx:{value:1.6}},
    vertexShader:`attribute float aDay;attribute vec3 aCol;attribute float aTk;attribute float aOut;
uniform float uCur;uniform float uT0;uniform float uTau;uniform float uGain;uniform float uScale;uniform float uSel;uniform float uD;uniform float uPx;
varying vec3 vCol;varying float vA;varying float vPs;varying float vOut;
void main(){
  float age=uCur-aDay;vCol=aCol;vOut=aOut;
  if(age<-0.0001||aDay<uT0-0.0001){gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=0.0;vA=0.0;vPs=0.0;return;}
  float a=uGain*(uTau>0.0?exp(-age/uTau):1.0);
  if(uSel>-0.5){a=abs(aTk-uSel)<0.5?min(1.0,max(a,0.08)*2.2):a*0.22;}
  vA=a;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_Position=projectionMatrix*mv;
  float ps=max(uPx,uD*uScale/max(0.001,-mv.z));
  gl_PointSize=ps;vPs=ps;
}`,
    fragmentShader:`varying vec3 vCol;varying float vA;varying float vPs;varying float vOut;
void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=length(p);if(r>1.0||vA<0.002)discard;
  float aa=min(0.5,2.0/max(1.0,vPs));float e=1.0-smoothstep(1.0-aa,1.0,r);
  float b=0.62+0.38*(1.0-r*r);
  if(vOut>0.5){float w=max(0.34,1.6/max(1.0,vPs));b=smoothstep(1.0-w-aa,1.0-w,r);} /* outside the law: hollow */
  gl_FragColor=vec4(vCol,clamp(vA*e*b,0.0,1.0));}`,
    transparent:true,depthWrite:false,blending:THREE.NormalBlending});
  GHOST.pts=new THREE.Points(g,m);GHOST.pts.frustumCulled=false;GHOST.pts.visible=false;GHOST.pts.renderOrder=2;WORLD.add(GHOST.pts);
  const ns=Math.max(2,NC*Math.max(0,F-1)*2),tg=new THREE.BufferGeometry();
  [['position',3],['aOther',3],['aDay',1],['aOD',1],['aCol',3],['aTy',1],['aCi',1]].forEach(([k,w])=>tg.setAttribute(k,new THREE.BufferAttribute(new Float32Array(ns*w),w)));
  tg.setDrawRange(0,0);
  const tm=new THREE.ShaderMaterial({
    uniforms:{uCur:{value:0},uT0:{value:0},uTau:{value:20},uOp:{value:.75},uTy:{value:new THREE.Vector3(1,1,0)},uSel:{value:-1}},
    vertexShader:`attribute vec3 aOther;attribute float aDay;attribute float aOD;attribute vec3 aCol;attribute float aTy;attribute float aCi;
uniform float uCur;uniform float uT0;uniform float uTau;uniform float uOp;uniform vec3 uTy;uniform float uSel;
varying vec3 vCol;varying float vA;
void main(){
  vec3 p=position;float a=uOp;float lo=min(aDay,aOD);vCol=aCol;
  if(lo<uT0-0.5||lo>uCur){a=0.0;}
  else if(aDay>uCur){p=mix(aOther,position,clamp((uCur-aOD)/max(0.001,aDay-aOD),0.0,1.0));}
  float age=max(0.0,uCur-min(aDay,uCur));
  float fade=uTau>0.0?max(0.16,exp(-age/(uTau*2.0))):1.0;
  float on=aTy<0.5?uTy.x:(aTy<1.5?uTy.y:uTy.z);
  a*=fade*on;
  if(uSel>-0.5){a*=abs(aCi-uSel)<0.5?1.6:0.25;}
  vA=a;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`,
    fragmentShader:`varying vec3 vCol;varying float vA;
void main(){if(vA<0.003)discard;gl_FragColor=vec4(vCol,min(1.0,vA));}`,
    transparent:true,depthWrite:false});
  GHOST.trl=new THREE.LineSegments(tg,tm);GHOST.trl.frustumCulled=false;GHOST.trl.visible=false;GHOST.trl.renderOrder=1;WORLD.add(GHOST.trl);
}
/* Real ghosts (Éric, 9 Nov.): a ghost is a faint copy of the object itself — its shape, colour, saturation, stretch and tilts
   at that point of its path — at the canon size of the object. The clock column (volume first) sets only how densely the
   copies appear along the line. Ghosts carry no symbol and no information: those stay with the leading object.
   Thrown ghosts (the throw ahead) are drawn hollow: edges only. */
function makeReps(){
  const U={uCur:{value:0},uT0:{value:0},uTau:{value:0},uGain:{value:.5},uSel:{value:-1},uSize:{value:1},uAll:{value:0}};
  const VS=`attribute vec3 iPos;attribute vec4 iQ;attribute float iS;attribute vec3 iCol;attribute float aDay;attribute float aTk;attribute float aOut;attribute float aOrg;attribute float aVol;
uniform float uCur;uniform float uT0;uniform float uTau;uniform float uGain;uniform float uSel;uniform float uSize;uniform float uFace;uniform float uAll;
varying vec3 vCol;varying float vA;
vec3 qrot(vec4 q,vec3 v){return v+2.0*cross(q.xyz,cross(q.xyz,v)+q.w*v);}
void main(){
  float age=uCur-aDay;
  bool hide=(uAll<0.5&&(age<-0.0001||aDay<uT0-0.0001))||(uFace>0.5&&aOut>0.5);
  if(hide){gl_Position=vec4(2.0,2.0,2.0,1.0);vA=0.0;vCol=vec3(0.0);return;}
  float a=uGain*((uAll<0.5&&uTau>0.0)?exp(-age/uTau):1.0);
  /* Gradient (Grok spec, 9 Nov.): the head is the brightest, the light fades back to the origin, the faintest mark that is still visible.
     If the trail fades correctly from head to origin, the Z0 transposition is coherent: the gradient is the built-in check. */
  float g=1.0;if(uAll<0.5){float span=max(0.001,uCur-aOrg);g=mix(0.1,1.0,clamp((aDay-aOrg)/span,0.0,1.0));}
  a*=g*aVol;
  if(uSel>-0.5){a=abs(aTk-uSel)<0.5?min(1.0,max(a,0.12)*2.2):a*0.22;}
  vA=a*(uFace>0.5?0.3:1.0);vCol=iCol*(0.35+0.65*g);
  vec3 p=position*uSize;p.y*=iS;p=qrot(iQ,p)+iPos;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;
  const FS=`varying vec3 vCol;varying float vA;void main(){if(vA<0.004)discard;gl_FragColor=vec4(vCol,min(1.0,vA));}`;
  const mf=new THREE.ShaderMaterial({uniforms:Object.assign({},U,{uFace:{value:1}}),vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const me=new THREE.ShaderMaterial({uniforms:Object.assign({},U,{uFace:{value:0}}),vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false});
  const R=.1*DENS,set={U,zones:[],group:new THREE.Group(),n:0};WORLD.add(set.group);set.group.visible=false;
  for(let z=0;z<5;z++){const g=geo(z,R),Z={objs:[]};
    const mk=(base,isFace)=>{const ig=new THREE.InstancedBufferGeometry();if(base.index)ig.setIndex(base.index);ig.setAttribute('position',base.attributes.position);ig.instanceCount=0;
      const o=isFace?new THREE.Mesh(ig,mf):new THREE.LineSegments(ig,me);o.frustumCulled=false;o.renderOrder=isFace?1:2;set.group.add(o);Z.objs.push(o)};
    g.faces.forEach(f=>mk(f,true));g.edges.forEach(e=>mk(e,false));set.zones.push(Z)}
  const AT={iPos:3,iQ:4,iS:1,iCol:3,aDay:1,aTk:1,aOut:1,aOrg:1,aVol:1};
  set.fill=function(list){
    const per=[[],[],[],[],[]];for(let k=0;k<list.n;k++){const z=list.zone(k);if(z>=0)per[z].push(k)}set.n=0;
    const o={pos:[0,0,0],q:[0,0,0,1],s:1,col:[1,1,1],day:0,tk:0,out:0,org:0,vol:1};
    per.forEach((ix,z)=>{const n=ix.length,A={};set.n+=n;
      Object.keys(AT).forEach(key=>{A[key]=new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,n)*AT[key]),AT[key])});
      ix.forEach((k,m)=>{list.get(k,o);A.iPos.array.set(o.pos,m*3);A.iQ.array.set(o.q,m*4);A.iS.array[m]=o.s;A.iCol.array.set(o.col,m*3);A.aDay.array[m]=o.day;A.aTk.array[m]=o.tk;A.aOut.array[m]=o.out;A.aOrg.array[m]=o.org;A.aVol.array[m]=o.vol});
      set.zones[z].objs.forEach(ob=>{const g=ob.geometry;Object.keys(A).forEach(key=>g.setAttribute(key,A[key]));g.instanceCount=n});
    });
  };
  return set;
}
const REP=makeReps(),THRREP=makeReps(),EMPTYL={n:0,zone:()=>-1,get:()=>{}};
/* Large systems: the copies unfold for the chosen stock, or for the members of the chosen Class 2 object. */
function repAllow(){if(N1<=150)return null;const s=S.sel;return new Set(s&&s.kind===1?[s.idx]:s&&s.kind===2?CARDS[s.idx].members:[])}
function buildReplicas(){
  const rp=GHOST.rep;if(!rp||!S.ghost){REP.fill(EMPTYL);return}
  const allow=repAllow(),q=new THREE.Quaternion(),e=new THREE.Euler();
  const ORG=new Float32Array(N1);for(let i=0;i<N1;i++){let d=S.T0;while(d<=S.T1&&!PRES[i*F+d])d++;ORG[i]=d} /* each trail's origin */
  REP.fill({n:rp.n,
    zone:k=>{if(allow&&!allow.has(rp.gt[k]))return -1;const A=rp.gr[k*4],B=rp.gr[k*4+1],u=rp.gr[k*4+2];return zoneOf(V[(u<.5?A:B)+3])},
    get:(k,o)=>{const A=rp.gr[k*4],B=rp.gr[k*4+1],u=rp.gr[k*4+2],az=rp.gr[k*4+3],L=(arr,kk)=>CY(arr[zoneOf(V[A+kk])],arr[zoneOf(V[B+kk])],u);
      e.set(L(LV.pitch,6),Math.PI/2-az,-L(LV.roll,8),'YXZ');q.setFromEuler(e);
      const ca=satRGB(zoneOf(V[A+5]),LV.sat[zoneOf(V[A+9])]),cb=satRGB(zoneOf(V[B+5]),LV.sat[zoneOf(V[B+9])]);
      o.pos[0]=rp.gp[k*3];o.pos[1]=rp.gp[k*3+1];o.pos[2]=rp.gp[k*3+2];o.q[0]=q.x;o.q[1]=q.y;o.q[2]=q.z;o.q[3]=q.w;o.s=L(LV.stretch,4);
      o.col[0]=CY(ca[0],cb[0],u);o.col[1]=CY(ca[1],cb[1],u);o.col[2]=CY(ca[2],cb[2],u);o.day=rp.gd[k];o.tk=rp.gt[k];o.out=rp.go[k];o.org=ORG[rp.gt[k]];o.vol=Math.min(1.8,Math.sqrt(S.gvol*(S.gvolI[rp.gt[k]]||1)))}});
}
function buildGhost(){
  const g=GHOST.pts.geometry,t=GHOST.trl.geometry;
  if(!S.ghost){g.setDrawRange(0,0);t.setDrawRange(0,0);GHOST.rep=null;buildReplicas();return}
  if(!CLK.win||CLK.win[0]!==S.T0||CLK.win[1]!==S.T1||!CLK.pres){buildClk(S.T0,S.T1,true);CLK.pres=true}
  const W=CLK[S.gclk]||CLK.vol,T0=S.T0,T1=S.T1,col=new THREE.Color();
  const gp=[],gd=[],gt=[],gc=[],go=[],gr=[];let chain=0;
  const wall=x=>Math.abs(x)>=.99999; /* beyond the system's bounds (0.5 % / 99.5 %) the object sits on the wall: outside the law */
  const wallAB=(A,B,u,k)=>u<=0?wall(V[A+k]):(wall(V[A+k])&&wall(V[B+k])&&V[A+k]*V[B+k]>0);
  /* v22: between two sessions a ghost sits on the cycloidal half-arch of its offset to the Z0 thread (Éric, v20.2) */
  const put=(ja,jb,u,d,i)=>{const A=ja*10,B=jb*10,X=zp(V,A,B,d,d+1,u,0),Y=zp(V,A,B,d,d+1,u,1),Z=zp(V,A,B,d,d+1,u,2),a=AZ(X),r=2-Z;
    gr.push(A,B,u,a);gp.push(r*Math.sin(a),Y,-r*Math.cos(a));gd.push(d+u);gt.push(i);gc.push(chain);go.push(wallAB(A,B,u,0)||wallAB(A,B,u,1)||wallAB(A,B,u,2)?1:0)};
  for(let i=0;i<N1;i++){
    let d=T0;const gstep=1/(S.gvol*(S.gvolI[i]||1)); /* ghost volume: more ghosts per median step, same rule */
    while(d<=T1){
      while(d<=T1&&!PRES[i*F+d])d++;
      if(d>T1)break;
      chain++;put(i*F+d,i*F+d,0,d,i);              /* the start point */
      let C=0,next=1;                               /* one ghost at each whole step of the cumulative column */
      while(d<T1&&PRES[i*F+d+1]){
        const ja=i*F+d,jb=ja+1,w=W[jb]>0?W[jb]:0;   /* the move d -> d+1 is made during session d+1: its column sets the step */
        while(w>0&&next<=C+w+1e-9){put(ja,jb,(next-C)/w,d,i);next+=gstep}
        C+=w;d++;
      }
      d++;
    }
  }
  const n=gd.length;
  if(GHOST.cap<n){const cap=Math.ceil(n*1.2)+64;GHOST.cap=cap;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(cap*3),3));
    g.setAttribute('aDay',new THREE.BufferAttribute(new Float32Array(cap),1));
    g.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(cap*3),3));
    g.setAttribute('aTk',new THREE.BufferAttribute(new Float32Array(cap),1));
    g.setAttribute('aOut',new THREE.BufferAttribute(new Float32Array(cap),1))}
  const P=g.attributes.position.array,D=g.attributes.aDay.array,C3=g.attributes.aCol.array,Tk=g.attributes.aTk.array,Ou=g.attributes.aOut.array;
  P.set(gp);D.set(gd);Tk.set(gt);Ou.set(go);
  for(let k=0;k<n;k++){col.set(secCol(TK[gt[k]].sec));C3[k*3]=col.r;C3[k*3+1]=col.g;C3[k*3+2]=col.b}
  /* The ruler, inside the law. Two ghosts of the same trail never overlap: the common diameter is the shortest distance
     between any two ghosts of one trail anywhere in the system (edge to edge, x1); the widest gap is the longest step reached
     in the system. A ghost on the wall (beyond the bounds) is outside the law: it is drawn hollow, named, and never sets the ruler. */
  let dmin=Infinity,dmax=0,out=0;const ST=new Array(N1);
  for(let a=0,i0=0;a<n;a=i0){
    i0=a;while(i0<n&&gt[i0]===gt[a])i0++;
    let lmin=Infinity,lmax=0,lo=0;
    for(let p=a;p<i0;p++){if(go[p]){lo++;continue}const px=gp[p*3],py=gp[p*3+1],pz=gp[p*3+2];
      for(let q=p+1;q<i0;q++){if(go[q])continue;const dx=gp[q*3]-px,dy=gp[q*3+1]-py,dz=gp[q*3+2]-pz,dd=dx*dx+dy*dy+dz*dz;
        if(q===p+1&&gc[q]===gc[p]&&dd>lmax)lmax=dd;
        if(dd<lmin)lmin=dd}}
    ST[gt[a]]={n:i0-a,min:Math.sqrt(lmin),max:Math.sqrt(lmax),out:lo};
    if(lmin<dmin)dmin=lmin;if(lmax>dmax)dmax=lmax;out+=lo;
  }
  dmin=Math.sqrt(dmin);dmax=Math.sqrt(dmax);if(!Number.isFinite(dmin)||dmin<=0)dmin=1e-3;
  GHOST.stk=ST;GHOST.ruler={dg:dmin,max:dmax/dmin,n,out,clk:S.gclk,T0,T1};GHOST.rep={gp,gd,gt,go,gr,n};buildReplicas();
  g.setDrawRange(0,n);Object.values(g.attributes).forEach(a=>a.needsUpdate=true);
  try{drawLegend()}catch(e){}
  const A=t.attributes,TP=A.position.array,TO=A.aOther.array,TD=A.aDay.array,TOD=A.aOD.array,TC=A.aCol.array,TY=A.aTy.array,TI=A.aCi.array;let m=0;
  CARDS.forEach((c,ci)=>{
    col.set(c.ty==='sec'?secCol(c.name):c.ty==='cty'?'#a6dcff':'#7f93b0');const ty=c.ty==='sec'?0:c.ty==='cty'?1:2;
    for(let d=0;d<F-1;d++){const qa=ci*F+d,qb=qa+1;if(!CP[qa]||!CP[qb])continue;const a=posOf(CV,qa),b=posOf(CV,qb);
      for(let e=0;e<2;e++){const me=e?b:a,ot=e?a:b;TP[m*3]=me[0];TP[m*3+1]=me[1];TP[m*3+2]=me[2];TO[m*3]=ot[0];TO[m*3+1]=ot[1];TO[m*3+2]=ot[2];
        TD[m]=e?d+1:d;TOD[m]=e?d:d+1;TC[m*3]=col.r;TC[m*3+1]=col.g;TC[m*3+2]=col.b;TY[m]=ty;TI[m]=ci;m++}}
  });
  t.setDrawRange(0,m);Object.values(A).forEach(a=>a.needsUpdate=true);
}
function ghostFrame(c){
  const on=S.ghost,u=GHOST.pts.material.uniforms,v=GHOST.trl.material.uniforms;
  GHOST.pts.visible=false;GHOST.trl.visible=on&&S.layers.gpaths;REP.group.visible=on&&S.layers.ghost;
  if(!on)return;
  {const U=REP.U;U.uCur.value=c;U.uT0.value=S.T0;U.uTau.value=S.gtau;U.uSize.value=1/S.exp;U.uGain.value=N1>150?.6:Math.min(.55,.5*Math.sqrt(101/N1));U.uSel.value=S.sel&&S.sel.kind===1?S.sel.idx:-1;U.uAll.value=0}
  u.uCur.value=c;u.uT0.value=S.T0;u.uTau.value=S.gtau;u.uD.value=(GHOST.ruler?GHOST.ruler.dg:.01)*S.exp;u.uPx.value=1.8*Math.min(2,window.devicePixelRatio||1); /* display floor: the ruler's diameter is below one pixel at the home view */
  u.uScale.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));
  u.uGain.value=Math.min(.8,.6*Math.sqrt(101/N1));
  u.uSel.value=S.sel&&S.sel.kind===1?S.sel.idx:-1;
  v.uCur.value=c;v.uT0.value=S.T0;v.uTau.value=S.gtau;v.uTy.value.set(S.layers.sec?1:0,S.layers.cty?1:0,S.layers.ind?1:0);
  v.uSel.value=S.sel&&S.sel.kind===2?S.sel.idx:-1;
  if(S.sel&&(S.sel.kind===1||S.sel.kind===2))pathGeo.setDrawRange(0,Math.max(0,Math.min(pathN,Math.floor(c)-pathD0+1)));
}
function ensureTL(){O1.forEach((o,i)=>{if(o.tl)return;o.tl=HK?badgeSprite(i,o):label(TK[i].s,'#ffffff',o.R*.46,500);o.tl.position.set(0,0,0);o.tl.material.depthTest=false;o.tl.renderOrder=9;o.tl.visible=false;o.root.add(o.tl)})}
function posOf(VV,q){const X=VV[q*10],Y=VV[q*10+1],Z=VV[q*10+2],a=AZ(X),r=2-Z;return [r*Math.sin(a),Y,-r*Math.cos(a)]}
const NS=48;

/* ---------------- Canon Z0 (Éric, 5 Nov.; Grok v20.2) ----------------
   Z0 is the mean of everything, computed as one set: Class 1 always; the Class 2 objects of the active levels when the box is
   ticked; the active Class 3 containers that hold something when that box is ticked. One computation, one value per take.
   Placeholder: means. The true Z0 (triple collapse) is not computable today. Z0 is not Z-ZERO (scalar output of H → V → T)
   Z0 is not the place of the central object either: its position in space is not established (rev. 23.10, Éric, 10 Nov., 23 h 17).
   Z0(τ) is the anchor of the gold vectors. The Z0 thread runs straight from Z0(T₀) to Z0(T₁); every floater = thread + offset,
   and the offset follows the cycloidal half-arch, axis by axis. */
const Z0A=[0,0,0],Z0B=[0,0,0],Z0N=[0,0];
const z0lin=(a,tau)=>Z0A[a]+(Z0B[a]-Z0A[a])*tau;
const tauOf=c=>(c-S.T0)/Math.max(1,S.T1-S.T0);
function zp(VV,A,B,dA,dB,u,k){
  if(A===B)return VV[A+k];
  const ta=tauOf(dA),tb=tauOf(dB),tc=ta+(tb-ta)*u;
  return clamp1(z0lin(k,tc)+CY(VV[A+k]-z0lin(k,ta),VV[B+k]-z0lin(k,tb),u));
}
function z0Compute(){
  [S.T0,S.T1].forEach((d,ti)=>{const s=[0,0,0];let n=0;
    for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j])continue;s[0]+=V[j*10];s[1]+=V[j*10+1];s[2]+=V[j*10+2];n++}
    if(S.layers.z0c2)for(let c=0;c<NC;c++){if(!S.layers[CARDS[c].ty])continue;const q=c*F+d;if(!CP[q])continue;s[0]+=CV[q*10];s[1]+=CV[q*10+1];s[2]+=CV[q*10+2];n++}
    if(S.layers.z0c3)for(let z=0;z<5;z++){if(C3ON[z]&&C3N[z*2+ti]){const t=C3T[z];s[0]+=t;s[1]+=t;s[2]+=t;n++}}
    const Z=ti?Z0B:Z0A;for(let a=0;a<3;a++)Z[a]=n?s[a]/n:0;Z0N[ti]=n;
  });
  updZ0Line();
}
const w3v=(X,Y,Z)=>{const a=AZ(X),r=2-Z;return [r*Math.sin(a),Y,-r*Math.cos(a)]};
const Z0G=new THREE.Group();WORLD.add(Z0G);
const z0Geo=new THREE.BufferGeometry();z0Geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NS*3),3));
const z0Line=new THREE.Line(z0Geo,new THREE.LineDashedMaterial({color:0xe8c872,transparent:true,opacity:.95,dashSize:.05,gapSize:.035}));Z0G.add(z0Line);
const z0Mark=new THREE.Group();Z0G.add(z0Mark);
z0Mark.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(.075)),new THREE.LineBasicMaterial({color:0xe8c872})));
z0Mark.add(new THREE.Mesh(new THREE.OctahedronGeometry(.032),new THREE.MeshBasicMaterial({color:0xe8c872})));
z0Mark.add(hitSphere(.11,{kind:5}));
/* rev. 23.10: the gold marker is back on Z0(τ), the anchor of the vectors; the central object is not placed there */
const z0L0=label('Z0(T₀)','#e8c872',.075),z0L1=label('Z0(T₁)','#e8c872',.075);
[z0L0,z0L1].forEach(l=>l.userData.base=l.scale.clone());
function updZ0Line(){
  const arr=z0Geo.attributes.position.array;
  for(let s=0;s<NS;s++){const tau=s/(NS-1),p=w3v(z0lin(0,tau),z0lin(1,tau),z0lin(2,tau));arr[s*3]=p[0];arr[s*3+1]=p[1];arr[s*3+2]=p[2]}
  z0Geo.attributes.position.needsUpdate=true;z0Line.computeLineDistances();
  const a=w3v(Z0A[0],Z0A[1],Z0A[2]),b=w3v(Z0B[0],Z0B[1],Z0B[2]);z0L0.position.set(a[0],a[1]+.1,a[2]);z0L1.position.set(b[0],b[1]+.1,b[2]);
}
function z0Frame(tau){
  Z0G.visible=S.layers.z0;if(!Z0G.visible)return;
  const p=w3v(z0lin(0,tau),z0lin(1,tau),z0lin(2,tau));z0Mark.position.set(p[0],p[1],p[2]);z0Mark.scale.setScalar(1/S.exp);
  [z0L0,z0L1].forEach(l=>l.scale.set(l.userData.base.x/S.exp,l.userData.base.y/S.exp,1));
}
const z0txt=Z=>'('+Z.map(x=>(x>=0?'+':'')+x.toFixed(5)).join(', ')+')';

/* ---------------- Throw (lancer) ahead of the real object, weighted by Class 2 ----------------
   From the session under the cursor (d), each stock throws h ghosts ahead of itself, under the same universal rule: same size,
   one ghost per median step (an unknown future clock counts one step per session), laid on the cycloidal half-arch per axis.
   The Class 2 objects carry the weight of the throw: the displacement thrown = weighted mean of the displacements of the
   stock's own cardinals (sector, country, industry : the active levels) over the h sessions before d. Weight = the cardinal's
   traded value, or equal. Accuracy: when session d + h exists, the thrown end point is compared with where the stock really
   went, and with staying put. Skill = 1 − error ÷ stay-put error (positive: the throw beats staying put). */
const THR={d:-1,cap:0,now:null,nowR:null,win:null,winD:0};
{
  const g=new THREE.BufferGeometry();g.setDrawRange(0,0);
  const m=new THREE.ShaderMaterial({
    uniforms:{uScale:{value:600},uD:{value:.01},uPx:{value:1.8},uSel:{value:-1}},
    vertexShader:`attribute vec3 aCol;attribute float aTk;attribute float aK;
uniform float uScale;uniform float uD;uniform float uPx;uniform float uSel;
varying vec3 vCol;varying float vA;varying float vPs;
void main(){vCol=aCol;float a=0.62-0.3*aK;if(uSel>-0.5){a=abs(aTk-uSel)<0.5?1.0:a*0.16;}vA=a;
  vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;
  float ps=max(uPx*2.2,uD*uScale/max(0.001,-mv.z));gl_PointSize=ps;vPs=ps;}`,
    fragmentShader:`varying vec3 vCol;varying float vA;varying float vPs;
void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=length(p);if(r>1.0)discard;
  float aa=min(0.5,2.0/max(1.0,vPs));float w=max(0.28,1.7/max(1.0,vPs));
  float b=smoothstep(1.0-w-aa,1.0-w,r)*(1.0-smoothstep(1.0-aa,1.0,r));
  gl_FragColor=vec4(mix(vCol,vec3(1.0),0.25),clamp(vA*b,0.0,1.0));}`,
    transparent:true,depthWrite:false});
  THR.pts=new THREE.Points(g,m);THR.pts.frustumCulled=false;THR.pts.visible=false;THR.pts.renderOrder=3;WORLD.add(THR.pts);
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  THR.err=new THREE.Line(lg,new THREE.LineDashedMaterial({color:0xffffff,transparent:true,opacity:.8,dashSize:.025,gapSize:.025}));THR.err.visible=false;WORLD.add(THR.err);
  THR.land=new THREE.Mesh(new THREE.OctahedronGeometry(.03),new THREE.MeshBasicMaterial({color:0xffffff}));THR.land.visible=false;WORLD.add(THR.land);
}
function thrDelta(i,d,h,out){
  out[0]=out[1]=out[2]=0;let W=0;const ws=[];
  if(d-h<0)return null;
  for(const ty of ['sec','cty','ind']){if(!S.layers[ty])continue;const c=CI[ty][i];if(c<0)continue;const qa=c*F+d-h,qb=c*F+d;if(!CP[qa]||!CP[qb])continue;
    const w=S.thrW==='eq'?1:CW[qb];if(!(w>0))continue;for(let a=0;a<3;a++)out[a]+=w*(CV[qb*10+a]-CV[qa*10+a]);W+=w;ws.push([c,w])}
  if(!(W>0))return null;for(let a=0;a<3;a++)out[a]/=W;return ws.map(x=>[x[0],x[1]/W]);
}
function thrEnd(i,d,h,D){const j=i*F+d;return [0,1,2].map(a=>clamp1(V[j*10+a]+D[a]))}
function thrScore(d,h){
  if(d-h<0||d+h>F-1)return null;const r=[],D=[0,0,0];
  for(let i=0;i<N1;i++){const j=i*F+d,jt=j+h;if(!PRES[j]||!PRES[jt])continue;if(!thrDelta(i,d,h,D))continue;
    let e=0,e0=0;for(let a=0;a<3;a++){const p=V[j*10+a],end=clamp1(p+D[a]),act=V[jt*10+a];e+=(act-end)*(act-end);e0+=(act-p)*(act-p)}
    r.push({i,e:Math.sqrt(e),e0:Math.sqrt(e0)})}
  return r;
}
const med=xs=>{if(!xs.length)return NaN;const a=xs.slice().sort((x,y)=>x-y),h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2};
function summarize(r){if(!r||!r.length)return null;const sk=[];let beat=0,se=0,se0=0;
  for(const x of r){if(x.e0>1e-9)sk.push(1-x.e/x.e0);if(x.e<x.e0)beat++;se+=x.e;se0+=x.e0}
  return {n:r.length,med:med(sk),beat:beat/r.length,err:se/r.length,err0:se0/r.length}}
function buildThrowWin(){
  THR.win=null;THR.winD=0;const h=S.thr;if(!S.ghost||!h)return;const all=[];
  for(let d=Math.max(S.T0,h);d<=Math.min(S.T1,F-1-h);d++){const r=thrScore(d,h);if(r&&r.length){THR.winD++;for(const x of r)all.push(x)}}
  THR.win=summarize(all);
}
function buildThrowFrame(d){
  THR.d=d;const h=S.thr,g=THR.pts.geometry;THR.now=null;THR.nowR=null;
  if(!S.ghost||!h){g.setDrawRange(0,0);THRREP.fill(EMPTYL);updThrSel();return}
  const items=[],D=[0,0,0],allow=repAllow(),q=new THREE.Quaternion(),e=new THREE.Euler();g.setDrawRange(0,0);
  for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j]||!S.layers.c1)continue;if(allow&&!allow.has(i))continue;if(!thrDelta(i,d,h,D))continue;
    for(let k=1;k<=h;k++){const u=k/h;items.push(i,clamp1(V[j*10]+CY(0,D[0],u)),clamp1(V[j*10+1]+CY(0,D[1],u)),clamp1(V[j*10+2]+CY(0,D[2],u)))}}
  THRREP.fill({n:items.length/4,zone:k=>zoneOf(V[(items[k*4]*F+d)*10+3]),get:(k,o)=>{const i=items[k*4],j=(i*F+d)*10,X=items[k*4+1],p=w3v(X,items[k*4+2],items[k*4+3]);
    e.set(LV.pitch[zoneOf(V[j+6])],Math.PI/2-AZ(X),-LV.roll[zoneOf(V[j+8])],'YXZ');q.setFromEuler(e);const c=satRGB(zoneOf(V[j+5]),LV.sat[zoneOf(V[j+9])]);
    o.pos[0]=p[0];o.pos[1]=p[1];o.pos[2]=p[2];o.q[0]=q.x;o.q[1]=q.y;o.q[2]=q.z;o.q[3]=q.w;o.s=LV.stretch[zoneOf(V[j+4])];
    o.col[0]=.6*c[0]+.4;o.col[1]=.6*c[1]+.4;o.col[2]=.6*c[2]+.4;o.day=0;o.tk=i;o.out=1;o.org=0;o.vol=1}});
  THR.nowR=thrScore(d,h);THR.now=summarize(THR.nowR);
  updThrSel();
}
function thrInfo(i){
  const d=THR.d,h=S.thr;if(d<0||!h)return null;const j=i*F+d;if(!PRES[j])return null;const D=[0,0,0],ws=thrDelta(i,d,h,D);if(!ws)return null;
  const end=thrEnd(i,d,h,D),has=d+h<=F-1&&PRES[j+h];let act=null,e=null,e0=null;
  if(has){act=[0,1,2].map(a=>V[(j+h)*10+a]);e=Math.hypot(act[0]-end[0],act[1]-end[1],act[2]-end[2]);e0=Math.hypot(act[0]-V[j*10],act[1]-V[j*10+1],act[2]-V[j*10+2])}
  return {d,h,ws,D,start:[0,1,2].map(a=>V[j*10+a]),end,act,e,e0};
}
function updThrSel(){
  const s=S.sel,info=s&&s.kind===1&&S.ghost&&S.thr?thrInfo(s.idx):null;
  THR.pts.material.uniforms.uSel.value=s&&s.kind===1?s.idx:-1;
  if(!info||!info.act){THR.err.visible=false;THR.land.visible=false;return}
  const a=w3v(...info.end),b=w3v(...info.act),arr=THR.err.geometry.attributes.position.array;
  arr.set([a[0],a[1],a[2],b[0],b[1],b[2]]);THR.err.geometry.attributes.position.needsUpdate=true;THR.err.computeLineDistances();
  THR.land.position.set(b[0],b[1],b[2]);THR.land.scale.setScalar(1/S.exp);THR.err.visible=THR.land.visible=true;
}
const pct=x=>Number.isFinite(x)?((x>=0?'+':'')+(x*100).toFixed(1).replace('.',',')+' %'):'—';
const pc0=x=>Number.isFinite(x)?Math.round(x*100)+' %':'—';
const v3=A=>A?'('+A.map(x=>(x>=0?'+':'')+x.toFixed(3)).join(', ')+')':'—';
function fcurve(VV,P,b,arr){ /* the cycloidal F-curve from T0 to T1: one easing per axis (G-3) */
  if(!(P[b+S.T0]&&P[b+S.T1]))return 0;
  const A=(b+S.T0)*10,B=(b+S.T1)*10;
  for(let s=0;s<NS;s++){const u=s/(NS-1),X=zp(VV,A,B,S.T0,S.T1,u,0),Y=zp(VV,A,B,S.T0,S.T1,u,1),Z=zp(VV,A,B,S.T0,S.T1,u,2),a=AZ(X),r=2-Z;arr[s*3]=r*Math.sin(a);arr[s*3+1]=Y;arr[s*3+2]=-r*Math.cos(a)}
  return NS;
}
function buildTrail(){
  const s=S.sel,arr=pathGeo.attributes.position.array;let n=0;
  pathD0=S.T0;
  if(s&&(s.kind===1||s.kind===2)){
    if(S.ghost){const P=s.kind===1?PRES:CP,VV=s.kind===1?V:CV,b=s.idx*F;let first=-1;
      for(let d=S.T0;d<=S.T1;d++){const q=b+d;if(!P[q]){if(first<0)continue;const k=n-1;arr[n*3]=arr[k*3];arr[n*3+1]=arr[k*3+1];arr[n*3+2]=arr[k*3+2];n++;continue}
        if(first<0)first=d;const p=posOf(VV,q);arr[n*3]=p[0];arr[n*3+1]=p[1];arr[n*3+2]=p[2];n++}
      if(first>=0)pathD0=first;}
    else n=s.kind===1?fcurve(V,PRES,s.idx*F,arr):fcurve(CV,CP,s.idx*F,arr);
  }
  pathN=n;
  pathGeo.setDrawRange(0,n);pathGeo.attributes.position.needsUpdate=true;yearPath.visible=n>1;
  CARDS.forEach((c,ci)=>{const g=trails[ci].geometry,m=fcurve(CV,CP,ci*F,g.attributes.position.array);g.setDrawRange(0,m);g.attributes.position.needsUpdate=true;trails[ci].userData.n=m});
}

/* ---------------- Per-frame application ---------------- */
/* Cycloidal half-arch (Éric, v20.2), for positions and colours alike: rise c(t) = (πt − sin πt)/π, descent 1 − c(1 − t);
   a channel or axis that does not change stays still. */
const cyc=t=>(Math.PI*t-Math.sin(Math.PI*t))/Math.PI;
function CY(a,b,t){const D=b-a;if(D>0)return a+D*cyc(t);if(D<0)return a+D*(1-cyc(1-t));return a}
const ease=CY,EZ=CY;
const clamp1=x=>x<-1?-1:x>1?1:x;
/* Colour (attribute 6) and saturation (attribute 10): every RGB channel follows the same half-arch. */
const ZRGB=ZCOL.map(c=>{const k=new THREE.Color(c);return [k.r,k.g,k.b]});
function satRGB(z,s){const c=ZRGB[z],g=.3*c[0]+.59*c[1]+.11*c[2];return [g+(c[0]-g)*s,g+(c[1]-g)*s,g+(c[2]-g)*s]}
function paint(o,ca,cb,sa,sb,t){const A=satRGB(ca,LV.sat[sa]),B=satRGB(cb,LV.sat[sb]),r=CY(A[0],B[0],t),g=CY(A[1],B[1],t),b=CY(A[2],B[2],t);o.faceMat.color.setRGB(r,g,b);o.edgeMat.color.setRGB(r,g,b)}
const layerOn=o=>o.kind===1?S.layers.c1:S.layers[CARDS[o.idx].ty];
function focusDim(o){
  if(!S.focus)return 1;
  const f=S.focus;
  if(f.kind===o.kind&&f.idx===o.idx)return 1;
  if(f.kind===2&&o.kind===1&&CARDS[f.idx].mset.has(o.idx))return .8;
  if(f.kind===1&&o.kind===2&&CARDS[o.idx].mset.has(f.idx))return .8;
  return .12;
}
function applyObj(o,d0,d1,t,dt){
  const isC=o.kind===2,P=isC?CP:PRES,VV=isC?CV:V,b=o.idx*F;
  const p0=P[b+d0],p1=P[b+d1];
  if(!(p0||p1)||!layerOn(o)){o.root.visible=false;o.cur=null;return}
  o.root.visible=true;
  const da=p0?d0:d1,db=p1?d1:d0,A=(b+da)*10,B=(b+db)*10;
  const v=k=>zp(VV,A,B,d0,d1,t,k);
  const X=v(0),Y=v(1),Z=v(2),a=AZ(X),r=2-Z;
  o.root.position.set(r*Math.sin(a),Y,-r*Math.cos(a));
  if(S.layers.spacing&&!S.ghost){const OF=isC?OFF2:OFF1,q0=o.idx*6,w=p0&&p1?t:(p0?0:1),u=1-w;o.root.position.x+=OF[q0]*u+OF[q0+3]*w;o.root.position.y+=OF[q0+1]*u+OF[q0+4]*w;o.root.position.z+=OF[q0+2]*u+OF[q0+5]*w}
  const za=k=>zoneOf(VV[A+k]),zb=k=>zoneOf(VV[B+k]),zd=k=>t<.5?za(k):zb(k);
  setShape(o,zd(3));
  const L=(arr,k)=>CY(arr[za(k)],arr[zb(k)],t);
  const st=L(LV.stretch,4),pit=L(LV.pitch,6),om=L(LV.spin,7),rol=L(LV.roll,8);
  o.orient.rotation.set(pit,Math.PI/2-a,-rol,'YXZ');
  o.spinA-=om*dt*(REDUCED?.25:1);o.spin.rotation.y=o.spinA;o.spin.scale.set(1,st,1);
  paint(o,za(5),zb(5),za(9),zb(9),t);
  const dim=focusDim(o);
  const pf=p0&&p1?1:(p0?1-t:t);
  if(o.kind===1){const fo=dim*pf;o.faceMat.opacity=fo;o.faceMat.depthWrite=fo>.97;o.edgeMat.opacity=.45*fo}
  else{o.edgeMat.opacity=.9*dim*pf;o.faceMat.opacity=.3*dim*pf}
  if(o.halo)o.halo.material.opacity=.55*dim;
  if(o.label)o.label.visible=S.layers.labels&&dim>.5&&!o.card;
  if(HK&&o.tl){const ab=clubAt(o.idx,t<.5?da:db);if(ab&&o.tl.userData.ab!==ab){o.tl.material.map=objTex(o.idx,ab);o.tl.material.needsUpdate=true;o.tl.userData.ab=ab}} /* the logo changes, the object stays */
  if(o.tl){const sh=S.layers.tlabels&&dim>.5&&!o.card;o.tl.visible=sh;if(sh)o.tl.material.opacity=.95*pf}
  o.cur={d:t<.5?da:db,p:o.root.position};
}
function applyC3(t,dt){
  C3O.forEach((o,z)=>{if(!o)return;
    const n0=C3N[z*2],n1=C3N[z*2+1];
    if(!n0&&!n1){o.body.visible=false;return}o.body.visible=true;
    const A=(z*2+(n0?0:1))*10,B=(z*2+(n1?1:0))*10;
    const za=k=>zoneOf(C3V[A+k]),zb=k=>zoneOf(C3V[B+k]),zd=k=>t<.5?za(k):zb(k);
    setShape(o,zd(3));
    const L=(arr,k)=>CY(arr[za(k)],arr[zb(k)],t);
    o.orient.rotation.set(L(LV.pitch,6),Math.PI/2-o.a,-L(LV.roll,8),'YXZ');
    o.spinA-=L(LV.spin,7)*dt*(REDUCED?.25:1);o.spin.rotation.y=o.spinA;o.spin.scale.set(1,L(LV.stretch,4),1);
    paint(o,za(5),zb(5),za(9),zb(9),t);
  });
}
/* Rev. 23.10: the central object holds its reserved space, the hollow centre; its position in space is not established.
   Only its body reacts (applyC4). Z0(τ) keeps the thread, the gold marker and the vectors. */
function c4Frame(tau){
  const X=z0lin(0,tau),Y=z0lin(1,tau),Z=z0lin(2,tau);
  core.position.set(0,0,0);C4O.a=0;
  window.__C4LIVE={sys:SYS.id,tau:Math.round(tau*1e4)/1e4,z0:[X,Y,Z],pos:[0,0,0],place:'espace réservé · position non établie',size:{c4:C4O.R,c1:.1*DENS,ratio:C4O.R/(.1*DENS)},parts:core.children.length,drift:[Z0B[0]-Z0A[0],Z0B[1]-Z0A[1],Z0B[2]-Z0A[2]],n:[C4N[0],C4N[1]]}; /* read-only state, as in YB1's hub */
}
function applyC4(t,dt){
  const o=C4O,n0=C4N[0],n1=C4N[1];
  if(!n0&&!n1){o.body.visible=false;return}o.body.visible=true;
  const A=(n0?0:1)*10,B=(n1?1:0)*10;
  const za=k=>zoneOf(C4V[A+k]),zb=k=>zoneOf(C4V[B+k]),zd=k=>t<.5?za(k):zb(k);
  setShape(o,zd(3));
  const L=(arr,k)=>CY(arr[za(k)],arr[zb(k)],t);
  o.orient.rotation.set(L(LV.pitch,6),Math.PI/2-o.a,-L(LV.roll,8),'YXZ'); /* same configuration everywhere: it faces the dial at its own X */
  o.spinA-=L(LV.spin,7)*dt*(REDUCED?.25:1);o.spin.rotation.y=o.spinA;o.spin.scale.set(1,L(LV.stretch,4),1);
  paint(o,za(5),zb(5),za(9),zb(9),t);
}
/* Vectors from Z0(τ), the moving mean (gold marker), to every rendered object (Class 1 and Class 2); they follow its drift.
   Rev. 23.10: they do not start from the central object, whose position in space is not established. */
const VECG=new THREE.Group();WORLD.add(VECG);
const vecGeo=new THREE.BufferGeometry();vecGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array((N1+NC)*6),3));
const vecLines=new THREE.LineSegments(vecGeo,new THREE.LineBasicMaterial({color:0xe8c872,transparent:true,opacity:N1>400?.07:.14,depthWrite:false}));VECG.add(vecLines);
function vecFrame(tau){
  VECG.visible=!!S.layers.c4v;if(!VECG.visible)return;
  const p=w3v(z0lin(0,tau),z0lin(1,tau),z0lin(2,tau)),arr=vecGeo.attributes.position.array;let m=0;
  const put=o=>{if(!o.root.visible)return;const q=o.root.position;arr[m++]=p[0];arr[m++]=p[1];arr[m++]=p[2];arr[m++]=q.x;arr[m++]=q.y;arr[m++]=q.z};
  O1.forEach(put);O2.forEach(put);
  vecGeo.setDrawRange(0,m/3);vecGeo.attributes.position.needsUpdate=true;
  if(window.__C4LIVE)window.__C4LIVE.vecFrom=[p[0],p[1],p[2]];
}
/* Spacing canon (spec of 12 Sept.): objects keep their class sizes (0,1 · 0,2 · 0,3 · 0,4) and never overlap.
   Shown positions are pushed apart by the least amount; cardinals (heavier) move less; containers do not move. */
const PAD=1.06;
function relaxPts(P,R,M,nd,its){ /* P: points {x,y,z}; the first nd move; M = 0 marks a fixed obstacle */
  const n=P.length,key=(x,y,z)=>((x+4096)*8192+(y+4096))*8192+(z+4096);
  let rmax=0;for(let i=0;i<n;i++)if(R[i]>rmax)rmax=R[i];const CELL=Math.max(.02,2*rmax*PAD);
  for(let it=0;it<its;it++){
    let moved=false;const grid=new Map();
    for(let i=0;i<n;i++){const p=P[i],k=key(Math.floor(p.x/CELL),Math.floor(p.y/CELL),Math.floor(p.z/CELL));let a=grid.get(k);if(!a)grid.set(k,a=[]);a.push(i)}
    for(let i=0;i<nd;i++){
      const p=P[i],cx=Math.floor(p.x/CELL),cy=Math.floor(p.y/CELL),cz=Math.floor(p.z/CELL);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){
        const a=grid.get(key(cx+dx,cy+dy,cz+dz));if(!a)continue;
        for(const j of a){
          if(j===i||(j<nd&&j<i))continue;
          const q=P[j];let ex=p.x-q.x,ey=p.y-q.y,ez=p.z-q.z,d=Math.hypot(ex,ey,ez);const m=(R[i]+R[j])*PAD;
          if(d>=m)continue;moved=true;
          if(d<1e-6){ex=Math.cos(i*2.399);ey=Math.sin(i*1.7)*.3;ez=Math.sin(i*2.399);d=Math.hypot(ex,ey,ez)}
          const ov=(m-d)/d,mi=M[i],mj=M[j],wi=mj===0?1:mj/(mi+mj),wj=mj===0?0:mi/(mi+mj);
          p.x+=ex*ov*wi;p.y+=ey*ov*wi;p.z+=ez*ov*wi;
          if(wj){q.x-=ex*ov*wj;q.y-=ey*ov*wj;q.z-=ez*ov*wj}
        }
      }
    }
    for(let i=0;i<nd;i++){const p=P[i],r=Math.hypot(p.x,p.z),rc=Math.max(1,Math.min(3,r));if(r>1e-9&&rc!==r){p.x*=rc/r;p.z*=rc/r}p.y=Math.max(-1,Math.min(1,p.y))}
    if(!moved)break;
  }
}
/* Spacing is resolved once per take (each take is a complete state); each object keeps a small offset from its data position. */
const OFF1=new Float32Array(N1*6),OFF2=new Float32Array(NC*6);
function spacingTakes(){
  OFF1.fill(0);OFF2.fill(0);
  [S.T0,S.T1].forEach((d,ti)=>{
    const P=[],R=[],M=[],ref=[];
    const gap=SYS.id==='world'?1.7:1; /* World doors must clear each other's hit sphere from the opening angle */
    for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j])continue;const p=posOf(V,j);P.push({x:p[0],y:p[1],z:p[2]});R.push(.1*DENS*gap/S.exp);M.push(1);ref.push([OFF1,i,p])}
    for(let c=0;c<NC;c++){const q=c*F+d;if(!CP[q])continue;const p=posOf(CV,q);P.push({x:p[0],y:p[1],z:p[2]});R.push(.2*DENS*gap/S.exp);M.push(8);ref.push([OFF2,c,p])}
    const nd=P.length;
    C3.forEach(g=>{P.push({x:g.position.x,y:g.position.y,z:g.position.z});R.push(.3/S.exp);M.push(0)});
    P.push({x:0,y:0,z:0});R.push(C4O.R/S.exp);M.push(0); /* the central object in its reserved space (hollow centre): fixed, nothing overlaps it */
    relaxPts(P,R,M,nd,S.exp>=1?30:6); /* contracted below ×1 the field cannot hold every object apart: a short pass only */
    for(let k=0;k<nd;k++){const [OF,idx,p]=ref[k],b=(idx*2+ti)*3;OF[b]=P[k].x-p[0];OF[b+1]=P[k].y-p[1];OF[b+2]=P[k].z-p[2]}
  });
}
/* During the movement, one light pass keeps passing objects from overlapping. */
function relax(){
  if(!S.layers.spacing)return;
  const P=[],R=[],M=[];
  O1.forEach(o=>{if(o.root.visible){P.push(o.root.position);R.push(o.R/S.exp);M.push(1)}});
  O2.forEach(o=>{if(o.root.visible){P.push(o.root.position);R.push(o.R/S.exp);M.push(8)}});
  const nd=P.length;
  if(S.layers.c3)C3.forEach(g=>{P.push({x:g.position.x,y:g.position.y,z:g.position.z});R.push(.3/S.exp);M.push(0)});
  if(S.layers.c4){P.push({x:core.position.x,y:core.position.y,z:core.position.z});R.push(C4O.R/S.exp);M.push(0)}
  relaxPts(P,R,M,nd,1);
}
function applyTrails(){
  CARDS.forEach((c,ci)=>{const l=trails[ci],o=O2[ci];l.visible=!S.ghost&&S.layers.trails&&o.root.visible&&(l.userData.n||0)>1;if(l.visible)l.material.opacity=.32*focusDim(o)});
}
function applyLinks(){
  const s=S.sel,arr=linkGeo.attributes.position.array;let n=0;
  const push=(a,b)=>{if(n>=LCAP-2)return;arr[n*3]=a.x;arr[n*3+1]=a.y;arr[n*3+2]=a.z;n++;arr[n*3]=b.x;arr[n*3+1]=b.y;arr[n*3+2]=b.z;n++};
  if(S.layers.links&&s){
    if(s.kind===2&&O2[s.idx].root.visible){const c=O2[s.idx].root.position,cc=CARDS[s.idx],dn=curD();cc.members.forEach(i=>{if(O1[i].root.visible&&(!cc.tk||cc.tk[i*F+dn]))push(c,O1[i].root.position)})}
    if(s.kind===1&&O1[s.idx].root.visible){const p=O1[s.idx].root.position,dn=curD();O2.forEach((o,ci)=>{const cc=CARDS[ci];if(o.root.visible&&cc.mset.has(s.idx)&&(!cc.tk||cc.tk[s.idx*F+dn]))push(p,o.root.position)})}
  }
  linkGeo.setDrawRange(0,n);linkGeo.attributes.position.needsUpdate=true;
}

/* ---------------- UI: attribute rack ---------------- */
const rack=$('rack');rack.innerHTML='';
function lineOptions(k){
  let h=LINES.filter(l=>AVAIL.includes(l.id)).map(l=>`<option value="${l.id}">${esc(l.label)}</option>`).join('');
  if(k===9)h=`<option value="km">Kobayashi Maru · collapse</option>`+h;
  return h;
}
/* Icon tiles (Éric, 9 and 10 Nov.): the strip stays on the extreme left; a click on an icon develops, to its right, the choice
   of its analysis and its Gaussian curve with draggable thresholds, without scrolling. A second click on the same icon folds it. */
const APPEL=document.querySelector('.app');
function setGOpen(on){APPEL.classList.toggle('gOpen',!!on);[...rack.children].forEach((b,k)=>b.setAttribute('aria-expanded',on&&S.open===k?'true':'false'));if(on)placeFly()}
/* rev. 23.10: the window stands to the right of the clicked icon, level with it, kept inside the height of the window. */
const FLY={moved:false,x:0,y:0}; /* rev. 23.14: where the viewer moved the Gaussian window */
function placeFly(){
  if(!APPEL.classList.contains('gOpen'))return;
  const P=$('left').lastElementChild,t=rack.children[S.open];if(!P||!t)return;
  const h=P.offsetHeight,w=P.offsetWidth,H=window.innerHeight,Wd=window.innerWidth;
  if(FLY.moved){ /* rev. 23.14: where the viewer put it, kept inside the window */
    P.style.left=Math.round(Math.max(4,Math.min(Wd-w-4,FLY.x)))+'px';P.style.top=Math.round(Math.max(4,Math.min(H-Math.min(h,60)-4,FLY.y)))+'px';return}
  const r=t.getBoundingClientRect();P.style.left='';
  P.style.top=Math.round(Math.max(8,Math.min(H-h-8,r.top+r.height/2-46)))+'px';
}
addEventListener('resize',placeFly);rack.parentElement.addEventListener('scroll',placeFly,{passive:true});
/* rev. 23.14 (Éric, 11 Nov., 15 h 14): the Gaussian window moves by its title bar so it never hides the chamber;
   a double click on the bar puts it back beside its icon. */
(()=>{const P=$('left').lastElementChild,bar=P.querySelector('h2');let d=null;
  bar.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;const r=P.getBoundingClientRect();
    d={dx:e.clientX-r.left,dy:e.clientY-r.top,id:e.pointerId};bar.setPointerCapture(e.pointerId);P.classList.add('drag');e.preventDefault()});
  bar.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;FLY.moved=true;FLY.x=e.clientX-d.dx;FLY.y=e.clientY-d.dy;placeFly()});
  const end=e=>{if(!d)return;d=null;P.classList.remove('drag');try{bar.releasePointerCapture(e.pointerId)}catch(_){}};
  bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
  bar.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;FLY.moved=false;placeFly()});
})();
ATTR.forEach((A,k)=>{
  const d=document.createElement('button');d.type='button';d.className='tile';d.dataset.k=k;
  d.title=(k+1)+'. '+A.name+' · '+A.tag+(A.desc?' · '+A.desc:'');d.setAttribute('aria-label',(k+1)+'. '+A.name);
  d.innerHTML=`<img class="ico" src="${ICO[k]}" alt=""><span class="tn">${esc(A.name)}</span><span class="zbar" id="zb${k}">${ZCOL.map(c=>`<i style="background:${c};width:20%"></i>`).join('')}</span>`;
  rack.appendChild(d);
  d.setAttribute('aria-expanded','false');
  d.addEventListener('click',()=>{if(APPEL.classList.contains('gOpen')&&S.open===k){setGOpen(false);return}
    S.open=k;refreshRack();setGOpen(true);drawGauss();placeFly();renderFiche()});
});
$('asel').addEventListener('change',e=>{const k=S.open;S.assign[k]=e.target.value;if(k===9)S.km=e.target.value==='km';S.cut[k].auto=true;rebuild();syncControls();drawGauss();renderFiche()});
function refreshRack(){
  ATTR.forEach((A,k)=>rack.children[k].setAttribute('aria-pressed',S.open===k?'true':'false'));
  const k=S.open,id=eff(k),sel=$('asel');
  sel.innerHTML=lineOptions(k);
  if(!sel.querySelector(`option[value="${id}"]`)){const o=document.createElement('option');o.value=id;o.textContent=LINEINFO[id].label;sel.appendChild(o)}
  sel.value=id;
  sel.disabled=!!S.session||(S.mode==='fourier'&&k>=3)||(k===9&&S.km);
  sel.title=!sel.disabled?'':S.session?'Session ouverte : les analyses sont fixées':(S.mode==='fourier'&&k>=3)?'Mode Fourier : cet attribut reçoit sa ligne dérivée ; passer en mode Libre pour choisir':'Kobayashi Maru : la saturation porte le collapse ; décocher pour choisir';
}
function zoneCounts(k,d){const c=[0,0,0,0,0];for(let i=0;i<N1;i++){const j=i*F+d;if(PRES[j])c[zoneOf(V[j*10+k])]++}return c}
function refreshZbars(d){
  for(let k=0;k<10;k++){const c=zoneCounts(k,d),n=c.reduce((a,b)=>a+b,0)||1;const bar=$('zb'+k);c.forEach((x,z)=>bar.children[z].style.width=(x/n*100)+'%')}
}

/* ---------------- UI: Gaussian window ---------------- */
const gc=$('gauss'),gx=gc.getContext('2d');
let gGeom=null,drag=-1,dragT=0;
function drawGauss(){
  const k=S.open,id=eff(k),cu=S.cut[k],P=POOL[k]||[];
  $('gk').innerHTML=`<img src="${ICO[k]}" alt="">${k+1} / 10`;$('gtitle').textContent=ATTR[k].name;
  $('gline').textContent=LINEINFO[id].label+(S.mode==='fourier'&&k>=3&&k<=8?' · dérivé (PROPOSED)':'');
  const dpr=Math.min(2,window.devicePixelRatio||1),Wc=gc.clientWidth,Hc=gc.clientHeight;
  gc.width=Wc*dpr;gc.height=Hc*dpr;gx.setTransform(dpr,0,0,dpr,0,0);gx.clearRect(0,0,Wc,Hc);
  const L=10,R=10,T=26,B=34,w=Wc-L-R,h=Hc-T-B;
  const span=cu.hi-cu.lo||1,x0=cu.lo-span*.04,x1=cu.hi+span*.04;
  const X=x=>L+(x-x0)/(x1-x0)*w;gGeom={X,inv:px=>x0+(px-L)/w*(x1-x0),T,B,L,w,h};
  const edges=[x0,...cu.c,x1];
  for(let z=0;z<5;z++){gx.fillStyle=ZCOL[z]+'1c';gx.fillRect(X(edges[z]),T,X(edges[z+1])-X(edges[z]),h)}
  const NB=46,bins=new Array(NB).fill(0);let below=0,above=0,inN=0,mu=0,m2=0;
  for(const x of P){if(x<cu.lo){below++;continue}if(x>cu.hi){above++;continue}const b=Math.min(NB-1,Math.floor((x-cu.lo)/span*NB));bins[b]++;inN++;mu+=x;m2+=x*x}
  mu=inN?mu/inN:0;const sd=inN?Math.sqrt(Math.max(1e-18,m2/inN-mu*mu)):1;
  const mx=Math.max(1,...bins),bw=w*(span/(x1-x0))/NB;
  gx.fillStyle='#4a5a74';
  bins.forEach((c,b)=>{const hh=c/mx*h;gx.fillRect(X(cu.lo)+b*bw+.5,T+h-hh,Math.max(1,bw-1),hh)});
  gx.strokeStyle='#dbe3ee';gx.globalAlpha=.75;gx.lineWidth=1.3;gx.beginPath();
  const pdfScale=inN*(span/NB);
  for(let s=0;s<=120;s++){const x=cu.lo+span*s/120,y=pdfScale*Math.exp(-.5*((x-mu)/sd)**2)/(sd*Math.sqrt(2*Math.PI));const py=T+h-Math.min(h,y/mx*h);s?gx.lineTo(X(x),py):gx.moveTo(X(x),py)}
  gx.stroke();gx.globalAlpha=1;
  gx.font='10px "IBM Plex Mono", monospace';gx.textBaseline='alphabetic';
  cu.c.forEach((c,z)=>{
    const px=X(c);gx.strokeStyle='#e9eef6';gx.lineWidth=1.2;gx.beginPath();gx.moveTo(px,T-4);gx.lineTo(px,T+h);gx.stroke();
    gx.beginPath();gx.arc(px,T-8,4.5,0,Math.PI*2);gx.fillStyle=S.session?'#05080d':'#e9eef6';gx.fill();gx.strokeStyle='#e9eef6';gx.stroke();
    let below=0;for(const x of P){if(x<c)below++;else break}
    const pct=P.length?Math.round(below/P.length*100):0;gx.fillStyle='#8b98ad';gx.textAlign='center';gx.fillText(pct+' %',px,9);
  });
  gx.textAlign='center';
  for(let z=0;z<5;z++){gx.fillStyle=ZCOL[z];gx.font='500 11px "IBM Plex Mono", monospace';gx.fillText(ZN[z],(X(edges[z])+X(edges[z+1]))/2,T+12)}
  const raw=LN[id],cl=x=>Math.max(x0,Math.min(x1,x));
  [[S.T0,'#5c6a82',T+h+3],[S.T1,'#a6dcff',T+h+9]].forEach(([d,c,y])=>{gx.strokeStyle=c;gx.lineWidth=1;for(let i=0;i<N1;i++){const j=i*F+d;if(!PRES[j])continue;const px=X(cl(raw[j]));gx.beginPath();gx.moveTo(px,y);gx.lineTo(px,y+5);gx.stroke()}});
  if(S.sel&&S.sel.kind===1){const a=S.sel.idx*F+S.T0,b=S.sel.idx*F+S.T1,ym=T+h*.5;gx.strokeStyle='#ffffff';gx.lineWidth=1.6;
    if(PRES[a]){const px=X(cl(raw[a]));gx.setLineDash([3,3]);gx.beginPath();gx.moveTo(px,T);gx.lineTo(px,T+h+8);gx.stroke();gx.setLineDash([])}
    if(PRES[b]){const px=X(cl(raw[b]));gx.beginPath();gx.moveTo(px,T);gx.lineTo(px,T+h+14);gx.stroke()}
    if(PRES[a]&&PRES[b]){const pa=X(cl(raw[a])),pb=X(cl(raw[b])),dx=pb>=pa?5:-5;gx.beginPath();gx.moveTo(pa,ym);gx.lineTo(pb,ym);gx.moveTo(pb,ym);gx.lineTo(pb-dx,ym-4);gx.moveTo(pb,ym);gx.lineTo(pb-dx,ym+4);gx.stroke()}}
  gx.font='10px "IBM Plex Mono", monospace';gx.fillStyle='#5c6a82';
  gx.textAlign='left';gx.fillText((below?'‹ '+below+'  ':'')+fmt(id,cu.lo),L,Hc-6);
  gx.textAlign='right';gx.fillText(fmt(id,cu.hi)+(above?'  '+above+' ›':''),L+w,Hc-6);
  gx.textAlign='center';gx.fillText('μ '+fmt(id,mu),L+w/2,Hc-6);
  const c0=zoneCounts(k,S.T0),cy=zoneCounts(k,S.T1);
  const yr=[0,0,0,0,0];for(const x of P)yr[x<cu.c[0]?0:x<cu.c[1]?1:x<cu.c[2]?2:x<cu.c[3]?3:4]++;
  const bounds=[`< ${fmt(id,cu.c[0])}`,`${fmt(id,cu.c[0])} → ${fmt(id,cu.c[1])}`,`${fmt(id,cu.c[1])} → ${fmt(id,cu.c[2])}`,`${fmt(id,cu.c[2])} → ${fmt(id,cu.c[3])}`,`≥ ${fmt(id,cu.c[3])}`];
  $('ztab').innerHTML=`<tr><th>zone</th><th>T₀</th><th>T₁</th><th>expression</th></tr>`+
    [4,3,2,1,0].map(z=>`<tr title="${esc(bounds[z])}"><td style="color:${ZCOL[z]}">${ZN[z]}</td><td>${c0[z]}</td><td>${cy[z]}</td><td style="color:var(--muted)">${esc(ATTR[k].levels[z])}</td></tr>`).join('');
  $('lockmsg').textContent=S.session?'Session ouverte : bornes fixées':(S.cut[k].auto?'Bornes 20 / 40 / 60 / 80 · déplaçables':'Bornes déplacées · non fixées');
  $('resetCut').disabled=!!S.session||S.cut[k].auto;
  gc.style.cursor=S.session?'default':'ew-resize';
}
function gPick(e){const r=gc.getBoundingClientRect();return e.clientX-r.left}
gc.addEventListener('pointerdown',e=>{
  if(S.session||!gGeom)return;const px=gPick(e),cu=S.cut[S.open];
  let best=-1,bd=10;cu.c.forEach((c,z)=>{const dd=Math.abs(gGeom.X(c)-px);if(dd<bd){bd=dd;best=z}});
  if(best>=0){drag=best;gc.setPointerCapture(e.pointerId)}
});
gc.addEventListener('pointermove',e=>{
  if(drag<0)return;const cu=S.cut[S.open],v=gGeom.inv(gPick(e)),span=(cu.hi-cu.lo)*1e-3;
  const lo=drag?cu.c[drag-1]+span:cu.lo+span,hi=drag<3?cu.c[drag+1]-span:cu.hi-span;
  cu.c[drag]=Math.max(lo,Math.min(hi,v));cu.auto=false;
  const now=performance.now();if(now-dragT>70){dragT=now;rebuild()}drawGauss();
});
const endDrag=()=>{if(drag<0)return;drag=-1;rebuild();drawGauss();renderFiche()};
gc.addEventListener('pointerup',endDrag);gc.addEventListener('pointercancel',endDrag);
$('resetCut').addEventListener('click',()=>{S.cut[S.open].auto=true;rebuild();drawGauss();renderFiche()});

/* ---------------- UI: header controls ---------------- */
const scrub=$('scrub');
function setProg(p){S.prog=Math.max(0,Math.min(1,p));scrub.value=Math.round(S.prog*1000)}
$('play').addEventListener('click',()=>{if(!S.playing&&S.prog>=1)setProg(0);S.playing=!S.playing;updPlay()});
function updPlay(){$('play').textContent=S.playing?'❚❚':'▶';$('play').setAttribute('aria-label',S.playing?'Pause':'Lecture')}
scrub.addEventListener('input',()=>{S.playing=false;updPlay();S.prog=+scrub.value/1000});
$('dur').addEventListener('change',e=>S.dur=+e.target.value);
function fillTakes(){const o=DATA.dates.map((d,i)=>`<option value="${i}">${d}</option>`).join('');$('selT0').innerHTML=o;$('selT1').innerHTML=o;$('selT0').value=S.T0;$('selT1').value=S.T1}
function setTake(which,v){
  if(S.session)return;
  if(which===0)S.T0=Math.min(v,S.T1-1);else S.T1=Math.max(v,S.T0+1);
  $('selT0').value=S.T0;$('selT1').value=S.T1;setProg(0);rebuild();drawGauss();renderFiche();
}
$('selT0').addEventListener('change',e=>setTake(0,+e.target.value));
$('selT1').addEventListener('change',e=>setTake(1,+e.target.value));
let spT=null;
function scheduleSpacing(lazy){ /* while the knob turns, the spacing is recomputed at most every 140 ms; on release, at once */
  if(lazy){if(!spT)spT=setTimeout(()=>{spT=null;spacingTakes();dirty=true},140);return}
  if(spT){clearTimeout(spT);spT=null}spacingTakes();
}
function setExp(E,fromSlider){
  E=Math.max(.05,Math.min(1000,+E||1));const k=E/S.exp;S.exp=E;window.__umExp=E;
  WORLD.scale.setScalar(E);
  const hs=Math.max(1,Math.sqrt(E)); /* the click area grows a little with the field so objects stay easy to pick */
  O1.forEach(o=>{o.root.scale.setScalar(1/E);o.hit.scale.setScalar(hs)});O2.forEach(o=>{o.root.scale.setScalar(1/E);o.hit.scale.setScalar(hs)});
  C3.forEach(g=>g.scale.setScalar(1/E));core.scale.setScalar(1/E);
  if(k!==1){tween=null;controls.target.multiplyScalar(k);camera.position.multiplyScalar(k)}
  scene.fog.near=10*E;scene.fog.far=24*E;controls.maxDistance=20*Math.max(1,E);camera.far=Math.max(100,60*E);camera.updateProjectionMatrix();
  scheduleSpacing(fromSlider);
  try{localStorage.setItem('um.volume',String(E))}catch(e){}
  if(!fromSlider)$('vol').value=Math.round(Math.max(-200,Math.min(400,Math.log2(E)*100)));
  $('volNum').value=E>=10?E.toFixed(1):E.toFixed(2);
  dirty=true;
}
$('vol').addEventListener('input',e=>setExp(Math.pow(2,+e.target.value/100),true));
$('vol').addEventListener('change',e=>setExp(Math.pow(2,+e.target.value/100)));
$('volNum').addEventListener('change',e=>setExp(e.target.value));
$('volMinus').addEventListener('click',()=>setExp(S.exp/1.25));
$('volPlus').addEventListener('click',()=>setExp(S.exp*1.25));
function setMode(m){if(S.session||(TWO&&m==='fourier'))return;S.mode=m;rebuild();syncControls();drawGauss();renderFiche()}
$('mFourier').addEventListener('click',()=>setMode('fourier'));
$('mFree').addEventListener('click',()=>setMode('free'));
$('km').addEventListener('change',e=>{if(S.session)return;S.km=e.target.checked;if(!S.km&&S.assign[9]==='km')S.assign[9]=HK?'pim':GC?(DATA.kmAlt||DATA.cols[0]):'ret1';if(S.km)S.assign[9]='km';S.cut[9].auto=true;rebuild();syncControls();drawGauss();renderFiche()});
$('session').addEventListener('click',()=>{
  if(S.session){S.session=null}
  else{S.session={ouverte:new Date().toISOString(),mode:S.mode,kobayashi:S.km||S.mode==='fourier',attributs:ATTR.map((A,k)=>({k:k+1,nom:A.name,ligne:eff(k),bornes:S.cut[k].c.slice(),queues:[S.cut[k].lo,S.cut[k].hi]}))};S.records.push(S.session)}
  syncControls();drawGauss();renderFiche();
});
function syncControls(){
  $('mFourier').setAttribute('aria-pressed',S.mode==='fourier');$('mFree').setAttribute('aria-pressed',S.mode==='free');
  $('mFourier').disabled=!!S.session||TWO;$('mFree').disabled=!!S.session;
  $('mFourier').title=TWO?(HK?"Le mode Fourier demande les matchs qui précèdent chaque prise ; ce système n'a que T₀ et T₁, deux saisons.":GC?"Le mode Fourier demande une suite de prises ; ce système n'a qu'un instantané (T₀ = T₁).":"Le mode Fourier demande les séances qui précèdent chaque prise ; ce système n'a que T₀ et T₁."):'';
  $('selT0').disabled=$('selT1').disabled=!!S.session;
  $('km').checked=S.km||S.mode==='fourier';$('km').disabled=!!S.session||S.mode==='fourier';
  const sb=$('session');sb.setAttribute('aria-pressed',!!S.session);
  sb.textContent=S.session?'Session ouverte · '+S.session.ouverte.slice(11,16)+' UTC · clore':'Ouvrir la session';
  refreshRack();
}

/* Layers */
const FINLAY=[['c1','Classe 1 · titres'],['sec','Classe 2 · secteurs'],['cty','Classe 2 · pays'],['ind','Classe 2 · industries'],['c3','Classe 3 · conteneurs'],['c4','Classe 4 · objet central'],['bounds','Bornes et cadran'],['trails','Traînées des cardinaux'],['ghost','Fantômes · copies de l\'objet'],['tlabels','Symbole dans l\'objet (Classe 1)'],['gpaths','Fantôme · lignes de trajectoire'],['links','Liens de la chaîne'],['labels','Étiquettes'],['spacing','Espacement (canon des tailles)'],['z0','Fil Z0 · moyenne de tout'],['z0c2','Z0 compte la Classe 2'],['z0c3','Z0 compte la Classe 3']];
const LAY=HK?HKLAY:GC?[['c1','Classe 1 · '+UN],...Object.keys(CTYPE).map(ty=>[ty,'Classe 2 · '+CTYPE[ty].plural])].concat(FINLAY.filter(x=>!['c1','sec','cty','ind'].includes(x[0]))):FINLAY;
if(!LAY.some(x=>x[0]==='c4v'))LAY.push(['c4v','Classe 4 · vecteurs depuis Z0(τ)']);
if(!LAY.some(x=>x[0]==='c3d'))LAY.push(['c3d','Classe 3 · diagonale Ω–Σ–α']);
if(!LAY.some(x=>x[0]==='micro'))LAY.push(['micro','Classe 4 · microcosme (espace réservé)']);
$('layers').innerHTML=LAY.map(([k,l])=>`<label class="chk"><input type="checkbox" id="ly-${k}" ${S.layers[k]?'checked':''}> ${esc(l)}</label>`).join('');
LAY.forEach(([k])=>$('ly-'+k).addEventListener('change',e=>{S.layers[k]=e.target.checked;G.bounds.visible=S.layers.bounds;G.c3.visible=S.layers.c3;G.c4.visible=S.layers.c4;
  if(['z0c2','z0c3','sec','cty','ind','c1',...CTYS].includes(k))rebuild(); /* push and pull: the set of Z0 and the weights of the throw change */
  dirty=true}));

/* Legend */
function drawLegend(){
  let h=[4,3,2,1,0].map(z=>`<span><span class="sw" style="background:${ZCOL[z]}"></span>${ZN[z]} ${esc(ATTR[3].levels[z])}</span>`).join('')+`<span>· taille : Classe 1 = 0,1 · Classe 2 = 0,2 · Classe 3 = 0,3 · objet central (Classe 4) = quatre fois la Classe 1, sans enveloppe</span>`;
  if(S.ghost)h+=`<span class="brk"></span><span>fantômes : copies de l'objet${N1>150?', déployées pour le titre ou le cardinal choisi':''} ; secteurs :</span>`+CARDS.filter(c=>c.ty==='sec').map(c=>`<span><span class="gl" style="background:${secCol(c.name)}"></span>${esc(c.name)}</span>`).join('')+`<span>· à la taille du canon, sans symbole ; lancés : creux · horloge : ${esc((GCLKL[S.gclk]||'').toLowerCase())}, un fantôme par médiane cumulée du titre ; elle règle seulement l'espacement${GHOST.ruler?` · règle du système : bord à bord (×1) au plus serré → ×${GHOST.ruler.max.toFixed(0)} au plus large · ${GHOST.ruler.n.toLocaleString('fr-CA')} fantômes, dont ${GHOST.ruler.out.toLocaleString('fr-CA')} creux : sur la paroi, hors bornes, hors règle`:''}</span>`;
  if(HK)h+=HKLEG;
  $('legend').innerHTML=h;
}
drawLegend();
/* Ghost controls */
const gBtn=$('ghost');
function syncGhostUI(){
  gBtn.setAttribute('aria-pressed',S.ghost?'true':'false');gBtn.disabled=TWO;
  gBtn.title=TWO?(HK?"Le fantôme demande la saison match par match ; ce système n'a que T₀ et T₁, deux saisons.":GC?"Le fantôme demande une suite de prises ; ce système n'a qu'un instantané (T₀ = T₁).":"Le fantôme demande toutes les séances ; ce système n'a que T₀ et T₁."):'Fantôme : chaque titre laisse ses fantômes de T₀ à T₁ ; la colonne d\'horloge en règle seulement l\'espacement (touche F)';
  $('gwBox').hidden=$('gtauBox').hidden=$('thrBox').hidden=$('gContact').hidden=$('gvBox').hidden=!S.ghost;$('gvol').value=String(Math.round(Math.log2(S.gvol)*100));$('gvolN').textContent='×'+fmtGV(S.gvol);$('gclk').value=S.gclk;$('gtau').value=String(S.gtau);$('thr').value=String(S.thr);$('thrW').value=S.thrW;
  $('sub').textContent='le corps · Universal Metaphor · moteur v2 · rév. 23.16 · '+(S.ghost?'fantôme · horloge : '+(GCLKL[S.gclk]||'').toLowerCase()+(S.thr?' · lancer '+S.thr+' séances':''):(HK?'deux prises · deux saisons':GC?'un instantané · T₀ = T₁':'deux prises'));
  drawLegend();
}
function setGhost(on){
  if(TWO)return;S.ghost=!!on;window.__umGhost=S.ghost;try{localStorage.setItem('um.fantome',S.ghost?'1':'0')}catch(e){}
  if(S.ghost)ensureTL();
  rebuild();syncGhostUI();drawGauss();renderFiche();
}
gBtn.addEventListener('click',()=>setGhost(!S.ghost));
$('gclk').addEventListener('change',e=>{S.gclk=e.target.value;window.__umGclk=S.gclk;buildGhost();syncGhostUI();renderFiche();dirty=true});
$('gtau').addEventListener('change',e=>{S.gtau=+e.target.value;window.__umGtau=S.gtau;dirty=true});
$('gvol').addEventListener('input',e=>{$('gvolN').textContent='×'+fmtGV(Math.pow(2,+e.target.value/100))});
$('gvol').addEventListener('change',e=>{S.gvol=Math.pow(2,+e.target.value/100);window.__umGvol=S.gvol;buildGhost();renderFiche();dirty=true});
$('gContact').addEventListener('click',()=>{if(GHOST.ruler&&GHOST.ruler.dg>0)setExp(Math.min(1000,Math.max(.05,2*.1*DENS/GHOST.ruler.dg)))});
$('thr').addEventListener('change',e=>{S.thr=+e.target.value;window.__umThr=S.thr;buildThrowWin();THR.d=-1;syncGhostUI();dirty=true});
$('thrW').addEventListener('change',e=>{S.thrW=e.target.value;window.__umThrW=S.thrW;buildThrowWin();THR.d=-1;dirty=true});

/* ---------------- Picking: hover, click, double-click ---------------- */
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),tip=$('tip');
let hover=null,downAt=null;
function pickAt(e){
  const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;
  ray.setFromCamera(mouse,camera);
  const vis=HITS.filter(m=>{let p=m;while(p){if(!p.visible)return false;p=p.parent}return true});
  const h=ray.intersectObjects(vis,false);if(!h.length)return null;
  h.sort((a,b)=>a.distance-b.distance);
  /* Exact hover (Éric, v20.2): a Class 1 object answers first, even inside a Class 2, 3 or 4 object or the Z0 marker. */
  const f=h[0];
  if(f.object.userData.ref.kind!==1){const c=f.object.getWorldPosition(new THREE.Vector3()),rr=f.object.geometry.parameters.radius*f.object.getWorldScale(new THREE.Vector3()).x;
    const o1=h.find(x=>x.object.userData.ref.kind===1&&x.object.getWorldPosition(new THREE.Vector3()).distanceTo(c)<=rr);if(o1)return o1.object.userData.ref}
  return f.object.userData.ref;
}
renderer.domElement.addEventListener('pointermove',e=>{
  const ref=pickAt(e);hover=ref;
  if(!ref){tip.style.display='none';renderer.domElement.style.cursor='';return}
  renderer.domElement.style.cursor='pointer';
  tip.innerHTML=tipHTML(ref);tip.style.display='block';
  const r=stage.getBoundingClientRect();let x=e.clientX-r.left+14,y=e.clientY-r.top+14;
  if(x+310>r.width)x=Math.max(4,x-330);if(y+180>r.height)y=Math.max(4,y-190);
  tip.style.left=x+'px';tip.style.top=y+'px';
});
renderer.domElement.addEventListener('pointerleave',()=>{tip.style.display='none'});
/* The central object is painted after everything else, so a click on its
   picture is a click on it even when a title sits in front along the ray. */
function class4OnTop(e){
  if(!G.c4.visible||!core.parent) return false;
  const r=renderer.domElement.getBoundingClientRect();
  const p=core.getWorldPosition(new THREE.Vector3());
  const sc=core.getWorldScale(new THREE.Vector3()).x||1;
  const dist=Math.max(.2,camera.position.distanceTo(p));
  const px=r.height/(2*Math.tan(camera.fov*Math.PI/360)*dist);
  const rad=Math.max(22,C4O.R*sc*px*1.25);
  p.project(camera);
  if(p.z>1) return false;
  const sx=(p.x*.5+.5)*r.width+r.left, sy=(-p.y*.5+.5)*r.height+r.top;
  return Math.hypot(e.clientX-sx,e.clientY-sy)<=rad;
}
function goParent(){
  const parent=window.UM_FLOOR_BY&&UM_FLOOR_BY[SYS.id]&&UM_FLOOR_BY[SYS.id].parent;
  switchSys(parent||'world');
}
function ascendOrEnter(e){
  const ref=pickAt(e);if(!ref)return;
  if(ref.side){switchSys(ref.side);return}
  if(class4OnTop(e)){
    if(SYS.id!=='world'){goParent();return}
    select({kind:4});enterPlan();return;
  }
  const rr=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-rr.left)/rr.width*2-1;mouse.y=-(e.clientY-rr.top)/rr.height*2+1;
  ray.setFromCamera(mouse,camera);
  const vis=HITS.filter(m=>{let p=m;while(p){if(!p.visible)return false;p=p.parent}return true});
  const onC4=ray.intersectObjects(vis,false).some(h=>h.object.userData.ref&&h.object.userData.ref.kind===4);
  if(ref.kind===1){const id=TK[ref.idx]&&TK[ref.idx].floor;if(id){switchSys(id);return}}
  if(onC4&&SYS.id!=='world'){goParent();return}
  select(ref);
  if(ref.kind===4)enterPlan();else if(ref.kind===1||ref.kind===2)enterFocus(ref);
}
let tapMark=null;
renderer.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY]});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;
  if(moved>(e.pointerType==='touch'?14:5))return;
  const ref=pickAt(e);
  /* One click on the central picture climbs to the parent. One click on a
     door (an object that names a floor) steps down. A plain title stays selected. */
  if(class4OnTop(e)&&SYS.id!=='world'){goParent();return}
  if(ref&&ref.side){switchSys(ref.side);return}
  if(ref&&ref.kind===1){const id=TK[ref.idx]&&TK[ref.idx].floor;if(id){switchSys(id);return}}
  if(ref)select(ref);
  const now=e.timeStamp,prev=tapMark;tapMark={t:now,x:e.clientX,y:e.clientY,type:e.pointerType||'mouse'};
  if(!prev||prev.type!==tapMark.type||now-prev.t<40||now-prev.t>520)return;
  if(Math.hypot(e.clientX-prev.x,e.clientY-prev.y)>28)return;
  lastTouchNav=performance.now();ascendOrEnter(e);
});
/* A finger double-tap never becomes a dblclick: the orbit handler cancels the touch. Mouse keeps dblclick. */
renderer.domElement.addEventListener('dblclick',e=>{if(lastTouchNav&&performance.now()-lastTouchNav<700)return;ascendOrEnter(e)});
function boxMembers(z,d){const m=[];for(let i=0;i<N1;i++){const j=i*F+d;if(PRES[j]&&boxOf(V[j*10],V[j*10+1],V[j*10+2])===z)m.push(i)}return m}
/* The leading object carries its information inside itself: its symbol always; when chosen, a short card. Ghosts carry none. */
let CARD=null;
function infoCard(lines,col){
  const c=document.createElement('canvas'),g=c.getContext('2d'),fs=lines.map((t,i)=>i?28:52),font=i=>`${i?400:500} ${fs[i]}px "IBM Plex Mono", ui-monospace, monospace`;
  let w=0;lines.forEach((t,i)=>{g.font=font(i);w=Math.max(w,g.measureText(t).width)});
  c.width=Math.ceil(w)+40;c.height=Math.ceil(fs.reduce((a,b)=>a+b*1.28,0))+26;
  g.fillStyle='rgba(5,8,13,.82)';g.beginPath();if(g.roundRect)g.roundRect(0,0,c.width,c.height,20);else g.rect(0,0,c.width,c.height);g.fill();
  let y=14;g.textBaseline='top';lines.forEach((t,i)=>{g.font=font(i);g.fillStyle=i?'#cfe0f0':col;g.fillText(t,20,y);y+=fs[i]*1.28});
  const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:false}));sp.renderOrder=11;sp.userData.asp=c.width/c.height;return sp;
}
function setCard(ref){
  if(CARD){CARD.o.root.remove(CARD.sp);CARD.o.card=null;try{CARD.sp.material.map.dispose();CARD.sp.material.dispose()}catch(e){}CARD=null}
  if(!ref||(ref.kind!==1&&ref.kind!==2))return;
  const o=(ref.kind===1?O1:O2)[ref.idx];let lines,col;
  if(ref.kind===1&&HK){const r=hkCardLines(ref.idx);lines=r[0];col=r[1]}
  else if(ref.kind===1&&GC){const t=TK[ref.idx];col='#a6dcff';lines=[t.s,t.a,t.g.join(' · ')]}
  else if(ref.kind===1){const t=TK[ref.idx],j=ref.idx*F+S.T1;col=secCol(t.sec);
    lines=[t.s,t.ind,PRES[j]?DATA.dates[S.T1]+' · '+fmt('lprice',LN.lprice[j])+' · '+(LN.ytd[j]>=0?'+':'')+(LN.ytd[j]*100).toFixed(1)+' %':t.sec]}
  else{const c=CARDS[ref.idx];col='#a6dcff';lines=[c.name,'Classe 2 · '+CTYPE[c.ty].label.toLowerCase(),c.members.length+' membres']}
  const sp=infoCard(lines,col),wv=1.9*o.R;sp.scale.set(wv,wv/sp.userData.asp,1);o.root.add(sp);o.card=sp;CARD={o,sp};
  if(o.label)o.label.visible=false;
}
function select(ref){const prev=CARD&&CARD.o;S.sel=ref;setCard(ref);if(prev&&prev.label&&prev.kind===2)prev.label.visible=S.layers.labels;buildTrail();if(S.ghost&&N1>150){buildReplicas();THR.d=-1}updThrSel();renderFiche();drawGauss();dirty=true}
function gCur(){return S.T0+S.prog*(S.T1-S.T0)}
function curD(){return S.ghost?Math.round(gCur()):(S.prog<.5?S.T0:S.T1)}
function vals(ref,d){
  if(ref.kind===1){const j=ref.idx*F+d;return PRES[j]?Array.from(V.subarray(j*10,j*10+10)):null}
  if(ref.kind===2){const q=ref.idx*F+d;return CP[q]?Array.from(CV.subarray(q*10,q*10+10)):null}
  return null;
}
function tipHTML(ref){
  const d=curD();
  if(ref.side)return `<div class="t">${esc(ref.label)}</div><div class="k">Classe 4 · à côté de Finance · hors de la galaxie</div><div class="k" style="margin-top:4px">${esc(ref.note||'')}</div>`;
  if(ref.kind===5)return `<div class="t">Z0 · moyenne de tout</div><div class="k">placeholder : moyennes · fil linéaire de Z0(T₀) à Z0(T₁)</div><div class="k" style="margin-top:5px">Z0(T₀) <b>${z0txt(Z0A)}</b> · ${Z0N[0]} points<br>Z0(T₁) <b>${z0txt(Z0B)}</b> · ${Z0N[1]} points</div><div class="k" style="margin-top:4px">dérive |Δ| <b>${Math.hypot(Z0B[0]-Z0A[0],Z0B[1]-Z0A[1],Z0B[2]-Z0A[2]).toFixed(5)}</b> · ancre des vecteurs de la Classe 4 vivante</div>`;
  if(ref.kind===4){
    const o0=zoneCounts(S.open,S.T0),o1=zoneCounts(S.open,S.T1);
    return `<div class="t">Classe 4 · objet central</div><div class="k">${esc(SYS.name)} · contenu et borné · dans son espace réservé · position dans l'espace non établie</div><div class="k" style="margin-top:4px">dérive de Z0 |Δ| <b>${Math.hypot(Z0B[0]-Z0A[0],Z0B[1]-Z0A[1],Z0B[2]-Z0A[2]).toFixed(5)}</b> · ${C4N[0]} → ${C4N[1]} ${UN}</div>
    <div class="k" style="margin-top:5px">Z-ZERO(T₀) ${DATA.dates[S.T0]} <b>${f8(ZZ[S.T0])}</b><br>Z-ZERO(T₁) ${DATA.dates[S.T1]} <b>${f8(ZZ[S.T1])}</b><br>ΔZ <b>${(ZZ[S.T1]-ZZ[S.T0]>=0?'+':'')+f8(ZZ[S.T1]-ZZ[S.T0])}</b></div>
    <div class="k" style="margin-top:5px">${esc(ATTR[S.open].name)} · T₀ ${[4,3,2,1,0].map(z=>ZN[z]+' '+o0[z]).join(' ')}<br>${esc(ATTR[S.open].name)} · T₁ ${[4,3,2,1,0].map(z=>ZN[z]+' '+o1[z]).join(' ')}</div>`;
  }
  if(ref.kind===3){const z=ref.idx,c=boxMembers(z,d).length;
    if(!C3ON[z])return `<div class="t">Classe 3 · piège ${C3SYM[z]} · non activé</div><div class="k">Champ ${ZN[z]} · (X, Y, Z) = ${c3xyz(z)}</div><div class="k" style="margin-top:4px">Prêt à être conditionné pour recevoir sa cible. Champ ouvert : ${c} ${UN} y passent sans être contenus (${HK?'saison':GC?'prise':'séance du'} ${DATA.dates[d]}).</div>`;
    return `<div class="t">Classe 3 · conteneur ${C3SYM[z]}</div><div class="k">${esc(ZNL[z])} · ${C3ROLE[z]} · piège fixe actif en (X, Y, Z) = ${c3xyz(z)}</div><div class="k" style="margin-top:4px">${c} ${UN} contenus ${(HK||GC)?'en':'à la séance du'} ${DATA.dates[d]}</div>${(()=>{const v=c3v(z,1)||c3v(z,0);return v?`<div class="k" style="margin-top:4px">manifeste à T₁ : ${esc(ATTR[3].levels[zoneOf(v[3])])} · ${esc(ATTR[5].levels[zoneOf(v[5])])} · rotation ${esc(ATTR[7].levels[zoneOf(v[7])])}</div>`:''})()}`}
  const v0=vals(ref,S.T0),v1=vals(ref,S.T1);
  const ti=ref.kind===1&&S.ghost&&S.thr?thrInfo(ref.idx):null;
  const head=ref.kind===1?`<div class="t">${esc(TK[ref.idx].s)}</div><div class="k">Classe 1 · ${HK?hkTipLine(ref.idx):GC?esc(TK[ref.idx].a)+' · '+esc(TK[ref.idx].g.join(', ')):esc(TK[ref.idx].sec)+' · '+esc(TK[ref.idx].cty)}</div>`+(S.ghost?ghostTip(ref.idx,d):'')+(ti?`<div class="k" style="margin-top:4px">lancer ${ti.h} séances : ${ti.act?'habileté <b>'+pct(1-ti.e/Math.max(1e-9,ti.e0))+'</b> contre l\'immobile':'point lancé, réel pas encore connu'}</div>`:'')
    :`<div class="t">${esc(CARDS[ref.idx].name)}</div><div class="k">Classe 2 · cardinal ${esc(CTYPE[CARDS[ref.idx].ty].label.toLowerCase())} · ${CN[ref.idx*F+d]} membres</div>`;
  if(!v0&&!v1)return head+`<div class="k" style="margin-top:4px">Hors du champ aux deux prises.</div>`;
  const zs=v=>v?v.map(zoneOf):null,a=zs(v0),b=zs(v1),L=b||a,arw=k=>(a?ZN[a[k]]:'·')+' → '+(b?ZN[b[k]]:'·');
  const dv=(v,d)=>v?TAU*(1+v.slice(0,9).reduce((x,y)=>x+y,0)/9)-ZZ[d]:null,e0=dv(v0,S.T0),e1=dv(v1,S.T1),rel=(e0!=null&&e1!=null)?e1-e0:null;
  return head+`<div class="k" style="margin-top:5px">T₀ → T₁ · X ${arw(0)} · Y ${arw(1)} · Z ${arw(2)}<br>à T₁ : ${esc(ATTR[3].levels[L[3]])} · ${esc(ATTR[5].levels[L[5]])} · ${esc(ATTR[9].levels[L[9]])}<br>${rel!=null?`mouvement relatif <b>${(rel>=0?'+':'')+rel.toFixed(5)}</b> · ${rel>=0?'gagne':'perd'} contre son système`:'présent à une seule prise'}</div>`;
}

function ghostTip(i,d){const j=i*F+d,t=TK[i];if(!PRES[j]||!(RVOL[j]>0))return '';
  return `<div class="k" style="margin-top:4px"><span style="color:${secCol(t.sec)}">●</span> séance du ${DATA.dates[d]} · volume ${qty(t.v[d-t.o])} titres · ×${RVOL[j].toFixed(2)} sa médiane · horloge ${esc((GCLKL[S.gclk]||'').toLowerCase())} : ${(CLK[S.gclk]||RVOL)[j].toFixed(2).replace('.',',')} fantôme(s) sur ce pas</div>`}
/* Camera moves */
let tween=null;
function flyTo(p,t,ms){tween={p0:camera.position.clone(),t0:controls.target.clone(),p1:p.clone(),t1:t.clone(),s:performance.now(),ms:ms||700}}
function enterFocus(ref){
  S.focus=ref;S.plan=false;const o=(ref.kind===1?O1:O2)[ref.idx];const p=o.root.position.clone().multiplyScalar(S.exp);
  const out=new THREE.Vector3(p.x,0,p.z).normalize();const dist=ref.kind===1?1.3:2.1;
  flyTo(p.clone().add(out.multiplyScalar(dist)).add(new THREE.Vector3(0,dist*.55,0)),p);
  banner('Mode Focus · '+(ref.kind===1?TK[ref.idx].s:CARDS[ref.idx].name)+' · la caméra suit l\'objet');dirty=true;
}
function enterPlan(){S.focus=null;S.plan=true;flyTo(new THREE.Vector3(0,10.5*S.exp,.01),new THREE.Vector3(0,0,0));banner('Mode Plan · cadran vu d\'en haut, midi en haut')}
function exitModes(){S.focus=null;S.plan=false;$('banner').style.display='none';flyTo(HOME.p.clone().multiplyScalar(S.exp),HOME.t.clone().multiplyScalar(S.exp));dirty=true}
function banner(t){$('bannerTxt').textContent=t;$('banner').style.display='flex'}
$('bannerExit').addEventListener('click',exitModes);
addEventListener('keydown',e=>{const typing=/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);if(!typing&&(e.key==='+'||e.key==='=')){e.preventDefault();setExp(S.exp*1.25)}if(!typing&&(e.key==='-'||e.key==='_')){e.preventDefault();setExp(S.exp/1.25)}if(!typing&&(e.key==='f'||e.key==='F')&&!e.metaKey&&!e.ctrlKey){e.preventDefault();setGhost(!S.ghost)}if(e.key==='Escape'&&(S.focus||S.plan))exitModes();if(e.key===' '&&e.target===document.body){e.preventDefault();$('play').click()}});

/* ---------------- Fiche (reading card) ---------------- */
const fiche=$('fiche');
function statusBlock(){
  return `<ul class="status">${HK?hkStatus():''}
  <li><span class="st v">VERIFIED</span>τ = √(φ² + 5) = ${TAU.toFixed(10)} ; τ² − φ = ${(TAU*TAU-PHI).toFixed(10)}</li>
  <li><span class="st g">GOVERNANCE</span>Lecture en deux prises : T₀ et T₁, chacune un état constitué complet, jointes par une seule transition cycloïdale par axe (G-1, G-3), sans les séances intermédiaires.</li>
  <li><span class="st g">GOVERNANCE</span>Conteneurs actifs : α en (+1, +1, +1), la tête du serpent, en haut, à l'intérieur, à 11 h 59 ; Ω en (−1, −1, −1), la queue, en bas, à l'extérieur, à 12 h 01 ; Σ en (0, 0, 0), le ventre, à 6 h. Z : +1 à l'intérieur, −1 à l'extérieur. Chaque conteneur actif manifeste les attributs physiques et angulaires du collapse de ses contenus. Les objets de Classe 1 sont solides. Volume (END GAME F3) : un bouton dilate ou contracte tout l'environnement, sans limite ; les positions s'écartent ou se rapprochent, les tailles restent au canon. Espacement selon le canon des tailles : 0,1 · 0,2 · 0,3 · 0,4, grille calibrée pour 1 234 objets, aucun chevauchement. Pièges λ⁻ (champ φ⁻) et λ⁺ (champ φ⁺) en place, non activés, prêts à être conditionnés pour recevoir leur cible. +1 à 11 h 59, −1 à 12 h 01. Quatre classes ; cinq zones, quatre bornes 20 / 40 / 60 / 80, fixées à l'ouverture de la session ; chaîne H → V → T par prise ; saturation = 10ᵉ résultat, le collapse (G-4 ; nom fixé par Éric le 6 nov.) ; tout cardinal est Classe 2 (G-5).</li>
  <li><span class="st g">GOVERNANCE</span>Ordre fixe des dix attributs (Éric, 6 nov.) : X, Y, Z ; forme, étirement-écrasement, couleur ; avant-arrière, rotation, centre-extérieur (les trois moments triangulaires, sur X, Y, Z) ; saturation. Chaque case porte son icône : sept icônes Fleur de vie (UM Investor Deck v11, diapo 10) et trois dessins d'Éric (étirement-écrasement, avant-arrière, centre-extérieur), tels quels.</li>
  <li><span class="st g">GOVERNANCE</span>Objet central (Éric, 10 nov., 22 h 51 et 23 h 17 ; YB1 v20.21, « in the core, everywhere ») : la Classe 4 est un seul objet. Sa position dans l'espace n'est pas établie : il se tient dans son espace réservé, le centre creux de la chambre (rayon &lt; 1, où aucun objet de Classe 1, 2 ou 3 ne va), et ne fait que réagir. Son corps manifeste le collapse des attributs physiques et angulaires de tout le système, sur le même ensemble que Z0 (un seul ensemble, une seule moyenne). Il n'a pas d'enveloppe : ce corps est l'objet central, quatre fois la taille d'un objet de Classe 1, dessiné par-dessus tout (Éric, 11 nov., 5 h 32) ; il porte Z-ZERO. Le système est contenu dans sa borne ; les objets de Classe 2 y portent leur propre jeu de tensions. Les vecteurs or partent de Z0(τ), la moyenne de tout (marqueur or sur le fil), pas de lui. Rien ne le chevauche. Un seul chemin dans le cœur du moteur : toutes les ancres et tous les étages futurs le portent.</li>
  <li><span class="st g">GOVERNANCE</span>Vue d'ouverture (Éric, 11 nov., 13 h 38) : seulement les objets et l'environnement, aucune ligne entre les objets. Vecteurs depuis Z0(τ), traînées des cardinaux, liens club ↔ club, traînée du transfert (LNH) et diagonale Ω–Σ–α attendent dans Couches ; les liens de la chaîne n'apparaissent qu'au choix d'un objet. Tous les liens de la page restent.</li>
  <li><span class="st g">GOVERNANCE</span>Panneaux déplaçables ou effaçables (Éric, 11 nov., 15 h 14) : rien ne doit cacher le moteur. La fenêtre gaussienne, seul panneau posé sur la chambre, se déplace par sa barre de titre (double clic : retour près de son icône) et s'efface par × ou Échap. La fiche s'efface par son ×, par Fiche ◨ ou la touche ] ; la colonne d'icônes par ◧ Attributs ou [ ; Vue pleine (\) efface les deux. Le HUB ne fait que relier le moteur réel ; chaque nouvel étage du HUB devient un nouvel objet du moteur.</li>
  <li><span class="st g">GOVERNANCE</span>Société · Musique (rév. 23.16, ancre #music ; Éric, 11 nov. : « as we build the hub, it's just gonna be another new object in the engine ») : le fichier Spotify 2021 de Gary Kivenko devient un système de Classe 4 du moteur, même squelette que la LNH. Un seul instantané (T₀ = T₁) : aucun mouvement, dérive [INCOMPLET]. Classe 1 montrée : 10 titres les plus populaires par genre (PROPOSED) ; Classe 2 : genres, tonalités, modes, contenu, mesures ; poids égal.</li>
  <li><span class="st p">PROPOSED</span>Microcosme (rév. 23.16 ; Éric, 10 nov., 23 h 20 : « the space given inside the reserved space for the central object is a microcosm of the entire space » ; Canon : tout s'emboîte dans tout) : toute la chambre est repliée dans l'espace réservé, entre l'objet central et la paroi intérieure (rayon 1 → 3 ramené à 0,46 → 0,94, hauteur × 0,3, même azimut). Chaque objet rendu y est un point de sa couleur ; les conteneurs gardent la couleur de leur zone. Un miroir : il ne place rien. Couche « Classe 4 · microcosme », éteinte à l'ouverture.</li>
  <li><span class="st o">OPEN</span>Espace provisoire (Éric, 10 nov., 23 h 20) : c'est du microcosme qu'on projettera un espace provisoire. La règle de projection n'est pas encore donnée ; rien n'est projeté.</li>
  <li><span class="st g">GOVERNANCE</span>Canon Z0 (Éric, 5 nov.) : Z0 est la moyenne de tout, calculée comme un seul ensemble (Classe 1 ; Classe 2 des niveaux actifs si la case est cochée ; conteneurs de Classe 3 actifs si la case est cochée). Fil Z0 linéaire de Z0(T₀) à Z0(T₁) ; chaque objet, chaque fantôme = fil + écart, et l'écart suit la demi-arche cycloïdale axe par axe : montée c(t) = (πt − sin πt)/π, descente 1 − c(1 − t), axe inchangé immobile. Les couleurs suivent la même règle, canal par canal. Pousser et tirer : cocher ou décocher recalcule aussitôt le fil, les positions, les fantômes et les lancers.</li>
  <li><span class="st g">GOVERNANCE</span>Axe de rotation des formes (Éric) : par les sommets, jamais par les faces. Dodécaèdre α de sommet à sommet opposé ; merkaba Ω de pointe à pointe ; tétraèdre φ⁺ sommet en haut, il roule sur sa base ; octaèdre φ⁻ de sommet à sommet ; cube Σ, seule exception, posé à plat sur une face. Survol exact : un objet de Classe 1 répond d'abord, même à l'intérieur d'une Classe 2.</li>
  <li><span class="st g">GOVERNANCE</span>Fantômes réels (Éric, 9 nov.) : un fantôme est une copie de l'objet, avec sa forme, sa couleur, sa saturation, son étirement et ses inclinaisons à ce point du trajet, à la taille du canon. Le volume règle la densité de leur présence le long de la ligne, jamais leur taille. Les fantômes ne portent ni symbole ni information : seul l'objet de tête les porte. Les fantômes lancés sont creux. « Volume au contact » écarte l'environnement jusqu'à ce que, au plus serré, deux fantômes d'une traîne se touchent bord à bord.</li>
  <li><span class="st g">GOVERNANCE</span>Volume du fantôme (spécification Grok, 9 nov.) : un cadran distinct du Volume du système, jamais fusionné ; il règle ensemble la densité de l'écho (plus de fantômes par pas médian, même règle) et sa clarté, globalement et pour chaque titre (fiche). Gradient : l'objet de tête est le plus lumineux, la lumière décroît jusqu'à l'origine, la marque la plus faible encore visible ; c'est le contrôle intégré de la transposition Z0. Icônes révision 2 (jeu préféré d'Éric) : cases 5, 7 et 9 redessinées dans le style Fleur de vie.</li>
  <li><span class="st g">GOVERNANCE</span>Information dans l'objet (règle commune 1, 6 nov.) : chaque objet de Classe 1 porte son symbole en lui ; chaque objet de Classe 2 porte son nom en lui ; l'objet choisi montre en lui sa fiche courte. Même structure pour tout système lu : pour la LNH, la photo du joueur et sa courte description iront dans l'objet. Interface (Éric, 9 nov.) : un clic sur une icône ouvre, dans le même panneau, le choix de l'analyse et les bornes de sa gaussienne ; chaque panneau latéral se masque et revient (touches [ et ]).</li>
  <li><span class="st p">PROPOSED</span>Formes opératoires : écartement minimal des positions affichées (rayons additionnés × 1,06 ; les cardinaux bougent huit fois moins que les titres ; les valeurs des fiches restent celles des données) ; collapse des conteneurs pondéré par la valeur échangée ; bornes calculées sur l'union des deux prises ; D₄ local = τ·(1 + v), soit la diagonale du cuboïde φd × √2d × √3d ; V = moyenne des neuf ; T = moyenne sur tous les points ; Fourier court 5 séances, long 63 ; cardinaux pondérés par la valeur échangée ; conteneur d'un titre = zone de sa projection sur la diagonale ; λ⁻ et λ⁺ posés à ∓0,4 ; échelles de couleur, d'étirement, de rotation et d'inclinaison.</li>
  <li><span class="st g">GOVERNANCE</span>Fantôme v19 (5 nov., Éric, de vive voix), règle universelle : le fantôme va du point de départ (T₀) au point d'arrivée (l'objet à la séance courante). La colonne choisie, le volume d'abord, règle seulement la fréquence d'apparition entre les deux : un fantôme à chaque pas égal de sa grandeur cumulée, et non à chaque séance. Elle ne touche jamais la taille ni l'intensité : tous les fantômes ont la même taille. Deux fantômes ne se chevauchent jamais. La distance entre fantômes exprime l'ampleur du changement ; les grands espaces aux extrêmes sont voulus, l'espace est un attribut de sens. La règle vaut pour chaque colonne.</li>
  <li><span class="st g">GOVERNANCE</span>Bornes de la règle (Éric) : au plus serré du système, les fantômes se touchent bord à bord (×1) ; au plus large, l'écart est le plus long atteint dans le système. Tout tient dans tout avec les mêmes bornes ; ce qui ne répond pas à la règle est nommé hors règle, et c'est une anomalie à lire, pas à corriger.</li>
  <li><span class="st p">PROPOSED</span>Pas de l'horloge = une médiane du titre sur la fenêtre [T₀ du titre, T₁] (médiane standard : moyenne des deux valeurs centrales quand leur nombre est pair ; recalculée quand T₀ ou T₁ bouge ; |rendement du jour| = |rendement log|, comme la volatilité 20 séances, et une séance plate compte dans sa médiane ; un volume nul est une absence et n'y compte pas ; alignée sur le prototype v19 de Grok, note du 5 nov., 20 h 15) (volume du jour ÷ volume médian du titre ; idem pour la valeur échangée, le |rendement du jour| et la volatilité 20 séances) ; « séance » sert de témoin. Le pas de la séance d+1 règle les fantômes du trajet d → d+1, posés en ligne droite dans l'espace des attributs. Diamètre commun = plus courte distance entre deux fantômes d'une même traîne, dans tout le système, hors paroi ; un fantôme posé sur la paroi (au-delà des bornes 0,5 % / 99,5 %) est hors règle : il est dessiné creux, compté, et ne règle pas la règle ; le Volume (F3) dilate l'espacement et le diamètre ensemble. Les copies sont à la taille du canon ; tant que le Volume ne les écarte pas, elles peuvent se chevaucher au plus serré : c'est le Volume au contact qui rétablit le bord à bord. Couleur = secteur. Mémoire : toute la période par défaut (5, 20 ou 63 séances en option). Couche « Fantôme · lignes de trajectoire » : traînées des cardinaux et chemin du titre choisi. En mode Fantôme, Fourier est calculé à chaque séance ; l'espacement des prises ne s'applique pas.</li>
  <li><span class="st o">OPEN</span>Chevauchements entre traînes de titres différents : la règle est appliquée à l'intérieur de chaque traîne ; deux titres au même état se superposent et ce n'est pas corrigé. Placement : Grok pose les titres sur le plan rendement cumulé × volatilité ; ici, la chambre toroïdale ajoute la valeur échangée sur 20 séances en profondeur.</li>
  <li><span class="st p">PROPOSED</span>Lancer devant l'objet réel (rév. 22) : depuis la séance sous le curseur, chaque titre lance h fantômes (5, 10 ou 20), même taille, un par pas médian (l'horloge future, inconnue, compte un pas par séance), sur la demi-arche cycloïdale. Les objets de Classe 2 portent le poids : déplacement lancé = moyenne pondérée des déplacements de ses cardinaux des niveaux actifs (secteur, pays, industrie) sur les h séances précédentes ; poids = valeur échangée du cardinal, ou égal. Précision : quand la séance d + h existe, point lancé contre point réel et contre l'immobile ; habileté = 1 − erreur ÷ erreur de l'immobile. C'est ici que l'âme (ESTHER, Esmeralda, CLAVIS) se branchera : l'écart entre fantômes lancés et fantômes passés est leur terrain.</li>
  <li><span class="st o">OPEN</span>Appariement montée/descente : les formules d'Éric sont suivies telles qu'écrites (Grok signale que « ease-out » désigne d'ordinaire l'autre demi-arche). Icônes X et Y : posées selon les définitions d'Éric (X la diagonale, Y la verticale), alors que les fichiers « case 01 » et « case 02 » de Grok sont dans l'ordre inverse : à confirmer.</li>
  <li><span class="st o">OPEN</span>Pouvoir discriminant au-delà des coordonnées brutes ; seuil d'émergence des Poppers ; source du résidu GEP de 99 % ; pont avec l'âme (CLAVIS) non branché.</li></ul>`;
}
function attrRows(v0,v1,raw0,raw1,ks){
  const sg=x=>(x>=0?'+':'')+x.toFixed(5);
  return ATTR.map((A,k)=>{
    if(ks&&!ks.includes(k))return '';
    const z0=v0?zoneOf(v0[k]):null,z1=v1?zoneOf(v1[k]):null,zl=z1!=null?z1:z0;
    const c0=v0?TAU*(1+v0[k])-ZZ[S.T0]:null,c1=v1?TAU*(1+v1[k])-ZZ[S.T1]:null;
    const chip=z=>z==null?'<span class="z" style="background:var(--line-2);color:var(--muted)">·</span>':`<span class="z" style="background:${ZCOL[z]}">${ZN[z]}</span>`;
    const rawTxt=(raw0||raw1)?`${raw0?esc(raw0(k)):'—'} → ${raw1?esc(raw1(k)):'—'}`:'collapse des membres';
    return `<div class="row"><span class="a"><img class="ico" src="${ICO[k]}" alt="${k+1}">${esc(A.name)} · <span style="color:var(--muted)">${esc(A.levels[zl])}</span></span><span class="zz">${chip(z0)}<i>→</i>${chip(z1)}</span>
    <span class="n">${esc(LINEINFO[eff(k)].label)} : ${rawTxt} · v ${v0?sgn(v0[k]):'—'} → ${v1?sgn(v1[k]):'—'} · D₄ − Z-ZERO ${c0!=null?sg(c0):'—'} → ${c1!=null?sg(c1):'—'}${c0!=null&&c1!=null?' · relatif '+sg(c1-c0):''}</span></div>`;
  }).join('');
}
function curveTxt(v0,v1){
  if(!v0||!v1)return 'Présent à une seule prise : il entre ou sort du champ pendant la transition.';
  const ax=['X','Y','Z'].map((n,a)=>{const d=v1[a]-v0[a];return {n,s:d>0?1:d<0?-1:0}});
  const t=ax.map(o=>o.n+' '+(o.s>0?'monte, c(t)':o.s<0?'descend, 1 − c(1 − t)':'immobile')).join(' · ');
  const straight=ax.every(o=>o.s===ax[0].s&&o.s!==0);
  return 'Courbe F, une par axe, lue contre le fil Z0 : '+t+(straight?'. Trajectoire droite : les trois axes suivent la même courbe, signal d\'anomalie (13 sept.).':'.');
}
function drawSpark(series,cuts,label){
  const c=$('spark');if(!c)return;const g=c.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1),W=c.clientWidth,H=c.clientHeight;
  c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
  const fin=series.filter(Number.isFinite);if(!fin.length)return;
  let lo=Math.min(...fin,...(cuts||[])),hi=Math.max(...fin,...(cuts||[]));if(hi===lo)hi=lo+1;
  const X=d=>2+d/(F-1)*(W-4),Y=y=>H-4-(y-lo)/(hi-lo)*(H-14);
  (cuts||[]).forEach((c0,z)=>{g.strokeStyle=ZCOL[z+1]+'66';g.beginPath();g.moveTo(0,Y(c0));g.lineTo(W,Y(c0));g.stroke()});
  g.strokeStyle='#a6dcff';g.lineWidth=1.3;g.beginPath();let st=false;
  series.forEach((y,d)=>{if(!Number.isFinite(y)){st=false;return}st?g.lineTo(X(d),Y(y)):g.moveTo(X(d),Y(y));st=true});g.stroke();
  [[S.T0,'T₀'],[S.T1,'T₁'],[curD(),'']].forEach(([d,t])=>{g.strokeStyle=t?'#5c6a82':'#ffffff';g.beginPath();g.moveTo(X(d),8);g.lineTo(X(d),H);g.stroke();if(t){g.fillStyle='#8b98ad';g.font='9px "IBM Plex Mono", monospace';g.fillText(t,X(d)+2,9)}});
  g.fillStyle='#5c6a82';g.font='9px "IBM Plex Mono", monospace';g.textAlign='right';g.fillText(label,W-2,9);
}
/* Rev. 23.10: the central object holds its reserved space, the hollow centre. Nothing is projected there yet (Éric, 10 Nov., 23 h 20). */
function c4Place(){
  return `<dl class="kv"><dt>Place</dt><dd>espace réservé · centre creux de la chambre (rayon &lt; 1)</dd>
    <dt>Position dans l'espace</dt><dd>non établie</dd>
    <dt>Microcosme</dt><dd>tout l'espace replié dans l'espace réservé (couche « Classe 4 · microcosme ») · projection d'un espace provisoire : pas encore</dd></dl>
    <p class="note"><span class="st o">OPEN</span>Éric, 10 nov., 23 h 20 : l'espace réservé à l'objet central est un microcosme de tout l'espace ; c'est de lui qu'on projettera un espace provisoire. Rien n'y est projeté dans cette révision.</p>`;
}
function c4Block(){
  const D=[0,1,2].map(a=>Z0B[a]-Z0A[a]),mod=Math.hypot(D[0],D[1],D[2]),sg=x=>(x>=0?'+':'')+x.toFixed(5);
  const dir=mod>0?'('+D.map(x=>(x>=0?'+':'')+(x/mod).toFixed(3)).join(', ')+')':'0 · aucune dérive';
  const z=(ti,k)=>C4N[ti]?ATTR[k].levels[zoneOf(C4V[ti*10+k])]:'—';
  return `<h2 style="margin-top:12px">Objet central · Classe 4 vivante · dérive-comme-signal <span>${C4N[0]} → ${C4N[1]} ${UN}</span></h2>
    <dl class="kv"><dt>Dérive de Z0 · Δ (X, Y, Z)</dt><dd>(${D.map(sg).join(', ')})</dd><dt>Module</dt><dd class="big">${mod.toFixed(5)}</dd><dt>Direction</dt><dd>${dir}</dd>
    <dt>Ensemble de Z0 · Classe ${['1',S.layers.z0c2?'2':'',S.layers.z0c3?'3':''].filter(Boolean).join(' + ')}</dt><dd>${Z0N[0]} → ${Z0N[1]}</dd>
    <dt>Centre-extérieur (distance moyenne à Z0)</dt><dd>${Number.isFinite(C4CE[0])?C4CE[0].toFixed(4):'—'} → ${Number.isFinite(C4CE[1])?C4CE[1].toFixed(4):'—'}</dd></dl>
    <table class="zt">${ATTR.map((A,k)=>`<tr><td><img class="ico" src="${ICO[k]}" alt="${k+1}"> ${esc(A.name)}</td><td>${esc(z(0,k))} → ${esc(z(1,k))}</td></tr>`).join('')}</table>
    <p class="note">L'objet central est la Classe 4 elle-même. Sa position dans l'espace n'est pas établie (Éric, 10 nov., 23 h 17) : il se tient dans son espace réservé, au centre creux de la chambre, et ne fait que réagir. Son corps manifeste le collapse des attributs physiques et angulaires de tout le système à chaque prise — forme, étirement-écrasement, couleur, avant-arrière, rotation, centre-extérieur, avec la saturation — sur le même ensemble que Z0 (un seul ensemble, une seule moyenne). Il passe de T₀ à T₁ par la demi-arche cycloïdale. Pas d'enveloppe autour de lui : ce corps est l'objet central, quatre fois la taille d'un objet de Classe 1, dessiné par-dessus tout. X, Y, Z effondrés sont Z0 lui-même : ils se lisent ici, ils ne placent pas l'objet. Les vecteurs or partent de Z0(τ), la moyenne de tout (marqueur or sur le fil), vers chaque objet rendu (couche « vecteurs depuis Z0(τ) »).</p>
    ${c4Place()}`;
}
function renderFiche(){
  const s=S.sel||{kind:4},d=curD(),k=S.open,id=eff(k);
  if(s.side){
    fiche.innerHTML=`<div class="cls">Classe 4 · à côté de Finance</div><h3>${esc(s.label)}</h3><div class="meta">${esc(s.note||'')}</div><p class="note">Hors de la galaxie finance : ni agrégat, ni zone, ni dérive de Finance. Double-clic pour entrer. La Classe 4 de cet étage remonte à Finance.</p>`;
    return;
  }
  let h='';
  if(s.kind===5){
    h=`<div class="cls">Z0 · moyenne de tout · placeholder</div><h3>Fil Z0</h3>
    <div class="meta">Un seul ensemble, une seule valeur par prise. Le vrai Z0, produit d'un triple effondrement, n'est pas calculable aujourd'hui. Z0 n'est pas Z-ZERO (sortie scalaire de la chaîne H → V → T), ni la place de l'objet central de Classe 4 : sa position dans l'espace n'est pas établie (Éric, 10 nov., 23 h 17). Z0(τ) est l'ancre des vecteurs or ; Z-ZERO est la valeur que porte l'objet central.</div>
    <dl class="kv"><dt>Z0(T₀) · ${DATA.dates[S.T0]}</dt><dd>${z0txt(Z0A)}</dd><dt>Z0(T₁) · ${DATA.dates[S.T1]}</dt><dd>${z0txt(Z0B)}</dd>
    <dt>Ensemble</dt><dd>${Z0N[0]} → ${Z0N[1]} points</dd><dt>Classe 2</dt><dd>${S.layers.z0c2?'comptée · niveaux '+CTYS.filter(t=>S.layers[t]).map(t=>CTYPE[t].label.toLowerCase()).join(', '):'non comptée'}</dd><dt>Classe 3</dt><dd>${S.layers.z0c3?'comptée (conteneurs actifs habités)':'non comptée'}</dd></dl>
    <p class="note">Pousser et tirer : dans Couches, « Z0 compte la Classe 2 », « Z0 compte la Classe 3 » et les niveaux de Classe 2 changent l'ensemble. Le fil, les positions, les fantômes et les lancers se recalculent aussitôt. Le fil est droit en coordonnées (X, Y, Z) ; dans la chambre toroïdale, il se courbe avec le cadran.</p>`;
  } else if(s.kind===4){
    const o0=zoneCounts(k,S.T0),o1=zoneCounts(k,S.T1);
    const M=[0,1,2,3,4].map(()=>[0,0,0,0,0]);let migr=0;
    for(let i=0;i<N1;i++){const a=i*F+S.T0,b=i*F+S.T1;if(PRES[a]&&PRES[b]){const za=zoneOf(V[a*10+k]),zb=zoneOf(V[b*10+k]);M[za][zb]++;if(za!==zb)migr++}}
    const mx=Math.max(1,...M.flat());
    h=`<div class="cls">Classe 4 · système contenu et borné</div><h3>${esc(SYS.name)}</h3>
    <div class="meta">${HK?hkMeta4():GC?`${N1} ${UN} · `+Object.keys(CTYPE).map(ty=>CARDS.filter(c=>c.ty===ty).length+' '+CTYPE[ty].plural).join(' · '):`${N1} titres · ${CARDS.filter(c=>c.ty==='sec').length} secteurs · ${CARDS.filter(c=>c.ty==='cty').length} pays · ${CARDS.filter(c=>c.ty==='ind').length} industries`} · 3 conteneurs actifs (Ω, Σ, α) · 2 pièges λ en attente</div>
    <dl class="kv"><dt>Z-ZERO(T₀) · ${DATA.dates[S.T0]}</dt><dd>${f8(ZZ[S.T0])}</dd><dt>Z-ZERO(T₁) · ${DATA.dates[S.T1]}</dt><dd>${f8(ZZ[S.T1])}</dd>
    <dt>ΔZ</dt><dd class="big">${(ZZ[S.T1]-ZZ[S.T0]>=0?'+':'')+f8(ZZ[S.T1]-ZZ[S.T0])}</dd></dl>
    <dl class="kv"><dt>Z0(T₀) · fil</dt><dd>${z0txt(Z0A)}</dd><dt>Z0(T₁) · fil</dt><dd>${z0txt(Z0B)}</dd></dl>
    <p class="note">L'objet central se tient dans son espace réservé, au centre creux de la chambre ; sa position dans l'espace n'est pas établie. Il porte Z-ZERO, sortie scalaire de la chaîne. Le fil Z0 (or pointillé, marqueur or à l'instant) est le repère des mouvements et l'ancre des vecteurs : trois choses distinctes. Pousser et tirer : dans Couches, « Z0 compte la Classe 2 », « Z0 compte la Classe 3 » et les niveaux de Classe 2 changent l'ensemble ; le corps de l'objet central, le fil, les positions, les fantômes et les lancers se recalculent aussitôt.</p>
    ${c4Block()}
    ${S.ghost&&S.thr?thrBlock4():''}${HK?hkBlock4():''}
    <h2 style="margin-top:12px">Bibliothèque de Classe 4 <span>${esc(SYS.silo)} · ${LIB.filter(x=>x.data&&x.silo===SYS.silo).length} / ${LIB.filter(x=>x.silo===SYS.silo).length}</span></h2>
    <div class="chain">${LIB.filter(x=>x.silo===SYS.silo).map(x=>`<button class="chip" type="button" data-sys="${x.id}" ${x.data?'':'disabled'}><span>${esc(x.name)}</span><em>${x.id===SYS.id?'affiché':x.data?'chargé · ouvrir':'en attente de YB1'}</em></button>`).join('')}</div>
    <h2 style="margin-top:12px">Migration T₀ → T₁ <span>${esc(ATTR[k].name)}</span></h2>
    <table class="mig"><tr><th>T₀╲T₁</th>${[0,1,2,3,4].map(z=>`<th style="color:${ZCOL[z]}">${ZN[z]}</th>`).join('')}<th>T₀</th></tr>
    ${[0,1,2,3,4].map(a=>`<tr><th style="color:${ZCOL[a]}">${ZN[a]}</th>${[0,1,2,3,4].map(b=>`<td style="background:${a===b?'#14202f':'rgba(166,220,255,'+(M[a][b]/mx*.35).toFixed(2)+')'}">${M[a][b]||''}</td>`).join('')}<td>${o0[a]}</td></tr>`).join('')}
    <tr><th>T₁</th>${o1.map(x=>`<td>${x}</td>`).join('')}<td></td></tr></table>
    <p class="note">${migr} ${UN} changent de zone. Vers les pôles : volée de corneilles ; retour vers les champs φ : murmuration. Aucun Popper n'est déclaré tant que son seuil reste OPEN.</p>
    <h2 style="margin-top:12px">Relevé de lecture</h2>
    <p class="note">${S.session?`Session ouverte le ${S.session.ouverte.replace('T',' ').slice(0,16)} UTC, mode ${S.session.mode}. Bornes fixées pour les dix attributs.`:'Aucune session ouverte : les bornes restent déplaçables. Ouvrez la session pour les fixer et créer le relevé.'} ${S.records.length} relevé(s) dans cette visite.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button id="copyState" type="button">Copier l'état pour l'âme (JSON)</button></div>
    <div id="dumpBox"></div>
    <h2 style="margin-top:12px">Statuts</h2>${statusBlock()}`;
  } else if(s.kind===3){
    const z=s.idx,rows=ATTR.map((A,kk)=>`<div class="row"><span class="a"><img class="ico" src="${ICO[kk]}" alt="${kk+1}">${esc(A.name)}</span><span class="z" style="background:${ZCOL[z]}">${zoneCounts(kk,S.T0)[z]} → ${zoneCounts(kk,S.T1)[z]}</span></div>`).join('');
    const mem=boxMembers(z,S.T1);
    h=(C3ON[z]?`<div class="cls">Classe 3 · conteneur fixe actif</div><h3>${esc(ZNL[z])}</h3><div class="meta">${C3ROLE[z]} · piège fixe en (X, Y, Z) = ${c3xyz(z)} · rayon 0,3 · T₀ ${DATA.dates[S.T0]} → T₁ ${DATA.dates[S.T1]}</div>
      <h2 style="margin-top:10px">Manifeste le collapse de ses contenus <span>${C3N[z*2]} → ${C3N[z*2+1]} ${UN}</span></h2>
      <p class="note">Forme, étirement-écrasement, couleur, avant-arrière, rotation et centre-extérieur du conteneur : collapse des ${UN} qu'il contient à chaque prise, ${HK?'pondéré par les matchs joués':GC?'à poids égal':'pondéré par la valeur échangée'} comme pour les cardinaux.</p>
      <div class="rows">${attrRows(c3v(z,0),c3v(z,1),null,null,[3,4,5,6,7,8])}</div>`
      :`<div class="cls">Classe 3 · piège <span style="text-transform:none">λ</span> · non activé</div><h3>${C3SYM[z]} · champ ${ZN[z]}</h3><div class="meta">En attente en (X, Y, Z) = ${c3xyz(z)} · rayon 0,3 · T₀ ${DATA.dates[S.T0]} → T₁ ${DATA.dates[S.T1]}</div><p class="note">Prêt à être conditionné pour recevoir sa cible. L'activation est un acte humain : tant qu'il n'est pas activé, le champ ${ZN[z]} reste ouvert et les ${UN} qui y passent ne sont pas contenus.</p>`)+`
    <p class="note">Nombre de ${UN} dans la zone ${ZN[z]}, attribut par attribut, de T₀ à T₁ :</p><div class="rows">${rows}</div>
    <h2 style="margin-top:10px">${C3ON[z]?(HK?'Joueurs contenus à T₁':'Titres contenus à T₁'):(HK?'Joueurs dans le champ ouvert à T₁':'Titres dans le champ ouvert à T₁')} <span>${mem.length}</span></h2><p class="note">${HK?'Un joueur':'Un titre'} appartient au conteneur de la zone où tombe la moyenne de ses X, Y et Z : sa projection sur la diagonale (PROPOSED).</p><div class="members">${mem.map(i=>`<button type="button" data-sel="1:${i}">${esc(TK[i].s)}</button>`).join('')}</div>`;
  } else if(s.kind===1&&HK){
    h=hkFiche1(s);
  } else if(s.kind===1&&GC){
    const t=TK[s.idx],j0=s.idx*F+S.T0,j1=s.idx*F+S.T1,v0=vals(s,S.T0),v1=vals(s,S.T1);
    const vz=v1||v0,z0=vz?boxOf(vz[0],vz[1],vz[2]):2;
    h=`<div class="cls">Classe 1 · point de données</div><h3>${esc(t.s)}</h3><div class="meta">${esc(t.a)}${t.al?' · '+esc(t.al):''} · ${esc(DATA.dates[S.T1])}</div>
    <div class="chain">${t.c2.map(ci=>`<button class="chip" type="button" data-sel="2:${ci}"><span>${esc(CARDS[ci].name)}</span><em>Classe 2 · ${esc(CTYPE[CARDS[ci].ty].label.toLowerCase())}</em></button>`).join('')}
      <button class="chip" type="button" data-sel="3:${z0}"><span style="color:${ZCOL[z0]}">${C3ON[z0]?esc(ZNL[z0]):'champ '+ZN[z0]+' ouvert · '+C3SYM[z0]+' non activé'}</span><em>${C3ON[z0]?'Classe 3 · conteneur':'Classe 3 · aucun'}</em></button>
      <button class="chip" type="button" data-sel="4:0"><span>${esc(SYS.name)}</span><em>Classe 4 · système</em></button></div>`;
    if(!v0&&!v1)h+=`<p class="note">Hors du champ.</p>`;
    else{const r0=PRES[j0]?k2=>fmt(eff(k2),LN[eff(k2)][j0]):null,r1=PRES[j1]?k2=>fmt(eff(k2),LN[eff(k2)][j1]):null;
      h+=`<dl class="kv"><dt>D₄ vertical (÷ 9)</dt><dd>${PRES[j1]?f8(VI[j1]):'—'}</dd><dt>Contre Z-ZERO</dt><dd class="big">${PRES[j1]?((VI[j1]-ZZ[S.T1]>=0?'+':'')+(VI[j1]-ZZ[S.T1]).toFixed(8)):'—'}</dd></dl>
      <p class="note">Un seul instantané : T₀ = T₁, aucun mouvement. Identifiant Spotify ${esc(t.id)}.</p><div class="rows">${attrRows(v0,v1,r0,r1)}</div>`}
  } else if(s.kind===1){
    const t=TK[s.idx],j0=s.idx*F+S.T0,j1=s.idx*F+S.T1,v0=vals(s,S.T0),v1=vals(s,S.T1);
    const cs=['sec','cty','ind'].map(ty=>cardOf(s.idx,ty));
    const vz=v1||v0,z0=vz?boxOf(vz[0],vz[1],vz[2]):2;
    h=`<div class="cls">Classe 1 · point de données</div><h3>${esc(t.s)}</h3><div class="meta">${esc(t.ind)} · T₀ ${DATA.dates[S.T0]} → T₁ ${DATA.dates[S.T1]}${t.o>0?' · coté depuis le '+DATA.dates[t.o]:''}</div>
    <div class="chain">
      <button class="chip" type="button" data-sel="2:${cs[0]}"><span>${esc(t.sec)}</span><em>Classe 2 · secteur</em></button>
      <button class="chip" type="button" data-sel="2:${cs[1]}"><span>${esc(t.cty)}</span><em>Classe 2 · pays</em></button>
      <button class="chip" type="button" data-sel="2:${cs[2]}"><span>${esc(t.ind)}</span><em>Classe 2 · industrie</em></button>
      <button class="chip" type="button" data-sel="3:${z0}"><span style="color:${ZCOL[z0]}">${C3ON[z0]?esc(ZNL[z0]):'champ '+ZN[z0]+' ouvert · '+C3SYM[z0]+' non activé'}</span><em>${C3ON[z0]?'Classe 3 · conteneur à T₁':'Classe 3 · aucun'}</em></button>
      <button class="chip" type="button" data-sel="4:0"><span>${esc(SYS.name)}</span><em>Classe 4 · système</em></button>
      ${LIB.filter(x=>x.data&&x.id!==SYS.id&&x.silo===SYS.silo&&x.tickers&&x.tickers.has(t.s)).map(x=>`<button class="chip" type="button" data-sys="${x.id}" data-tk="${esc(t.s)}"><span>aussi dans ${esc(x.name)}</span><em>Classe 4 · ouvrir</em></button>`).join('')}
    </div>`;
    if(S.ghost){const st=GHOST.stk&&GHOST.stk[s.idx],R=GHOST.ruler,x=v=>(v/R.dg).toFixed(v/R.dg<10?2:0).replace('.',',');
      h+=`<h2 style="margin-top:10px">${esc(GCLKL[S.gclk]||'')} séance par séance <span>×1 = médiane du titre = un fantôme</span></h2><canvas id="vbars" class="vbars" aria-label="Colonne d'horloge de chaque séance rapportée à la médiane du titre"></canvas>`;
      {const gv=S.gvolI[s.idx]||1;h+=`<label class="asel" style="margin-top:8px" title="Volume du fantôme de ce titre : densité et clarté de son écho, par-dessus le réglage global">Volume du fantôme · ${esc(TK[s.idx].s)} <input id="gvolI" type="range" min="-200" max="200" step="1" value="${Math.round(Math.log2(gv)*100)}" style="flex:1;accent-color:#b388ff"><b id="gvolIN">×${fmtGV(gv)}</b></label>`}
      if(S.thr)h+=thrBlock1(s.idx);
      if(st&&R&&st.n>1)h+=`<p class="note">${st.n} fantômes de T₀ à T₁ · écart le plus serré ×${x(st.min)} · le plus large ×${x(st.max)}${st.out?` · ${st.out} creux, sur la paroi : hors règle`:''} · règle du système : ×1 (bord à bord) → ×${R.max.toFixed(0)}</p>`}
    if(!v0&&!v1)h+=`<p class="note">Hors du champ aux deux prises.</p>`;
    else{
      const e0=PRES[j0]?VI[j0]-ZZ[S.T0]:null,e1=PRES[j1]?VI[j1]-ZZ[S.T1]:null,rel=e0!=null&&e1!=null?e1-e0:null;
      const r0=PRES[j0]?k2=>fmt(eff(k2),LN[eff(k2)][j0]):null,r1=PRES[j1]?k2=>fmt(eff(k2),LN[eff(k2)][j1]):null;
      h+=`<dl class="kv"><dt>Clôture</dt><dd>${PRES[j0]?fmt('lprice',LN.lprice[j0]):'—'} → ${PRES[j1]?fmt('lprice',LN.lprice[j1]):'—'}</dd>
      <dt>D₄ vertical (÷ 9)</dt><dd>${PRES[j0]?f8(VI[j0]):'—'} → ${PRES[j1]?f8(VI[j1]):'—'}</dd>
      <dt>Mouvement relatif</dt><dd class="big">${rel!=null?((rel>=0?'+':'')+rel.toFixed(8)):'—'}</dd></dl>
      <p class="note">${rel!=null?(rel>=0?'Il gagne contre son propre système entre les deux prises.':'Il perd contre son propre système entre les deux prises.')+' ':''}${curveTxt(v0,v1)}</p>
      <div class="rows">${attrRows(v0,v1,r0,r1)}</div>`;
    }
  } else {
    const c=CARDS[s.idx],v0=vals(s,S.T0),v1=vals(s,S.T1),q0=s.idx*F+S.T0,q1=s.idx*F+S.T1;
    const mem=HK?hkSortMembers(c.members):GC?c.members.slice().sort((a,b)=>(LN[DATA.cols[0]][b*F+S.T1]||0)-(LN[DATA.cols[0]][a*F+S.T1]||0)):c.members.slice().sort((a,b)=>(LN[WL][b*F+S.T1]||0)-(LN[WL][a*F+S.T1]||0));
    h=`<div class="cls">Classe 2 · cardinal · ${esc(CTYPE[c.ty].label.toLowerCase())}</div><h3>${esc(c.name)}</h3>
    <div class="meta">Membres dans le champ : ${CN[q0]} à T₀ → ${CN[q1]} à T₁ · poids ${HK?Math.round(CW[q0]).toLocaleString('fr-CA')+' → '+Math.round(CW[q1]).toLocaleString('fr-CA')+' matchs joués':GC?'égal (un '+UN.replace(/s$/,'')+' = un)':usd(CW[q0])+' → '+usd(CW[q1])+' échangés '+(TWO?'le jour même':'par séance (moyenne 20)')}</div>
    <p class="note">Super-instanciateur : collapse pondéré de tous les résultats spatiaux, physiques et angulaires de ses membres, à chaque prise. Il mène la danse. ${curveTxt(v0,v1)}</p>
    <div class="chain"><button class="chip" type="button" data-sel="4:0"><span>${esc(SYS.name)}</span><em>Classe 4 · système</em></button></div>${HK?hkFiche2(s.idx):''}`;
    if(S.ghost&&S.thr&&THR.nowR){const r=THR.nowR.filter(x=>c.mset.has(x.i)),sm=summarize(r);
      h+=`<h2 style="margin-top:10px">Lancers de ses membres <span>${S.thr} séances depuis le ${DATA.dates[THR.d]}</span></h2><p class="note">${sm?`${sm.n} titres mesurés · habileté médiane <b>${pct(sm.med)}</b> · ${pc0(sm.beat)} battent l'immobile.`:'Pas encore mesurables : la séance d + h n\'existe pas dans les données.'}</p>`}
    if(v0||v1)h+=`<div class="rows">${attrRows(v0,v1,null,null)}</div>`;else h+=`<p class="note">Aucun membre dans le champ aux deux prises.</p>`;
    h+=`<h2 style="margin-top:10px">Membres${HK&&c.tk?' (T₀ ∪ T₁)':''} <span>${c.members.length}</span></h2><div class="members">${mem.map(i=>`<button type="button" data-sel="1:${i}">${esc(TK[i].s)}</button>`).join('')}</div>`;
  }
  fiche.innerHTML=h;
  {const gi=fiche.querySelector('#gvolI');if(gi&&S.sel&&S.sel.kind===1){const i=S.sel.idx;
    gi.addEventListener('input',e=>{fiche.querySelector('#gvolIN').textContent='×'+fmtGV(Math.pow(2,+e.target.value/100))});
    gi.addEventListener('change',e=>{S.gvolI[i]=Math.pow(2,+e.target.value/100);buildGhost();renderFiche();dirty=true})}}

  if(S.ghost&&s.kind===1)drawVBars(s.idx);
  fiche.querySelectorAll('[data-sel]').forEach(b=>b.addEventListener('click',()=>{const [kd,ix]=b.dataset.sel.split(':').map(Number);select(kd===4?{kind:4}:{kind:kd,idx:ix})}));
  const cp=$('copyState');if(cp)cp.addEventListener('click',copyState);
  fiche.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>setScope(+b.dataset.scope),0)));
  fiche.querySelectorAll('[data-sys]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.sys!==SYS.id)setTimeout(()=>switchSys(b.dataset.sys,{tk:b.dataset.tk||null}),0)}));
}
const fmtGV=x=>(x>=10?x.toFixed(0):x.toFixed(2)).replace('.',',').replace(/,?0+$/,'');
function thrBlock1(i){
  const t=thrInfo(i);if(!t)return `<p class="note">Lancer : aucun cardinal actif ne couvre les ${S.thr} séances avant le ${DATA.dates[Math.max(0,THR.d)]||'—'}.</p>`;
  const w=t.ws.map(([c,x])=>`${esc(CARDS[c].name)} ${pc0(x)}`).join(' · ');
  return `<h2 style="margin-top:10px">Lancer devant l'objet <span>${t.h} séances depuis le ${DATA.dates[t.d]}</span></h2>
  <dl class="kv"><dt>Poids des Classe 2</dt><dd>${w}</dd><dt>Déplacement lancé</dt><dd>${v3(t.D)}</dd><dt>Départ</dt><dd>${v3(t.start)}</dd><dt>Point lancé</dt><dd>${v3(t.end)}</dd>
  <dt>Réel · ${t.act?DATA.dates[t.d+t.h]:'à venir'}</dt><dd>${v3(t.act)}</dd>${t.act?`<dt>Erreur · immobile</dt><dd>${t.e.toFixed(3)} · ${t.e0.toFixed(3)}</dd><dt>Habileté</dt><dd class="big">${pct(1-t.e/Math.max(1e-9,t.e0))}</dd>`:''}</dl>
  <p class="note">${t.act?'Copies creuses (arêtes seules) : les fantômes lancés. Losange blanc : où le titre est vraiment allé ; le pointillé blanc mesure l\'erreur.':'La séance d + h n\'existe pas encore dans les données : le lancer attend sa mesure.'} Unités : celles des axes, de −1 à +1.</p>`;
}
function thrBlock4(){
  const a=THR.now,b=THR.win,f=x=>x.toFixed(3).replace('.',',');
  return `<h2 style="margin-top:12px">Lancers pondérés par la Classe 2 <span>${S.thr} séances · poids ${S.thrW==='eq'?'égal':'valeur échangée'}</span></h2>
  <div class="rows"><div class="row"><span class="a">Depuis le ${DATA.dates[Math.max(0,THR.d)]||'—'} · ${a?a.n+' titres':'à mesurer'}</span><span class="big">${a?pct(a.med):'—'}</span><span class="n">${a?pc0(a.beat)+' battent l\'immobile · erreur '+f(a.err)+' contre '+f(a.err0):(THR.d-S.thr<0?'Il faut '+S.thr+' séances avant le lancer pour peser les cardinaux.':'La séance d + h n\'existe pas encore dans les données.')}</span></div>
  <div class="row"><span class="a">Fenêtre T₀ → T₁ · ${THR.winD} séances · ${b?b.n.toLocaleString('fr-CA')+' lancers':'—'}</span><span class="big">${b?pct(b.med):'—'}</span><span class="n">${b?pc0(b.beat)+' battent l\'immobile · erreur '+f(b.err)+' contre '+f(b.err0):'—'}</span></div></div>
  <p class="note">Grand chiffre : habileté médiane, 1 − erreur ÷ erreur de l'immobile. Positive : le poids des cardinaux a mieux placé le titre que de le laisser sur place. Erreurs en unités d'axe (−1 à +1). Mesure de la règle, pas une prévision de marché.</p>`;
}
function drawVBars(i){
  const c=$('vbars');if(!c)return;const g=c.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1),W=c.clientWidth,H=c.clientHeight;
  c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const t=TK[i],cd=curD(),lo=-2,hi=3,span=Math.max(1,S.T1-S.T0);
  const Y=r=>H-12-(Math.max(lo,Math.min(hi,Math.log2(r)))-lo)/(hi-lo)*(H-22),X=d=>3+(d-S.T0)/span*(W-6),bw=Math.max(1,(W-6)/(span+1)-.4),y1=Y(1),col=secCol(t.sec);
  g.strokeStyle='#2b3c55';g.lineWidth=1;g.beginPath();g.moveTo(0,y1);g.lineTo(W,y1);g.stroke();
  const WC=CLK[S.gclk]||RVOL;for(let d=S.T0;d<=S.T1;d++){const j=i*F+d,r=WC[j];if(!(r>0))continue;const y=Y(r);g.globalAlpha=d<=cd?.85:.13;g.fillStyle=col;g.fillRect(X(d)-bw/2,Math.min(y,y1),bw,Math.max(1,Math.abs(y1-y)))}
  g.globalAlpha=1;g.strokeStyle='#ffffff';g.beginPath();g.moveTo(X(cd),4);g.lineTo(X(cd),H-11);g.stroke();
  g.font='9px "IBM Plex Mono", monospace';g.fillStyle='#8b98ad';g.textAlign='left';g.fillText('×1',2,y1-3);g.fillText(DATA.dates[S.T0],2,H-1);
  g.textAlign='right';g.fillText(DATA.dates[S.T1],W-2,H-1);
  const j=i*F+cd;if(WC[j]>0){g.fillStyle='#dbe3ee';g.fillText(DATA.dates[cd]+' · ×'+WC[j].toFixed(2),W-2,9)}
}
function copyState(){
  const d=curD();
  const out={projet:'Manifestation',systeme:SYS.name,corps:'Universal Metaphor · moteur v2 · rév. 23.16',ame:'CLAVIS × Esmeralda · pont non branché',volume:+S.exp.toFixed(4),transition:'T₀ → T₁, courbe F cycloïdale par axe',mode:S.mode,kobayashi:S.km||S.mode==='fourier',fantome:{actif:S.ghost,horloge:GCLKL[S.gclk],regle:'v20 : un fantôme par médiane cumulée du titre (médiane standard sur la fenêtre [T₀ du titre, T₁]) ; même taille pour tous ; espacement seulement ; bord à bord (×1) au plus serré → écart le plus long du système',diametre:GHOST.ruler?+GHOST.ruler.dg.toPrecision(6):null,ecartMax:GHOST.ruler?+GHOST.ruler.max.toFixed(2):null,fantomes:GHOST.ruler?GHOST.ruler.n:0,horsRegle:GHOST.ruler?GHOST.ruler.out:0,memoire:S.gtau||'toute la période'},
    z0:{T0:Z0A.map(x=>+x.toFixed(6)),T1:Z0B.map(x=>+x.toFixed(6)),ensemble:Z0N.slice(),classe2:S.layers.z0c2,classe3:S.layers.z0c3,regle:'moyenne de tout, un seul ensemble ; fil linéaire ; écart cycloïdal par axe'},
    lancer:{horizon:S.thr,poids:S.thrW,seance:THR.d>=0?DATA.dates[THR.d]:null,maintenant:THR.now,fenetre:THR.win},
    session:S.session,prises:{T0:{date:DATA.dates[S.T0],zzero:+ZZ[S.T0].toFixed(8)},T1:{date:DATA.dates[S.T1],zzero:+ZZ[S.T1].toFixed(8)},dZ:+(ZZ[S.T1]-ZZ[S.T0]).toFixed(8)},
    attributs:ATTR.map((A,k)=>({k:k+1,nom:A.name,ligne:eff(k),bornes:S.cut[k].c.map(x=>+x.toPrecision(8))})),
    classe1:TK.map((t,i)=>{const a=vals({kind:1,idx:i},S.T0),b=vals({kind:1,idx:i},S.T1),pk=v=>v?{v:v.map(x=>+x.toFixed(4)),zones:v.map(x=>ZN[zoneOf(x)])}:null;return HK?{s:t.s,id:t.id,position:t.pos,nationalite:t.nat,clubs:t.cl,T0:pk(a),T1:pk(b)}:GC?{s:t.s,artistes:t.a,album:t.al,id:t.id,genres:t.g,T0:pk(a),T1:pk(b)}:{s:t.s,secteur:t.sec,pays:t.cty,industrie:t.ind,T0:pk(a),T1:pk(b)}}),
    classe2:CARDS.map((c,ci)=>{const a=vals({kind:2,idx:ci},S.T0),b=vals({kind:2,idx:ci},S.T1);return {type:c.ty,nom:c.name,membres:c.members.length,T0:a?a.map(x=>+x.toFixed(4)):null,T1:b?b.map(x=>+x.toFixed(4)):null}})};
  const txt=JSON.stringify(out,null,1);
  const show=()=>{$('dumpBox').innerHTML='<textarea class="dump" readonly></textarea>';const ta=$('dumpBox').firstChild;ta.value=txt;ta.focus();ta.select()};
  try{navigator.clipboard.writeText(txt).then(()=>{$('copyState').textContent='Copié'},show)}catch(e){show()}
}

/* ---------------- Main loop ---------------- */
let dirty=true,lastD=-1,lastF=0,last=performance.now(),firstFull=0,alive=true;
function computeFirstFull(){for(let d=0;d<F;d++){let n=0;for(let i=0;i<N1;i++)if(PRES[i*F+d])n++;if(n>=.9*N1)return d}return 0}
function tick(now){
  if(!alive)return;
  const dt=Math.min(.1,(now-last)/1000);last=now;
  if(tween){const u=Math.min(1,(now-tween.s)/tween.ms),e=1-(1-u)*(1-u);camera.position.lerpVectors(tween.p0,tween.p1,e);controls.target.lerpVectors(tween.t0,tween.t1,e);if(u>=1)tween=null}
  if(S.playing){setProg(S.prog+dt/S.dur);if(S.prog>=1){S.playing=false;updPlay()}}
  const d0=S.T0,d1=S.T1,t=S.prog;
  c4Frame(S.ghost?tauOf(gCur()):t); /* the central object holds its reserved space; its state is exposed first */
  if(C3DIAG)C3DIAG.visible=!!S.layers.c3d;
  if(S.ghost){const c=gCur(),dA=Math.min(S.T1,Math.floor(c)),dB=Math.min(S.T1,dA+1),tt=c-dA;
    O1.forEach(o=>applyObj(o,dA,dB,tt,dt));O2.forEach(o=>applyObj(o,dA,dB,tt,dt));applyC3(t,dt);relax();}
  else{O1.forEach(o=>applyObj(o,d0,d1,t,dt));O2.forEach(o=>applyObj(o,d0,d1,t,dt));applyC3(t,dt);if(t>0&&t<1)relax();}
  ghostFrame(gCur());
  z0Frame(S.ghost?tauOf(gCur()):t);applyC4(t,dt);vecFrame(S.ghost?tauOf(gCur()):t);microFrame();
  if(S.ghost&&S.thr){const dI=Math.min(S.T1,Math.floor(gCur()));if(dI!==THR.d)buildThrowFrame(dI);
    const U=THRREP.U;U.uSize.value=1/S.exp;U.uAll.value=1;U.uGain.value=.8;U.uSel.value=S.sel&&S.sel.kind===1?S.sel.idx:-1;
    THRREP.group.visible=S.layers.ghost;THR.pts.visible=false;}
  else{THR.pts.visible=false;THRREP.group.visible=false;THR.err.visible=false;THR.land.visible=false;if(THR.d!==-1&&(!S.ghost||!S.thr))THR.d=-1}
  applyTrails();applyLinks();applyXfer();applyPTrail();
  yearPath.visible=!!(S.sel&&(S.sel.kind===1||S.sel.kind===2))&&pathGeo.drawRange.count>1&&(!S.ghost||S.layers.gpaths);
  if(S.focus&&!tween){const o=(S.focus.kind===1?O1:O2)[S.focus.idx];if(o.root.visible){const dlt=o.root.position.clone().multiplyScalar(S.exp).sub(controls.target).multiplyScalar(.12);controls.target.add(dlt);camera.position.add(dlt)}}
  if(S.ghost){const c=gCur(),dA=Math.floor(c),dB=Math.min(S.T1,dA+1);$('date').textContent=DATA.dates[Math.round(c)];$('zzNow').textContent=f8(ZZ[dA]+(ZZ[dB]-ZZ[dA])*(c-dA))}
  else{$('date').textContent=Math.round(t*100)+' %';$('zzNow').textContent=f8(ease(ZZ[d0],ZZ[d1],t))}
  const near=S.ghost?Math.round(gCur()):(t<.5?d0:d1);
  if(near!==lastD||dirty){refreshZbars(near);drawGauss();renderFiche();lastD=near;dirty=false}
  controls.update();coreTop();
  requestAnimationFrame(tick);
}

/* ---------------- Start ---------------- */
rebuild();
firstFull=computeFirstFull();S.T0=firstFull;rebuild();
fillTakes();syncControls();
ensureTL();syncGhostUI();
{const e0=S.exp;S.exp=1;setExp(e0);} /* the volume survives a change of system */
setProg(REDUCED?1:0);
renderFiche();drawGauss();refreshZbars(S.T0);
requestAnimationFrame(tick);
if(!REDUCED)setTimeout(()=>{if(alive){S.playing=true;updPlay()}},700);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawGauss();renderFiche()});
addEventListener('resize',()=>{drawGauss();renderFiche()});
BOOT.destroy=()=>{alive=false;S.playing=false;BOOT.ac.abort();ro.disconnect();try{renderer.dispose();renderer.forceContextLoss()}catch(e){}renderer.domElement.remove();$('tip').style.display='none';$('banner').style.display='none'};
if(keep&&keep.tk){const i=TK.findIndex(t=>t.s===keep.tk);if(i>=0)select({kind:1,idx:i})}
window.__umSelect=select; /* hook for the soul (CLAVIS) bridge and for tests */
})();
}
/* Side panels (Éric, 9 Nov.): either side can be cleared for a full view of the metaphor and brought back. */
(function(){
  const app=document.querySelector('.app');
  const set=(c,on)=>{app.classList.toggle(c,!on);$o(c==='noL'?'tgL':'tgR').setAttribute('aria-pressed',on?'true':'false');try{localStorage.setItem('um.'+c,on?'1':'0')}catch(e){}};
  const get=c=>{try{return localStorage.getItem('um.'+c)!=='0'}catch(e){return true}};
  const syncV=()=>$o('tgV').setAttribute('aria-pressed',app.classList.contains('noL')&&app.classList.contains('noR')?'true':'false');
  set('noL',get('noL'));set('noR',get('noR'));syncV();
  let back={l:true,r:true};
  $o('tgV').addEventListener('click',()=>{const l=!app.classList.contains('noL'),r=!app.classList.contains('noR');
    if(l||r){back={l,r};set('noL',false);set('noR',false)}else{set('noL',back.l||!back.r);set('noR',back.r||!back.l)}syncV()});
  [$o('tgL'),$o('tgR')].forEach(b=>b.addEventListener('click',()=>setTimeout(syncV,0)));
  $o('tgL').addEventListener('click',()=>set('noL',app.classList.contains('noL')));
  $o('tgR').addEventListener('click',()=>set('noR',app.classList.contains('noR')));
  $o('rX').addEventListener('click',()=>{if(!app.classList.contains('noR'))$o('tgR').click()}); /* rev. 23.14: erase the reading card */
  const fold=()=>{app.classList.remove('gOpen');document.querySelectorAll('#rack .tile').forEach(b=>b.setAttribute('aria-expanded','false'))};
  $o('gClose').addEventListener('click',fold);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&app.classList.contains('gOpen'))fold()});
  addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.metaKey||e.ctrlKey)return;if(e.key==='['){e.preventDefault();$o('tgL').click()}if(e.key===']'){e.preventDefault();$o('tgR').click()}if(e.key==='\\'){e.preventDefault();$o('tgV').click()}});
})();
/* Library selector and #hash routing (#ndx100, #sp500y, #djia, #sp500, #ibov, #n225, #hsi, #asx200, #sti, #ftse100, #dax, #cac40, #sx5e, #tasi, #nhl), one group per silo */
(function(){
  const sel=$o('sys');
  sel.innerHTML=[...new Set(LIB.map(x=>x.silo))].map(s=>`<optgroup label="${esco(s)}">`+LIB.filter(x=>x.silo===s).map(x=>`<option value="${x.id}"${x.data?'':' disabled'}>${esco(x.name)}${x.data?'':' · en attente de YB1'}</option>`).join('')+'</optgroup>').join('');
  sel.addEventListener('change',()=>switchSys(sel.value));
  const hub=document.getElementById('hubHome'); if(hub) hub.addEventListener('click',()=>switchSys('world'));
  function rawHash(){return (location.hash||'').replace(/^#/,'').replace(/^\//,'');}
  function resolved(raw){
    if(window.UM_RESOLVE) return window.UM_RESOLVE(raw);
    if(!raw||raw==='world') return 'world';
    return LIB.some(x=>x.id===raw&&x.data)?raw:'';
  }
  /* The hub always opens on Finance. A bookmark does not open a floor. */
  const arrived=rawHash();
  try{history.replaceState(null,'',location.pathname+location.search+'#/world')}catch(e){}
  switchSys('world');
  if(arrived&&arrived!=='world'&&!resolved(arrived)) window.__umUnknown=arrived;
})();
