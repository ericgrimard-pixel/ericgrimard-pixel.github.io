/* Application code from v20.11 HUB galaxies (SAFE Pages) — DATA/FLOORS/NHL loaded by previous scripts.
   Standing definition of the Hub (v20.39). The Class 4 library below is the floor structure;
   this sentence is the standing rule for Music, kept in this header:
   Music (Société · Musique) is an independent field (a row) in the World view, under society. It is separate from finance and from professional sport, and it has its own Class 2 objects. It is the starting point for the next layer of the build. It is never nested inside any panel.
   Its Class 2 slot is #um-musique-c2 on the World view. The slot is empty: the Hub has no local music data source. Nothing is invented.
   Étage international · manifestation is #/floor/WF: the five geographic macro-zones as Class 2.
   #/world is the World market Class 4 (Z0 = mean of the whole system) surrounded by Omega, φ−, Sigma, φ+, Alpha. */
var DATA = window.DATA;
const INDEX_GROUP_NAME={NDX:'Nasdaq-100 (indice)',SPX:'S&P 500 (indice)',ALL:'Nasdaq-100 ∪ S&P 500',STI:'Straits Times Index',IBOV:'Ibovespa',TASI:'Tadawul All-Share Index (TASI)',N225:'Nikkei 225',HSI:'Hang Seng Index',FTSE100:'FTSE 100',DAX:'DAX 40',CAC40:'CAC 40',SX5E:'EURO STOXX 50',ASX200:'S&P/ASX 200',DJIA:'Dow Jones (DJIA)'};
window.INDEX_GROUP_NAME=INDEX_GROUP_NAME;
var FLOORS = window.FLOORS;
var NHL = window.NHL;
// ---------- bibliothèque de Classe 4 (v20.3) : exactement 8 objets, toujours présents ----------
// Les conteneurs sont toujours là ; seuls les objets de Classe 2 imbriqués (les places) varient selon les données disponibles.
const EC='en construction — à remplir quand les crédits le permettront';
const FBY=ct=>Object.keys(FLOORS).filter(m=>FLOORS[m].ct===ct);
const LIB4=[
 {id:'AMF',name:'America Floor',boxes:[{name:'America Floor',kind:'self',fl:FBY('AMF')}]},
 {id:'EUF',name:'Europe Floor',boxes:[{name:'Europe Floor',kind:'self',fl:FBY('EUF')}]},
 {id:'AFF',name:'Africa Floor',boxes:[{name:'Africa Floor',kind:'self',fl:FBY('AFF')}]},
 {id:'ASF',name:'Asia Floor',boxes:[{name:"Asie de l'Est, du Sud-Est et du Sud",kind:'sub',fl:FBY('ASF').filter(m=>!FLOORS[m].w)},{name:"Asie de l'Ouest (Moyen-Orient)",kind:'sub',fl:FBY('ASF').filter(m=>FLOORS[m].w)}]},
 {id:'OCF',name:'Oceania Floor',boxes:[{name:'Oceania Floor',kind:'self',fl:FBY('OCF')}]},
 {id:'WF',name:'World Floor',boxes:['AMF','EUF','AFF','ASF','OCF'].map(id=>({name:{AMF:'America Floor',EUF:'Europe Floor',AFF:'Africa Floor',ASF:'Asia Floor',OCF:'Oceania Floor'}[id],kind:'c4n',fl:FBY(id)}))},
 {id:'NSF',name:'North-South Floor',boxes:[{name:'Hémisphère Nord',kind:'half',fl:Object.keys(FLOORS).filter(m=>FLOORS[m].lat>=0)},{name:'Hémisphère Sud',kind:'half',fl:Object.keys(FLOORS).filter(m=>FLOORS[m].lat<0)}]},
 {id:'EWF',name:'East-West Floor',boxes:[{name:'Hémisphère Ouest',kind:'half',fl:Object.keys(FLOORS).filter(m=>FLOORS[m].lon<0)},{name:'Hémisphère Est',kind:'half',fl:Object.keys(FLOORS).filter(m=>FLOORS[m].lon>=0)}]}];
LIB4.forEach(L4=>L4.fl=new Set(L4.boxes.flatMap(b=>b.fl)));
const FCOL={XNYS:'#6fa8ff',XNAS:'#4fd1c5',BATS:'#ff9f5a'};
// source : Nasdaq-100, S&P 500, ou leur union (S&P 500 prioritaire pour les 86 titres communs ; écarts d'arrondi ≤ 0,001 $)
{const sp=new Set(DATA.SPX.objs.map(o=>o.t));DATA.ALL={dates:DATA.SPX.dates,objs:DATA.SPX.objs.concat(DATA.NDX.objs.filter(o=>!sp.has(o.t))).sort((a,b)=>a.t<b.t?-1:1)};}
let SYS=LIB4[0],EMPTY=false;const NF={}; // NF[mic] = nombre de titres de la source sur cette place
const SECT={"Technology":"#5fb6ff","Communication Services":"#b48cff","Consumer Cyclical":"#ff9f5a","Consumer Defensive":"#9ad66b","Healthcare":"#ff6f91","Industrials":"#e6c35c","Financial Services":"#4fd1c5","Energy":"#ff5a4f","Utilities":"#8fb3c9","Real Estate":"#d49b6a","Basic Materials":"#c7a6ff","":"#bbbbbb"};
const COLN={volume:'volume (somme des constituants)',valeur:'valeur échangée (somme)',absret:'|rendement du jour| (moyenne)',vol20:'volatilité 20 séances (moyenne)',seance:'séance (témoin)'};
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');const $=id=>document.getElementById(id);
function volSys(){return Math.max(0,Math.min(1,+$('volsys').value/100));}
function volGh(){return Math.max(0,Math.min(1,+$('volgh').value/100));}
function volGhObj(){return Math.max(0,Math.min(1,+$('volghobj').value/100));}
let W,H,DPR=window.devicePixelRatio||1;const L=96,T=30,B=50;let R=30,PW=0; // v20.14 — room for left icon rail
function plotFrame(){
  let top=T, bottom=B;
  const lift=W<760 && document.body && (document.body.classList.contains('mode-world')||document.body.classList.contains('mode-region')||window.__CORE_ZONES);
  if(lift) bottom=Math.round(H*0.48);
  const strip=W<760 && document.getElementById('super-strip');
  if(strip){
    const r=strip.getBoundingClientRect();
    const st=getComputedStyle(strip);
    if(r.height>24 && r.width>80 && st.display!=='none' && st.visibility!=='hidden' && r.bottom>top && r.bottom<H*0.62)
      top=Math.round(Math.min(r.bottom+8, H*0.34));
  }
  if(H-bottom-top<140) bottom=Math.max(B, Math.round(H-top-180));
  return {top, bottom};
}
function size(){W=innerWidth;H=innerHeight;PW=Math.round(Math.min(480,Math.max(300,W*.3)));R=$('libon')&&!$('libon').checked?30:PW+44;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);}
size();
const FLOOR=3,NS=24,SUB=8; // plancher px ; échantillons par segment cycloïdal ; sous-pas d'animation par séance
// ---------- transition cycloïdale (canon) ----------
// Corpus Rev3 / runs du 6 oct. : cycloïde vraie s(t)=t−sin(2πt)/(2π), « PAS une quadratique ».
// Gouvernance du 11 oct. (G-3, §12.5) : appliquée indépendamment sur chaque axe ; ease-out pour un déplacement positif,
// ease-in pour un déplacement négatif, immobile pour aucun. Demi-arches de la cycloïde vraie.
const CIN=t=>{const th=Math.PI*t;return (th-Math.sin(th))/Math.PI;};   // demi-arche, départ lent (ease-in)
const COUT=t=>1-CIN(1-t);                                               // demi-arche, arrivée lente (ease-out)
const CFULL=t=>t-Math.sin(2*Math.PI*t)/(2*Math.PI);                     // arche complète (référence Rev3)
// v20.2 — canon Z0 : le fil Z0(T₀)→Z0(T₁) est linéaire ; toute floter = fil Z0(τ) + écart au fil, l'écart suivant la demi-arche cycloïdale axe par axe.
// Appariement v20.2 (formules d'Éric, 5 nov) : valeur qui monte → c(t) = (πt − sin πt)/π ; valeur qui descend → 1 − c(1 − t) ; valeur inchangée → immobile.
// (En v20.1 l'appariement était inverse : 1 − c(1 − t) à la montée. Pour y revenir : ARCH_V201 = true.)
const ARCH_V201=false;const RISE=t=>ARCH_V201?COUT(t):CIN(t),FALL=t=>ARCH_V201?CIN(t):COUT(t);
function arch(v0,v1,t){return v1>v0?v0+(v1-v0)*RISE(t):v1<v0?v0+(v1-v0)*FALL(t):v0;} // règle cycloïdale sur une valeur (axe, canal de couleur…)
function cycAbs(p0,p1,t){return [arch(p0[0],p1[0],t),arch(p0[1],p1[1],t)];}
// ---------- couleur : la règle cycloïdale s'applique aussi aux couleurs (lecture relative au fil Z0) ----------
// Teinte = identité de l'objet (secteur), constante. Luminosité ← écart au fil Z0 sur x (rendement), saturation ← écart sur y (vol20).
// Chaque canal qui change entre deux séances est interpolé par arch() ; un canal inchangé reste inchangé.
function hexHue(h){const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;let hh=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return (hh*60+360)%360;}
const HUE={};function hueOf(hex){return HUE[hex]??(HUE[hex]=hexHue(hex));}
function colAt(hex,i,p){if(!Z0||!p)return {h:hueOf(hex),s:70,l:62};const z=ZL(i),ox=p[0]-z[0],oy=p[1]-z[1];
  return {h:hueOf(hex),s:Math.max(25,Math.min(98,68+30*Math.tanh(oy/0.25))),l:Math.max(35,Math.min(85,60+24*Math.tanh(ox/0.25)))};}
function colArch(c0,c1,t){return {h:arch(c0.h,c1.h,t),s:arch(c0.s,c1.s,t),l:arch(c0.l,c1.l,t)};}
function css(c){return 'hsl('+c.h.toFixed(0)+','+c.s.toFixed(0)+'%,'+c.l.toFixed(0)+'%)';}
function colMove(hex,p0,p1,i0,i1,t){return css(p1&&t>0?colArch(colAt(hex,i0,p0),colAt(hex,i1,p1),t):colAt(hex,i0,p0));}
window.__COLLOG=[];
function cyc(p0,p1,t,i0,i1){if(!Z0||i0==null)return cycAbs(p0,p1,t);const z0=ZL(i0),z1=ZL(i1),zt=ZL(i0+(i1-i0)*t);
  const o0=[p0[0]-z0[0],p0[1]-z0[1]],o1=[p1[0]-z1[0],p1[1]-z1[1]];const o=cycAbs(o0,o1,t);return [zt[0]+o[0],zt[1]+o[1]];}
// ---------- moteurs (séparés ; CLAVIS n'est pas touché) ----------
// Classe 4 = effondrement total de toutes les constituantes du système (classes 3, 2 et 1 communes).
// Position = moyenne de l'ensemble (Z0, canon). Le caractère visuel est l'effondrement des attributs du nuage.
// Point de branchement : MANIF_ENGINES.irrationalisateur = {name, collapse(points)->[x,y]}.
const MANIF_ENGINES={class4:{name:'effondrement vivant (dérive-comme-signal)',collapse:pts=>{let sx=0,sy=0;for(const p of pts){sx+=p[0];sy+=p[1];}return [sx/pts.length,sy/pts.length];}},irrationalisateur:null};
window.MANIF_ENGINES=MANIF_ENGINES;
function collapseClass4(pts){const e=MANIF_ENGINES.irrationalisateur||MANIF_ENGINES.class4;return e.collapse(pts);}
// « Tout » à la séance i : configuration active, en un seul ensemble — Classe 1 + (Classe 2 si cochée) + (conteneurs de Classe 3 si cochés)
function SET(i){const pts=[],walls=new Map();let n1=0,n2=0,n3=0;
  ds.objs.forEach((o,k)=>{const p=P1(k,i);if(!p)return;pts.push(p);n1++;
    const sx=p[0]<bx[0]?'G':p[0]>bx[1]?'D':'',sy=p[1]<by[0]?'B':p[1]>by[1]?'H':'';if(sx||sy){const key=sx+sy;if(!walls.has(key))walls.set(key,[]);walls.get(key).push([Math.min(bx[1],Math.max(bx[0],p[0])),Math.min(by[1],Math.max(by[0],p[1]))]);}});
  if($('z2').checked)GROUPS.forEach(g=>{const p=P2(g,i);if(p){pts.push(p);n2++;}});
  if($('z3').checked)walls.forEach(w=>{pts.push(MANIF_ENGINES.class4.collapse(w));n3++;});
  return {pts,n1,n2,n3};}
let Z0=null; // {i0,i1,a,b,n0,n1,C4:[] par séance}
// Classe 4 imbriquée (World : continents ; North-South / East-West : hémisphères) : effondrement de ses seuls constituants (Classe 1 + ses places de Classe 2 si cochées)
function SETBOX(b,i){const pts=[],fl=new Set(b.fl);ds.objs.forEach((o,k)=>{if(!fl.has(o.f))return;const p=P1(k,i);if(p)pts.push(p);});
  if($('z2').checked&&$('lvl').value==='f')GROUPS.forEach(g=>{if(g.mic&&fl.has(g.mic)){const p=P2(g,i);if(p)pts.push(p);}});return pts;}

/* v20.12 — market two frames only (proposés — à confirmer par Éric) */
window.UM_MARKET_FRAMES={
  label:'T0/T1 proposés — à confirmer par Éric',
  T0:'2026-01-02',
  T1:'2026-11-04',
  note:'Séries embarquées NDX/S&P : 2 jan 2026 → 4 nov 2026. Une seule constante à changer.'
};
if(typeof window.__MARKET_Z0_TWOPASS==='undefined') window.__MARKET_Z0_TWOPASS=true;
if(typeof window.__Z0_DOMAIN==='undefined') window.__Z0_DOMAIN='finance';
function computeZ0(){ if(window.__Z0_DOMAIN==='none'){ Z0=null; return; }
Z0=null;const C4=[];for(let i=S0;i<=S1;i++){const s=SET(i);C4[i]=s.pts.length?collapseClass4(s.pts):null;}
  const C4N=SYS.boxes.filter(b=>b.kind==='c4n'||b.kind==='half').map(b=>{const P=[];for(let i=S0;i<=S1;i++){const q=SETBOX(b,i);P[i]=q.length?collapseClass4(q):null;}return {b,P,has:P.some(x=>x)};});
  const s0=SET(S0),s1=SET(S1);// Z0 = moyenne de tout en un seul ensemble à T₀ et à T₁ ; le fil Z0(τ) est linéaire (canon). La Classe 4 vivante porte ce fil et le caractère du nuage.
  Z0={i0:S0,i1:S1,a:MANIF_ENGINES.class4.collapse(s0.pts),b:MANIF_ENGINES.class4.collapse(s1.pts),n0:s0,n1:s1,C4,C4N};}
function ZL(tau){const f=(tau-Z0.i0)/(Z0.i1-Z0.i0);return [Z0.a[0]+(Z0.b[0]-Z0.a[0])*f,Z0.a[1]+(Z0.b[1]-Z0.a[1])*f];}

// ---------- v20.21 — Classe 4 vivante dans le noyau (partout) ----------
// Un seul chemin partagé : computeC4Live (marché T0/T1) ou liveFromHits (nuage visible).
// paintLivingClass4 + syncC4Panel s'appliquent à toute vue qui rend des objets par le moteur.
// Z0(τ) = (1−f)·Z0(T₀) + f·Z0(T₁)  [fil linéaire, marché]
// Sans série temporelle : ancre = moyenne réelle de ce qui est là ; dérive = 0 · [INCOMPLET].
function hideC4Panel(){const el=$('c4panel');if(el) el.hidden=true;}
function meanHueHex(hexes){let cx=0,cy=0,n=0;for(const hex of hexes){const rad=hueOf(hex)*Math.PI/180;cx+=Math.cos(rad);cy+=Math.sin(rad);n++;}if(!n)return null;return (Math.atan2(cy,cx)*180/Math.PI+360)%360;}
function cloudStats(pts,origin){const n=pts.length;if(!n||!origin)return null;let sxx=0,syy=0,sxy=0,rad=0;
  for(const p of pts){const ux=p[0]-origin[0],uy=p[1]-origin[1];sxx+=ux*ux;syy+=uy*uy;sxy+=ux*uy;rad+=Math.hypot(ux,uy);}
  sxx/=n;syy/=n;sxy/=n;rad/=n;
  const theta=0.5*Math.atan2(2*sxy,sxx-syy);
  const tr=sxx+syy,det=sxx*syy-sxy*sxy,disc=Math.sqrt(Math.max(0,tr*tr/4-det));
  const l1=tr/2+disc,l2=tr/2-disc;
  const sigMaj=Math.sqrt(Math.max(0,l1)),sigMin=Math.sqrt(Math.max(0,l2));
  const stretch=(sigMin>1e-9)?(sigMaj/sigMin):null;
  const ecc=(sigMaj>1e-9)?(1-sigMin/sigMaj):0;
  return {n,sxx,syy,sxy,theta,sigMaj,sigMin,stretch,ecc,radius:rad};}
function interpPos(p0,p1,i0,u,i1){if(!p0&&!p1)return null;if(!(u>0))return p0||null;if(!p0)return p1;if(!p1)return p0;return cyc(p0,p1,u,i0,i1==null?i0+1:i1);}
function playSpan(c,u){u=u||0;if(window.__MARKET_Z0_TWOPASS!==false&&window.__PLAYING&&S1>c){return {i0:c,i1:S1,u:u,tau:c+u*(S1-c)};}return {i0:c,i1:c+1,u:u,tau:c+u};}
function wallCollapseMap(i){const walls=new Map();if(!ds||!ds.objs)return walls;
  ds.objs.forEach((o,k)=>{const p=P1(k,i);if(!p)return;const sx=p[0]<bx[0]?'G':p[0]>bx[1]?'D':'',sy=p[1]<by[0]?'B':p[1]>by[1]?'H':'';if(!(sx||sy))return;const key=sx+sy;if(!walls.has(key))walls.set(key,[]);walls.get(key).push([Math.min(bx[1],Math.max(bx[0],p[0])),Math.min(by[1],Math.max(by[0],p[1]))]);});
  const out=new Map();walls.forEach((w,key)=>{if(w.length)out.set(key,MANIF_ENGINES.class4.collapse(w));});return out;}
function computeC4Live(c,u){if(!Z0||window.__Z0_DOMAIN==='none'||EMPTY||!ds||!ds.objs)return null;
  u=u||0;const sp=playSpan(c,u),tau=sp.tau,zc=ZL(tau),pts=[],hues=[];let n1=0,n2=0,n3=0;
  ds.objs.forEach((o,k)=>{const p=interpPos(P1(k,sp.i0),P1(k,sp.i1),sp.i0,sp.u,sp.i1);if(!p)return;pts.push(p);n1++;hues.push(SECT[o.s]||'#bbbbbb');});
  if($('z2')&&$('z2').checked)GROUPS.forEach(g=>{const p=interpPos(P2(g,sp.i0),P2(g,sp.i1),sp.i0,sp.u,sp.i1);if(p){pts.push(p);n2++;}});
  if($('z3')&&$('z3').checked){const w0=wallCollapseMap(sp.i0),w1=wallCollapseMap(sp.i1);const keys=new Set([...w0.keys(),...w1.keys()]);keys.forEach(key=>{const p=interpPos(w0.get(key)||null,w1.get(key)||null,sp.i0,sp.u,sp.i1);if(p){pts.push(p);n3++;}});}
  if(!pts.length)return null;
  const stats=cloudStats(pts,zc);
  const pts0=[];ds.objs.forEach((o,k)=>{const p=P1(k,Z0.i0);if(p)pts0.push(p);});
  if($('z2')&&$('z2').checked)GROUPS.forEach(g=>{const p=P2(g,Z0.i0);if(p)pts0.push(p);});
  if($('z3')&&$('z3').checked)wallCollapseMap(Z0.i0).forEach(p=>{if(p)pts0.push(p);});
  const st0=cloudStats(pts0,Z0.a);const theta=stats?stats.theta:0,theta0=st0?st0.theta:0;let rot=theta-theta0;while(rot>Math.PI)rot-=2*Math.PI;while(rot<-Math.PI)rot+=2*Math.PI;
  const hue=meanHueHex(hues);let sat=68,light=60,sn=0,ss=0,sl=0;
  ds.objs.forEach((o,k)=>{const p=interpPos(P1(k,sp.i0),P1(k,sp.i1),sp.i0,sp.u,sp.i1);if(!p)return;const col=colAt(SECT[o.s]||'#bbbbbb',tau,p);ss+=col.s;sl+=col.l;sn++;});
  if(sn){sat=ss/sn;light=sl/sn;}
  const drift=[zc[0]-Z0.a[0],zc[1]-Z0.a[1]];
  const tNorm=(Z0.i1!==Z0.i0)?(tau-Z0.i0)/(Z0.i1-Z0.i0):0;
  let zVal=null;
  try{const zA=systemZAt(sp.i0),zB=systemZAt(sp.i1); if(zA!=null&&zB!=null) zVal=arch(zA,zB,sp.u); else zVal=(zA!=null?zA:zB);}catch(e){zVal=null;}
  return {space:'market',sysName:(typeof SYS!=='undefined'&&SYS&&SYS.name)||'système',tau,t:tNorm,zc,drift,driftIncomplet:false,n1,n2,n3,n:pts.length,stats,theta,theta0,rot,hue,sat,light,
    stretch:stats?stats.stretch:null,ecc:stats?stats.ecc:0,radius:stats?stats.radius:0,
    sigMaj:stats?stats.sigMaj:0,sigMin:stats?stats.sigMin:0,zVal};}
function liveFromHits(hits,sysName){
  hits=hits||(typeof HIT!=='undefined'?HIT:null)||window.HIT;
  if(!hits) return null;
  const pts=[],kinds=[];
  (hits.c1||[]).forEach(h=>{if(h&&isFinite(h.px)&&isFinite(h.py)){pts.push([h.px,h.py]);kinds.push(1);}});
  (hits.c2||[]).forEach(h=>{if(h&&isFinite(h.px)&&isFinite(h.py)){pts.push([h.px,h.py]);kinds.push(2);}});
  if(!pts.length) return null;
  const sx=pts.reduce((a,p)=>a+p[0],0)/pts.length,sy=pts.reduce((a,p)=>a+p[1],0)/pts.length,zc=[sx,sy];
  const stats=cloudStats(pts,zc);
  let n1=0,n2=0;kinds.forEach(k=>{if(k===1)n1++;else n2++;});
  return {space:'static',sysName:sysName||'système',tau:0,t:0,zc,drift:[0,0],driftIncomplet:true,n1,n2,n3:0,n:pts.length,
    stats,theta:stats?stats.theta:0,theta0:stats?stats.theta:0,rot:0,hue:null,sat:null,light:60,
    stretch:stats?stats.stretch:null,ecc:stats?stats.ecc:0,radius:stats?stats.radius:0,
    sigMaj:stats?stats.sigMaj:0,sigMin:stats?stats.sigMin:0,px:sx,py:sy};}
function coherenceVerdictFrom(payload){
  const z0=payload&&payload.z0, t0=payload&&payload.z0T0, t1=payload&&payload.z0T1, attrs=payload&&payload.attrs||{};
  const fin=v=>v!=null&&isFinite(v);
  const xy=fin(z0&&z0.x)&&fin(z0&&z0.y)&&fin(t0&&t0.x)&&fin(t0&&t0.y)&&fin(t1&&t1.x)&&fin(t1&&t1.y);
  const zOk=fin(attrs.Z);
  return {xy,z:zOk,ok:xy,label:xy?(zOk?'X, Y et Z cohérents — le jeu de données tient':'X et Y cohérents · Z [INCOMPLET]'):'[INCOMPLET] — X/Y non calculables'};
}
function attrChipHtml(name, text, state, bar){
  const cls='attr-chip'+(state?' '+state:'');
  const b=(bar!=null&&isFinite(bar))?'<i class="attr-bar" style="width:'+Math.max(4,Math.min(100,Math.abs(bar)*100))+'%"></i>':'';
  return '<span class="'+cls+'" data-attr="'+name+'"><b>'+name+'</b> <em>'+text+'</em>'+b+'</span>';
}
function syncC4Panel(live){const el=$('c4panel');if(!el){window.__C4LIVE=live||null;return;}
  if(!live){el.hidden=true;window.__C4LIVE=null;return;}
  const z=live.zc,d=live.drift||[0,0],mag=Math.hypot(d[0],d[1]),ang=Math.atan2(d[1],d[0])*180/Math.PI;
  const fn=v=>(v!=null&&isFinite(v))?Number(v).toFixed(4):'[INCOMPLET]';
  const fp=v=>(v!=null&&isFinite(v))?((v*100).toFixed(2)+' %'):'[INCOMPLET]';
  const fd=v=>(v!=null&&isFinite(v))?(Number(v).toFixed(2)+'°'):'[INCOMPLET]';
  const stretchTxt=(live.stretch!=null&&isFinite(live.stretch))?(live.stretch>99?'>99':live.stretch.toFixed(3)):'[INCOMPLET]';
  const hueTxt=(live.hue!=null&&isFinite(live.hue))?(live.hue.toFixed(1)+'°'):'[INCOMPLET]';
  const sysName=live.sysName||(typeof SYS!=='undefined'&&SYS&&SYS.name)||'système';
  const market=live.space!=='static';
  const z0T0=(market&&typeof Z0!=='undefined'&&Z0&&Z0.a)?{x:Z0.a[0],y:Z0.a[1]}:null;
  const z0T1=(market&&typeof Z0!=='undefined'&&Z0&&Z0.b)?{x:Z0.b[0],y:Z0.b[1]}:null;
  const fourierMode=(typeof gateModeFromHash==='function'?gateModeFromHash():'libre')==='fourier';
  const fou=window.__FOURIER||null;
  const unlocked=new Set(typeof unlockedAttrNames==='function'?unlockedAttrNames(live.t,fourierMode):['X','Y','Z','Forme','Étirement-écrasement','Couleur','Inclinaison avant-arrière','Rotation','Centre-extérieur','Saturation']);
  const zTxt=(live.zVal!=null&&isFinite(live.zVal))?fn(live.zVal):'[INCOMPLET]';
  function cell(name,fallback){
    if(!unlocked.has(name)) return '…';
    if(fourierMode&&fou&&fou.attrs&&fou.attrs[name]){
      const a=fou.attrs[name];
      if(a.incomplet||a.value==null||!isFinite(a.value)) return '[INCOMPLET]';
      return Number(a.value).toFixed(4);
    }
    return fallback;
  }
  const payload={version:'v20.39',sys:sysName,space:live.space||'market',tau:live.tau,t:live.t,gateMode:fourierMode?'fourier':'libre',formT:(live.formT!=null?live.formT:((typeof window.waveFormT==='function')?window.waveFormT():1)),swell:(live.swell!=null?live.swell:((typeof window.waveSwell==='function')?window.waveSwell():1)),
    z0:market?{x:z[0],y:z[1],ret:Math.exp(z[0])-1,vol:z[1]}:{x:z[0],y:z[1]},
    z0T0,z0T1,
    drift:{dx:d[0],dy:d[1],mag,angleDeg:ang,incomplet:!!live.driftIncomplet},
    n1:live.n1,n2:live.n2,n3:live.n3,n:live.n,
    developed:[...unlocked],
    fourier:fourierMode?fou:null,
    kobayashi:fourierMode&&fou?fou.kobayashi:null,
    attrs:{X:z[0],Y:z[1],Z:(live.zVal!=null&&isFinite(live.zVal))?live.zVal:'[INCOMPLET]',Forme:live.ecc,'Étirement-écrasement':(live.stretch!=null&&isFinite(live.stretch))?live.stretch:null,
      Couleur:live.hue,'Inclinaison avant-arrière':'[INCOMPLET]',Rotation:live.rot*180/Math.PI,
      'Centre-extérieur':live.radius,Saturation:live.sat}};
  const coh=coherenceVerdictFrom(payload);
  payload.coherence=coh;
  window.__C4LIVE=payload;
  window.__ATTR_UNLOCKED=[...unlocked];
  window.__WAVE_T=window.__WAVE?Math.max(0,Math.min(1,progress||0)):null;
  el.hidden=false;
  try{
    let tog=document.getElementById('c4-toggle');
    if(!tog){
      tog=document.createElement('button'); tog.type='button'; tog.id='c4-toggle'; tog.textContent='Attributs';
      document.body.appendChild(tog);
      tog.addEventListener('click',()=>{
        const open=document.body.classList.toggle('c4-open');
        tog.setAttribute('aria-expanded', open?'true':'false');
      });
    }
    tog.setAttribute('aria-expanded', document.body.classList.contains('c4-open')?'true':'false');
  }catch(e){}
  const z0Line=market
    ? '('+fn(z[0])+', '+fn(z[1])+') · '+fp(Math.exp(z[0])-1)+' · vol '+fp(z[1])+' · τ = '+fn(live.t)
    : '('+fn(z[0])+', '+fn(z[1])+') · moyenne de ce qui est visible';
  const driftLine=live.driftIncomplet
    ? 'Δ ('+fn(d[0])+', '+fn(d[1])+') · module '+fn(mag)+' · [INCOMPLET] — aucune série temporelle'
    : 'Δ ('+fn(d[0])+', '+fn(d[1])+') · module '+fn(mag)+' · direction '+fd(ang);
  const xLine=market? (fn(z[0])+' · '+fp(Math.exp(z[0])-1)) : (fn(z[0])+' (position)');
  const yLine=market? (fn(z[1])+' · '+fp(z[1])) : (fn(z[1])+' (position)');
  const radLine=market? fn(live.radius) : (fn(live.radius)+' px');
  function fmtTop(an){
    if(!an||an.incomplet||!an.top||!an.top.length) return '[INCOMPLET]';
    return an.top.slice(0,3).map(b=>'k='+b.k+' · T='+(isFinite(b.period)?b.period.toFixed(2):'?')+' · A='+b.amp.toFixed(4)).join(' ; ');
  }
  let fourierHtml='';
  if(fourierMode){
    fourierHtml='<table class="c4-attrs"><caption>Fourier long / court</caption><tbody>';
    if(fou&&fou.ready){
      fourierHtml+='<tr><th>Long X</th><td>'+fmtTop(fou.long&&fou.long.X)+(fou.long&&fou.long.incomplet?' · [INCOMPLET]':'')+'</td></tr>'
        +'<tr><th>Long Y</th><td>'+fmtTop(fou.long&&fou.long.Y)+'</td></tr>'
        +'<tr><th>Long Z</th><td>'+fmtTop(fou.long&&fou.long.Z)+'</td></tr>'
        +'<tr><th>Court X</th><td>'+fmtTop(fou.short&&fou.short.X)+'</td></tr>'
        +'<tr><th>Court Y</th><td>'+fmtTop(fou.short&&fou.short.Y)+'</td></tr>'
        +'<tr><th>Court Z</th><td>'+fmtTop(fou.short&&fou.short.Z)+'</td></tr>'
        +'<tr><th>n long</th><td>'+(fou.nLong||0)+(fou.span&&fou.span.first?(' · '+fou.span.first+' → '+fou.span.last):'')+'</td></tr>';
    } else {
      fourierHtml+='<tr><th>Séries</th><td>[INCOMPLET]</td></tr>';
    }
    const koba=unlocked.has('Kobayashi-Maru')?'[INCOMPLET — définition à fournir]':'…';
    fourierHtml+='<tr><th>Kobayashi-Maru</th><td>'+koba+'</td></tr></tbody></table>';
  }
  const chipNames=['X','Y','Z','Forme','Étirement-écrasement','Couleur','Inclinaison avant-arrière','Rotation','Centre-extérieur','Saturation'].concat(fourierMode?['Kobayashi-Maru']:[]);
  const chipVals={
    X: unlocked.has('X')?xLine:'…',
    Y: unlocked.has('Y')?yLine:'…',
    Z: unlocked.has('Z')?zTxt:'…',
    Forme: cell('Forme',fn(live.ecc)),
    'Étirement-écrasement': cell('Étirement-écrasement',stretchTxt),
    Couleur: cell('Couleur',hueTxt),
    'Inclinaison avant-arrière': cell('Inclinaison avant-arrière','[INCOMPLET]'),
    Rotation: cell('Rotation',fd(live.rot*180/Math.PI)),
    'Centre-extérieur': cell('Centre-extérieur',radLine),
    Saturation: unlocked.has('Saturation')?((live.sat!=null&&isFinite(live.sat))?live.sat.toFixed(1):'[INCOMPLET]'):'…',
    'Kobayashi-Maru': unlocked.has('Kobayashi-Maru')?'[INCOMPLET — définition à fournir]':'…'
  };
  const chipHtml='<div class="attr-strip" aria-label="Attributs dans l’ordre">'+chipNames.map(name=>{
    const locked=fourierMode&&(name==='X'||name==='Y'||name==='Z');
    const on=unlocked.has(name)||locked;
    const txt=chipVals[name]||'…';
    const st=locked?'locked':(on?(String(txt).indexOf('[INCOMPLET]')>=0?'incomplet':'on'):'pending');
    let bar=null;
    if(on&&name==='X') bar=Math.tanh((z&&z[0])||0);
    if(on&&name==='Y') bar=Math.tanh((z&&z[1])||0);
    if(on&&name==='Z'&&live.zVal!=null&&isFinite(live.zVal)) bar=Math.tanh((live.zVal-8)/2);
    if(on&&name==='Forme'&&isFinite(live.ecc)) bar=live.ecc;
    if(on&&name==='Saturation'&&isFinite(live.sat)) bar=live.sat/100;
    return attrChipHtml(name, locked?(txt+' · verrouillé'):txt, st, bar);
  }).join('')+'</div>';
  el.innerHTML='<header>Classe 4 vivante — '+sysName+'</header>'
    +'<p class="c4-rule">Dérive-comme-signal · l’ancre est le mouvement du système · mode '+(fourierMode?'Fourier':'Libre')+'</p>'
    +'<p class="c4-coh" id="c4-coh">'+coh.label+'</p>'
    +chipHtml
    +'<dl>'
    +'<div><dt>Constituants</dt><dd id="c4-n">'+live.n1+' Cl.1 + '+live.n2+' Cl.2 + '+live.n3+' Cl.3 = '+live.n+'</dd></div>'
    +'<div><dt>Z0 à l’instant</dt><dd id="c4-z0">'+z0Line+'</dd></div>'
    +'<div><dt>Dérive depuis T₀</dt><dd id="c4-drift">'+driftLine+'</dd></div>'
    +'</dl>'
    +'<table class="c4-attrs"><caption>Attributs effondrés</caption><tbody>'
    +'<tr><th>X</th><td id="c4-attr-x">'+(unlocked.has('X')?xLine:'…')+'</td></tr>'
    +'<tr><th>Y</th><td id="c4-attr-y">'+(unlocked.has('Y')?yLine:'…')+'</td></tr>'
    +'<tr><th>Z</th><td id="c4-attr-z">'+(unlocked.has('Z')?zTxt:'…')+'</td></tr>'
    +'<tr><th>Forme</th><td id="c4-attr-forme">'+cell('Forme',fn(live.ecc))+'</td></tr>'
    +'<tr><th>Étirement-écrasement</th><td id="c4-attr-stretch">'+cell('Étirement-écrasement',stretchTxt)+'</td></tr>'
    +'<tr><th>Couleur</th><td id="c4-attr-hue">'+cell('Couleur',hueTxt)+'</td></tr>'
    +'<tr><th>Inclinaison avant-arrière</th><td id="c4-attr-tilt">'+cell('Inclinaison avant-arrière','[INCOMPLET]')+'</td></tr>'
    +'<tr><th>Rotation</th><td id="c4-attr-rot">'+cell('Rotation',fd(live.rot*180/Math.PI))+'</td></tr>'
    +'<tr><th>Centre-extérieur</th><td id="c4-attr-radius">'+cell('Centre-extérieur',radLine)+'</td></tr>'
    +'<tr><th>Saturation</th><td id="c4-attr-sat">'+(unlocked.has('Saturation')?((live.sat!=null&&isFinite(live.sat))?live.sat.toFixed(1):'[INCOMPLET]'):'…')+'</td></tr>'
    +'</tbody></table>'+fourierHtml;
  if(window.__CORE_ZONES&&window.__WORLD_ZONES){
    const rows=window.__WORLD_ZONES.map(function(z){
      const gap=z.incomplet?' [INCOMPLET]':'';
      return '<span class="wz" data-zone="'+z.name+'">'+z.name+gap+'</span>';
    }).join(' · ');
    el.insertAdjacentHTML('beforeend','<p class="world-zones" id="world-zones">'+rows+'</p>');
  }
}

function drawClass4Glyph(ctx,px,py,live,label){
  const radius=live&&isFinite(live.radius)?live.radius:0;
  const radScale=(live&&live.space==='static')?180:0.12;
  const hero=document.body&&document.body.classList.contains('manifest-primary')?1.7:1;
  const size=16*hero*(0.82+0.5*Math.tanh(radius/radScale));
  const stretch=(live&&live.stretch!=null&&isFinite(live.stretch))?live.stretch:1;
  const k=Math.min(2.6,Math.max(1,Math.sqrt(stretch)));
  const rx=size*Math.sqrt(k),ry=size/Math.sqrt(k);
  const theta=(live&&isFinite(live.theta))?live.theta:0;
  const col=(live&&live.hue!=null&&isFinite(live.hue))?('hsl('+live.hue.toFixed(0)+','+Math.max(30,Math.min(95,live.sat||68)).toFixed(0)+'%,'+Math.max(38,Math.min(78,live.light||60)).toFixed(0)+'%)'):'#ffd966';
  const formT=(live&&isFinite(live.formT))?live.formT:((typeof window.waveFormT==='function')?window.waveFormT():1);
  ctx.save();ctx.translate(px,py);ctx.rotate(theta);
  ctx.beginPath();
  if(formT>=0.999){
    ctx.moveTo(0,-ry);ctx.lineTo(rx,0);ctx.lineTo(0,ry);ctx.lineTo(-rx,0);ctx.closePath();
  }else{
    const n=20;
    for(let i=0;i<=n;i++){
      const a=-Math.PI/2+i*2*Math.PI/n;
      const diamond=1/(Math.abs(Math.cos(a))/Math.max(1e-6,rx)+Math.abs(Math.sin(a))/Math.max(1e-6,ry));
      const wobble=1+0.32*Math.sin(3*a)+0.18*Math.sin(5*a+0.7);
      const circ=Math.max(rx,ry)*0.95*wobble;
      const r=circ+(diamond-circ)*formT;
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }
  ctx.fillStyle='rgba(8,10,16,.92)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-rx*0.58,0);ctx.lineTo(rx*0.58,0);ctx.moveTo(0,-ry*0.58);ctx.lineTo(0,ry*0.58);
  ctx.strokeStyle='rgba(232,200,114,.9)';ctx.lineWidth=1.15;ctx.stroke();
  if(live&&isFinite(live.rot)&&Math.abs(live.rot)>1e-3){ctx.beginPath();ctx.arc(0,0,Math.min(rx,ry)*0.42,0,live.rot,live.rot<0);ctx.strokeStyle='rgba(232,200,114,.75)';ctx.lineWidth=1.3;ctx.stroke();}
  ctx.restore();
  const lab=label||('Classe 4 — '+((live&&live.sysName)||(typeof SYS!=='undefined'&&SYS&&SYS.name)||'système'));
  ctx.fillStyle='#e8c872';ctx.font='700 11px system-ui';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(lab,px,py+ry+8);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  return Math.max(rx,ry);}
function c4Vol(){try{const v=typeof volSys==='function'?volSys():1;return isFinite(v)?v:1;}catch(e){return 1;}}
function paintLivingClass4(ctx,live,opts){
  opts=opts||{};
  if(!ctx||!live||!isFinite(live.px)||!isFinite(live.py)) return null;
  const hits=(typeof HIT!=='undefined'&&HIT)||window.HIT||{c1:[],c2:[],c4n:[]};
  const zx=live.px,zy=live.py,vol=c4Vol();
  ctx.save();ctx.strokeStyle='#e8c872';
  (hits.c1||[]).forEach(h=>{if(!h||!isFinite(h.px)||!isFinite(h.py))return;ctx.globalAlpha=0.10*vol;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(zx,zy);ctx.lineTo(h.px,h.py);ctx.stroke();});
  (hits.c2||[]).forEach(h=>{if(!h||!isFinite(h.px)||!isFinite(h.py))return;const focus=live.space!=='static'&&typeof sel!=='undefined'&&sel&&typeof GROUPS!=='undefined'&&GROUPS[h.gi]===sel.g;ctx.globalAlpha=(focus?0.55:0.32)*vol;ctx.lineWidth=focus?1.6:1.1;ctx.beginPath();ctx.moveTo(zx,zy);ctx.lineTo(h.px,h.py);ctx.stroke();});
  (hits.c4n||[]).forEach(h=>{if(!h||!isFinite(h.px)||!isFinite(h.py))return;ctx.globalAlpha=0.45*vol;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(zx,zy);ctx.lineTo(h.px,h.py);ctx.stroke();});
  ctx.restore();
  ctx.save();ctx.globalAlpha=Math.max(0.82,vol);
  const hitR=drawClass4Glyph(ctx,zx,zy,live,live.sysName==='World'?'World':('Classe 4 — '+(live.sysName||(typeof SYS!=='undefined'&&SYS&&SYS.name)||'système')));
  ctx.restore();
  const rec={px:zx,py:zy,r:hitR+2,p:live.zc,live,kind:'c4-live'};
  if(opts.preserveC4) hits.c4Live=rec;
  else {hits.c4=rec;hits.z0={px:zx,py:zy,r:9.25,p:live.zc};}
  return rec;}
function applyLivingClass4FromHits(sysName){
  const hits=(typeof HIT!=='undefined'&&HIT)||window.HIT;
  const live=liveFromHits(hits,sysName);
  if(!live){hideC4Panel();return null;}
  syncC4Panel(live);
  paintLivingClass4(ctx,live,{preserveC4:true});
  return live;}
window.computeC4Live=computeC4Live;window.cloudStats=cloudStats;window.liveFromHits=liveFromHits;window.paintLivingClass4=paintLivingClass4;window.applyLivingClass4FromHits=applyLivingClass4FromHits;

// ---------- données de base (positions seulement ; aucune traîne n'est calculée ici) ----------
let ds,BASE,S0,S1,GROUPS=[],sel=null,dep=null,CACHE=new Map(),zoom=1,panX=0,panY=0,bx,by,progress=0;
function median(a){a=a.filter(v=>v!=null&&isFinite(v)).sort((x,y)=>x-y);const n=a.length;if(!n)return NaN;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function pct(a,p){a=a.slice().sort((x,y)=>x-y);const h=(a.length-1)*p,lo=Math.floor(h),hi=Math.ceil(h);return a[lo]+(a[hi]-a[lo])*(h-lo);}
function base(){const n=ds.dates.length;BASE=ds.objs.map(o=>{const c=o.c,v=o.v,r=new Array(n).fill(null),vol=new Array(n).fill(null);
  for(let i=1;i<n;i++)if(c[i]!=null&&c[i-1]!=null)r[i]=Math.log(c[i]/c[i-1]);
  for(let i=0;i<n;i++){const w=[];for(let j=Math.max(1,i-19);j<=i;j++)if(r[j]!=null)w.push(r[j]);if(w.length>=2){const m=w.reduce((a,b)=>a+b,0)/w.length;vol[i]=Math.sqrt(w.reduce((a,b)=>a+(b-m)*(b-m),0)/(w.length-1)*252);}}
  const col={volume:v,valeur:c.map((x,i)=>x!=null&&v[i]!=null?x*v[i]:null),absret:r.map(x=>x==null?null:Math.abs(x)),vol20:vol,seance:c.map(x=>x==null?null:1)};
  return {r,vol,col};});}
// positions de Classe 1 dans la fenêtre (x = rendement log depuis le T₀ du titre, y = vol20)
let A0=[];
function window_(){S0=+$('s').value;S1=+$('e').value;A0=ds.objs.map((o,k)=>{for(let i=S0;i<=S1;i++)if(BASE[k].vol[i]!=null&&o.c[i]!=null)return i;return -1;});
  const X=[],Y=[];ds.objs.forEach((o,k)=>{const a=A0[k];if(a<0)return;const p0=(o.c0!=null&&o.c0>0)?o.c0:o.c[a];if(!(p0>0)||o.c[S1]==null)return;X.push(0,Math.log(o.c[S1]/p0));Y.push(BASE[k].vol[a],BASE[k].vol[S1]);});
  bx=[pct(X,.005),pct(X,.995)];by=[pct(Y,.005),pct(Y,.995)];}
function P1(k,i){const a=A0[k],o=ds.objs[k];if(o.c[i]==null||!BASE[k]||BASE[k].vol[i]==null)return null;
  const c0=(o.c0!=null)?o.c0:((a>=0)?o.c[a]:null);
  if(c0==null||!(c0>0))return null;
  if(o.c0==null&&(a<0||i<a))return null;
  return [Math.log(o.c[i]/c0),BASE[k].vol[i]];}
// Classe 2 : position = moyenne des attributs des constituants présents à la séance
function groups(){const lvl=$('lvl').value,m=new Map();ds.objs.forEach((o,k)=>{const key=lvl==='x'?((window.INDEX_GROUP_NAME||{NDX:'Nasdaq-100 (indice)',SPX:'S&P 500 (indice)',ALL:'Nasdaq-100 ∪ S&P 500',STI:'Straits Times Index',IBOV:'Ibovespa',TASI:'Tadawul All-Share Index (TASI)'})[$('ds').value]):lvl==='f'?(FLOORS[o.f]?FLOORS[o.f].n+' ('+o.f+')':'(place inconnue)'):(lvl==='s'?o.s:o.i)||'(sans '+(lvl==='s'?'secteur':'industrie')+')';if(!m.has(key))m.set(key,{name:key,mem:[],sec:o.s,mic:lvl==='f'?o.f:null});m.get(key).mem.push(k);});
  GROUPS=[...m.values()].sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  // couleur : secteur majoritaire
  GROUPS.forEach(g=>{const cnt={};g.mem.forEach(k=>cnt[ds.objs[k].s]=(cnt[ds.objs[k].s]||0)+1);g.sec=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];g.col=lvl==='x'?'#e8c872':lvl==='f'?(FCOL[g.mic]||'#bbbbbb'):(SECT[g.sec]||'#bbb');});
  $('sel').innerHTML='<option value="">— aucun —</option>'+GROUPS.map((g,i)=>'<option value="'+i+'">'+g.name+' ('+g.mem.length+')</option>').join('');}
function P2(g,i){let sx=0,sy=0,n=0;for(const k of g.mem){const p=P1(k,i);if(p){sx+=p[0];sy+=p[1];n++;}}return n?[sx/n,sy/n]:null;}
function C2(g,i,col){let s=0,n=0;for(const k of g.mem){if(!P1(k,i))continue;const v=BASE[k].col[col][i];if(v==null)continue;s+=v;n++;}if(!n)return null;return (col==='volume'||col==='valeur')?s:(col==='seance'?1:s/n);}
// ---------- vue ----------
function vb(){const px=(bx[1]-bx[0])*.04,py=(by[1]-by[0])*.04;return {x0:bx[0]-px,x1:bx[1]+px,y0:Math.max(0,by[0]-py),y1:by[1]+py};}
function view(){const v=vb();const cx=(v.x0+v.x1)/2,cy=(v.y0+v.y1)/2,hx=(v.x1-v.x0)/2/zoom,hy=(v.y1-v.y0)/2/zoom;return {x0:cx-hx+panX,x1:cx+hx+panX,y0:cy-hy+panY,y1:cy+hy+panY};}
function unit(){const v=vb();return [(W-L-R)/(v.x1-v.x0),(H-T-B)/(v.y1-v.y0)];} // px par unité, vue d'origine
// ---------- traîne v19 le long des trajets cycloïdaux (paramètre : longueur d'arc) ----------
// pos(i) -> [x,y] ou null ; rv(i) -> valeur d'horloge / médiane ; de a à S1
function trailFullYear(pos,rv,a,base){base=base||'#bbbbbb';const [ux,uy]=unit();const G=[],path=[];let p0=pos(a),i0=a;G.push({k:0,x:p0[0],y:p0[1],e:a,t:0,col:css(colAt(base,a,p0))});let cum=0,kk=1,S=0;
  for(let d=a;d<S1;d++){const p1=pos(d+1);const r1=rv(d+1)||0;if(!p1){cum+=r1;S+=r1;continue;}
    const smp=[[...p0,0]],len=[0];for(let j=1;j<=NS;j++){const t=j/NS,q=cyc(p0,p1,t,i0,d+1);smp.push([q[0],q[1],t]);len.push(len[j-1]+Math.hypot((q[0]-smp[j-1][0])*ux,(q[1]-smp[j-1][1])*uy));}
    path.push({e:d+1,p0,p1,smp});const Lt=len[NS];
    while(r1>0&&kk<=cum+r1+1e-12){const f=(kk-cum)/r1,s=f*Lt;let j=1;while(j<NS&&len[j]<s)j++;const w=len[j]>len[j-1]?(s-len[j-1])/(len[j]-len[j-1]):0;const t=(j-1+w)/NS;const q=cyc(p0,p1,t,i0,d+1);G.push({k:kk,x:q[0],y:q[1],e:d+1,t,col:colMove(base,p0,p1,i0,d+1,t)});kk++;}
    cum+=r1;S+=r1;p0=p1;i0=d+1;}
  G.forEach(g=>g.h=g.x<bx[0]||g.x>bx[1]||g.y<by[0]||g.y>by[1]);return {G,path,S,nh:G.filter(g=>g.h).length};}
/* v20.11 — market Z0 transition: T0→T1 two-pass only (séance data kept; no full-year snapshot walk) */
function trailTwoPass(pos,rv,a,base){
  base=base||'#bbbbbb'; const [ux,uy]=unit(); const G=[],path=[];
  let i0=a; let p0=pos(i0);
  while(!p0 && i0<S1){ i0++; p0=pos(i0); }
  if(!p0){ return {G:[],path:[],S:0,nh:0,twopass:true}; }
  G.push({k:0,x:p0[0],y:p0[1],e:i0,t:0,col:css(colAt(base,i0,p0))});
  const p1=pos(S1);
  if(!p1){ G.forEach(g=>g.h=g.x<bx[0]||g.x>bx[1]||g.y<by[0]||g.y>by[1]); return {G,path,S:0,nh:G.filter(g=>g.h).length,twopass:true}; }
  // Single cycloidal segment T0→T1. Column rule still spaces ghosts on THIS segment only.
  const smp=[[...p0,0]],len=[0];
  for(let j=1;j<=NS;j++){const t=j/NS,q=cyc(p0,p1,t,i0,S1);smp.push([q[0],q[1],t]);len.push(len[j-1]+Math.hypot((q[0]-smp[j-1][0])*ux,(q[1]-smp[j-1][1])*uy));}
  path.push({e:S1,p0,p1,smp});
  const Lt=len[NS];
  const r1=Math.max(1, (rv(S1)||1)); // at least one step so T1 is reached
  let kk=1, cum=0, S=0;
  while(kk<=r1+1e-12){const f=kk/r1,s=f*Lt;let j=1;while(j<NS&&len[j]<s)j++;const w=len[j]>len[j-1]?(s-len[j-1])/(len[j]-len[j-1]):0;const t=(j-1+w)/NS;const q=cyc(p0,p1,t,i0,S1);G.push({k:kk,x:q[0],y:q[1],e:S1,t,col:colMove(base,p0,p1,i0,S1,t)});kk++;}
  S=r1;
  // Ensure T1 endpoint present
  const last=G[G.length-1];
  if(!last || last.e!==S1 || Math.hypot(last.x-p1[0], last.y-p1[1])>1e-6){
    G.push({k:kk,x:p1[0],y:p1[1],e:S1,t:1,col:css(colAt(base,S1,p1))});
  }
  G.forEach(g=>g.h=g.x<bx[0]||g.x>bx[1]||g.y<by[0]||g.y>by[1]);
  return {G,path,S,nh:G.filter(g=>g.h).length,twopass:true};
}
function trail(pos,rv,a,base){
  if(window.__Z0_DOMAIN==='none'){ return {G:[],path:[],S:0,nh:0,skipped:'static-no-z0'}; }
  if(window.__MARKET_Z0_TWOPASS!==false) return trailTwoPass(pos,rv,a,base);
  return trailFullYear(pos,rv,a,base);
}
window.trailTwoPass=trailTwoPass; window.trailFullYear=trailFullYear;

/* v20.27 — FloorShortGhost math inlined so a page that only loads app.js still paints the trail.
   Keep in sync with um/js/floor-short-ghost.js. */
/* v20.27 — short trailing-sequence ghost for financial floors
 *
 * Éric (voice, 2026-11-12, America/Toronto): a GHOST on BOTH interpretations
 * of the financial floors. The ghost is the last sequence of the movement —
 * a short trailing segment, like a motion trail. Short is good: it gives an
 * idea of the movement. NOT Fourier-related. Not the v19 volume-spaced
 * trail (volGh / volGhObj / arc-length trail along the whole path).
 *
 * Both interpretations (Hub evidence — see FLOOR-SHORT-GHOST-SPEC.md):
 *   - "year"     : séance-by-séance walk (trailFullYear, door #sp500y / "2026 · année").
 *                  Last N séances behind the current τ.
 *   - "twopass"  : single cycloidal T0→T1 segment (trailTwoPass, door #sp500 /
 *                  "deux séances", __MARKET_Z0_TWOPASS). Last N virtual frames
 *                  behind the current t ∈ [0,1] on that segment.
 *
 * No invented market data: samples only existing getPos(i) values and the
 * engine's already-used interpolant (cyc / ZL) between known seats. Missing
 * seats are skipped. At T0 / t=0 the tail is empty.
 *
 * Length: N = 8 (in the 6–12 range). Decay: linear fade 0.08 (oldest) → 0.45
 * (newest ghost), always behind the live object (α = 1). For twopass the
 * virtual frame count along T0→T1 is 64, so the tail spans 8/64 ≈ 12.5 % of
 * the segment (short regardless of playSubsteps, which is only 8 in floor mode).
 *
 * This file is pure and DOM-free so it can be unit-tested in Node and reused
 * by the Hub floor renderer. app.js paints with paintFloorShortGhosts().
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FloorShortGhost = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  const N = 8;
  const TWOPASS_FRAMES = 64;
  const FADE_MIN = 0.08;
  const FADE_MAX = 0.45;
  const YEAR_TOKENS = ['year', 'annee', 'année', 'an', 'fullYear'];
  const TWOPASS_TOKENS = ['twopass', 't0t1', 't0-t1', 'seances', 'séances', 'deux-seances', 'deux-séances', '2seances'];

  function fade(i, n) {
    if (!(n > 0)) return 0;
    const t = (i + 1) / n; // 1/n … 1, i=0 oldest
    return FADE_MIN + (FADE_MAX - FADE_MIN) * t;
  }

  function applyFades(pts) {
    const n = pts.length;
    pts.forEach((g, i) => { g.fade = fade(i, n); });
    return pts;
  }

  function isYear(kind) {
    const k = String(kind == null ? '' : kind).toLowerCase();
    return YEAR_TOKENS.includes(k) || k === 'year';
  }

  function interpOf(flagOrKind) {
    if (flagOrKind === false) return 'year';
    if (flagOrKind === true) return 'twopass';
    return isYear(flagOrKind) ? 'year' : 'twopass';
  }

  function parseInterpretation(parts, query) {
    let found = null;
    const consider = (raw) => {
      if (raw == null || raw === '') return;
      const t = String(raw).toLowerCase();
      if (YEAR_TOKENS.includes(t)) found = 'year';
      else if (TWOPASS_TOKENS.includes(t)) found = 'twopass';
    };
    if (query && typeof query === 'object') {
      const q = query;
      const get = typeof q.get === 'function'
        ? (k) => q.get(k)
        : (k) => q[k];
      consider(get('view') || get('interp') || get('interpretation'));
    }
    if (Array.isArray(parts)) parts.forEach(consider);
    return found;
  }

  function defaultCyc(p0, p1, t) {
    if (!p0) return p1 || null;
    if (!p1 || !(t > 0)) return p0;
    if (t >= 1) return p1;
    return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
  }

  function firstPos(getPos, S0, S1) {
    let i0 = S0, p0 = getPos(i0);
    while (!p0 && i0 < S1) { i0++; p0 = getPos(i0); }
    return { i0, p0, p1: getPos(S1) };
  }

  function tCurTwoPass(playing, progress, parkedAt) {
    if (playing) return Math.max(0, Math.min(1, +progress || 0));
    if (parkedAt === 'T1' || parkedAt === 1) return 1;
    if (parkedAt === 'T0' || parkedAt === 0) return 0;
    const n = +parkedAt;
    if (isFinite(n)) return Math.max(0, Math.min(1, n));
    return 1; // floor views land on T1
  }

  function pointsTwoPass(args) {
    const getPos = args.getPos;
    const cycFn = args.cycFn || defaultCyc;
    const S0 = args.S0, S1 = args.S1;
    const { i0, p0, p1 } = firstPos(getPos, S0, S1);
    if (!p0 || !p1) return []; // no T0 or no T1 → no movement to trail; do not invent
    const tCur = tCurTwoPass(args.playing, args.progress, args.parkedAt);
    if (tCur <= 0) return [];
    const frames = Math.max(N, args.frames || TWOPASS_FRAMES);
    const dt = 1 / frames;
    const pts = [];
    for (let k = N; k >= 1; k--) {
      const t = tCur - k * dt;
      if (t < 0) continue; // before T0: skip, do not invent
      const p = t === 0 ? p0 : (t >= 1 ? p1 : cycFn(p0, p1, t, i0, S1));
      if (p) pts.push({ p: [p[0], p[1]], t, kind: 'twopass' });
    }
    return applyFades(pts);
  }

  function pointsYear(args) {
    const getPos = args.getPos;
    const S0 = args.S0, S1 = args.S1;
    const c = args.c, u = args.u || 0;
    const tau = c + u;
    if (!(tau > S0)) return [];
    const pts = [];
    const from = Math.max(S0, Math.floor(tau) - N);
    for (let i = from; i < tau && i <= S1; i++) {
      if (i !== Math.floor(i)) continue;
      const p = getPos(i);
      if (!p) continue; // missing séance: skip, do not invent
      pts.push({ p: [p[0], p[1]], t: i, seance: i, kind: 'year' });
    }
    return applyFades(pts.slice(-N));
  }

  function points(mode, args) {
    return interpOf(mode) === 'year' ? pointsYear(args) : pointsTwoPass(args);
  }

  /* Class-4 rides the linear fil Z0(τ)=ZL(τ), not the cycloidal floater rule. */
  function pointsC4TwoPass(args) {
    const ZL = args.ZL;
    const S0 = args.S0, S1 = args.S1;
    if (typeof ZL !== 'function') return [];
    const tCur = tCurTwoPass(args.playing, args.progress, args.parkedAt);
    if (tCur <= 0) return [];
    const frames = Math.max(N, args.frames || TWOPASS_FRAMES);
    const dt = 1 / frames;
    const pts = [];
    for (let k = N; k >= 1; k--) {
      const t = tCur - k * dt;
      if (t < 0) continue;
      const tau = S0 + t * (S1 - S0);
      const p = ZL(tau);
      if (p) pts.push({ p: [p[0], p[1]], t, tau, kind: 'twopass-c4' });
    }
    return applyFades(pts);
  }

  function pointsC4Year(args) {
    const ZL = args.ZL;
    const S0 = args.S0, S1 = args.S1;
    const c = args.c, u = args.u || 0;
    const tau = c + u;
    if (typeof ZL !== 'function' || !(tau > S0)) return [];
    const pts = [];
    const from = Math.max(S0, Math.floor(tau) - N);
    for (let i = from; i < tau && i <= S1; i++) {
      if (i !== Math.floor(i)) continue;
      const p = ZL(i);
      if (!p) continue;
      pts.push({ p: [p[0], p[1]], t: i, tau: i, kind: 'year-c4' });
    }
    return applyFades(pts.slice(-N));
  }

  return {
    VERSION: 'v20.27',
    N, TWOPASS_FRAMES, FADE_MIN, FADE_MAX,
    fade, interpOf, isYear, parseInterpretation,
    points, pointsTwoPass, pointsYear,
    pointsC4TwoPass, pointsC4Year, defaultCyc, tCurTwoPass
  };
}));

/* v20.27 — short trailing-sequence ghost (Éric, 12 nov 2026, America/Toronto).
   Last N=8 steps, decaying opacity, on BOTH floor interpretations:
   year (séance walk / trailFullYear / #sp500y) and twopass (T0→T1 / trailTwoPass / #sp500).
   Not Fourier; not the v19 volGh arc-length activity trail. Math: floor-short-ghost.js. */
function setFloorInterpretation(kind){
  const year=(typeof window.FloorShortGhost==='object'&&window.FloorShortGhost.isYear)
    ? window.FloorShortGhost.isYear(kind)
    : /^(year|fullYear|annee|année|an)$/i.test(String(kind||''));
  window.__FLOOR_INTERPRETATION=year?'year':'twopass';
  window.__MARKET_Z0_TWOPASS=!year;
  try{ if(typeof CACHE!=='undefined'&&CACHE&&CACHE.clear) CACHE.clear(); }catch(e){}
  return window.__FLOOR_INTERPRETATION;
}
window.setFloorInterpretation=setFloorInterpretation;
function floorInterpMode(){
  if(window.__FLOOR_INTERPRETATION==='year'||window.__MARKET_Z0_TWOPASS===false) return 'year';
  return 'twopass';
}
function shortGhostApi(){ return window.FloorShortGhost||null; }
function shortGhostPointsFor(getPos, state){
  const G=shortGhostApi(); if(!G) return [];
  const cycFn=typeof cyc==='function'?cyc:G.defaultCyc;
  const mode=floorInterpMode();
  if(mode==='year') return G.pointsYear({getPos, cycFn, S0, S1, c:state.c, u:state.u});
  let parked;
  if(!window.__PLAYING){
    if(state.c>=S1) parked='T1';
    else if(state.c<=S0) parked='T0';
    else parked=(S1>S0)?(state.c-S0)/(S1-S0):1;
  }
  return G.pointsTwoPass({getPos, cycFn, S0, S1, playing:!!window.__PLAYING, progress:state.u, parkedAt:parked});
}
function shortGhostC4(state){
  const G=shortGhostApi(); if(!G||typeof ZL!=='function') return [];
  const mode=floorInterpMode();
  if(mode==='year') return G.pointsC4Year({ZL, S0, S1, c:state.c, u:state.u});
  let parked;
  if(!window.__PLAYING){
    if(state.c>=S1) parked='T1';
    else if(state.c<=S0) parked='T0';
    else parked=(S1>S0)?(state.c-S0)/(S1-S0):1;
  }
  return G.pointsC4TwoPass({ZL, S0, S1, playing:!!window.__PLAYING, progress:state.u, parkedAt:parked});
}
function paintFloorShortGhosts(ctx, env){
  if(window.__Z0_DOMAIN==='none') return;
  if(!shortGhostApi()) return;
  const {X,Y,cl,c,u}=env;
  const vs=typeof volSys==='function'?volSys():1;
  const paint=(pts,rad,col)=>{
    if(!pts||!pts.length) return 0;
    ctx.save();
    for(const g of pts){
      const q=cl(g.p[0],g.p[1]),px=X(q[0]),py=Y(q[1]);
      ctx.globalAlpha=g.fade*vs;
      ctx.beginPath(); ctx.arc(px,py,rad,0,7);
      ctx.fillStyle=col; ctx.fill();
    }
    ctx.restore();
    return pts.length;
  };
  const st={c,u};
  let nC2=0,nC1=0,nC4=0,nC4n=0;
  const many=GROUPS.length>30;
  GROUPS.forEach(g=>{
    if(sel&&sel.g!==g&&many) return;
    const isS=sel&&sel.g===g;
    const rad=isS?14:(many?4:7);
    nC2+=paint(shortGhostPointsFor(i=>P2(g,i),st), rad, g.col||'#8aa0c8');
  });
  const mem=(sel&&sel.g&&sel.g.mem)?sel.g.mem:null;
  if(mem&&mem.length<=200){
    const rad=mem.length>80?1.8:2.4;
    mem.forEach(k=>{ nC1+=paint(shortGhostPointsFor(i=>P1(k,i),st), rad, '#c5cddc'); });
  } else if(typeof dep!=='undefined'&&dep&&dep.M){
    dep.M.forEach(tr=>{ nC1+=paint(shortGhostPointsFor(i=>P1(tr.k,i),st), 2.4, '#c5cddc'); });
  }
  if(Z0&&Z0.a&&Z0.b) nC4+=paint(shortGhostC4(st), 8, '#e8c872');
  if(Z0&&Z0.C4N&&!(document.body.classList.contains('mode-world')||document.body.classList.contains('mode-intl'))){
    Z0.C4N.forEach(n=>{
      if(!n||!n.P) return;
      nC4n+=paint(shortGhostPointsFor(i=>n.P[i]||null,st), 3, '#c9b56a');
    });
  }
  window.__SHORT_GHOST={mode:floorInterpMode(), n:8, nC2, nC1, nC4, nC4n, volsys:vs};
}
window.paintFloorShortGhosts=paintFloorShortGhosts;
function gtrail(g){if(window.__Z0_DOMAIN==='none'){return {G:[],path:[],S:0,nh:0,skipped:'static-no-z0'};}const col=$('col').value,key=SYS.id+'|'+$('ds').value+'|'+$('lvl').value+'|'+$('z2').checked+$('z3').checked+'|'+g.name+'|'+col+'|'+S0+'|'+S1+'|'+W+'x'+H;if(CACHE.has(key))return CACHE.get(key);
  const t0=performance.now();const vals=[];for(let i=S0;i<=S1;i++)vals.push(C2(g,i,col));const med=median(vals);
  let a=S0;while(a<=S1&&!P2(g,a))a++;const tr=trail(i=>P2(g,i),i=>{const v=C2(g,i,col);return v==null?0:v/med;},a,g.col);tr.med=med;tr.ms=performance.now()-t0;CACHE.set(key,tr);return tr;}
function deploy(g,d0){const col=$('col').value;const t0=performance.now();const M=[];
  for(const k of g.mem){if(!P1(k,d0))continue;const a=A0[k];const cc=BASE[k].col[col];const med=median(cc.slice(a,S1+1));if(!(med>0))continue;
    const tr=trail(i=>P1(k,i),i=>cc[i]==null?0:cc[i]/med,d0,SECT[ds.objs[k].s]||'#bbbbbb');tr.k=k;M.push(tr);}
  return {g,d0,M,ms:performance.now()-t0};}
// diamètre commun : plus court écart consécutif (vue d'origine) parmi les traînes affichées, hors creux
function rule(){const [ux,uy]=unit();let mn=Infinity,mx=0;const trs=[];if(sel)trs.push(sel.tr);if(dep)trs.push(...dep.M);
  for(const tr of trs){const G=tr.G;for(let i=1;i<G.length;i++){if(G[i].h||G[i-1].h)continue;const d=Math.hypot((G[i].x-G[i-1].x)*ux,(G[i].y-G[i-1].y)*uy);if(d>0){mn=Math.min(mn,d);mx=Math.max(mx,d);}}}
  return {mn,mx};}
// ---------- dessin ----------
function paintManifestMark(ctx,px,py,rad,col,label,ang){
  const formT=(typeof waveFormT==='function')?waveFormT():1;
  const k=1.2+0.45*Math.abs(Math.sin((ang||0)*2));
  const rx=Math.max(4,rad)*Math.sqrt(k), ry=Math.max(4,rad)/Math.sqrt(k);
  ctx.save(); ctx.translate(px,py); ctx.rotate(ang||0);
  ctx.beginPath();
  const n=16;
  for(let i=0;i<=n;i++){
    const a=-Math.PI/2+i*2*Math.PI/n;
    const diamond=1/(Math.abs(Math.cos(a))/Math.max(1e-6,rx)+Math.abs(Math.sin(a))/Math.max(1e-6,ry));
    const wobble=1+0.26*Math.sin(3*a)+0.12*Math.sin(5*a+0.4);
    const circ=Math.max(rx,ry)*0.9*wobble;
    const r=circ+(diamond-circ)*formT;
    const x=Math.cos(a)*r, y=Math.sin(a)*r;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle='rgba(8,10,16,.94)'; ctx.fill();
  ctx.strokeStyle=col||'#e8c872'; ctx.lineWidth=Math.max(1.2,rad*0.08); ctx.stroke();
  ctx.restore();
  if(label){ ctx.fillStyle=col||'#e8c872'; ctx.font='700 14px system-ui'; ctx.fillText(label,px+rx+6,py+4); }
}
function fmt(n){return Math.round(n).toLocaleString('fr-CA');}
function visible(gh,c,u){return gh.e<c||(gh.e===c&&gh.t<=0)||(gh.e===c+1&&gh.t<=u)||gh.k===0&&gh.e<=c;}
let HIT={c1:[],c2:[],c4:null,z0:null,gr:0,c:0};
function draw(){if(window.__DRAW_OVERRIDE==='nhl'){ if(typeof window.drawNhlGalaxy==='function') window.drawNhlGalaxy(); return;}if(window.__DRAW_OVERRIDE==='roster'&&typeof window.drawRoster==='function'){window.drawRoster();return;}const c=+$('c').value,u=progress;HIT={c1:[],c2:[],c4:null,c4n:[],z0:null,gr:0,c,lib:[],libR:null};window.HIT=HIT;GROUPS.forEach(g=>g._px=null);if(typeof EMPTY==='undefined'||EMPTY||!ds||!ds.dates)return (typeof drawEmpty==='function'?drawEmpty():undefined);if(window.__Z0_DOMAIN==='none'&&!(document.body&&document.body.classList.contains('mode-floor'))){hideC4Panel();return;} $('d').textContent=ds.dates[S0]+' → '+ds.dates[S1]+'  ·  instant '+ds.dates[Math.max(0,Math.min(c,ds.dates.length-1))]+(u>0?' (+'+u.toFixed(2)+')':'');
  document.body.classList.add('manifest-primary');
  if(!document.body.classList.contains('c4-open')) document.body.classList.add('c4-collapsed');
  const sp0=playSpan(c,u);
  const zc0=(Z0&&typeof ZL==='function')?ZL(sp0.tau):[0,0];
  const radii=[];
  const touchR=p=>{ if(!p||!isFinite(p[0])||!isFinite(p[1])||!zc0) return; radii.push(Math.hypot(p[0]-zc0[0],p[1]-zc0[1])); };
  if(typeof GROUPS!=='undefined') GROUPS.forEach(g=>{ touchR(P2(g,sp0.i0)); touchR(P2(g,sp0.i1)); touchR(P2(g,S0)); touchR(P2(g,S1)); });
  if(Z0){ touchR(Z0.a); touchR(Z0.b); if(Z0.C4N) Z0.C4N.forEach(n=>{ if(n&&n.P){ touchR(n.P[sp0.i0]); touchR(n.P[sp0.i1]); } }); }
  radii.sort((a,b)=>a-b);
  const maxR=Math.max(0.04, radii.length?radii[Math.floor((radii.length-1)*0.55)]:0.08);
  const frame=plotFrame();const Bb=frame.bottom,Tt=frame.top;
  const cx=L+(W-L-R)*0.5, cy=Tt+(H-Tt-Bb)*0.46;
  const reach=Math.min(W-L-R, H-Tt-Bb)*0.42;
  const swell=(window.__WAVE&&typeof waveSwell==='function')?waveSwell():1;
  const soft=u=>u/(1+Math.abs(u));
  const X=x=>cx+soft((x-zc0[0])/maxR)*reach*1.55*swell;
  const Y=y=>cy-soft((y-zc0[1])/maxR)*reach*1.55*swell;
  const cl=(x,y)=>[x,y];
  ctx.fillStyle='#07080c';ctx.fillRect(0,0,W,H);
  document.body.classList.toggle('c4-wave-attrs', !window.__WAVE || (typeof waveFormT==='function' && waveFormT()>=0.98));
  // contexte : positions courantes des objets de Classe 1 (aucune traîne)
  const rl=(sel||dep)?rule():{mn:NaN,mx:NaN};const dr=rl.mn*zoom,r=Math.max(FLOOR,isFinite(dr)?dr:FLOOR)/2;const objR=sel?16:13;HIT.gr=objR;
  const fadeOf=(gh,tr)=>{const vis=[];for(const g of tr.G)if(visible(g,c,u))vis.push(g);if(!vis.length)return 0;const k0=tr.G[0].k,k1=vis[vis.length-1].k,sp=k1-k0;return sp<=0?1:0.08+0.92*((gh.k-k0)/sp);};
  const ghosts=(tr,col,isFocus,rad,noFuture)=>{ // écho volumétrique : copies de la forme de l'objet, pas une ligne
    const ve=volGh()*volGhObj(); if(ve<=0) return;
    const boost=(isFocus&&$('ghfocus').checked)?1.5:1;
    const step=Math.max(1,Math.round(1+(1-Math.min(1,ve*(isFocus&&$('ghfocus').checked?1.25:1)))*8));
    let lastK=-1; for(const g of tr.G) if(visible(g,c,u)) lastK=g.k;
    for(const pass of [0,1]){
      for(const gh of tr.G){const vis=visible(gh,c,u);if(pass===0&&(vis||noFuture)||pass===1&&!vis)continue;
        if(gh.k%step&&gh.k!==0&&gh.k!==lastK) continue;
        const q=cl(gh.x,gh.y),px=X(q[0]),py=Y(q[1]);if(px<-rad||px>W+rad||py<-rad||py>H+rad)continue;
        const fade=fadeOf(gh,tr),a=Math.min(1,(0.05+0.95*ve)*boost*fade*(pass?1:.18));
        const cc=gh.col||col; ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(px,py,rad,0,7);
        if(gh.h){ctx.strokeStyle=cc;ctx.lineWidth=Math.max(1.2,rad*.12);ctx.stroke();}
        else{ctx.fillStyle=cc;ctx.fill();ctx.strokeStyle=cc;ctx.lineWidth=Math.max(1,rad*.1);ctx.globalAlpha=Math.min(1,a*1.15);ctx.stroke();}}
    }
    ctx.globalAlpha=1;};
  if(dep){dep.M.forEach(tr=>{const o=ds.objs[tr.k];ghosts(tr,SECT[o.s]||'#bbb',false,dep.M.length<=60?8:4,true);});
    const dg=dep.gh,q=cl(dg.x,dg.y);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),Math.max(6,objR+3),0,7);ctx.stroke();}
  if(sel) ghosts(sel.tr,sel.g.col,true,objR,false);
  // fil Z0 (linéaire) ; le glyphe de Classe 4 est redessiné après les objets pour rester lisible
  const sp=playSpan(c,u);
  const liveC4=(Z0&&!EMPTY)?computeC4Live(c,u):null;
  if(liveC4 && (document.body.classList.contains('mode-world')||document.body.classList.contains('mode-intl'))) liveC4.sysName='World';
  else if(liveC4 && (window.__CORE_ZONES||window.__REGION_DOORS) && window.__FLOOR_TITLE) liveC4.sysName=window.__FLOOR_TITLE;
  if(liveC4){liveC4.formT=(typeof window.waveFormT==='function')?window.waveFormT():1;liveC4.swell=(typeof window.waveSwell==='function')?window.waveSwell():1;}
  if(liveC4) syncC4Panel(liveC4); else hideC4Panel();
  if(Z0){const A=Z0.a,Bz=Z0.b,zc=liveC4?liveC4.zc:ZL(sp.tau);ctx.save();ctx.strokeStyle='rgba(232,200,114,.55)';ctx.lineWidth=1.4;ctx.globalAlpha=0.85*volSys();ctx.beginPath();ctx.moveTo(X(A[0]),Y(A[1]));ctx.lineTo(X(Bz[0]),Y(Bz[1]));ctx.stroke();
    HIT.z0={px:X(zc[0]),py:Y(zc[1]),r:8+1.25,p:zc};HIT.c4={px:X(zc[0]),py:Y(zc[1]),r:22,p:zc,live:liveC4};
    ctx.restore();}
  // v20.27 — short trailing-sequence ghost (last N steps, decaying opacity) on both interpretations.
  try{ if(!document.body.classList.contains('manifest-primary') && typeof paintFloorShortGhosts==='function') paintFloorShortGhosts(ctx,{X,Y,cl,c,u,sp,liveC4}); }catch(e){}
  // objets de Classe 2 à l'instant (déplacés sur leur trajet cycloïdal)
  const many=GROUPS.length>30;GROUPS.forEach((g,gi)=>{if(sel&&sel.g!==g&&many)return;const onWorld=!!(window.__CORE_ZONES||window.__REGION_DOORS);const reveal=(!onWorld||!window.__WAVE)?1:((typeof waveSwell==='function')?waveSwell():1);if(onWorld&&window.__WAVE&&reveal<=0.02)return;const p0=P2(g,sp.i0);if(!p0)return;const p1=P2(g,sp.i1);let p=(p1&&sp.u>0)?cyc(p0,p1,sp.u,sp.i0,sp.i1):p0;if(typeof window.swellFromZ0==="function"&&liveC4) p=window.swellFromZ0(p,liveC4.zc);const q=cl(p[0],p[1]);let px=X(q[0]),py=Y(q[1]); px=Math.max(L+28,Math.min(W<760?318:W-R-18,px)); py=Math.max(Math.max(Tt+78,112),Math.min(H-Bb-28,py));
    if(window.__REGION_DOORS&&HIT.c4&&(!window.__WAVE||swell>0.98)){
      const minC4=(HIT.c4.r||22)+36, minG=58;
      for(let guard=0;guard<14;guard++){
        let dx=px-HIT.c4.px, dy=py-HIT.c4.py, d=Math.hypot(dx,dy), moved=false;
        if(d<minC4){ if(d<0.8){ dx=1; dy=-0.45*(GROUPS.filter(o=>o._px!=null).length+1); d=Math.hypot(dx,dy); } px=HIT.c4.px+dx/d*minC4; py=HIT.c4.py+dy/d*minC4; moved=true; }
        for(const o of GROUPS){ if(o._px==null) continue; dx=px-o._px; dy=py-o._py; d=Math.hypot(dx,dy); if(d<minG){ if(d<0.8){ dx=0; dy=1; d=1; } px+=dx/d*(minG-d); py+=dy/d*(minG-d); moved=true; } }
        px=Math.max(L+10,Math.min(W<760?328:W-R-10,px)); py=Math.max(Tt+16,Math.min(H-Bb-16,py));
        if(!moved) break;
      }
    }
    const isS=sel&&sel.g===g;const rad=isS?30:(many?11:(onWorld?28:16));const gc=colMove(g.col,p0,p1,c,c+1,u);if(isS)window.__COLLOG.push([c,u,gc]);g._px=px;g._py=py;g._r=rad;HIT.c2.push({gi,px,py,r:rad+(isS?1.1:0.7),p});
    ctx.globalAlpha=volSys()*(sel&&!isS?0.55:1);
    const ang=Math.atan2(cy-py, px-cx);
    const lab=(!many||isS||onWorld)?(onWorld?g.name:(g.name.length>18?g.name.slice(0,17)+'…':g.name)):null;
    paintManifestMark(ctx,px,py,rad,gc,lab,ang);
    const pA=P2(g,S0), pB=P2(g,S1);
    if(pA&&pB){ ctx.save(); ctx.globalAlpha=0.34; [0.22,0.5,0.78].forEach(t=>{ paintManifestMark(ctx, X(pA[0]+(pB[0]-pA[0])*t), Y(pA[1]+(pB[1]-pA[1])*t), Math.max(5,rad*0.38), gc, null, ang); }); ctx.restore(); }
    ctx.globalAlpha=1;});
  // couche Classe 1, au-dessus des objets de Classe 2 : positions courantes (aucune traîne) puis constituants déployés
  ctx.globalAlpha=1;const _c1r=(sel&&sel.g&&sel.g.mem&&sel.g.mem.length>200)?5:(sel&&sel.g&&sel.g.mem&&sel.g.mem.length>80)?6:(sel?7:5);const hitC1=!(window.__CORE_ZONES||window.__REGION_DOORS);ds.objs.forEach((o,k)=>{if(document.body.classList.contains('mode-world')||document.body.classList.contains('mode-intl')||window.__REGION_DOORS)return;const p0=P1(k,sp.i0);if(!p0)return;if(sel&&sel.g&&sel.g.mem&&sel.g.mem.indexOf(k)<0) return;if(!sel&&ds.objs.length>140&&(k%3)!==0) return;const p1=P1(k,sp.i1);let p=(p1&&sp.u>0)?cyc(p0,p1,sp.u,sp.i0,sp.i1):p0;if(typeof window.swellFromZ0==="function"&&liveC4) p=window.swellFromZ0(p,liveC4.zc);const q=cl(p[0],p[1]),px=X(q[0]),py=Y(q[1]);if(px<-8||px>W+8||py<-8||py>H+8)return;if(hitC1) HIT.c1.push({k,px,py,r:_c1r,p});paintManifestMark(ctx,px,py,_c1r,SECT[o.s]||'#c5cddc',null,Math.atan2(cy-py,px-cx));});ctx.globalAlpha=1;
  if(dep){
    // constituants à l'instant, déplacés sur leur trajet cycloïdal
    const few=dep.M.length<=60;ctx.globalAlpha=volSys();dep.M.forEach(tr=>{const k=tr.k,o=ds.objs[k];if(c<dep.d0)return;const p0=P1(k,sp.i0),p1=P1(k,sp.i1);if(!p0)return;let p=(p1&&sp.u>0)?cyc(p0,p1,sp.u,sp.i0,sp.i1):p0;if(typeof window.swellFromZ0==="function"&&liveC4) p=window.swellFromZ0(p,liveC4.zc);const q=cl(p[0],p[1]),px=X(q[0]),py=Y(q[1]);const col=colMove(SECT[o.s]||'#bbbbbb',p0,p1,c,c+1,u);
      HIT.c1.push({k,px,py,r:(few?8:4)+0.5,dep:true});ctx.beginPath();ctx.arc(px,py,few?8:4,0,7);ctx.fillStyle='rgba(8,10,16,.85)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1;ctx.stroke();
      if(few){let fs=6;ctx.font='600 '+fs+'px system-ui';while(ctx.measureText(o.t).width>14&&fs>3){fs-=.5;ctx.font='600 '+fs+'px system-ui';}ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.t,px,py+.5);ctx.textAlign='left';ctx.textBaseline='alphabetic';}});ctx.globalAlpha=1;
  }
  // vecteurs + glyphe : chemin unique paintLivingClass4 (noyau, pas d'opt-in)
  if(Z0&&Z0.C4N&&!document.body.classList.contains('mode-world')&&!document.body.classList.contains('mode-intl')){ctx.save();ctx.globalAlpha=Math.max(0.82,c4Vol());
    Z0.C4N.forEach((n,ni)=>{const a0=n.P[sp.i0],a1=n.P[sp.i1];if(!a0)return;let p=(a1&&sp.u>0)?cyc(a0,a1,sp.u,sp.i0,sp.i1):a0;if(typeof window.swellFromZ0==="function"&&liveC4) p=window.swellFromZ0(p,liveC4.zc);const qx=X(p[0]),qy=Y(p[1]);
      const morph=(typeof c3MorphAt==='function')?c3MorphAt(n.b,sp,p):null;
      const hitR=(typeof drawC3Morph==='function')?drawC3Morph(ctx,qx,qy,morph,n.b.name,ni):6;
      HIT.c4n.push({px:qx,py:qy,r:(hitR||8)+0.9,p,n,morph,off:morph&&morph.off});});
    ctx.restore();}
  if(liveC4){liveC4.space=liveC4.space||'market';liveC4.sysName=liveC4.sysName||SYS.name;liveC4.formT=(typeof window.waveFormT==='function')?window.waveFormT():1;liveC4.swell=(typeof window.waveSwell==='function')?window.waveSwell():1;liveC4.px=X(liveC4.zc[0]);liveC4.py=Y(liveC4.zc[1]);if(HIT.c4){HIT.c4.px=liveC4.px;HIT.c4.py=liveC4.py;HIT.c4.p=liveC4.zc;HIT.c4.live=liveC4;}paintLivingClass4(ctx,liveC4,{});}
  try{if(typeof sampleLayerCoherence==='function') sampleLayerCoherence(sp);}catch(e){window.__LAYER_TAU=null;}
  // état
  let h='';if(sel){const tr=sel.tr;h+='<b>'+sel.g.name+'</b> ('+sel.g.mem.length+' constituants) · '+fmt(tr.G.length)+' fantômes, dont '+fmt(tr.nh)+' creux · Σrv = '+tr.S.toFixed(2)+' · calcul '+tr.ms.toFixed(0)+' ms (cache)';}
  else h+='Aucune traîne calculée. Choisir un objet de Classe 2.';
  if(dep){let n=0,nh=0;dep.M.forEach(t=>{n+=t.G.length;nh+=t.nh;});h+='<br>Déploiement depuis '+ds.dates[dep.d0]+' : '+dep.M.length+' constituants, '+fmt(n)+' fantômes (dont '+fmt(nh)+' creux) · '+dep.ms.toFixed(0)+' ms';}
  if(sel){if(isFinite(rl.mn)&&rl.mn>0&&isFinite(rl.mx)){h+='<br>Diamètre de la règle : '+rl.mn.toPrecision(3)+' px × zoom '+zoom.toFixed(1)+(dr<FLOOR?' → affiché '+FLOOR+' px (plancher)':' = '+dr.toPrecision(3)+' px')+' · règle ×1 → ×'+fmt(rl.mx/rl.mn);}else{h+='<br>Diamètre de la règle : [INCOMPLET] (écart T0→T1 non mesurable — vol20 à T0 absente de la fenêtre courte)';}}
  if(Z0){const f=v=>(v!=null&&isFinite(v))?v.toFixed(4):'[INCOMPLET]';const aok=Z0.a&&isFinite(Z0.a[0])&&isFinite(Z0.a[1]);const bok=Z0.b&&isFinite(Z0.b[0])&&isFinite(Z0.b[1]);const live=window.__C4LIVE;h+='<br><span style="color:#e8c872">Z0 — moyenne de tout, fil linéaire T₀→T₁ (dérive-comme-signal) — T₀ '+(aok?('('+f(Z0.a[0])+', '+f(Z0.a[1])+')'):'[INCOMPLET] (vol20 à T0 hors fenêtre courte)')+' → T₁ '+(bok?('('+f(Z0.b[0])+', '+f(Z0.b[1])+')'):'[INCOMPLET]')+(live?(' · maintenant ('+f(live.z0.x)+', '+f(live.z0.y)+') · dérive module '+f(live.drift.mag)):'')+' · ensemble T₁ : '+Z0.n1.n1+' Cl.1 + '+Z0.n1.n2+' Cl.2 + '+Z0.n1.n3+' Cl.3 = '+Z0.n1.pts.length+' · moteur Cl.4 : '+(MANIF_ENGINES.irrationalisateur||MANIF_ENGINES.class4).name+'</span>';}
  if(sel){const vis=sel.tr.G.filter(g=>visible(g,c,u));window.__GHOST={n:vis.length,volsys:volSys(),volgh:volGh(),volghobj:volGhObj(),focus:$('ghfocus').checked,libon:$('libon').checked,R:R,W:W,objR:objR,fades:vis.length?[0,.25,.5,.75,1].map(t=>{const g=vis[Math.min(vis.length-1,Math.round(t*(vis.length-1)))];return {k:g.k,fade:+fadeOf(g,sel.tr).toFixed(4)};}):[]};}
    else window.__GHOST={n:0,volsys:volSys(),volgh:volGh(),volghobj:volGhObj(),libon:$('libon').checked,R:R,W:W};
  $('st').innerHTML=h;legend();drawLib();}
function legend(){
  // v20.14 — never paint the version changelog over the galaxy canvas.
  if($('lg')) $('lg').innerHTML='';
  if($('lg')) $('lg').style.display='none';
}

function wrapT(t,w){const out=[];let line='';for(const wd of t.split(' ')){const tt=line?line+' '+wd:wd;if(ctx.measureText(tt).width>w&&line){out.push(line);line=wd;}else line=tt;}if(line)out.push(line);return out;}
function drawLib(){HIT.lib=[];HIT.libR=null;if(!$('libon').checked)return;const x0=W-PW-14,y0=10,w=PW,h=H-20;HIT.libR={x:x0,y:y0,w,h};
  ctx.save();ctx.fillStyle='rgba(10,12,18,.94)';ctx.strokeStyle='#2a2f3a';ctx.lineWidth=1;ctx.fillRect(x0,y0,w,h);ctx.strokeRect(x0+.5,y0+.5,w-1,h-1);
  ctx.fillStyle='#e8c872';ctx.font='700 12px system-ui';ctx.fillText('Bibliothèque de Classe 4 — 8 objets',x0+10,y0+17);
  ctx.fillStyle='#8a91a0';ctx.font='10px system-ui';ctx.fillText('source : '+$('ds').selectedOptions[0].textContent+' · ● place avec données · ○ place vide',x0+10,y0+30);
  const gx=x0+8,gy=y0+38,cw=(w-24)/2,ch=(h-46-12)/4;
  LIB4.forEach((L4,li)=>{const fx=gx+(li%2)*(cw+8),fy=gy+Math.floor(li/2)*(ch+4),isS=L4===SYS;const nd=[...L4.fl].filter(m=>NF[m]>0).length;
    HIT.lib.push({kind:'frame',sys:L4,x:fx,y:fy,w:cw,h:ch,nd});
    ctx.fillStyle=isS?'rgba(232,200,114,.08)':'rgba(20,24,34,.7)';ctx.fillRect(fx,fy,cw,ch);ctx.strokeStyle=isS?'#e8c872':'#4a5266';ctx.lineWidth=isS?2:1;ctx.setLineDash(nd?[]:[5,3]);ctx.strokeRect(fx+.5,fy+.5,cw-1,ch-1);ctx.setLineDash([]);
    ctx.fillStyle=isS?'#e8c872':'#dfe3ea';ctx.font='700 11px system-ui';ctx.fillText('◆ '+L4.name,fx+6,fy+14);
    ctx.font='9px system-ui';ctx.fillStyle='#8a91a0';ctx.fillText('Classe 4 · '+L4.fl.size+' places · '+nd+' avec données',fx+6,fy+25);
    let by=fy+30;const nb=L4.boxes.length,side=L4.boxes.every(b=>b.kind==='half');const bh=side?ch-34:(ch-34-(nb-1)*3)/nb;
    L4.boxes.forEach((b,bi)=>{const bx_=side?fx+4+bi*((cw-8)/2+0):fx+4,bw=side?(cw-8)/2-2:cw-8,byy=side?by:by+bi*(bh+3);const bnd=b.fl.filter(m=>NF[m]>0).length;
      if(b.kind!=='self'){ctx.strokeStyle=bnd?'#8a7a4a':'#3a4256';ctx.lineWidth=1;ctx.setLineDash(bnd?[]:[3,3]);ctx.strokeRect(bx_+.5,byy+.5,bw-1,bh-1);ctx.setLineDash([]);
        ctx.fillStyle=bnd?'#e8c872':'#9aa1b0';ctx.font='600 9px system-ui';ctx.fillText((b.kind==='c4n'?'◆ ':'')+b.name,bx_+4,byy+10);HIT.lib.push({kind:'box',sys:L4,b,x:bx_,y:byy,w:bw,h:bh,nd:bnd});}
      const top=b.kind==='self'?byy+2:byy+14;let cx=bx_+8,cy=top+6;const sp=11;
      // places de données d'abord (avec étiquette), puis emplacements vides
      const fl=b.fl.slice().sort((a,c)=>(NF[c]>0)-(NF[a]>0));
      for(const m of fl){const has=NF[m]>0;const r=has?5:3.2;let lab=has?m+' '+NF[m]:'';const lw=has?(ctx.font='600 9px system-ui',ctx.measureText(lab).width+14):sp;
        if(cx+lw>bx_+bw-2){cx=bx_+8;cy+=sp;}if(cy>byy+bh-3)break;
        ctx.beginPath();ctx.arc(cx,cy,r,0,7);if(has){ctx.fillStyle=FCOL[m]||'#bbb';ctx.fill();ctx.fillStyle='#dfe3ea';ctx.font='600 9px system-ui';ctx.fillText(lab,cx+7,cy+3);}else{ctx.strokeStyle='#6b7385';ctx.lineWidth=1;ctx.setLineDash([1.5,1.5]);ctx.stroke();ctx.setLineDash([]);}
        HIT.lib.push({kind:'slot',sys:L4,b,mic:m,px:cx,py:cy,r:r+0.8,has});cx+=lw;}
      if(!bnd){ctx.font='italic 9px system-ui';ctx.fillStyle='#e8a872';const lines=wrapT(EC,bw-12);let ty=Math.min(byy+bh-4-(lines.length-1)*10,Math.max(cy+16,byy+bh-4-(lines.length-1)*10));lines.forEach((l,j)=>ctx.fillText(l,bx_+6,ty+j*10));}
    });});
  ctx.restore();}
function hoverLib(mx,my){const R_=HIT.libR;if(!R_||mx<R_.x||mx>R_.x+R_.w||my<R_.y||my>R_.y+R_.h)return null;
  // priorité dans la bibliothèque : place (Classe 2) → conteneur imbriqué → objet de Classe 4
  let b=null,bd=Infinity;for(const h of HIT.lib)if(h.kind==='slot'){const d=Math.hypot(h.px-mx,h.py-my);if(d<=h.r&&d<bd){bd=d;b=h;}}
  if(b){const f=FLOORS[b.mic];return {kind:'slot',mic:b.mic,text:'Classe 2 — place : '+f.n+' ('+b.mic+')\nISO 10383 : '+f.iso+' · '+f.city+', '+f.cc+'\nVille : '+f.lat.toFixed(2)+', '+f.lon.toFixed(2)+' → hémisphère '+(f.lat>=0?'Nord':'Sud')+' / '+(f.lon>=0?'Est':'Ouest')+'\nDans : '+b.sys.name+(b.b.kind!=='self'?' › '+b.b.name:'')+'\n'+(b.has?'Données : '+NF[b.mic]+' titres de la source (cotation primaire)':'Aucune donnée — emplacement vide, aucune valeur inventée')}};
  const inR=h=>mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h;
  for(const h of HIT.lib)if(h.kind==='box'&&inR(h))return {kind:'box',sys:h.sys.id,text:(h.b.kind==='c4n'?'Classe 4 imbriquée — ':'Conteneur — ')+h.b.name+'\nDans : '+h.sys.name+' · '+h.b.fl.length+' places · '+h.nd+' avec données'+(h.nd?'':'\n'+EC)};
  for(const h of HIT.lib)if(h.kind==='frame'&&inR(h))return {kind:'frame',sys:h.sys.id,text:'Classe 4 — '+h.sys.name+'\n'+h.sys.fl.size+' places de Classe 2 imbriquées · '+h.nd+' avec données'+(h.nd?'':'\n'+EC)+'\n(cliquer : choisir ce système)'};
  return {kind:'lib',text:'Bibliothèque de Classe 4 — 8 objets'};}
function clickLib(mx,my){const h=hoverLib(mx,my);if(!h)return false;
  if(h.kind==='slot'){const f=LIB4.find(x=>x.fl.has(h.mic));if(SYS.fl.has(h.mic)&&!EMPTY&&$('lvl').value==='f'){const gi=GROUPS.findIndex(g=>g.mic===h.mic);if(gi>=0){stopPlay();select(gi);}}return true;}
  if(h.sys&&h.sys!==SYS.id){$('sys').value=h.sys;stopPlay();clearSel();setDS();defaultSel();}return true;}
function drawEmpty(){$('d').textContent=EMPTY?ds.dates[+$('s').value]+' → '+ds.dates[+$('e').value]:'';ctx.fillStyle='#07080c';ctx.fillRect(0,0,W,H);
  const cx=L+(W-L-R)/2,cy=T+(H-T-B)/2;ctx.strokeStyle='#e8a872';ctx.setLineDash([8,5]);ctx.lineWidth=1.5;ctx.strokeRect(L,T,W-L-R,H-T-B);ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(cx,cy-26);ctx.lineTo(cx+26,cy);ctx.lineTo(cx,cy+26);ctx.lineTo(cx-26,cy);ctx.closePath();ctx.strokeStyle='#e8c872';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.textAlign='center';ctx.fillStyle='#e8c872';ctx.font='700 20px system-ui';ctx.fillText('Classe 4 — '+SYS.name,cx,cy+60);ctx.fillStyle='#e8a872';ctx.font='italic 15px system-ui';ctx.fillText(EC,cx,cy+84);
  ctx.fillStyle='#8a91a0';ctx.font='12px system-ui';ctx.fillText(SYS.fl.size+' places de Classe 2 nommées, toutes vides : aucune donnée dans la source, aucune valeur inventée ; Z0 non calculable.',cx,cy+106);ctx.textAlign='left';
  hideC4Panel();$('st').innerHTML='<b>'+SYS.name+'</b> — '+EC+'. Conteneur structurel présent ; '+SYS.fl.size+' emplacements de Classe 2 vides.';legend();drawLib();}
// ---------- interaction ----------
function select(gi){clearSel();if(gi===''||gi==null)return draw();const g=GROUPS[+gi];sel={g,tr:gtrail(g)};$('sel').value=gi;if(g._volgh==null)g._volgh=100;$('volghobj').value=g._volgh;$('volghobjv').textContent=g._volgh;fit();draw();}
function clearSel(){sel=null;dep=null;CACHE.clear();$('sel').value='';zoom=1;panX=0;panY=0;}
function hitGhost(mx,my){if(!sel)return null;const v=view();const frame=plotFrame();const Bb=frame.bottom,Tt=frame.top;const X=x=>L+(x-v.x0)/(v.x1-v.x0)*(W-L-R),Y=y=>H-Bb-(y-v.y0)/(v.y1-v.y0)*(H-Tt-Bb);let best=null,bd=(HIT.gr||16)+2;for(const gh of sel.tr.G){const d=Math.hypot(X(gh.x)-mx,Y(gh.y)-my);if(d<bd){bd=d;best=gh;}}return best;}
function doDeploy(gh,auto){const d0=gh.k===0?gh.e:(gh.t>=1?gh.e:gh.e-1);dep=deploy(sel.g,d0);dep.gh=gh;$('c').value=d0;progress=0;fit();draw();if(auto)startPlay(d0);}
let timer=null;
function startPlay(from){if(timer){clearInterval(timer);timer=null;}
  // v20.27: year interpretation walks séance-by-séance (series already in the data).
  // twopass (default, v20.11 / v20.20): single T0→T1 transition.
  const year=window.__FLOOR_INTERPRETATION==='year'||window.__MARKET_Z0_TWOPASS===false;
  const t0=(from!=null?from:S0);
  $('c').value=t0; progress=0; window.__PLAYING=true; $('play').textContent='❚❚ Pause'; let sub=0;
  if(!year){
    const steps=(typeof playSubsteps==='function')?playSubsteps():SUB;
    timer=setInterval(()=>{sub++;
      if(sub>=steps){ $('c').value=S1; progress=0; stopPlay(); draw(); return; }
      progress=sub/steps; // interpolate T0 → T1 within the single shared frame loop
      draw();
    },28);
  } else {
    const steps=SUB; // 8 substeps per séance
    timer=setInterval(()=>{sub++;
      if(sub>=steps){
        sub=0; progress=0;
        const nxt=Math.min(S1, +$('c').value+1);
        $('c').value=nxt;
        if(nxt>=S1){ stopPlay(); draw(); return; }
      } else {
        progress=sub/steps;
      }
      draw();
    },28);
  }
  if(typeof window.syncGatePlayLabel==='function') window.syncGatePlayLabel();
}
function stopPlay(){
  if(timer){clearInterval(timer);timer=null;}
  const wasWave=!!window.__WAVE;
  window.__PLAYING=false;
  if(wasWave) try{ (window.finishManifestWave||finishManifestWave)(); }catch(e){ window.__WAVE=false; }
  progress=0;
  $('play').textContent='▶ Jouer';
  if(typeof window.syncGatePlayLabel==='function') window.syncGatePlayLabel();
}
$('play').onclick=()=>{if(timer){stopPlay();draw();return;}startPlay(dep?dep.d0:S0);};
$('c').oninput=()=>{stopPlay();draw();};
$('sel').onchange=()=>select($('sel').value);
$('clr').onclick=()=>{stopPlay();clearSel();draw();};
addEventListener('keydown',e=>{if(e.key==='Escape'){if($('pop')&&$('pop').classList.contains('open')){$('pop').classList.remove('open');document.querySelectorAll('#icons button.attr').forEach(b=>b.setAttribute('aria-expanded','false'));window.__POP={open:false};return;}stopPlay();clearSel();draw();return;}if(e.key===']'||(((e.key==='b')||(e.key==='B'))&&!/^(INPUT|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||''))){e.preventDefault();$('libon').checked=!$('libon').checked;$('libon').dispatchEvent(new Event('change'));}});
$('col').onchange=()=>{const gi=$('sel').value;stopPlay();clearSel();if(gi!=='')select(gi);else draw();};
$('lvl').onchange=()=>{stopPlay();clearSel();groups();computeZ0();defaultSel();};
function reZ0(){stopPlay();const gi=$('sel').value;const kk=dep&&dep.gh.k,d0=dep&&dep.d0;computeZ0();CACHE.clear();if(gi!==''){sel={g:GROUPS[+gi],tr:gtrail(GROUPS[+gi])};if(dep){const gh=sel.tr.G.find(g=>g.k===kk)||sel.tr.G[0];dep=deploy(sel.g,d0);dep.gh=gh;}}fit();draw();}
for(const id of['z2','z3','zt'])$(id).onchange=reZ0;
for(const id of['s','e'])$(id).onchange=()=>{let s=+$('s').value,e=+$('e').value;if(e<s+5){e=Math.min(ds.dates.length-1,s+5);$('e').value=e;}$('c').value=e;const gi=$('sel').value;stopPlay();clearSel();window_();computeZ0();if(gi!=='')select(gi);else draw();};
function worldIndexKeys(){return Object.keys(DATA).filter(k=>{const d=DATA[k];return !!(d&&d.meta&&d.meta.floor&&d.objs&&d.objs.length);});}
function mergeFloorDatasets(floorId){
  const keys=worldIndexKeys().filter(k=>DATA[k].meta.floor===floorId);
  if(!keys.length) return null;
  const dateSet=new Set();
  keys.forEach(k=>(DATA[k].dates||[]).forEach(d=>dateSet.add(d)));
  const dates=[...dateSet].sort();
  const objs=[];
  keys.forEach(k=>{
    const src=DATA[k];
    const imap=new Map((src.dates||[]).map((d,i)=>[d,i]));
    (src.objs||[]).forEach(o=>{
      const c=dates.map(d=>{const i=imap.get(d);return (i!=null&&o.c&&o.c[i]!=null)?o.c[i]:null;});
      const v=dates.map(d=>{const i=imap.get(d);return (i!=null&&o.v&&o.v[i]!=null)?o.v[i]:null;});
      objs.push(Object.assign({},o,{c,v}));
    });
  });
  const starts=keys.map(k=>DATA[k].meta&&DATA[k].meta.dates&&DATA[k].meta.dates[0]).filter(Boolean).sort();
  const t0s=keys.map(k=>DATA[k].meta&&DATA[k].meta.T0).filter(Boolean).sort();
  const t1s=keys.map(k=>DATA[k].meta&&DATA[k].meta.T1).filter(Boolean).sort();
  return {dates,objs,meta:{id:floorId,name:((typeof LIB4!=='undefined'&&LIB4.find(x=>x.id===floorId))||{}).name||floorId,floor:floorId,T0:t0s[0]||true,T1:t1s.length?t1s[t1s.length-1]:undefined,dates:starts.length?[starts[starts.length-1]]:undefined,merged:keys,n_with_prices:objs.filter(o=>o.c0!=null||(o.c&&o.c.some(x=>x!=null))).length}};
}
function setDS(){SYS=LIB4.find(x=>x.id===$('sys').value)||LIB4[0];const src=DATA[$('ds').value];
  const keepAll=!!(src&&src.meta&&(src.meta.keepAll||/^(EX-|REG-|HEMI-)/.test(String(src.meta.id||''))));
  if(keepAll){
    ds={dates:src.dates||[],objs:(src.objs||[]).slice()};
    EMPTY=!ds.objs.length;const n=ds.dates.length;for(const id of['s','e','c'])$(id).max=Math.max(0,n-1);
    for(const id of['lvl','col','z2','z3','zt','sel','s','e','c','play','clr'])$(id).disabled=EMPTY;
    if(EMPTY){BASE=[];GROUPS=[];Z0=null;sel=null;dep=null;$('sel').innerHTML='<option value="">— aucun —</option>';return;}
    base();window_();groups();computeZ0();return;
  }
  let used=src;
  if(src&&src.objs&&!src.objs.some(o=>SYS.fl.has(o.f))){
    const merged=mergeFloorDatasets(SYS.id);
    if(merged&&merged.objs.some(o=>SYS.fl.has(o.f))) used=merged;
  }
  for(const m in FLOORS)NF[m]=0;if(used&&used.objs)used.objs.forEach(o=>{if(o.f in NF)NF[o.f]++;});
  ds={dates:(used&&used.dates)||[],objs:((used&&used.objs)||[]).filter(o=>SYS.fl.has(o.f))};EMPTY=!ds.objs.length;const n=ds.dates.length;for(const id of['s','e','c'])$(id).max=n-1;
  for(const id of['lvl','col','z2','z3','zt','sel','s','e','c','play','clr'])$(id).disabled=EMPTY;
  const twopass=!!(used&&used.meta&&used.meta.T0&&used.objs&&used.objs.some(o=>o.c0!=null));
  if(twopass){let i0=0;if(used.meta&&used.meta.dates&&used.meta.dates.length){const k=ds.dates.indexOf(used.meta.dates[0]);if(k>=0)i0=k;}$('s').value=i0;$('e').value=n-1;$('c').value=n-1;}
  else if(!$('s').dataset.init){$('s').value=Math.max(0,ds.dates.indexOf('2026-01-06'));$('e').value=ds.dates.indexOf('2026-11-04')>=0?ds.dates.indexOf('2026-11-04'):n-1;$('c').value=$('e').value;$('s').dataset.init=1;}
  if(EMPTY){BASE=[];GROUPS=[];Z0=null;sel=null;dep=null;$('sel').innerHTML='<option value="">— aucun —</option>';return;}
  base();window_();groups();computeZ0();}

function playSubsteps(){return window.__WAVE?96:SUB;}
function mergeUniverseDataset(){
  if(window.__UNIVERSE_DS&&window.__UNIVERSE_DS.objs&&window.__UNIVERSE_DS.objs.length) return window.__UNIVERSE_DS;
  const keys=['ALL'].concat(typeof worldIndexKeys==='function'?worldIndexKeys():[]);
  const srcList=keys.map(k=>DATA[k]).filter(s=>s&&s.objs&&s.objs.length);
  const dateSet=new Set();
  srcList.forEach(src=>(src.dates||[]).forEach(d=>dateSet.add(d)));
  const dates=[...dateSet].sort();
  const objs=[]; const seen=new Set();
  srcList.forEach(src=>{
    const imap=new Map((src.dates||[]).map((d,i)=>[d,i]));
    (src.objs||[]).forEach(o=>{
      const id=(o.t||'')+'|'+(o.f||'');
      if(seen.has(id)) return; seen.add(id);
      const c=dates.map(d=>{const i=imap.get(d);return (i!=null&&o.c&&o.c[i]!=null)?o.c[i]:null;});
      const v=dates.map(d=>{const i=imap.get(d);return (i!=null&&o.v&&o.v[i]!=null)?o.v[i]:null;});
      objs.push(Object.assign({},o,{c,v}));
    });
  });
  const wkeys=typeof worldIndexKeys==='function'?worldIndexKeys():[];
  const starts=wkeys.map(k=>DATA[k].meta&&DATA[k].meta.dates&&DATA[k].meta.dates[0]).filter(Boolean).sort();
  const t0s=wkeys.map(k=>DATA[k].meta&&DATA[k].meta.T0).filter(Boolean).sort();
  const t1s=wkeys.map(k=>DATA[k].meta&&DATA[k].meta.T1).filter(Boolean).sort();
  const uni={dates,objs,meta:{id:'UNIVERSE',name:'Univers — tous les étages cotés',floor:'WF',T0:t0s[0]||'2026-01-02',T1:t1s.length?t1s[t1s.length-1]:'2026-11-04',dates:starts.length?[starts[starts.length-1]]:undefined,merged:wkeys,n_with_prices:objs.filter(o=>o.c0!=null||(o.c&&o.c.some(x=>x!=null))).length}};
  window.__UNIVERSE_DS=uni; DATA.UNIVERSE=uni; return uni;
}
function zAttr(k,i){
  const o=ds&&ds.objs&&ds.objs[k];
  if(!o||!o.c||!o.v) return null;
  let s=0,n=0;
  for(let j=Math.max(0,i-19);j<=i;j++){
    if(o.c[j]!=null&&o.v[j]!=null&&o.c[j]>0){s+=o.c[j]*o.v[j];n++;}
  }
  if(!n||!(s>0)) return null;
  return Math.log10(s/n);
}
function systemZAt(i){
  if(!ds||!ds.objs) return null;
  let s=0,n=0;
  ds.objs.forEach((o,k)=>{const z=zAttr(k,i);if(z!=null){s+=z;n++;}});
  return n?s/n:null;
}
function p1Full(k,i,p0cache){
  const o=ds&&ds.objs&&ds.objs[k];
  if(!o||!o.c||o.c[i]==null||!BASE||!BASE[k]||BASE[k].vol[i]==null) return null;
  let p0=p0cache?p0cache[k]:null;
  if(!(p0>0)){
    p0=(o.c0!=null&&o.c0>0)?o.c0:null;
    if(!(p0>0)){for(let j=0;j<o.c.length;j++){if(o.c[j]!=null&&o.c[j]>0){p0=o.c[j];break;}}}
  }
  if(!(p0>0)) return null;
  return [Math.log(o.c[i]/p0),BASE[k].vol[i]];
}
function collapseAtFull(i,p0cache){
  if(!ds||!ds.objs) return null;
  const pts=[];
  ds.objs.forEach((o,k)=>{const p=p1Full(k,i,p0cache);if(p)pts.push(p);});
  if($('z2')&&$('z2').checked&&GROUPS) GROUPS.forEach(g=>{
    let sx=0,sy=0,n=0; for(const k of g.mem){const p=p1Full(k,i,p0cache);if(p){sx+=p[0];sy+=p[1];n++;}}
    if(n) pts.push([sx/n,sy/n]);
  });
  return pts.length?{pts,z:collapseClass4(pts)}:null;
}
function dftAnalyze(values,label){
  const u=(values||[]).filter(v=>v!=null&&isFinite(v));
  const n=u.length;
  const out={label:label||'',n,incomplet:n<3,F:null,mean:null,bins:[],top:[],periodHint:null};
  if(n<3) return out;
  const mean=u.reduce((a,b)=>a+b,0)/n;
  const x=u.map(v=>v-mean);
  let sine=0; for(let m=0;m<n;m++) sine+=x[m]*Math.sin(2*Math.PI*m/n);
  const F=(2/n)*(-sine);
  const bins=[]; const nh=Math.floor(n/2);
  for(let k=1;k<=nh;k++){
    let re=0,im=0;
    for(let m=0;m<n;m++){const ang=2*Math.PI*k*m/n; re+=x[m]*Math.cos(ang); im-=x[m]*Math.sin(ang);}
    bins.push({k,period:n/k,re,im,amp:(2/n)*Math.hypot(re,im)});
  }
  bins.sort((a,b)=>b.amp-a.amp);
  out.F=F; out.mean=mean; out.bins=bins; out.top=bins.slice(0,5); out.periodHint=out.top.length?out.top[0].period:null;
  return out;
}
function lastConsecutive(arr,maxN){
  const vals=[];
  for(let i=arr.length-1;i>=0&&vals.length<maxN;i--){
    if(arr[i]==null||!isFinite(arr[i])){ if(vals.length) break; continue; }
    vals.push(arr[i]);
  }
  return vals.reverse();
}
const KOBAYASHI_FOUND='INDEX VIVANT — Manifestation : « Modes : Fourier (trois entrées) ; libre ; Kobayashi Maru (la transparence est le collapse de tous les résultats, G-4). » Aucune procédure exécutable dans le code du hub au-delà de cette phrase. Recette Fourier : F=(2/n)·(−Σ u_m·sin(2πm/n)), F=0 si n<3 ; court ≤5, long ≤63 ; forme=court X, couleur=court Y, étirement=court Z, rotation=long X, inclinaison avant=long Y, inclinaison radiale=long Z. Saturation n’y est pas assignée.';
function computeFourierSystem(){
  const LONG_MIN=63, SHORT_MAX=5, SHORT_MIN=3;
  const kobayashi={status:'[INCOMPLET — définition à fournir]',found:KOBAYASHI_FOUND};
  const empty={ready:false,reason:'no-series',long:{incomplet:true,n:0},short:{incomplet:true},attrs:{},kobayashi};
  window.__FOURIER=empty;
  if(!ds||!ds.objs||!ds.dates||!BASE) return empty;
  const p0cache=ds.objs.map(o=>{
    if(o.c0!=null&&o.c0>0) return o.c0;
    if(o.c){for(let j=0;j<o.c.length;j++){if(o.c[j]!=null&&o.c[j]>0) return o.c[j];}}
    return null;
  });
  const xs=[],ys=[],zs=[],days=[];
  for(let i=0;i<ds.dates.length;i++){
    const col=collapseAtFull(i,p0cache);
    if(!col) continue;
    xs.push(col.z[0]); ys.push(col.z[1]); zs.push(systemZAt(i)); days.push(ds.dates[i]);
  }
  const longN=xs.length, longIncomplet=longN<LONG_MIN;
  const shortX=lastConsecutive(xs,SHORT_MAX), shortY=lastConsecutive(ys,SHORT_MAX), shortZ=lastConsecutive(zs,SHORT_MAX);
  const longX=dftAnalyze(xs,'long X'), longY=dftAnalyze(ys,'long Y'), longZ=dftAnalyze(zs,'long Z');
  const courtX=dftAnalyze(shortX,'court X'), courtY=dftAnalyze(shortY,'court Y'), courtZ=dftAnalyze(shortZ,'court Z');
  if(longIncomplet){ [longX,longY,longZ].forEach(a=>{a.incomplet=true; a.reason='span T0→T1 < 63 séances ('+longN+')';}); }
  if(shortX.length<SHORT_MIN) courtX.incomplet=true;
  if(shortY.length<SHORT_MIN) courtY.incomplet=true;
  if(shortZ.length<SHORT_MIN) courtZ.incomplet=true;
  const pickF=an=>(!an||an.incomplet||an.F==null||!isFinite(an.F))?null:an.F;
  const raw={'Forme':pickF(courtX),'Couleur':pickF(courtY),'Étirement-écrasement':pickF(courtZ),'Rotation':pickF(longX),'Inclinaison avant-arrière':pickF(longY),'Centre-extérieur':pickF(longZ)};
  const mags=Object.values(raw).filter(v=>v!=null).map(Math.abs);
  const norm=mags.length?Math.max.apply(null,mags):0;
  const attrs={};
  Object.keys(raw).forEach(k=>{const v=raw[k]; attrs[k]={raw:v,value:(v==null||!norm)?v:(v/norm),incomplet:v==null};});
  const result={ready:true,nLong:longN,nShort:Math.min(shortX.length,shortY.length),span:{first:days[0]||null,last:days[days.length-1]||null},long:{X:longX,Y:longY,Z:longZ,incomplet:longIncomplet,n:longN},short:{X:courtX,Y:courtY,Z:courtZ,incomplet:shortX.length<SHORT_MIN},attrs,kobayashi};
  window.__FOURIER=result; return result;
}
const ATTR_REVEAL=['X','Y','Z','Forme','Étirement-écrasement','Couleur','Inclinaison avant-arrière','Rotation','Centre-extérieur','Saturation'];
function unlockedAttrNames(tNorm,fourier){
  const t=Math.max(0,Math.min(1,+tNorm||0));
  const names=['X','Y','Z'];
  const extra=ATTR_REVEAL.slice(3).slice();
  if(fourier) extra.push('Kobayashi-Maru');
  return names.concat(extra.slice(0,Math.floor(t*extra.length+1e-9)));
}
function c3MorphAt(box,sp,p){
  const zc=ZL(sp.tau);
  const pts=[],hues=[];
  if(box&&box.fl){
    const fl=new Set(box.fl);
    ds.objs.forEach((o,k)=>{
      if(!fl.has(o.f)) return;
      const q=interpPos(P1(k,sp.i0),P1(k,sp.i1),sp.i0,sp.u,sp.i1);
      if(!q) return;
      pts.push(q); hues.push(SECT[o.s]||'#bbbbbb');
    });
  }
  const stats=cloudStats(pts.length?pts:(p?[p]:[]), zc);
  const hue=meanHueHex(hues);
  let sat=68,n=0,ss=0;
  pts.forEach(q=>{const col=colAt('#ffb347',sp.tau,q);ss+=col.s;n++;});
  if(n) sat=ss/n;
  return {stretch:stats?stats.stretch:1,ecc:stats?stats.ecc:0,theta:stats?stats.theta:0,radius:stats?stats.radius:0,hue:hue,sat:sat,rot:stats?stats.theta:0,n:pts.length,off:p?[p[0]-zc[0],p[1]-zc[1]]:[0,0]};
}
function drawC3Morph(ctx,qx,qy,morph,name,ni){
  const size=9*(0.85+0.4*Math.tanh(((morph&&morph.radius)||0)/0.12));
  const stretch=(morph&&morph.stretch!=null&&isFinite(morph.stretch))?morph.stretch:1;
  const k=Math.min(2.6,Math.max(1,Math.sqrt(stretch)));
  const rx=size*Math.sqrt(k), ry=size/Math.sqrt(k);
  const theta=(morph&&isFinite(morph.theta))?morph.theta:0;
  const col=(morph&&morph.hue!=null&&isFinite(morph.hue))?('hsl('+morph.hue.toFixed(0)+','+Math.max(30,Math.min(95,morph.sat||68)).toFixed(0)+'%,58%)'):'#ffb347';
  ctx.save(); ctx.translate(qx,qy); ctx.rotate(theta);
  ctx.beginPath(); ctx.moveTo(0,-ry); ctx.lineTo(rx,0); ctx.lineTo(0,ry); ctx.lineTo(-rx,0); ctx.closePath();
  ctx.fillStyle='rgba(8,10,16,.9)'; ctx.fill(); ctx.strokeStyle=col; ctx.lineWidth=1.4; ctx.stroke();
  if(morph&&isFinite(morph.rot)&&Math.abs(morph.rot)>1e-3){ctx.beginPath();ctx.arc(0,0,Math.min(rx,ry)*0.45,0,morph.rot,morph.rot<0);ctx.stroke();}
  ctx.restore();
  ctx.fillStyle=col; ctx.font='600 10px system-ui';
  ctx.fillText('◆ '+(name||'')+' (imbriqué)', qx+Math.max(rx,ry)+6, qy-8-(ni||0)*12);
  return Math.max(rx,ry);
}
function sampleLayerCoherence(sp){
  if(!Z0||!sp||typeof ZL!=='function'){ window.__LAYER_TAU=null; window.__LAYER_COHERENCE=null; return null; }
  const zc=ZL(sp.tau);
  const c1=[];
  if(ds&&ds.objs){
    ds.objs.forEach((o,k)=>{
      if(c1.length>=8) return;
      const p=interpPos(P1(k,sp.i0),P1(k,sp.i1),sp.i0,sp.u,sp.i1);
      if(!p) return;
      c1.push({k,t:o.t,p:[p[0],p[1]],off:[p[0]-zc[0],p[1]-zc[1]]});
    });
  }
  const c3=[];
  if(Z0.C4N){
    Z0.C4N.forEach(n=>{
      const a0=n.P[sp.i0], a1=n.P[sp.i1];
      if(!a0) return;
      const p=(a1&&sp.u>0)?cyc(a0,a1,sp.u,sp.i0,sp.i1):a0;
      c3.push({name:n.b.name,p:[p[0],p[1]],off:[p[0]-zc[0],p[1]-zc[1]]});
    });
  }
  const eps=1e-9;
  const rec={
    tau:sp.tau,u:sp.u,i0:sp.i0,i1:sp.i1,
    tNorm:(Z0.i1!==Z0.i0)?(sp.tau-Z0.i0)/(Z0.i1-Z0.i0):0,
    z0:{x:zc[0],y:zc[1]},
    c1,c3,
    sameTau:true,
    ok:{
      c1FromZ0:c1.every(o=>Math.abs(o.p[0]-zc[0]-o.off[0])<eps&&Math.abs(o.p[1]-zc[1]-o.off[1])<eps),
      c3FromZ0:c3.every(o=>Math.abs(o.p[0]-zc[0]-o.off[0])<eps&&Math.abs(o.p[1]-zc[1]-o.off[1])<eps)
    }
  };
  window.__LAYER_TAU=rec; window.__LAYER_COHERENCE=rec; return rec;
}
window.computeFourierSystem=computeFourierSystem;
window.__sampleTau=function(tNorm){
  if(!Z0) return null;
  const t=Math.max(0,Math.min(1,+tNorm||0));
  window.__PLAYING=true;
  if($('c')) $('c').value=Z0.i0;
  progress=t;
  draw();
  return window.__LAYER_TAU;
};

function defaultSel(){const gi=GROUPS.findIndex(g=>g.name==='Technology');if(gi>=0)select(gi);else if(GROUPS.length&&$('lvl').value==='f'){let b=0;GROUPS.forEach((g,i)=>{if(g.mem.length>GROUPS[b].mem.length)b=i;});select(b);}else draw();}
$('ds').onchange=$('sys').onchange=()=>{stopPlay();clearSel();setDS();defaultSel();};
function syncVolLabels(){$('volsysv').textContent=$('volsys').value;$('volghv').textContent=$('volgh').value;$('volghobjv').textContent=$('volghobj').value;$('panbtn').textContent=$('libon').checked?'› Bibliothèque':'‹ Bibliothèque';$('panbtn').setAttribute('aria-expanded',$('libon').checked?'true':'false');$('panbtn').title=$('libon').checked?'Escamoter le panneau de droite (raccourci ])':'Rétablir le panneau de droite (raccourci ])';}
function applyPanel(){size();const gi=$('sel').value;CACHE.clear();if(gi!==''&&!EMPTY)select(gi);else draw();syncVolLabels();}
function onVol(){syncVolLabels();if(sel)sel.g._volgh=+$('volghobj').value;draw();}
for(const id of['volsys','volgh','volghobj'])$(id).oninput=onVol;
$('ghfocus').onchange=()=>draw();
$('libon').onchange=applyPanel;
$('panbtn').onclick=()=>{$('libon').checked=!$('libon').checked;applyPanel();};
const ATTRS=[{name:'X',an:'volume',mu:0,sig:1},{name:'Y',an:'volume',mu:0,sig:1},{name:'Z',an:'volume',mu:0,sig:1},{name:'Forme',an:'volume',mu:0,sig:1},{name:'Étirement-écrasement',an:'volume',mu:0,sig:1},{name:'Couleur',an:'volume',mu:0,sig:1},{name:'Inclinaison avant-arrière',an:'volume',mu:0,sig:1},{name:'Rotation',an:'volume',mu:0,sig:1},{name:'Centre-extérieur',an:'volume',mu:0,sig:1},{name:'Saturation',an:'volume',mu:0,sig:1}];
function drawGauss(){const cv=$('popcv'),g=cv.getContext('2d'),W=cv.width,H=cv.height;const mu=+$('popmu').value,sig=Math.max(0.05,+$('popsig').value);g.clearRect(0,0,W,H);const zcol=['#151a24','#1a2230','#243044','#1a2230','#151a24'];for(let i=0;i<5;i++){g.fillStyle=zcol[i];g.fillRect(i*W/5,0,W/5,H);}g.strokeStyle='#2a2f3a';g.beginPath();for(let i=1;i<5;i++){g.moveTo(i*W/5,0);g.lineTo(i*W/5,H);}g.stroke();g.beginPath();for(let i=0;i<=W;i++){const x=-4+8*i/W,y=Math.exp(-0.5*Math.pow((x-mu)/sig,2)),py=H-14-y*(H-28);if(i===0)g.moveTo(i,py);else g.lineTo(i,py);}g.strokeStyle='#e8c872';g.lineWidth=2;g.stroke();$('popmuv').textContent=(+mu).toFixed(2);$('popsigv').textContent=(+sig).toFixed(2);}
function closePop(){$('pop').classList.remove('open');document.querySelectorAll('#icons button.attr').forEach(b=>b.setAttribute('aria-expanded','false'));window.__POP={open:false};}
function openPop(i,btn){const a=ATTRS[i];$('pop').dataset.i=i;$('poptitle').textContent=a.name+' — analyse et gaussienne';$('popan').value=a.an;$('popmu').value=a.mu;$('popsig').value=a.sig;$('pop').classList.add('open');document.querySelectorAll('#icons button.attr').forEach(b=>b.setAttribute('aria-expanded','false'));btn.setAttribute('aria-expanded','true');drawGauss();const r=btn.getBoundingClientRect(),pw=$('pop').offsetWidth,ph=$('pop').offsetHeight;let left=r.left,top=r.bottom+8;if(left+pw>innerWidth-10)left=Math.max(8,innerWidth-pw-10);if(top+ph>innerHeight-10)top=Math.max(8,r.top-ph-8);$('pop').style.left=left+'px';$('pop').style.top=top+'px';window.__POP={open:true,attr:a.name,i:i,scrollY:scrollY};}
$('popx').onclick=closePop;
$('popan').onchange=()=>{const i=+$('pop').dataset.i;if(ATTRS[i])ATTRS[i].an=$('popan').value;};
$('popmu').oninput=$('popsig').oninput=()=>{const i=+$('pop').dataset.i;if(ATTRS[i]){ATTRS[i].mu=+$('popmu').value;ATTRS[i].sig=+$('popsig').value;}drawGauss();};
document.querySelectorAll('#icons button.attr').forEach(btn=>{btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPop(+btn.dataset.i,btn);});});
document.addEventListener('mousedown',e=>{if(!$('pop').classList.contains('open'))return;if($('pop').contains(e.target)||(e.target.closest&&e.target.closest('#icons button.attr')))return;closePop();});
window.closePop=closePop;window.openPop=openPop;window.__ATTRS=ATTRS;

addEventListener('resize',()=>{size();const gi=$('sel').value;if(gi!==''&&!EMPTY){const kk=dep&&dep.gh.k,d0=dep&&dep.d0;CACHE.clear();sel={g:GROUPS[+gi],tr:gtrail(GROUPS[+gi])};if(dep){const gh=sel.tr.G.find(g=>g.k===kk)||sel.tr.G[0];const keep=dep;dep=deploy(sel.g,d0);dep.gh=gh;}}draw();});
// cadrage automatique sur la traîne choisie (et le déploiement)
function fitGroupsOnScreen(){
  const pts=[];
  if(typeof GROUPS!=='undefined') GROUPS.forEach(g=>{ [S0,S1].forEach(i=>{ const p=P2(g,i); if(p&&isFinite(p[0])&&isFinite(p[1])) pts.push(p); }); });
  if(Z0&&Z0.a&&Z0.b){ pts.push(Z0.a,Z0.b); }
  if(pts.length<2) return;
  let x0=Math.min.apply(null,pts.map(p=>p[0])), x1=Math.max.apply(null,pts.map(p=>p[0]));
  let y0=Math.min.apply(null,pts.map(p=>p[1])), y1=Math.max.apply(null,pts.map(p=>p[1]));
  const px=Math.max(0.05,(x1-x0)*0.28), py=Math.max(0.05,(y1-y0)*0.35);
  bx=[x0-px,x1+px]; by=[Math.max(0,y0-py),y1+py];
  zoom=1; panX=0; panY=0;
}
function fit(){
  // v20.14 — fit to the dense core of Class 1 (+ Class 2) so the galaxy fills the view.
  const pts=[]; const c=+$('c').value;
  const pushP=(p)=>{ if(p) pts.push({x:p[0],y:p[1]}); };
  if(sel && sel.g && sel.g.mem){
    sel.g.mem.forEach(k=>pushP(P1(k,c)));
    pushP(P2(sel.g,c));
  } else if(ds && ds.objs){
    ds.objs.forEach((o,k)=>pushP(P1(k,c)));
  }
  if(pts.length<8 && sel && sel.tr && sel.tr.G) pts.push(...sel.tr.G);
  if(pts.length<4 && dep) dep.M.forEach(t=>pushP(P1(t.k,c)));
  if(pts.length<2 && Z0 && $('zt') && $('zt').checked){ pts.push({x:Z0.a[0],y:Z0.a[1]},{x:Z0.b[0],y:Z0.b[1]}); }
  if(!pts.length) return;
  const xs=pts.map(p=>p.x).sort((a,b)=>a-b), ys=pts.map(p=>p.y).sort((a,b)=>a-b);
  const q=(a,p)=>{const h=(a.length-1)*p,lo=Math.floor(h),hi=Math.ceil(h);return a[lo]+(a[hi]-a[lo])*(h-lo);};
  // 8–92% core avoids extreme outliers flattening zoom to 1
  let x0=q(xs,.08), x1=q(xs,.92), y0=q(ys,.08), y1=q(ys,.92);
  if(!(x1>x0)) { x0=xs[0]-0.05; x1=xs[xs.length-1]+0.05; }
  if(!(y1>y0)) { y0=Math.max(0,ys[0]-0.02); y1=ys[ys.length-1]+0.02; }
  // pad
  const px=(x1-x0)*0.18||0.05, py=(y1-y0)*0.18||0.05;
  x0-=px; x1+=px; y0=Math.max(0,y0-py); y1+=py;
  const v=vb();
  const zx=(v.x1-v.x0)/((x1-x0)||1e-9), zy=(v.y1-v.y0)/((y1-y0)||1e-9);
  zoom=Math.max(1.15, Math.min(5000, Math.min(zx,zy)));
  panX=(x0+x1)/2-(v.x0+v.x1)/2; panY=(y0+y1)/2-(v.y0+v.y1)/2;
}
let drag=null,moved=false,hubDown=null,hubDownAt=0;
cv.onmousedown=e=>{
  drag=[e.clientX,e.clientY]; moved=false;
  const now=performance.now();
  if(hubDown && now-hubDownAt<500) return;
  hubDown=null; hubDownAt=now;
  if(EMPTY) return;
  const world=document.body.classList.contains('mode-world');
  const intl=document.body.classList.contains('mode-intl');
  const onFloor=document.body.classList.contains('mode-floor');
  const onCenter=HIT.c4 && Math.hypot(HIT.c4.px-e.clientX,HIT.c4.py-e.clientY)<=(HIT.c4.r||22)+4;
  const route=typeof parseHash==='function'?parseHash():{};
  const hit=(world||intl||onFloor)&&!EMPTY?hoverAt(e.clientX,e.clientY):null;
  const g=hit&&(hit.kind==='c2'||hit.kind==='c1')?(hit.kind==='c2'?GROUPS[hit.gi]:GROUPS.find(gr=>gr.mem&&gr.mem.indexOf(hit.k)>=0)):null;
  const distC4=HIT.c4?Math.hypot(HIT.c4.px-e.clientX,HIT.c4.py-e.clientY):1e9;
  const distG=(g&&g._px!=null)?Math.hypot(g._px-e.clientX,g._py-e.clientY):1e9;
  if(g&&g.hubFloor&&distG<=(g._r||16)+4) hubDown=g.hubFloor;
  else if(world && onCenter) hubDown='#/floor/WF';
  else if(intl && onCenter) hubDown='#/world';
  else if(onFloor && onCenter) hubDown=(route.sys&&(route.index||route.ex))?('#/floor/'+route.sys):'#/world';
};
onmouseup=()=>drag=null;
cv.onmousemove=e=>{if(!drag||EMPTY)return;if(Math.abs(e.clientX-drag[0])+Math.abs(e.clientY-drag[1])>2)moved=true;const v=view();panX-=(e.clientX-drag[0])/(W-L-R)*(v.x1-v.x0);panY+=(e.clientY-drag[1])/(H-T-B)*(v.y1-v.y0);drag=[e.clientX,e.clientY];draw();};
// survol : test géométrique exact sur la forme dessinée (rayon affiché compris).
// Priorité : Classe 1 (même à l'intérieur d'un objet de Classe 2) → Classe 2 → Classe 4 → marqueur Z0 → fantôme de la traîne. Aucune zone morte.
function hoverAt(mx,my){if(window.__DRAW_OVERRIDE==='nhl')return null;if(window.__DRAW_OVERRIDE==='roster'){const best=a=>{let b=null,bd=Infinity;for(const h of (a||[])){const d=Math.hypot(h.px-mx,h.py-my);if(d<=(h.r||8)&&d<bd){bd=d;b=h;}}return b;};const h=best(HIT.c2);if(h){const g=GROUPS[h.gi];return {kind:'c2',gi:h.gi,text:'Classe 2 — '+(g?g.name:'')+'\n[INCOMPLET] prix T0/T1'};}if(HIT.c4&&Math.hypot(HIT.c4.px-mx,HIT.c4.py-my)<=(HIT.c4.r||28))return {kind:'c4',text:'Classe 4 — '+((window.__ROSTER&&window.__ROSTER.title)||'')+'\n[INCOMPLET] prix T0/T1'};const c1=best(HIT.c1);if(c1){const it=(window.__ROSTER&&window.__ROSTER.items||[])[c1.k];return {kind:'c1',k:c1.k,text:'Classe 1 — '+((it&&it.label)||'')+'\n[INCOMPLET] prix T0/T1'};}return null;}{const lb=hoverLib(mx,my);if(lb)return lb;}if(EMPTY)return null;const inC=h=>Math.hypot(h.px-mx,h.py-my)<=h.r;const best=a=>{let b=null,bd=Infinity;for(const h of a){const d=Math.hypot(h.px-mx,h.py-my);if(d<=h.r&&d<bd){bd=d;b=h;}}return b;};
  const pc=v=>(v*100).toFixed(1)+' %',c=HIT.c;
  // constituants déployés dessinés au-dessus : prioritaires parmi les Classe 1
  let h=best(HIT.c1.filter(z=>z.dep))||best(HIT.c1.filter(z=>!z.dep));
  if(h){const o=ds.objs[h.k],p=P1(h.k,c)||h.p;return {kind:'c1',k:h.k,text:'Classe 1 — objet élémentaire\n'+o.t+' · '+(o.s||'—')+' · '+(o.i||'—')+'\nPlace de cotation : '+(FLOORS[o.f]?FLOORS[o.f].n+' ('+o.f+')':'—')+'\nSéance '+ds.dates[c]+'\nRendement cumulé depuis T₀ : '+(p?pc(Math.exp(p[0])-1):'—')+'\nVolatilité 20 séances : '+(p?pc(p[1]):'—')+'\nVolume : '+(o.v[c]!=null?o.v[c].toLocaleString('fr-CA'):'—')};}
  h=best(HIT.c2);if(h){const g=GROUPS[h.gi];return {kind:'c2',gi:h.gi,text:'Classe 2 — '+g.name+'\n'+({s:'secteur',i:'industrie',x:'indice',f:'place (bourse)'}[$('lvl').value])+' · '+g.mem.length+' constituants\nPosition = moyenne des constituants\nRendement cumulé : '+pc(Math.exp(h.p[0])-1)+' · vol20 : '+pc(h.p[1])+'\n(cliquer : choisir sa traîne)'};}
  if(HIT.c4&&Math.hypot(HIT.c4.px-mx,HIT.c4.py-my)<=HIT.c4.r){const raw=HIT.c4.live||window.__C4LIVE;const L=(raw&&raw.z0)?raw:((window.__C4LIVE&&window.__C4LIVE.z0)?window.__C4LIVE:null);const extra=L?('\nZ0 : ('+L.z0.x.toFixed(4)+', '+L.z0.y.toFixed(4)+') · dérive module '+L.drift.mag.toFixed(4)+' · dir. '+L.drift.angleDeg.toFixed(1)+'°\nConstituants : '+L.n1+' Cl.1 + '+L.n2+' Cl.2 + '+L.n3+' Cl.3\nX '+L.attrs.X.toFixed(4)+' · Y '+L.attrs.Y.toFixed(4)+' · Z [INCOMPLET]\nForme '+((L.attrs.Forme!=null&&isFinite(L.attrs.Forme))?L.attrs.Forme.toFixed(4):'—')+' · Étirement '+((L.attrs['Étirement-écrasement']!=null&&isFinite(L.attrs['Étirement-écrasement']))?L.attrs['Étirement-écrasement'].toFixed(3):'[INCOMPLET]')+' · Rotation '+((L.attrs.Rotation!=null&&isFinite(L.attrs.Rotation))?L.attrs.Rotation.toFixed(2)+'°':'—')+'\nCentre-extérieur '+((L.attrs['Centre-extérieur']!=null&&isFinite(L.attrs['Centre-extérieur']))?L.attrs['Centre-extérieur'].toFixed(4):'—')+' · Saturation '+((L.attrs.Saturation!=null&&isFinite(L.attrs.Saturation))?L.attrs.Saturation.toFixed(1):'—')+'\nInclinaison avant-arrière : [INCOMPLET]'):'';return {kind:'c4',text:'Classe 4 — ancre comparative (Z0)\n'+SYS.name+' · moteur : '+(MANIF_ENGINES.irrationalisateur||MANIF_ENGINES.class4).name+'\nRendement cumulé : '+pc(Math.exp(HIT.c4.p[0])-1)+' · vol20 : '+pc(HIT.c4.p[1])+extra};}
  {let b=null,bd=Infinity;for(const h of HIT.c4n){const d=Math.abs(h.px-mx)+Math.abs(h.py-my);if(d<=h.r&&d<bd){bd=d;b=h;}}if(b)return {kind:'c4n',text:'Classe 4 imbriquée — '+b.n.b.name+' (dans '+SYS.name+')\nEffondrement de ses constituants (moyenne de l’ensemble restreint)\nRendement cumulé : '+pc(Math.exp(b.p[0])-1)+' · vol20 : '+pc(b.p[1])};}
  if(HIT.z0&&inC(HIT.z0))return {kind:'z0',text:'Z0 — fil linéaire Z0(T₀) → Z0(T₁)\nZ0 = moyenne de tout, en un seul ensemble · dérive-comme-signal\nRendement cumulé : '+pc(Math.exp(HIT.z0.p[0])-1)+' · vol20 : '+pc(HIT.z0.p[1])};
  if(sel){const v=view();const frame=plotFrame();const Bb=frame.bottom,Tt=frame.top;const X=x=>L+(x-v.x0)/(v.x1-v.x0)*(W-L-R),Y=y=>H-Bb-(y-v.y0)/(v.y1-v.y0)*(H-Tt-Bb);const cl=(x,y)=>[Math.min(bx[1],Math.max(bx[0],x)),Math.min(by[1],Math.max(by[0],y))];let b=null,bd=Infinity;
    for(const gh of sel.tr.G){const q=cl(gh.x,gh.y);const d=Math.hypot(X(q[0])-mx,Y(q[1])-my);if(d<=HIT.gr+0.5&&d<bd){bd=d;b=gh;}}
    if(b)return {kind:'ghost',text:'Fantôme n° '+b.k+' — '+sel.g.name+'\nTrajet '+ds.dates[Math.max(S0,b.e-1)]+' → '+ds.dates[b.e]+(b.h?'\nCreux (hors règle)':'')+'\n(cliquer : déployer les constituants)'};}
  return null;}
window.hoverAt=hoverAt;
cv.addEventListener('mousemove',e=>{const tip=$('tip');if(drag){tip.style.display='none';return;}const r=hoverAt(e.clientX,e.clientY);if(!r){tip.style.display='none';tip.dataset.kind='';return;}
  tip.textContent=r.text;tip.dataset.kind=r.kind;tip.style.display='block';tip.style.left=Math.min(W-330,e.clientX+14)+'px';tip.style.top=Math.min(H-140,e.clientY+14)+'px';});
cv.addEventListener('mouseleave',()=>{$('tip').style.display='none';});
cv.onclick=e=>{if(moved)return;if(clickLib(e.clientX,e.clientY))return;if(EMPTY)return;const gh=hitGhost(e.clientX,e.clientY);if(gh){doDeploy(gh,true);return;}
  for(let gi=0;gi<GROUPS.length;gi++){const g=GROUPS[gi];if(g._px!=null&&Math.hypot(g._px-e.clientX,g._py-e.clientY)<=g._r+1.1){if(document.body.classList.contains('mode-world')||document.body.classList.contains('mode-intl')||document.body.classList.contains('mode-region')||document.body.classList.contains('mode-roster'))return;stopPlay();select(gi);return;}}};
cv.ondblclick=()=>{
  // Hub navigation is its own layer: an object dives into its floor; Class 4 goes up one level.
  if(window.__clickNavTimer){ clearTimeout(window.__clickNavTimer); window.__clickNavTimer=null; }
  if(hubDown && typeof window.go==='function'){ const dest=hubDown; hubDown=null; window.go(dest); return; }
  if(EMPTY)return;
  zoom=1;panX=0;panY=0;draw();
};
cv.addEventListener('wheel',ev=>{ev.preventDefault();if(EMPTY)return;const v=view();const mx=v.x0+(ev.clientX-L)/(W-L-R)*(v.x1-v.x0),my=v.y0+(H-B-ev.clientY)/(H-T-B)*(v.y1-v.y0);const f=ev.deltaY<0?1.25:0.8;const nz=Math.max(1,Math.min(5000,zoom*f));
  const k=zoom/nz;const vv=vb(),cx=(vv.x0+vv.x1)/2,cy=(vv.y0+vv.y1)/2;panX=mx-(mx-(cx+panX))*k-cx;panY=my-(my-(cy+panY))*k-cy;zoom=nz;draw();},{passive:false});
// ---------- démarrage (paramètres d'URL facultatifs : ds, lvl, col, sel, dep=AAAA-MM-JJ, at=AAAA-MM-JJ, z, noui) ----------
LIB4.forEach(x=>{const op=document.createElement('option');op.value=x.id;op.textContent=x.name;$('sys').appendChild(op);});size();
const U=new URLSearchParams(location.search);if(U.get('sys'))$('sys').value=U.get('sys');if(U.get('lib')==='0'){$('libon').checked=false;size();}if(U.get('ds'))$('ds').value=U.get('ds');if(U.get('lvl'))$('lvl').value=U.get('lvl');if(U.get('col'))$('col').value=U.get('col');
/* Application overlay v20.11 — galaxies hero + silos (SAFE Pages). */
/* v20.11 — fenêtre principale dans la colonne + tableau d'état, registre, LNH et sports.
   Injecté à la fin du prototype ; n'altère pas le moteur financier des versions antérieures. */
(function(){
const EC='en construction — à remplir quand les crédits le permettront';
const FLOOR_IDS=['AMF','EUF','AFF','ASF','OCF','WF','NSF','EWF'];

/* === Analysis silos — Finance ⊄ Sports ; sports isolated per sport (Éric 17:49) === */
const ANALYSIS_FINANCE_KEY='um.analysis.finance.attrs.v1';
const ANALYSIS_SPORT_PREFIX='um.analysis.sports.';
function analysisSportKey(sport){ return ANALYSIS_SPORT_PREFIX + sport + '.v1'; }
function analysisFinanceLoad(){
  try{
    const raw=localStorage.getItem(ANALYSIS_FINANCE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}
function analysisFinanceSave(){
  try{
    if(typeof ATTRS==='undefined') return;
    const payload={savedAt:Date.now(), domain:'finance', attrs:ATTRS.map(a=>({name:a.name,an:a.an,mu:a.mu,sig:a.sig}))};
    localStorage.setItem(ANALYSIS_FINANCE_KEY, JSON.stringify(payload));
  }catch(e){}
}
function analysisFinanceRestore(){
  const st=analysisFinanceLoad();
  if(!st||!st.attrs||typeof ATTRS==='undefined') return;
  st.attrs.forEach((a,i)=>{ if(ATTRS[i]){ if(a.an!=null) ATTRS[i].an=a.an; if(a.mu!=null) ATTRS[i].mu=a.mu; if(a.sig!=null) ATTRS[i].sig=a.sig; } });
}
function analysisSportLoad(sport){
  try{ return JSON.parse(localStorage.getItem(analysisSportKey(sport))||'null'); }catch(e){ return null; }
}
function analysisSportSave(sport, state){
  try{
    localStorage.setItem(analysisSportKey(sport), JSON.stringify(Object.assign({savedAt:Date.now(), domain:'sports', sport:sport}, state||{})));
  }catch(e){}
}
function analysisAssertIsolation(){
  // Runtime guard used by tests: finance key never written by sports paths; sport keys never hold ATTRS
  const fin=analysisFinanceLoad();
  const sports=['nhl','football','american-football','soccer','basketball'];
  const report={financeKey:ANALYSIS_FINANCE_KEY, sportKeys:sports.map(analysisSportKey), ok:true, leaks:[]};
  sports.forEach(sp=>{
    const st=analysisSportLoad(sp);
    if(st && (st.attrs || st.domain==='finance')){ report.ok=false; report.leaks.push(sp+':finance-shaped'); }
  });
  if(fin && fin.domain && fin.domain!=='finance'){ report.ok=false; report.leaks.push('finance:bad-domain'); }
  // Ensure no shared key name collision
  const all=[ANALYSIS_FINANCE_KEY].concat(sports.map(analysisSportKey));
  if(new Set(all).size!==all.length){ report.ok=false; report.leaks.push('key-collision'); }
  return report;
}
window.analysisFinanceSave=analysisFinanceSave;
window.analysisFinanceRestore=analysisFinanceRestore;
window.analysisSportSave=analysisSportSave;
window.analysisSportLoad=analysisSportLoad;
window.analysisAssertIsolation=analysisAssertIsolation;
window.ANALYSIS_FINANCE_KEY=ANALYSIS_FINANCE_KEY;
window.analysisSportKey=analysisSportKey;

/* === Z0 domain rules (v20.11) — static sports structures: NO Z0; market = T0→T1 only === */
window.__Z0_DOMAIN='finance'; // 'finance' | 'none'
if(typeof window.__FLOOR_INTERPRETATION==='undefined'){
  window.__FLOOR_INTERPRETATION='twopass';
  window.__MARKET_Z0_TWOPASS=true;
}
function z0DomainForRoute(route){
  if(!route) return 'finance';
  if(route.mode==='nhl'||route.mode==='sports'||route.mode==='placeholder') return 'none';
  if(route.mode==='galaxy'&&(route.galaxy==='sports'||route.galaxy==='nhl')) return 'none';
  return 'finance';
}
function assertNoZ0OnStatics(){
  // Runtime guard for tests: sports silos never hold Z0 fields
  const sports=['nhl','football','american-football','soccer','basketball'];
  const leaks=[];
  sports.forEach(sp=>{
    const st=analysisSportLoad(sp);
    if(st && (st.Z0 || st.z0 || st.trail || st.ghosts)) leaks.push(sp);
  });
  return {ok:leaks.length===0, leaks, domain:window.__Z0_DOMAIN, twopass:!!window.__MARKET_Z0_TWOPASS};
}
window.z0DomainForRoute=z0DomainForRoute;
window.assertNoZ0OnStatics=assertNoZ0OnStatics;


const POS_FR={C:'Center (centre)',L:'Left Wing (ailier gauche)',R:'Right Wing (ailier droit)',D:'Defense (défenseur)',G:'Goalie (gardien)'};
const SPORT_PH=[
  {id:'football',name:'Football'},
  {id:'american-football',name:'Football américain'},
  {id:'soccer',name:'Soccer'},
  {id:'basketball',name:'Basketball'}
];
function countMic(mic,dsKey){const src=DATA[dsKey||'ALL'];return src?src.objs.filter(o=>o.f===mic).length:0;}
function floorFeeds(id){const L=LIB4.find(x=>x.id===id);if(!L)return {n:0,mics:[]};const mics=[...L.fl].filter(m=>countMic(m)>0);return {n:mics.length,mics};}


function floorLiveState(id){
  const reg=findReg(id);
  const fd=floorFeeds(id);
  if(fd.n>0) return 'live';
  if(reg&&reg.status==='live') return 'live';
  return 'empty';
}
function hubCategoryOf(entry){
  if(!entry) return 'Autres';
  if(entry.category==='finance'||entry.category==='sports'||entry.category==='Autres') return entry.category;
  if(entry.group==='floors'||entry.group==='indices') return 'finance';
  if(entry.group==='sports'||entry.group==='windows') return 'sports';
  return entry.category||'Autres';
}

/* v20.11 — arbre d'ouverture à CINQ branches (Éric 16:52) + coupes */

/* v20.12 — merge South America MIC floors from WORLD_FLOORS */
(function(){
  try{
    const extra=(window.WORLD_FLOORS&&WORLD_FLOORS.floors_extra)||{};
    Object.keys(extra).forEach(k=>{ if(!window.FLOORS[k]) window.FLOORS[k]=extra[k]; });
  }catch(e){}
})();

const TREE_BRANCHES=[
  {id:'APAC',name:'Asie-Pacifique',floor:'ASF',includes:['ASF','OCF'],blurb:'Asie + Australie / Océanie',covered:false},
  {id:'ME',name:'Moyen-Orient',floor:'MEF',includes:['MEF'],blurb:'Branche propre (Tadawul, etc.) — plus « Asie de l’Ouest »',covered:false},
  {id:'EUR',name:'Europe',floor:'EUF',includes:['EUF'],blurb:'Europe Floor',covered:false},
  {id:'AFR',name:'Afrique',floor:'AFF',includes:['AFF'],blurb:'Africa Floor',covered:false},
  {id:'AMER',name:'Amériques',floor:'AMF',includes:['AMF'],blurb:'Amérique du Nord + du Sud · NDX · S&P 500',covered:true}
];
const TREE_COUPES=[
  {id:'coupe-monde',name:'Monde',floor:'WF',route:'#/floor/WF'},
  {id:'coupe-ns',name:'Nord-Sud',floor:'NSF',route:'#/floor/NSF'},
  {id:'coupe-ew',name:'Est-Ouest',floor:'EWF',route:'#/floor/EWF'},
  {id:'coupe-eurasie',name:'Eurasie',floor:'EWF',route:'#/floor/EWF',note:'Coupe Europe + Asie (via East-West) — pas une branche d’ouverture'}
];
function treeBranchById(id){return TREE_BRANCHES.find(b=>b.id===id)||null;}
function treeBranchForFloor(floorId){
  if(!floorId) return null;
  if(floorId==='MEF') return treeBranchById('ME');
  return TREE_BRANCHES.find(b=>b.includes.indexOf(floorId)>=0)||null;
}
function branchLiveState(b){
  if(b.id==='AMER') return floorFeeds('AMF').n>0?'live':'empty';
  return branchCovered(b)?'live':'empty';
}
function branchCovered(b){
  // v20.12: a branch is "couverte (liens)" if WORLD_FLOORS lists exchanges/indices with verified links,
  // or (AMER) if NDX/SPX price feeds exist. Price series beyond NDX/SPX remain [INCOMPLET].
  if(b.id==='AMER'){
    const sa=((window.WORLD_FLOORS||{}).branches||{}).AMER;
    const hasSA=!!(sa&&((sa.exchanges||[]).some(e=>e.links&&e.links.exchange)||(sa.indices||[]).length));
    return floorFeeds('AMF').n>0 || hasSA;
  }
  const blk=((window.WORLD_FLOORS||{}).branches||{})[b.id];
  if(!blk) return false;
  const nEx=(blk.exchanges||[]).filter(e=>e.links&&e.links.exchange).length;
  const nIx=(blk.indices||[]).length;
  return (nEx+nIx)>0;
}

function registryBalanceRows(){
  const rows=[];
  // FINANCE opening = 5 tree branches only (not 8 floors)
  for(const b of TREE_BRANCHES){
    const st=branchLiveState(b);
    const cov=branchCovered(b);
    let detail=b.blurb;
    if(b.id==='AMER'&&cov) detail='America Floor · NDX '+DATA.NDX.objs.length+' · S&P 500 '+DATA.SPX.objs.length;
    else if(!cov) detail=b.blurb+' · '+EC;
    rows.push({id:b.id,name:b.name,kind:'tree-branch',status:cov?'live':'empty',route:'#/galaxy/'+b.id,detail,children:[],group:'tree',category:'finance',floor:b.floor,branch:b.id});
  }
  const sportsKids=[
    {id:'NHL',name:'Hockey — LNH',status:'live',route:'#/sports/nhl',count:NHL.players.length+' joueurs · '+Object.keys(NHL.teams).length+' clubs',category:'sports'},
    ...SPORT_PH.map(s=>({id:s.id,name:s.name,status:'empty',route:'#/sports/'+s.id,count:EC,category:'sports'}))
  ];
  rows.push({id:'SPORTS',name:'Sports professionnels',kind:'window',status:'live',route:'#/sports',detail:'Hockey (LNH) en service · '+NHL.players.length+' joueurs',children:sportsKids,group:'windows',category:'sports'});
  const covered=new Set(rows.map(r=>r.id).concat(rows.flatMap(r=>(r.children||[]).map(c=>c.id))).concat(['NDX','SPX','NHL',...SPORT_PH.map(s=>s.id),...TREE_BRANCHES.map(b=>b.id)]));
  for(const x of REGISTRY){
    if(covered.has(x.id)) continue;
    // Keep floors in registry but do not list them on opening tree
    if(FLOOR_IDS.indexOf(x.id)>=0) continue;
    rows.push({id:x.id,name:x.name,kind:x.kind||'system',status:x.status||'empty',route:x.route||('#/'+x.id),detail:x.blurb||(x.status==='empty'?EC:'Système enregistré'),children:[],group:x.group||'other',category:hubCategoryOf(x)});
  }
  return rows;
}
function balanceCell(row, isChild){
  const live=row.status==='live';
  const cls=live?'bal-cell live':'bal-cell empty';
  const badge=live?'ACTIVE':'en construction';
  const kids=(row.children&&row.children.length)?('<div class="bal-kids">'+row.children.map(c=>balanceCell(c,true)).join('')+'</div>'):'';
  const count=row.count?('<span class="bal-count">'+row.count+'</span>'):(row.detail&&!isChild?('<span class="bal-detail">'+row.detail+'</span>'):'');
  return `<div role="button" tabindex="0" class="${cls}${isChild?' child':''}" data-id="${row.id}" data-route="${row.route}" data-status="${row.status}" data-branch="${row.branch||''}" aria-label="${row.name} — ${badge}">
    <span class="bal-name">${row.name}</span>
    <span class="bal-badge">${badge}</span>
    ${count}
    ${kids}
  </div>`;
}
window.__HUB_CAT='finance';
window.__HUB_TREE=null; // open branch id or null (sommet)
function planetaryCoverageRows(){
  const amCovered=floorFeeds('AMF').n>0;
  const continents=TREE_BRANCHES.map(b=>{
    const cov=branchCovered(b);
    let note=b.blurb;
    if(b.id==='AMER'&&cov) note='Amériques · NDX '+DATA.NDX.objs.length+' · S&P 500 '+DATA.SPX.objs.length;
    else note=b.blurb+' · même gabarit arbre → Classe 2 → Classe 1 · '+EC;
    return {id:'branch-'+b.id,name:b.name,floor:b.floor,branch:b.id,route:'#/galaxy/'+b.id,covered:cov,note,kind:'branch'};
  });
  const coupes=TREE_COUPES.map(c=>{
    const st=floorLiveState(c.floor);
    const cov=st==='live'&&amCovered;
    return {id:c.id,name:c.name,floor:c.floor,route:c.route,covered:cov,note:(c.note||('Coupe · étage '+c.floor+' conservé comme structure'))+(cov?' · données via Amériques':' · '+EC),kind:'coupe'};
  });
  return continents.concat(coupes);
}
function renderPlanetaryCoverage(){
  const rows=planetaryCoverageRows();
  const branches=rows.filter(r=>r.kind==='branch');
  const coupes=rows.filter(r=>r.kind==='coupe');
  const nCov=branches.filter(r=>r.covered).length;
  const item=r=>{
    const st=r.covered?'covered':'gap';
    const badge=r.covered?'COUVERT':'NON COUVERT — prochain chantier';
    return `<button type="button" class="cov-row ${st}" data-id="${r.id}" data-route="${r.route}" data-floor="${r.floor||''}" data-branch="${r.branch||''}" aria-label="${r.name} — ${badge}">
      <span class="cov-name">${r.name}</span>
      <span class="cov-badge">${badge}</span>
      <span class="cov-note">${r.note}</span>
    </button>`;
  };
  return `<section id="planetary-coverage" aria-label="Couverture planétaire">
    <div class="cov-head"><h2 class="cov-title">Couverture planétaire</h2>
      <p class="cov-sum"><strong>${nCov}</strong> branche${nCov>1?'s':''} couverte${nCov>1?'s':''} sur ${branches.length} · arbre d’ouverture à 5 branches · coupes hors arbre</p></div>
    <h3 class="cov-sub">Cinq branches d’ouverture</h3>
    <div class="cov-list" id="cov-list">${branches.map(item).join('')}</div>
    <h3 class="cov-sub">Coupes (super-instantiateurs hors arbre)</h3>
    <div class="cov-list" id="cov-coupes">${coupes.map(item).join('')}</div>
  </section>`;
}

function floorContentsForHub(branchOrFloor){
  const b=treeBranchById(branchOrFloor)||treeBranchForFloor(branchOrFloor);
  const id=b?b.id:branchOrFloor;
  const WF=(window.WORLD_FLOORS&&WORLD_FLOORS.branches)||{};
  const blk=WF[id]||{};
  const rows=[];
  if(id==='AMER'||branchOrFloor==='AMF'){
    rows.push(
      {id:'NDX',name:'Nasdaq-100',status:'live',route:'#/floor/AMF/index/NDX',count:DATA.NDX.objs.length+' titres Classe 1 · prix T0/T1',klass:2},
      {id:'SPX',name:'S&P 500',status:'live',route:'#/floor/AMF/index/SPX',count:DATA.SPX.objs.length+' titres Classe 1 · prix T0/T1',klass:2},
      {id:'XNYS',name:'NYSE',status:'live',route:'#/floor/AMF/ex/XNYS',count:countMic('XNYS')+' titres',klass:2},
      {id:'XNAS',name:'Nasdaq',status:'live',route:'#/floor/AMF/ex/XNAS',count:countMic('XNAS')+' titres',klass:2},
      {id:'BATS',name:'Cboe BZX',status:'live',route:'#/floor/AMF/ex/BATS',count:countMic('BATS')+' titres',klass:2}
    );
  }
  // Indices Class 2 with verified links (+ constituents when present)
  (blk.indices||[]).forEach(ix=>{
    const n=ix.constituents_n||0;
    const priced=!!(DATA[ix.id]&&DATA[ix.id].meta&&DATA[ix.id].meta.n_with_prices);
    const floor=(DATA[ix.id]&&DATA[ix.id].meta&&DATA[ix.id].meta.floor)||ix.floor||((id==='AMER')?'AMF':(id==='EUR')?'EUF':(id==='AFR')?'AFF':(id==='ME')?'MEF':(id==='APAC')?'ASF':null);
    const st=priced?'live':(n>0?'links':'links');
    const count=priced?(DATA[ix.id].meta.n_with_prices+' titres Classe 1 · prix T0/T1'):(n>0?(n+' constituants Classe 1 · [INCOMPLET] prix T0/T1'):((ix.note||'[INCOMPLET] constituants')+' · liens vérifiés'));
    const route='#/floor/'+(floor||'AFF')+'/index/'+ix.id;
    rows.push({id:ix.id,name:ix.name,status:st,route:route,count:count,klass:2,links:ix.links,note:ix.note,constituents_n:n});
  });
  // Exchange Class 2
  (blk.exchanges||[]).forEach(ex=>{
    const has=!!(ex.links&&ex.links.exchange);
    const micInfo=ex.mic?('MIC '+ex.mic):'';
    rows.push({
      id:ex.id,name:ex.name+(ex.city?(' · '+ex.city):''),
      status:has?'links':'empty',
      route:'#/floor/'+((ex.mic&&typeof meMics==='function'&&meMics().has(ex.mic))?'MEF':(ex.ct||(FLOORS[ex.mic]&&FLOORS[ex.mic].ct)||'AMF'))+'/ex/'+(ex.mic||ex.id),
      count:(has?'liens vérifiés':'[INCOMPLET]')+' · '+micInfo+(ex.iso_name?(' · '+ex.iso_name):''),
      klass:2,links:ex.links,note:ex.note
    });
  });
  if(rows.length) return rows;
  return [{id:(id||'x')+'-empty',name:EC,status:'empty',route:b?('#/galaxy/'+b.id):('#/'),count:'Branche → Classe 2 [INCOMPLET]',klass:2}];
}
function renderSuperStrip(activeBranch){
  // Persistent strip of the FIVE opening branches — always visible
  const atTop=!activeBranch;
  const chips=TREE_BRANCHES.map(b=>{
    const live=branchCovered(b);
    const here=b.id===activeBranch;
    const collapsed=!!activeBranch && !here;
    return `<button type="button" class="strip-chip ${live?'live':'empty'}${here?' open':''}${collapsed?' c2':''}" data-id="${b.id}" data-branch="${b.id}" data-route="#/galaxy/${b.id}" title="${b.name}" aria-current="${here?'true':'false'}">
      <span class="strip-id">${b.id}</span>
      <span class="strip-name">${b.name}</span>
      <span class="strip-badge">${live?'ACTIVE':'en construction'}</span>
    </button>`;
  }).join('');
  const back=atTop?'':`<button type="button" class="strip-top" data-route="#/" data-hub-cat="finance" id="retour-sommet" aria-label="Retour au sommet">↑ Retour au sommet</button>`;
  return `<nav id="super-strip" class="${atTop?'at-top':'branch-open'}" aria-label="Cinq branches d’ouverture">${back}<div class="strip-ring">${chips}</div></nav>`;
}
function renderOpenFloorPanel(branchId){
  const b=treeBranchById(branchId)||treeBranchForFloor(branchId);
  const id=b?b.id:branchId;
  const name=b?b.name:branchId;
  const contents=floorContentsForHub(id);
  const cells=contents.map(c=>{
    const live=c.status==='live';
    return `<div role="button" tabindex="0" class="bal-cell ${live?'live':'empty'} child" data-id="${c.id}" data-route="${c.route}" data-status="${c.status}">
      <span class="bal-name">${c.name}</span>
      <span class="bal-badge">${live?'ACTIVE':'en construction'}</span>
      <span class="bal-count">${c.count||''}</span>
    </div>`;
  }).join('');
  const others=TREE_BRANCHES.filter(x=>x.id!==id).map(ob=>{
    const live=branchCovered(ob);
    return `<div role="button" tabindex="0" class="c2-collapsed ${live?'live':'empty'}" data-id="${ob.id}" data-branch="${ob.id}" data-route="#/galaxy/${ob.id}" aria-label="${ob.name} (Classe 2 replié)">
      <span class="c2-id">${ob.id}</span>
      <span class="c2-lab">${ob.name}</span>
      <span class="c2-badge">${live?'ACTIVE':'en construction'}</span>
    </div>`;
  }).join('');
  return `<section id="open-floor-panel" data-branch="${id}" data-floor="${b?b.floor:''}">
    <div class="ofp-head"><h3>Branche ouverte — ${name}</h3>
      <p class="ofp-note">Objets Classe 2 peuplés ici · les quatre autres branches restent visibles en objets Classe 2 repliés · bandeau permanent des 5</p></div>
    <div class="bal-grid ofp-contents">${cells}</div>
    <div class="c2-rail" aria-label="Autres branches en objets Classe 2">${others}</div>
  </section>`;
}

function renderBalanceChart(activeCat){
  const cat=activeCat||window.__HUB_CAT||'finance';
  window.__HUB_CAT=cat;
  const rows=registryBalanceRows();
  const cats=[
    {id:'finance',name:'FINANCE',blurb:'Arbre à 5 branches — Asie-Pacifique, Moyen-Orient, Europe, Afrique, Amériques'},
    {id:'sports',name:'SPORTS PROFESSIONNELS',blurb:'Hockey (LNH) actif · soccer, football, football américain, basketball en construction'}
  ];
  const extras=rows.filter(r=>r.category!=='finance'&&r.category!=='sports');
  if(extras.length) cats.push({id:'Autres',name:'AUTRES',blurb:'Systèmes enregistrés hors Finance / Sports'});
  const doors=cats.map(c=>{
    const subset=rows.filter(r=>r.category===c.id);
    const nLive=subset.filter(r=>r.status==='live').length;
    const here=c.id===cat;
    return `<button type="button" class="hub-door ${here?'open':''}" data-hub-cat="${c.id}" data-id="HUBCAT-${c.id}" aria-pressed="${here?'true':'false'}" aria-label="${c.name}">
      <span class="door-name">${c.name}</span>
      <span class="door-meta">${nLive} ACTIVE · ${subset.length} systèmes</span>
      <span class="door-blurb">${c.blurb}</span>
    </button>`;
  }).join('');
  const shown=rows.filter(r=>r.category===cat);
  const openBranch=(cat==='finance' && window.__HUB_TREE)||null;
  const strip=cat==='finance'?renderSuperStrip(openBranch):'';
  const topNote=cat==='finance'
    ?(openBranch
      ?'Branche ouverte : contenu Classe 2 peuplé · autres branches = objets Classe 2 visibles (bandeau permanent des 5)'
      :'SOMMET — arbre-objet à cinq branches seulement (Asie-Pacifique, Moyen-Orient, Europe, Afrique, Amériques). Ouvrir une branche pour peupler.')
    :'ACTIVE = données réelles / live · en construction = sans données inventées';
  const body=cat==='finance'
    ?(openBranch
      ? renderOpenFloorPanel(openBranch)
      : `<div class="bal-grid super-top tree-top" id="bal-floors" data-cat="finance">${shown.map(r=>balanceCell(r,false)).join('')}</div>`)
    : `<div class="bal-grid" id="bal-floors" data-cat="${cat}">${shown.map(r=>balanceCell(r,false)).join('')}</div>`;
  return `<section id="balance-chart" aria-label="Tableau d'état des applications">
    <div class="bal-head"><h2 class="bal-title">Tableau d'état — applications</h2>
      <p class="bal-lead">Portes FINANCE et SPORTS PROFESSIONNELS · ${topNote}</p></div>
    <div class="hub-doors" id="hub-doors">${doors}</div>
    ${strip}
    ${body}
  </section>`;
}

/* Ghost ↔ HUB state (session memory) — no new hub UI */
const GHOST_HUB_KEY='um.ghost.hubState.v1';
const GHOST_HUB_VER=2;
function ghostHubEnsureNS(){
  if(!window.__GHOST) window.__GHOST={};
  if(!window.__GHOST.hub) window.__GHOST.hub={key:GHOST_HUB_KEY,version:GHOST_HUB_VER};
  return window.__GHOST.hub;
}
function ghostHubCoverageSnapshot(){
  try{ return planetaryCoverageRows().map(r=>({id:r.id,name:r.name,floor:r.floor,covered:!!r.covered,route:r.route})); }
  catch(e){ return []; }
}
function ghostHubCaptureState(reason){
  const route=typeof parseHash==='function'?parseHash():{mode:'home'};
  const openBranch=(route.mode==='galaxy'&&route.branch)?route.branch:((route.mode==='tree'&&route.branch)?route.branch:(window.__HUB_TREE||null));
  // Legacy floor route → map to branch if possible
  let branch=openBranch;
  if(!branch && route.mode==='floor'&&route.sys){
    const bb=treeBranchForFloor(route.sys); branch=bb?bb.id:null;
  }
  const folded=TREE_BRANCHES.filter(b=>b.id!==branch).map(b=>b.id);
  const state={
    v:GHOST_HUB_VER,
    savedAt:Date.now(),
    reason:reason||'change',
    openBranch:branch||null,
    openFloor:null, // deprecated — kept absent so old readers ignore
    treePath:branch?('tree/'+branch+(route.index?('/index/'+route.index):route.ex?('/ex/'+route.ex):'')):null,
    foldedAsClass2:folded,
    route:{mode:route.mode||'home', hash:location.hash||'#/', sys:route.sys||null, branch:branch||null, index:route.index||null, agg:route.agg||null, key:route.key||null, player:route.player||null, sport:route.sport||null},
    hubCat:window.__HUB_CAT||'finance',
    coverage:ghostHubCoverageSnapshot(),
    galaxyPath:(function(){
      if(route.mode==='fields'){
    bits.push(crumbLink('#/fields','Champs',route.fields==='root'));
    if(route.fields==='sports') bits.push(crumbLink('#/fields/sports','Sports professionnels',true));
    else if(route.fields==='finance') bits.push(crumbLink('#/fields/finance','Finance',true));
    else if(route.fields==='finance-na'){
      bits.push(crumbLink('#/fields/finance','Finance',false));
      bits.push(crumbLink('#/fields/finance/NA','Amérique du Nord',true));
    }
  } else if(route.mode==='galaxy'){
        if(route.galaxy==='planet') return 'galaxy/planet';
        if(route.branch) return 'galaxy/'+route.branch;
        if(route.galaxy) return 'galaxy/'+route.galaxy;
      }
      if(route.mode==='floor'&&route.sys) return 'floor/'+route.sys+(route.index?('/index/'+route.index):'');
      if(route.mode==='nhl') return 'sports/nhl';
      return null;
    })(),
    rightWindow:null // NEVER persist right window — always closed on restore
  };
  const ns=ghostHubEnsureNS();
  ns.last=state;
  try{ localStorage.setItem(GHOST_HUB_KEY, JSON.stringify(state)); }catch(e){ ns.saveError=String(e); }
  return state;
}
function ghostHubReadSaved(){
  try{
    const raw=localStorage.getItem(GHOST_HUB_KEY);
    if(!raw) return null;
    const st=JSON.parse(raw);
    if(!st||st.v!==GHOST_HUB_VER) return null;
    // Migrate / ignore old 8-floor ghost paths → clean top
    if(st.openBranch!=null && !treeBranchById(st.openBranch)) return null;
    if(st.openFloor!=null && !st.openBranch){
      // old format: try map floor→branch; if unmapped or obsolete multi-floor top → clean
      const bb=treeBranchForFloor(st.openFloor);
      if(!bb) return null;
      st.openBranch=bb.id;
    }
    if(st.route && st.route.mode && ['home','floor','tree','galaxy','sports','nhl','placeholder'].indexOf(st.route.mode)<0) return null;
    return st;
  }catch(e){ return null; }
}
function ghostHubRestoreOnOpen(){
  const ns=ghostHubEnsureNS();
  const st=ghostHubReadSaved();
  ns.restored=null;
  const liveCov=ghostHubCoverageSnapshot();
  if(st&&st.coverage){
    const prev=new Map(st.coverage.map(c=>[c.id,!!c.covered]));
    ns.coverageDelta=liveCov.filter(c=>prev.has(c.id)&&prev.get(c.id)!==c.covered).map(c=>({id:c.id,was:prev.get(c.id),now:c.covered}));
  } else ns.coverageDelta=[];
  // Right window NEVER restored — always start closed
  try{ if(typeof closeRightWindow==='function') closeRightWindow(); }catch(e){}
  window.__RW_FORCE_CLOSED=true;
  if(!st){ window.__HUB_TREE=null; window.__HUB_OPEN_FLOOR=null; window.__HUB_CAT='finance'; ns.restored='clean-top'; return null; }
  window.__HUB_CAT=st.hubCat||'finance';
  const branch=st.openBranch||null;
  // Prefer explicit galaxyPath when present (v20.11)
  if(st.galaxyPath && typeof st.galaxyPath==='string'){
    let hash='#/'+st.galaxyPath.replace(/^#?\/?/, '');
    if(st.galaxyPath.indexOf('galaxy/')===0 || st.galaxyPath.indexOf('floor/')===0 || st.galaxyPath.indexOf('sports/')===0){
      try{ history.replaceState(null,'',hash.startsWith('#')?hash:'#'+hash); }catch(e){ location.hash=hash; }
      if(st.galaxyPath.indexOf('galaxy/')===0){
        const bid=st.galaxyPath.split('/')[1];
        if(bid && treeBranchById(bid)){ window.__HUB_TREE=bid; window.__HUB_OPEN_FLOOR=treeBranchById(bid).floor||null; }
        else { window.__HUB_TREE=null; window.__HUB_OPEN_FLOOR=null; }
      }
      ns.restored='galaxyPath:'+st.galaxyPath;
    }
  } else if(branch && treeBranchById(branch)){
    window.__HUB_TREE=branch;
    const b=treeBranchById(branch);
    window.__HUB_OPEN_FLOOR=b.floor||null;
    let hash='#/galaxy/'+branch;
    if(st.treePath && st.treePath.indexOf('tree/'+branch)===0){
      const rest=st.treePath.slice(('tree/'+branch).length);
      if(rest.indexOf('/index/')===0||rest.indexOf('/ex/')===0){
        if(b.floor && b.floor!=='MEF') hash='#/floor/'+b.floor+rest;
        else hash='#/galaxy/'+branch;
      }
    } else if(st.route && st.route.mode==='floor' && st.route.sys){
      hash='#/floor/'+st.route.sys+(st.route.index?('/index/'+st.route.index):'');
    } else if(st.route && st.route.mode==='galaxy' && st.route.branch){
      hash='#/galaxy/'+st.route.branch;
    }
    try{ history.replaceState(null,'',hash); }catch(e){ location.hash=hash; }
    ns.restored='branch:'+branch;
  } else {
    window.__HUB_TREE=null;
    window.__HUB_OPEN_FLOOR=null;
    const h=location.hash||'';
    if(!h || h==='#' || h==='#/'){ try{ history.replaceState(null,'','#/'); }catch(e){ location.hash='#/'; } }
    ns.restored='super-top';
  }
  ns.last=Object.assign({}, st, {coverage:liveCov, rightWindow:null});
  return st;
}
function ghostHubBindLifecycle(){
  if(window.__GHOST_HUB_BOUND) return;
  window.__GHOST_HUB_BOUND=true;
  const save=()=>{ try{ ghostHubCaptureState('lifecycle'); }catch(e){} };
  addEventListener('pagehide', save);
  addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') save(); });
}

function ensureMainframeNav(){
  let nav=$('nav-mainframe');
  // v20.14 — do NOT duplicate HUB — point de chute (homebtn already present)
  if(nav){ nav.style.display='none'; }
  if(!nav){
    // keep a hidden stub for any legacy highlight code
    nav=document.createElement('button');
    nav.type='button';
    nav.id='nav-mainframe';
    nav.className='navapp';
    nav.style.display='none';
    nav.setAttribute('data-route','#/');
    nav.setAttribute('data-id','MAINFRAME');
    nav.textContent='HUB — point de chute';
    if($('ui')) $('ui').appendChild(nav);
  } else {
    nav.textContent='HUB — point de chute';
  }
  if($('homebtn')){
    $('homebtn').textContent='HUB — point de chute';
    $('homebtn').setAttribute('data-route','#/');
  }
  const sel=$('sys');
  if(sel && !sel.querySelector('option[value="__MAIN__"]')){
    const op=document.createElement('option');
    op.value='__MAIN__';
    op.textContent='HUB — point de chute';
    sel.insertBefore(op, sel.firstChild);
  } else if(sel){
    const op=sel.querySelector('option[value="__MAIN__"]');
    if(op) op.textContent='HUB — point de chute';
  }
}
function syncMainframeNavHighlight(route){
  const on=route&&route.mode==='home';
  const nav=$('nav-mainframe');
  if(nav){nav.setAttribute('aria-current',on?'true':'false');nav.classList.toggle('here',!!on);}
  if($('homebtn')){$('homebtn').setAttribute('aria-current',on?'true':'false');$('homebtn').classList.toggle('here',!!on);}
  const sel=$('sys');
  if(sel){
    if(on) sel.value='__MAIN__';
    else if(route&&route.mode==='floor'&&route.sys && [...sel.options].some(o=>o.value===route.sys)) sel.value=route.sys;
  }
  // Tree strip state (5 branches)
  if(route&&route.mode==='tree'&&route.branch){
    window.__HUB_TREE=route.branch;
    const bb=treeBranchById(route.branch);
    window.__HUB_OPEN_FLOOR=bb?bb.floor:null;
    window.__HUB_CAT='finance';
  } else if(route&&route.mode==='floor'&&route.sys){
    const bb=treeBranchForFloor(route.sys);
    window.__HUB_TREE=bb?bb.id:null;
    window.__HUB_OPEN_FLOOR=route.sys;
    window.__HUB_CAT='finance';
  } else if(on){
    if(!window.__HUB_KEEP_OPEN){ window.__HUB_TREE=null; window.__HUB_OPEN_FLOOR=null; }
  }
  syncPersistentStrip(route);
  try{ ghostHubCaptureState('route'); }catch(e){}
}
function syncPersistentStrip(route){
  let strip=$('super-strip-persist');
  let active=null;
  if(route&&route.mode==='galaxy'&&route.branch) active=route.branch;
  else if(route&&route.mode==='tree'&&route.branch) active=route.branch;
  else if(route&&route.mode==='floor'&&route.sys){ const bb=treeBranchForFloor(route.sys); active=bb?bb.id:null; }
  else if(window.__HUB_TREE) active=window.__HUB_TREE;
  const html=renderSuperStrip(active);
  if(!strip){
    strip=document.createElement('div');
    strip.id='super-strip-persist';
    document.body.appendChild(strip);
  }
  // Show persistent strip in floor mode (hub already embeds strip inside balance-chart)
  if(route&&(route.mode==='floor'||route.mode==='tree'||route.mode==='galaxy')){
    strip.style.display='block';
    strip.innerHTML=html;
    strip.className='persist-strip mode-floor-strip';
  } else if(route&&route.mode==='home'){
    // hub embeds strip inside balance-chart; hide duplicate persist
    strip.style.display='none';
    strip.innerHTML='';
  } else {
    strip.style.display='none';
    strip.innerHTML='';
  }
}

function seasonLab(s){return s==='20242025'?'2024-25':s==='20252026'?'2025-26':s;}
function latestTeam(p){return (p.ts&& (p.ts['20252026']||p.ts['20242025']))||'';}
function teamLabel(abbr){
  const n=NHL.teams[abbr];if(!n)return abbr;
  const a=n['20252026'],b=n['20242025'];
  if(a&&b&&a!==b)return a+' (2025-26) · '+b+' (2024-25)';
  return a||b||abbr;
}
function teamShort(abbr){const n=NHL.teams[abbr];return (n&&(n['20252026']||n['20242025']))||abbr;}

const REGISTRY=[
  {id:'AMF',kind:'class4-floor',name:'America Floor',status:'live',route:'#/floor/AMF',group:'floors',category:'finance',parent:null},
  {id:'EUF',kind:'class4-floor',name:'Europe Floor',status:'empty',route:'#/floor/EUF',group:'floors',category:'finance',parent:null},
  {id:'AFF',kind:'class4-floor',name:'Africa Floor',status:'empty',route:'#/floor/AFF',group:'floors',category:'finance',parent:null},
  {id:'ASF',kind:'class4-floor',name:'Asia Floor',status:'empty',route:'#/floor/ASF',group:'floors',category:'finance',parent:null},
  {id:'OCF',kind:'class4-floor',name:'Oceania Floor',status:'empty',route:'#/floor/OCF',group:'floors',category:'finance',parent:null},
  {id:'WF',kind:'class4-floor',name:'World Floor',status:'live',route:'#/floor/WF',group:'floors',category:'finance',parent:null},
  {id:'NSF',kind:'class4-floor',name:'North-South Floor',status:'live',route:'#/floor/NSF',group:'floors',category:'finance',parent:null},
  {id:'EWF',kind:'class4-floor',name:'East-West Floor',status:'live',route:'#/floor/EWF',group:'floors',category:'finance',parent:null},
  {id:'NDX',kind:'index',name:'Nasdaq-100',status:'live',route:'#/floor/AMF/index/NDX',group:'indices',category:'finance',parent:'AMF'},
  {id:'SPX',kind:'index',name:'S&P 500',status:'live',route:'#/floor/AMF/index/SPX',group:'indices',category:'finance',parent:'AMF'},
  {id:'SPORTS',kind:'window',name:'Sports professionnels',status:'live',route:'#/sports',group:'windows',category:'sports',parent:null},
  {id:'NHL',kind:'class4-system',name:'LNH',status:'live',route:'#/sports/nhl',group:'sports',category:'sports',parent:'SPORTS',
   hierarchy:{c1:'joueur',c2:['équipe','pays','position','année de repêchage','joueurs échangés'],c4:'système'}},
  {id:'football',kind:'placeholder',name:'Football',status:'empty',route:'#/sports/football',group:'sports',category:'sports',parent:'SPORTS'},
  {id:'american-football',kind:'placeholder',name:'Football américain',status:'empty',route:'#/sports/american-football',group:'sports',category:'sports',parent:'SPORTS'},
  {id:'soccer',kind:'placeholder',name:'Soccer',status:'empty',route:'#/sports/soccer',group:'sports',category:'sports',parent:'SPORTS'},
  {id:'basketball',kind:'placeholder',name:'Basketball',status:'empty',route:'#/sports/basketball',group:'sports',category:'sports',parent:'SPORTS'}
];
function registerSystem(entry){if(!entry.category)entry.category='Autres';REGISTRY.push(entry);if(document.body.classList.contains('mode-home'))renderMainframe();return entry;}
function findReg(id){return REGISTRY.find(x=>x.id===id);}

function parseHash(){
  const rawFull=decodeURIComponent((location.hash||'#/').replace(/^#/,''));
  const qi=rawFull.indexOf('?');
  const raw=qi>=0?rawFull.slice(0,qi):rawFull;
  const q=new URLSearchParams(qi>=0?rawFull.slice(qi+1):'');
  const gateMode=q.get('mode')==='fourier'?'fourier':'libre';
  const p=raw.split('/').filter(Boolean);
  if(p[0]==='world'){
    const r={mode:'world', gateMode};
    if(p.includes('t0t1')||p.includes('twopass')||p.includes('seances')||p.includes('deux-seances')) r.interpretation='twopass';
    else if(p.includes('year')||p.includes('annee')||p.includes('année')) r.interpretation='year';
    else r.interpretation='year';
    return r;
  }
  if(!p.length){
    const r={mode:'home', gateMode};
    const interp=(typeof window.FloorShortGhost==='object'&&window.FloorShortGhost.parseInterpretation)
      ? window.FloorShortGhost.parseInterpretation(p,q)
      : null;
    if(interp) r.interpretation=interp;
    return r;
  }
  if(p[0]==='fields'){
    const r={mode:'fields', fields:'root'};
    if(p[1]==='sports'){ r.fields='sports'; }
    else if(p[1]==='finance'){
      r.fields='finance';
      if(p[2]==='NA' || p[2]==='north-america'){ r.fields='finance-na'; }
      else if(p[2]==='AMER'){ r.fields='finance-na'; } // alias historique (Amérique du Nord) — ne pas casser
      else if(p[2]==='APAC'||p[2]==='ME'||p[2]==='EUR'||p[2]==='AFR'||p[2]==='LATAM'){ r.fields='finance-'+p[2]; r.branch=p[2]; }
    }
    return r;
  }
  if(p[0]==='galaxy'){
    if(!p[1] || p[1]==='planet') return {mode:'galaxy', galaxy:'planet', branch:null};
    if(p[1]==='sports') return {mode:'galaxy', galaxy:'sports'};
    if(p[1]==='nhl') return {mode:'galaxy', galaxy:'nhl'};
    const b=treeBranchById(p[1]);
    if(b){
      const r={mode:'galaxy', galaxy:'branch', branch:p[1], sys:b.floor||null, name:b.name};
      if(p[2]==='index'&&p[3]) r.worldSub={kind:'index', id:p[3]};
      if(p[2]==='ex'&&p[3]) r.worldSub={kind:'ex', id:p[3]};
      const interp=(typeof window.FloorShortGhost==='object'&&window.FloorShortGhost.parseInterpretation)
        ? window.FloorShortGhost.parseInterpretation(p,q)
        : ((p.includes('year')||p.includes('annee')||p.includes('année'))?'year':((p.includes('t0t1')||p.includes('twopass'))?'twopass':null));
      if(interp) r.interpretation=interp;
      return r;
    }
    return {mode:'galaxy', galaxy:'planet'};
  }
  if(p[0]==='sources') return {mode:'sources'};
  if(p[0]==='tree'&&p[1]){
    // legacy alias → galaxy branch
    const b=treeBranchById(p[1]);
    return {mode:'galaxy', galaxy:'branch', branch:p[1], sys:b?b.floor:null, name:b?b.name:p[1]};
  }
  if(p[0]==='floor'&&p[1]){
    const r={mode:'floor',sys:p[1],ds:'ALL'};
    for(let i=2;i<p.length;i++){
      if(p[i]==='index'&&p[i+1]){r.index=p[++i];r.ds=r.index;r.lvl='x';}
      else if(p[i]==='ex'&&p[i+1]){r.ex=p[++i];r.lvl='f';}
      else if(p[i]==='ds'&&p[i+1]){r.ds=p[++i];}
      else if(p[i]==='year'||p[i]==='annee'||p[i]==='année') r.interpretation='year';
      else if(p[i]==='t0t1'||p[i]==='twopass'||p[i]==='seances'||p[i]==='deux-seances') r.interpretation='twopass';
    }
    const interp=(typeof window.FloorShortGhost==='object'&&window.FloorShortGhost.parseInterpretation)
      ? window.FloorShortGhost.parseInterpretation(p,q)
      : null;
    if(interp) r.interpretation=interp;
    return r;
  }
  if(p[0]==='sports'){
    if(!p[1]) return {mode:'sports'};
    if(p[1]==='nhl'){
      const r={mode:'nhl'};let i=2;
      if(p[i]==='list'){ r.list=true; i++; }
      if(p[i]==='agg'&&p[i+1]&&p[i+2]!==undefined){r.agg=p[i+1];r.key=p[i+2];i+=3;}
      if(p[i]==='player'&&p[i+1]) r.player=p[i+1];
      if(p[2]==='conf'&&p[3]){ r.nhlLevel='conf'; r.nhlConf=String(p[3]).toLowerCase(); }
      else if(p[2]==='div'&&p[3]){ r.nhlLevel='div'; r.nhlDiv=String(p[3]).toLowerCase(); }
      else if(p[2]==='team'&&p[3]){ r.nhlLevel='team'; r.nhlTeam=String(p[3]).toUpperCase(); }
      else if(!r.list && !r.agg && !r.player){ r.nhlLevel='league'; }
      return r;
    }
    return {mode:'placeholder',sport:p[1]};
  }
  return {mode:'home'};
}
function go(hash){
  const h=hash.startsWith('#')?hash:'#'+hash;
  if((location.hash||'#')===h || (location.hash||'')===h.replace(/^#/,'#')) {applyRoute();return;}
  location.hash=h;
}
function crumbLink(href,label,here){
  return here?`<span class="here">${label}</span>`:`<a href="${href}" data-route="${href}">${label}</a>`;
}
function renderCrumb(route){
  const bits=[crumbLink(DEFAULT_FLOOR,'HUB — point de chute',(location.hash||'')===DEFAULT_FLOOR)];
  if(route.mode==='galaxy'){
    bits.push(crumbLink('#/galaxy/planet','Galaxie planétaire',route.galaxy==='planet'));
    if(route.galaxy==='sports') bits.push(crumbLink('#/galaxy/sports','Sports',true));
    else if(route.galaxy==='nhl'){ bits.push(crumbLink('#/galaxy/sports','Sports',false)); bits.push(crumbLink('#/sports/nhl','LNH',true)); }
    else if(route.branch){ const b=treeBranchById(route.branch); bits.push(crumbLink('#/galaxy/'+route.branch,(b&&b.name)||route.branch,true)); }
  } else if(route.mode==='tree'){
    const b=treeBranchById(route.branch);
    bits.push(crumbLink('#/galaxy/'+route.branch,(b&&b.name)||route.branch,true));
  } else if(route.mode==='floor' && route.sys==='WF' && !route.index && !route.ex){
    bits.push(crumbLink('#/floor/WF','Étage international · manifestation',true));
  } else if(route.mode==='floor'){
    const bb=treeBranchForFloor(route.sys);
    if(bb) bits.push(crumbLink('#/galaxy/'+bb.id,bb.name,false));
    const L=LIB4.find(x=>x.id===route.sys);
    bits.push(crumbLink('#/floor/'+route.sys,(L&&L.name)||route.sys,!route.index&&!route.ex));
    if(route.index) bits.push(crumbLink('#/floor/'+route.sys+'/index/'+route.index,(INDEX_GROUP_NAME[route.index]||(route.index==='NDX'?'Nasdaq-100':'S&P 500')),true));
    if(route.ex){const f=FLOORS[route.ex];bits.push(crumbLink('#/floor/'+route.sys+'/ex/'+route.ex,(f?f.n+' ('+route.ex+')':route.ex),true));}
  } else if(route.mode==='sports'){
    bits.push(crumbLink('#/sports','Sports professionnels',true));
  } else if(route.mode==='nhl'){
    bits.push(crumbLink('#/sports','Sports professionnels',false));
    bits.push(crumbLink('#/sports/nhl','LNH',!route.agg&&!route.player));
    if(route.agg) bits.push(crumbLink('#/sports/nhl/agg/'+route.agg+'/'+encodeURIComponent(route.key),aggTitle(route.agg,route.key),!route.player));
    if(route.player){const pl=NHL.players.find(p=>p.id===route.player);bits.push(crumbLink(location.hash,pl?pl.n:route.player,true));}
  } else if(route.mode==='placeholder'){
    bits.push(crumbLink('#/sports','Sports professionnels',false));
    const sp=SPORT_PH.find(x=>x.id===route.sport)||findReg(route.sport);
    bits.push(crumbLink('#/sports/'+route.sport,(sp&&sp.name)||route.sport,true));
  }
  const html=bits.join('<span class="sep">›</span>');
  const el=$('crumb'); if(el) el.innerHTML=html;
  document.querySelectorAll('.overlay .crumb-slot').forEach(n=>n.innerHTML=html);
}

function tileHTML(id,name,sum,status,route){
  return `<button type="button" class="tile ${status}" data-id="${id}" data-route="${route}">
    <span class="k">${name}</span>
    <span class="s">${sum}</span>
    <span class="badge">${status==='live'?'accessible':'en construction'}</span>
  </button>`;
}
function renderMainframe(){
  if(typeof window.renderDomainMap==='function'){
    window.renderDomainMap();
    return;
  }
  // Opening = balance chart tree (5 branches only). Floors LIB4 kept as data structure, not shown as opening tiles.
  const shown=new Set(['AMF','EUF','AFF','ASF','OCF','WF','NSF','EWF','NDX','SPX','SPORTS','NHL','APAC','ME','EUR','AFR','AMER']);
  const extra=REGISTRY.filter(x=>!shown.has(x.id) && !SPORT_PH.some(s=>s.id===x.id) && FLOOR_IDS.indexOf(x.id)<0);
  const extraBlock=extra.length?('<h2>Autres systèmes du registre</h2><div class="tiles" id="mf-extra">'+extra.map(x=>tileHTML(x.id,x.name,x.blurb||(x.status==='empty'?EC:'Système enregistré'),x.status||'empty',x.route||('#/'+x.id))).join('')+'</div>'):'';
  $('mf').innerHTML=`<div class="ovtop"><div>
      <h1>HUB — point de chute Universal Metaphor <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Point de chute de tout le développement Universal Metaphor. Arbre-objet à cinq branches · portes FINANCE / SPORTS · galaxies · couverture et coupes. <a class="src-jump" href="#/sources" data-route="#/sources">Sources et liens de données</a>.</p>
      <p class="t01-banner" id="t01-banner"><strong>${(window.UM_MARKET_FRAMES&&UM_MARKET_FRAMES.label)||'T0/T1 proposés'}</strong> — T0 = ${(UM_MARKET_FRAMES&&UM_MARKET_FRAMES.T0)||'2026-01-02'} · T1 = ${(UM_MARKET_FRAMES&&UM_MARKET_FRAMES.T1)||'2026-11-04'}</p>
    </div></div>
    <!-- v20.13: single portal CTA is #um-galaxy-hero-static → #/fields (no duplicate button here) -->
    <p class="fields-hint muted">Le bouton doré en haut ouvre la structure des champs (Finance · Sports professionnels).</p>
    ${renderBalanceChart(window.__HUB_CAT||'finance')}
    ${renderPlanetaryCoverage()}
    <h2>Sports professionnels</h2>
    <div class="tiles" id="mf-sports">
      ${tileHTML('SPORTS','Sports professionnels','Hockey (LNH) en service ; football, football américain, soccer et basketball en construction','live','#/sports')}
      ${tileHTML('NHL','LNH — système de Classe 4',NHL.players.length+' joueurs (Classe 1) · équipes, pays, positions et années de repêchage (Classe 2)','live','#/sports/nhl')}
    </div>
    ${extraBlock}`;
}

function renderSports(){
  $('spwin').innerHTML=`<div class="ovtop"><div>
      <h1>Sports professionnels <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Le hockey (LNH) est le premier système en service. Les autres sports sont des emplacements visibles, sans aucune donnée inventée. Chaque sport = silo d'analyse isolé (um.analysis.sports.&lt;sport&gt;.*) — jamais mélangé à la finance ni entre sports.</p>
      <p class="galaxy-actions"><button type="button" data-route="#/galaxy/sports" id="sports-to-galaxies">Ouvrir les galaxies Sports</button></p>
    </div></div>
    <div class="tiles" id="sp-tiles">
      ${tileHTML('NHL','Hockey — LNH','Système de Classe 4 en service · '+NHL.players.length+' joueurs · saisons 2024-25 et 2025-26 · source API NHL','live','#/sports/nhl')}
      ${SPORT_PH.map(s=>tileHTML(s.id,s.name,EC,'empty','#/sports/'+s.id)).join('')}
    </div>`;
}
function renderPlaceholder(sport){
  // Isolated silo per sport — no shared analysis with NHL or finance
  try{ if(!analysisSportLoad(sport)) analysisSportSave(sport,{tab:null,silo:sport,status:'empty'}); }catch(e){}

  const sp=SPORT_PH.find(x=>x.id===sport)||findReg(sport)||{id:sport,name:sport};
  $('phwin').innerHTML=`<div class="ovtop"><div>
      <h1>${sp.name} <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead" data-status="empty">${EC}</p>
      <p>Conteneur visible dans la fenêtre des sports professionnels et dans le registre. Aucune donnée n’a été inventée pour le remplir.</p>
      <p><button type="button" data-route="#/sports">Retour aux sports professionnels</button>
         <button type="button" data-route="#/">Retour à la fenêtre principale</button></p>
    </div></div>`;
}

function aggTitle(agg,key){
  if(agg==='team') return key==='MULTI'?'Plusieurs clubs [INCOMPLET]':(teamShort(key)+' ('+key+')');
  if(agg==='nat') return 'Nationalité '+key;
  if(agg==='pos') return POS_FR[key]||key;
  if(agg==='draft') return key==='UNDRAFTED'?'Non repêché':('Repêchage '+key);
  if(agg==='players') return 'Tous les joueurs';
  return key;
}
function nhlMembers(agg,key){
  return NHL.players.filter(p=>{
    if(agg==='players') return true;
    if(agg==='team'){const t=latestTeam(p);return key==='MULTI'?t.includes(','):t===key;}
    if(agg==='nat') return p.nat===key;
    if(agg==='pos') return p.pos===key;
    if(agg==='draft') return key==='UNDRAFTED'?!p.dy:String(p.dy)===String(key);
    return false;
  }).slice().sort((a,b)=>a.n<b.n?-1:1);
}
function fmt(v,kind){
  if(v==null||v==='') return '—';
  if(kind==='pct') return (Math.abs(v)<=1?(v*100):v).toFixed(1)+' %';
  if(kind==='gaa') return Number(v).toFixed(2);
  if(kind==='svp') return Number(v).toFixed(3);
  if(kind==='toi'){const s=Number(v);if(!isFinite(s)) return String(v);const m=Math.floor(s/60),r=Math.round(s%60);return m+':' + String(r).padStart(2,'0');}
  return String(v);
}
function playerById(id){return NHL.players.find(p=>p.id===id);}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function initialsOf(p){
  if(p.ini) return p.ini;
  const parts=(p.n||'').replace(/-/g,' ').split(/\s+/).filter(Boolean);
  if(!parts.length) return '?';
  if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}
function posLabel(code){return POS_FR[code]||code;}
function photoBlock(p){
  const name=esc(p.n);
  return `<div class="photo-wrap" data-player-photo="${p.id}">
    <div class="photo-ph" aria-hidden="true"><span class="pname">${name}</span><span class="soon">photo à venir</span></div>
    <img class="photo-file" src="photos/${p.id}.png" alt="Visuel provisoire : ${name} (photo à venir)" onload="this.classList.add('ok')" onerror="this.remove()">
  </div>`;
}
function markImg(src, fallback){
  if(!src) return fallback||'';
  return `<img class="aggmark" src="${src}" alt="" onload="this.classList.add('ok')" onerror="this.remove()">${fallback||''}`;
}
function logoPath(abbr){return abbr&&abbr!=='MULTI'&&!String(abbr).includes(',')?('logos/'+abbr+'.svg'):'';}
function flagPath(code){return code?('drapeaux/'+code+'.png'):'';}
function clubLogoHTML(abbr, extraClass){
  if(!abbr||abbr==='MULTI'||String(abbr).includes(',')) return '';
  const name=teamShort(abbr);
  const href=`#/sports/nhl/agg/team/${encodeURIComponent(abbr)}`;
  const cls=extraClass?('club-thumb '+extraClass):'club-thumb';
  return `<a class="${cls}" role="link" href="${href}" data-route="${href}" data-logo-abbr="${esc(abbr)}" aria-label="Ouvrir l'objet ${esc(name)} (${esc(abbr)})"><img class="club-logo" alt="" src="logos/${esc(abbr)}.svg" data-abbr="${esc(abbr)}" onload="this.classList.add('ok');this.dataset.logoStatus='ok'" onerror="window.__logoFallback&&window.__logoFallback(this)"><span class="club-logo-text" hidden>${esc(abbr)}</span></a>`;
}
function playerHref(p,agg,key){
  if(agg&&key) return `#/sports/nhl/agg/${agg}/${encodeURIComponent(key)}/player/${p.id}`;
  return `#/sports/nhl/player/${p.id}`;
}
function playerThumb(p,agg,key,selId){
  const href=playerHref(p,agg,key);
  const name=esc(p.n);
  return `<a class="pthumb" role="link" href="${href}" data-route="${href}" data-player="${p.id}" aria-label="Ouvrir la fiche de ${name}" aria-current="${p.id===selId?'true':'false'}"><span class="pthumb-slot"><span class="pthumb-ph">${name}</span><img src="photos/${p.id}.png" alt="" onload="this.classList.add('ok')" onerror="this.remove()"></span></a>`;
}
window.__logoFallback=function(img){
  const abbr=img.getAttribute('data-abbr')||'';
  const fb=(typeof NHL!=='undefined'&&NHL.logoData&&NHL.logoData[abbr])||'';
  if(fb&&img.dataset.tried!=='1'){img.dataset.tried='1';img.src=fb;return;}
  img.dataset.logoStatus='fallback';
  img.style.display='none';
  const t=img.parentElement&&img.parentElement.querySelector('.club-logo-text');
  if(t) t.hidden=false;
};
function linkClub(abbr){
  if(!abbr) return '—';
  if(String(abbr).includes(',')) return `<a class="c2link" href="#/sports/nhl/agg/team/MULTI" data-route="#/sports/nhl/agg/team/MULTI">${esc(abbr)}</a> <span class="incomp">[INCOMPLET : ventilation par club non faite]</span>`;
  return `${clubLogoHTML(abbr,'inline')}<a class="c2link" href="#/sports/nhl/agg/team/${encodeURIComponent(abbr)}" data-route="#/sports/nhl/agg/team/${encodeURIComponent(abbr)}">${esc(teamShort(abbr))} (${esc(abbr)})</a>`;
}
function linkNat(code){
  if(!code) return '—';
  return `<a class="c2link" href="#/sports/nhl/agg/nat/${encodeURIComponent(code)}" data-route="#/sports/nhl/agg/nat/${encodeURIComponent(code)}">${esc(code)}</a>`;
}
function linkPos(code){
  if(!code) return '—';
  return `<a class="c2link" href="#/sports/nhl/agg/pos/${encodeURIComponent(code)}" data-route="#/sports/nhl/agg/pos/${encodeURIComponent(code)}">${esc(posLabel(code))}</a>`;
}
function linkDraft(p){
  const key=p.dy?String(p.dy):'UNDRAFTED';
  const lab=p.dy?(p.dy+' · ronde '+(p.dr??'—')+' · total '+(p.dov??'—')):'Non repêché';
  return `<a class="c2link" href="#/sports/nhl/agg/draft/${encodeURIComponent(key)}" data-route="#/sports/nhl/agg/draft/${encodeURIComponent(key)}">${esc(lab)}</a>`;
}
function playerIsTraded(p){
  return (NHL.tradedRows||[]).some(r=>r.id===p.id)||Object.values(p.ts||{}).some(t=>String(t).includes(','));
}
function linkTraded(p){
  if(!playerIsTraded(p)) return '— (une seule équipe par saison connue)';
  return `<a class="c2link" id="link-traded" href="#/sports/nhl/agg/team/MULTI" data-route="#/sports/nhl/agg/team/MULTI">Joueurs échangés — plusieurs clubs</a> <span class="incomp">[INCOMPLET : ventilation par club non faite]</span>`;
}

function renderPlayerCard(p){
  if(!p) return `<p>Joueur introuvable.</p>`;
  const seasons=Object.keys(p.st).sort();
  const last=latestTeam(p);
  const teamBits=seasons.map(s=>{
    const t=p.ts[s];
    if(!t) return seasonLab(s)+' : —';
    if(t.includes(',')) return seasonLab(s)+' : '+linkClub(t);
    const nm=NHL.teams[t]?(NHL.teams[t][s]||teamShort(t)):'';
    return seasonLab(s)+' : '+clubLogoHTML(t,'inline')+`<a class="c2link" href="#/sports/nhl/agg/team/${encodeURIComponent(t)}" data-route="#/sports/nhl/agg/team/${encodeURIComponent(t)}">${esc(t)}${nm?' — '+esc(nm):''}</a>`;
  }).join('<br>');
  const isG=p.pos==='G';
  const rows=seasons.map(s=>{
    const st=p.st[s];
    if(isG) return `<tr><td>${seasonLab(s)}</td><td>${fmt(st.gp)}</td><td>${fmt(st.gs)}</td><td>${fmt(st.w)}</td><td>${fmt(st.l)}</td><td>${fmt(st.ot)}</td><td>${fmt(st.gaa,'gaa')}</td><td>${fmt(st.svp,'svp')}</td><td>${fmt(st.so)}</td><td>${fmt(st.toi,'toi')}</td></tr>`;
    return `<tr><td>${seasonLab(s)}</td><td>${fmt(st.gp)}</td><td>${fmt(st.g)}</td><td>${fmt(st.a)}</td><td>${fmt(st.p)}</td><td>${fmt(st.pm)}</td><td>${fmt(st.pim)}</td><td>${fmt(st.sog)}</td><td>${fmt(st.ppg)}</td><td>${fmt(st.ppp)}</td></tr>`;
  }).join('');
  const thead=isG
    ? '<tr><th>Saison</th><th>PJ</th><th>Dém.</th><th>V</th><th>D</th><th>DP</th><th>Moy.</th><th>% arrêts</th><th>Bl</th><th>TOI</th></tr>'
    : '<tr><th>Saison</th><th>PJ</th><th>B</th><th>A</th><th>Pts</th><th>+/−</th><th>PUN</th><th>Tirs</th><th>BAN</th><th>Pts AN</th></tr>';
  const card=(window.NHL_CARDS&&NHL_CARDS.cards||[]).find(c=>String(c.id)===String(p.id));
  const desc=(card&&card.description)||p.d||'[INCOMPLET] description';
  window.__NHL_CARD={id:p.id,name:p.n,team:last,position:p.pos,positionLabel:posLabel(p.pos),nationality:p.nat,seasons,stats:p.st,photo:'photos/'+p.id+'.png',photoStatus:'placeholder',photoName:p.n,description:desc,ageStatus:'INCOMPLET',traded:playerIsTraded(p)};
  return `<div id="nhlcard" data-player="${p.id}">
    ${photoBlock(p)}
    <h3>${esc(p.n)}</h3>
    ${desc?`<p class="desc" id="nhldesc">${esc(desc)}</p>`:''}
    <p class="src">${esc(p.src||'Source : api.nhle.com/stats/rest/en · extraction 9 nov 2026')}</p>
    <dl>
      <dt>Classe</dt><dd>1 — point de donnée</dd>
      <dt>Équipe</dt><dd>${teamBits}</dd>
      <dt>Position</dt><dd>${linkPos(p.pos)}<span class="soon-note">Un symbole pourra venir plus tard.</span></dd>
      <dt>Nationalité</dt><dd>${linkNat(p.nat)}</dd>
      <dt>Naissance</dt><dd>${p.bd||'—'} · ${[p.city,p.br,p.bc].filter(Boolean).join(', ')||'—'}</dd>
      <dt>Taille / poids</dt><dd>${p.hin?p.hin+' po ('+p.hcm+' cm)': '—'} · ${p.wlb?p.wlb+' lb ('+p.wkg+' kg)':'—'}</dd>
      <dt>Repêchage</dt><dd>${linkDraft(p)}</dd>
      <dt>Groupe échangés</dt><dd>${linkTraded(p)}</dd>
      <dt>Âge</dt><dd class="incomp">[INCOMPLET] — date de référence du calcul d’âge à fixer.</dd>
    </dl>
    <table><thead>${thead}</thead><tbody>${rows}</tbody></table>
  </div>`;
}
function renderAggList(agg){
  let keys=[];
  if(agg==='team'){keys=Object.keys(NHL.teams).sort((a,b)=>teamShort(a).localeCompare(teamShort(b),'fr'));keys.push('MULTI');}
  else if(agg==='nat'){const s=new Set(NHL.players.map(p=>p.nat));keys=[...s].sort();}
  else if(agg==='pos') keys=['C','L','R','D','G'];
  else if(agg==='draft'){const s=new Set(NHL.players.map(p=>p.dy).filter(Boolean));keys=[...s].sort();keys.push('UNDRAFTED');}
  return keys.map(k=>{
    let n=nhlMembers(agg,k).length;
    const extra=(k==='MULTI'||k==='UNDRAFTED')?'incomp':'';
    let nLab=n+' joueur'+(n>1?'s':'')+' (Classe 1)';
    let mark='';
    if(agg==='team'&&k==='MULTI'){n=(NHL.tradedRows||[]).length;nLab=n+' lignes joueur-saison [INCOMPLET]';}
    if(agg==='team'&&k!=='MULTI') mark=clubLogoHTML(k);
    if(agg==='nat') mark=markImg(flagPath(k));
    const href=`#/sports/nhl/agg/${agg}/${encodeURIComponent(k)}`;
    if(agg==='team'&&k!=='MULTI'){
      return `<div class="agg ${extra}" data-agg="${agg}" data-key="${k}">${mark}<a class="agg-body" href="${href}" data-route="${href}"><span class="k">${aggTitle(agg,k)}</span><span class="s">${nLab}</span></a></div>`;
    }
    return `<a class="agg ${extra}" data-agg="${agg}" data-key="${k}" href="${href}" data-route="${href}" role="link">
      ${mark}<span class="k">${aggTitle(agg,k)}</span>
      <span class="s">${nLab}</span>
    </a>`;
  }).join('');
}
function lastSeasonStats(p){const s=p.st['20252026']? '20252026':'20242025';return {s,st:p.st[s]};}
function renderTradedMembers(selId){
  const rows=(NHL.tradedRows||[]).slice().sort((a,b)=> (a.n+a.season)<(b.n+b.season)?-1:1);
  const uniq=new Set(rows.map(r=>r.id)).size;
  const tr=rows.map(r=>{
    const p=playerById(r.id)||{id:r.id,n:r.n};
    const href=`#/sports/nhl/agg/team/MULTI/player/${r.id}`;
    return `<tr data-id="${r.id}" aria-current="${r.id===selId?'true':'false'}" data-route="${href}">
      <td>${playerThumb(p,'team','MULTI',selId)}<a class="pname" href="${href}" data-route="${href}">${esc(r.n)}</a></td>
      <td>${seasonLab(r.season)}</td><td>${linkClub(r.team)}</td><td>${linkPos(r.pos)}</td><td>${linkNat(r.nat)}</td></tr>`;
  }).join('');
  const head=`<h3>Joueurs échangés — plusieurs clubs [INCOMPLET]</h3>
    <p class="lead">${rows.length} lignes joueur-saison (${uniq} joueurs distincts) dont le champ équipe contient plusieurs sigles. La ventilation par club n’est pas faite. Un même joueur peut apparaître deux fois s’il a été échangé les deux saisons. Cliquez un nom pour ouvrir sa fiche (Classe 1) à l’intérieur de l’objet.</p>`;
  return `<p><button type="button" id="nhlback" data-route="#/sports/nhl">← Retour aux regroupements</button></p>${head}
    <input class="filter" id="nhlfilter" placeholder="Filtrer les joueurs…">
    <div id="nhlmembers"><table><thead><tr><th>Nom</th><th>Saison</th><th>Équipe (brut)</th><th>Pos.</th><th>Nat.</th></tr></thead>
    <tbody id="nhltbody">${tr}</tbody></table></div>`;
}
function renderAllPlayers(selId){
  const mem=nhlMembers('players','ALL');
  const items=mem.map(p=>`<div class="pdir-item" data-id="${p.id}" aria-current="${p.id===selId?'true':'false'}">${playerThumb(p,'players','ALL',selId)}<a class="pname" href="#/sports/nhl/agg/players/ALL/player/${p.id}" data-route="#/sports/nhl/agg/players/ALL/player/${p.id}">${esc(p.n)}</a><span class="s">${esc(posLabel(p.pos))}</span></div>`).join('');
  return `<p><button type="button" id="nhlback" data-route="#/sports/nhl">← Retour aux regroupements</button></p>
    <h3>Tous les joueurs</h3>
    <p class="lead">${mem.length} joueurs (Classe 1). Chaque vignette — le nom complet tant que la photo réelle n’est pas là — ouvre la fiche du joueur. Filtrez par nom.</p>
    <input class="filter" id="nhlfilter" placeholder="Rechercher un joueur…">
    <div id="nhlplayerdir" class="pthumb-grid">${items}</div>`;
}
function renderMembers(agg,key,selId){
  if(agg==='team'&&key==='MULTI') return renderTradedMembers(selId);
  if(agg==='players') return renderAllPlayers(selId);
  const mem=nhlMembers(agg,key);
  const rows=mem.map(p=>{
    const {s,st}=lastSeasonStats(p);
    const pts=p.pos==='G'? (st.w!=null? (st.w+' V'):'—') : (st.p!=null?st.p:'—');
    const href=`#/sports/nhl/agg/${agg}/${encodeURIComponent(key)}/player/${p.id}`;
    return `<tr data-id="${p.id}" aria-current="${p.id===selId?'true':'false'}" data-route="${href}">
      <td>${playerThumb(p,agg,key,selId)}<a class="pname" href="${href}" data-route="${href}">${esc(p.n)}</a></td><td>${linkClub(latestTeam(p))}</td><td>${linkPos(p.pos)}</td><td>${linkNat(p.nat)}</td><td>${seasonLab(s)} · ${pts}</td></tr>`;
  }).join('');
  const mk=(agg==='team'&&key!=='MULTI')?clubLogoHTML(key):(agg==='nat'?markImg(flagPath(key)):'');
  let head=`<h3>${mk} ${aggTitle(agg,key)}</h3><p class="lead">${mem.length} joueurs (Classe 1) dans cet objet de Classe 2.`;
  if(agg==='pos') head+=` Les positions sont nommées en toutes lettres (Center, Left Wing, Right Wing, Defense, Goalie). Un symbole pourra venir plus tard.`;
  if(agg==='team'&&key==='MULTI') head+=` Le champ équipe de l’API contient plusieurs sigles ; la ventilation par club n’est pas faite.`;
  if(agg==='team'&&key!=='MULTI'&&NHL.teamStats[key]){
    const ts=NHL.teamStats[key];
    head+=`</p><table><thead><tr><th>Saison</th><th>Nom officiel</th><th>PJ</th><th>V</th><th>D</th><th>DP</th><th>Pts</th><th>BP</th><th>BC</th></tr></thead><tbody>`;
    head+=Object.keys(ts).sort().map(s=>{const t=ts[s];return `<tr><td>${seasonLab(s)}</td><td>${t.name}</td><td>${fmt(t.gp)}</td><td>${fmt(t.w)}</td><td>${fmt(t.l)}</td><td>${fmt(t.ot)}</td><td>${fmt(t.pts)}</td><td>${fmt(t.gf)}</td><td>${fmt(t.ga)}</td></tr>`;}).join('');
    head+=`</tbody></table><p class="lead">`;
  }
  head+=` Cliquez un joueur pour ouvrir sa fiche à l’intérieur de l’objet.</p>`;
  return `<p><button type="button" id="nhlback" data-route="#/sports/nhl">← Retour aux regroupements</button></p>${head}
    <input class="filter" id="nhlfilter" placeholder="Filtrer les joueurs…">
    <div id="nhlmembers"><table><thead><tr><th>Nom</th><th>Équipe</th><th>Pos.</th><th>Nat.</th><th>Saison récente</th></tr></thead>
    <tbody id="nhltbody">${rows}</tbody></table></div>`;
}
function renderNHL(route){
  const prev=window.__NHL_STATE||{};
  const sameList=!!(route.agg&&route.key&&prev.agg===route.agg&&prev.key===route.key&&$('nhlright')&&$('nhlleft')&&$('nhlsplit'));
  if(sameList){
    const plInc=route.player?playerById(route.player):null;
    $('nhlright').innerHTML=plInc?renderPlayerCard(plInc):'<p class="lead">Cliquez la vignette d’un joueur pour ouvrir sa fiche à l’intérieur de l’objet : visuel, nom, position, club (logo), nationalité, repêchage, statistiques et liens de Classe 2.</p>';
    document.querySelectorAll('#nhlleft [aria-current="true"]').forEach(el=>el.setAttribute('aria-current','false'));
    if(route.player){
      document.querySelectorAll('#nhlleft [data-player="'+route.player+'"], #nhlleft [data-id="'+route.player+'"]').forEach(el=>el.setAttribute('aria-current','true'));
    }
    window.__NHL_STATE={agg:route.agg,key:route.key,player:route.player||null,nPlayers:NHL.players.length,nTeams:Object.keys(NHL.teams).length,card:window.__NHL_CARD||null};
    return;
  }
  const agg=route.agg||'team';
  const tabs=['team','nat','pos','draft'].map(k=>{
    const lab={team:'Équipes',nat:'Pays / nationalités',pos:'Positions',draft:'Années de repêchage'}[k];
    return `<button type="button" data-agg-tab="${k}" data-route="#/sports/nhl" aria-selected="${k===agg&&!route.player? 'false': (k===agg?'true':'false')}" ${k===agg?'aria-current="true"':''}>${lab}</button>`;
  }).join('');
  // tabs should switch aggregate type at nhl root or keep us at grid of that type
  const tabBar=`<div class="tabs" id="nhltabs">
    <button type="button" data-route="#/sports/nhl" data-agg-tab="team" aria-selected="${agg==='team'&&!route.key?'true':(agg==='team'?'true':'false')}">Équipes</button>
    <button type="button" data-route="#/sports/nhl/agg/nat/_list" data-agg-tab="nat" aria-selected="${agg==='nat'&&!route.key?'true':(agg==='nat'?'true':'false')}">Pays / nationalités</button>
    <button type="button" data-route="#/sports/nhl/agg/pos/_list" data-agg-tab="pos" aria-selected="${agg==='pos'&&!route.key?'true':(agg==='pos'?'true':'false')}">Positions</button>
    <button type="button" data-route="#/sports/nhl/agg/draft/_list" data-agg-tab="draft" aria-selected="${agg==='draft'&&!route.key?'true':(agg==='draft'?'true':'false')}">Années de repêchage</button>
  </div>`;
  // Simpler tabs: clicking a tab goes to #/sports/nhl?agg= or we use a dedicated list hash.
  // I'll use #/sports/nhl for teams grid, and store current tab in route.agg when no key? 
  // Cleaner: #/sports/nhl, #/sports/nhl/view/nat, #/sports/nhl/view/pos, #/sports/nhl/view/draft
  // To avoid changing parser mid-way, treat missing key as grid of that type:
  // #/sports/nhl → team grid
  // I'll render team grid at root, and other grids when agg is set without intending a specific member...
  // Problem: parseHash requires key after agg. I'll use key='*' for grid... ugly.
  // Better approach: tabs call go with hash #/sports/nhl and set a variable NHL_TAB.
  // For deep links of other tabs, use #/sports/nhl/agg/nat/.  (empty key)
  // Update parser: if p[i]==='agg' && p[i+1] && (p[i+2]===undefined or p[i+2]==='player') → grid of that type? 
  // Current parser requires p[i+2]. I'll use the key '_' to mean "list".
  // Tabs: #/sports/nhl (teams), and for others I'll just use NHL_TAB state + hash #/sports/nhl when teams.
  // For Playwright, team grid at #/sports/nhl is enough; other tabs can set location to #/sports/nhl and NHL_TAB.
let showGrid=!route.key;
  // If we came from tab buttons with data-agg-tab, handle below via click; for hash #/sports/nhl show team grid.
  let gridAgg=route.key?null:(route.agg||'team');
  if(!route.agg&&!route.key) gridAgg='team';
  // When route is #/sports/nhl/agg/team/PIT, show members not grid
  const showMembers=!!(route.agg&&route.key);
  const pl=route.player?playerById(route.player):null;
  const left=showMembers? renderMembers(route.agg,route.key,route.player)
    : `<p class="lead">Objets de Classe 2 : regroupements sur les mêmes joueurs (points de Classe 1). La Classe 4 est l’ensemble du système.</p>
       <div class="tabs" id="nhltabs">
         <button type="button" class="tab" data-tab="team" aria-selected="${(gridAgg==='team')?'true':'false'}">Équipes</button>
         <button type="button" class="tab" data-tab="nat" aria-selected="${gridAgg==='nat'?'true':'false'}">Pays / nationalités</button>
         <button type="button" class="tab" data-tab="pos" aria-selected="${gridAgg==='pos'?'true':'false'}">Positions</button>
         <button type="button" class="tab" data-tab="draft" aria-selected="${gridAgg==='draft'?'true':'false'}">Années de repêchage</button>
         <button type="button" class="tab" data-route="#/sports/nhl/agg/players/ALL" aria-selected="false">Joueurs</button>
         <button type="button" class="tab" data-tab="age" aria-selected="${gridAgg==='age'?'true':'false'}">Âge [INCOMPLET]</button>
       </div>
       <div id="nhlgrid">${renderAggList(gridAgg||'team')}</div>`;
  $('nhlview').innerHTML=`<div class="ovtop"><div>
      <h1>Classe 4 — LNH <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Chaque joueur est un point de donnée de Classe 1. Les équipes, pays, positions et années de repêchage sont des objets de Classe 2. La Classe 4 contient tout le système. ${NHL.players.length} joueurs · saisons 2024-25 et 2025-26 · source API NHL (extraction du 9 nov. 2026). Logos officiels des 32 clubs sur les objets de Classe 2 (licence [INCOMPLET : conditions d’usage NHL non vérifiées]). En l’absence de photo réelle, le nom complet du joueur tient lieu de visuel (fichier photos/{id}.png, à remplacer plus tard). Les positions sont nommées en toutes lettres — Center, Left Wing, Right Wing, Defense, Goalie — un symbole pourra venir plus tard. Chaque fiche relie le joueur à son club, sa nationalité, sa position, son année de repêchage et, s’il y a lieu, au groupe des joueurs échangés. Chaque liste (clubs, nationalités, positions, années de repêchage, joueurs échangés, recherche Tous les joueurs) montre une vignette cliquable par joueur — le nom complet en attendant la photo réelle — qui ouvre sa fiche. Les 32 logos de clubs sont des vignettes cliquables qui ouvrent l’objet club et son effectif. L’âge reste [INCOMPLET].</p>
    </div></div>
    <div id="nhlsplit">
      <div id="nhlleft">${left}</div>
      <div id="nhlright">${pl?renderPlayerCard(pl):'<p class="lead">Cliquez la vignette d’un joueur pour ouvrir sa fiche à l’intérieur de l’objet : visuel, nom, position, club (logo), nationalité, repêchage, statistiques et liens de Classe 2.</p>'}</div>
    </div>`;
  window.__NHL_STATE={agg:route.agg||'team',key:route.key||null,player:route.player||null,nPlayers:NHL.players.length,nTeams:Object.keys(NHL.teams).length,card:window.__NHL_CARD||null};
  const tabsEl=$('nhltabs');
  if(tabsEl) tabsEl.addEventListener('click',e=>{
    const b=e.target.closest('[data-tab]'); if(!b) return;
    e.preventDefault();
    // re-render grid in place without losing the NHL shell — use hash without key
    NHL_TAB=b.dataset.tab; nhlPersistTab();
    renderNHLGridOnly(NHL_TAB);
    tabsEl.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));
  });
  const filt=$('nhlfilter');
  if(filt) filt.addEventListener('input',()=>{
    const q=filt.value.toLowerCase();
    document.querySelectorAll('#nhltbody tr, #nhlplayerdir .pdir-item').forEach(el=>{
      el.style.display=el.textContent.toLowerCase().includes(q)?'':'none';
    });
  });
}
let NHL_TAB=(function(){ const st=analysisSportLoad('nhl'); return (st&&st.tab)||'team'; })();
function nhlPersistTab(){ analysisSportSave('nhl',{tab:NHL_TAB, silo:'nhl'}); }

function renderNHLGridOnly(tab){
  const g=$('nhlgrid'); if(!g) return;
  if(tab==='age'){
    g.innerHTML='<p class="incomp" id="age-incomp">Super-instanciateur Âge : [INCOMPLET : date de référence du calcul d’âge à fixer]. Aucun regroupement par âge n’a été calculé. Le champ birth_date est présent dans les données, sans calcul d’âge.</p>';
    return;
  }
  g.innerHTML=renderAggList(tab);
}



/* === v20.12 planetary floors UI (links + constituents) + Sources panel === */
function escAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function worldFloorCard(row){
  const links=row.links||{};
  const as=[];
  Object.keys(links).forEach(k=>{
    const L=links[k]; if(!L||!L.url) return;
    as.push('<a class="wf-link" href="'+escAttr(L.url)+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">'+escAttr(k)+' ↗</a>');
  });
  const badge=row.status==='live'?'COUVERT (données)':(row.status==='links'?'LIENS':'[INCOMPLET]');
  const bcls=row.status==='live'?'live':(row.status==='links'?'links':'empty');
  const route=row.route?(' data-route="'+escAttr(row.route)+'" role="button" tabindex="0"'):'';
  return '<article class="wf-card '+bcls+'" data-id="'+escAttr(row.id)+'"'+route+' aria-label="'+escAttr(row.name)+'">'+
    '<header><span class="wf-id">'+escAttr(row.id)+'</span> <strong>'+escAttr(row.name)+'</strong> <span class="wf-badge">'+badge+'</span></header>'+
    '<p class="wf-count">'+escAttr(row.count||'')+'</p>'+
    (as.length?'<p class="wf-links">'+as.join(' · ')+'</p>':'')+
    (row.note?'<p class="wf-note incomp">'+escAttr(row.note)+'</p>':'')+
    '</article>';
}
function renderWorldBranchPanel(branchId){
  const b=treeBranchById(branchId);
  const rows=floorContentsForHub(branchId);
  const frames=window.UM_MARKET_FRAMES||{};
  const t01=(branchId==='AMER')?('<p class="t01-banner" id="t01-banner"><strong>'+escAttr(frames.label||'T0/T1')+'</strong> — T0 = '+escAttr(frames.T0||'?')+' · T1 = '+escAttr(frames.T1||'?')+' <span class="muted">('+escAttr(frames.note||'')+')</span></p>'):'';
  const ix=rows.filter(r=>((window.WORLD_FLOORS.branches[branchId]||{}).indices||[]).some(i=>i.id===r.id) || ['NDX','SPX'].includes(r.id));
  const ex=rows.filter(r=>!ix.includes(r));
  return '<div class="ovtop"><div>'+
    '<h1>Branche — '+escAttr((b&&b.name)||branchId)+' <span class="verpill">v20.15</span></h1>'+
    '<div class="crumb-slot"></div>'+
    '<p class="lead">Objets Classe 2 = places / indices avec liens vérifiés (HTTP 2xx/3xx). Constituants Classe 1 sourcés quand disponibles ; sinon [INCOMPLET]. Aucune valeur inventée.</p>'+
    t01+
    '<p class="galaxy-actions">'+
      '<button type="button" class="retour-hub" data-route="#/galaxy/planet">← Galaxie planétaire</button> '+
      '<button type="button" class="retour-hub" data-route="#/">← Retour au hub</button> '+
      '<button type="button" class="retour-hub" data-route="#/sources">Sources et liens de données</button>'+
    '</p></div></div>'+
    '<section class="wf-sec"><h2>Indices (Classe 2)</h2><div class="wf-grid">'+(ix.map(worldFloorCard).join('')||'<p class="incomp">[INCOMPLET]</p>')+'</div></section>'+
    '<section class="wf-sec"><h2>Places / échanges (Classe 2)</h2><div class="wf-grid">'+(ex.map(worldFloorCard).join('')||'<p class="incomp">[INCOMPLET]</p>')+'</div></section>';
}
function renderSourcesPanel(){
  const WF=window.WORLD_FLOORS||{};
  const branches=WF.branches||{};
  const frames=window.UM_MARKET_FRAMES||{};
  let body='';
  const order=['APAC','ME','EUR','AFR','AMER'];
  order.forEach(bid=>{
    const blk=branches[bid]; if(!blk) return;
    const bname=(treeBranchById(bid)||{}).name||bid;
    body+='<section class="src-branch"><h2>'+escAttr(bname)+' <span class="wf-id">'+bid+'</span></h2>';
    body+='<h3>Indices</h3><ul class="src-list">';
    (blk.indices||[]).forEach(ix=>{
      const st=ix.constituents_n>0?'couvert (constituants)':(ix.links&&ix.links.factsheet?'liens seulement':'[INCOMPLET]');
      const href=(ix.links&&ix.links.factsheet&&ix.links.factsheet.url)||'';
      body+='<li><strong>'+escAttr(ix.name)+'</strong> — '+escAttr(st)+
        (href?' — <a href="'+escAttr(href)+'" target="_blank" rel="noopener">fiche/source</a>':'')+
        (ix.constituents_n?(' — '+ix.constituents_n+' C1'):'')+
        (ix.note?(' — <span class="incomp">'+escAttr(ix.note)+'</span>'):'')+
        '</li>';
    });
    if(bid==='AMER'){
      body+='<li><strong>Nasdaq-100</strong> — couvert (prix embarqués) — route #/floor/AMF/index/NDX</li>';
      body+='<li><strong>S&amp;P 500</strong> — couvert (prix embarqués) — route #/floor/AMF/index/SPX</li>';
    }
    body+='</ul><h3>Places (MIC)</h3><ul class="src-list">';
    (blk.exchanges||[]).forEach(ex=>{
      const href=ex.links&&ex.links.exchange&&ex.links.exchange.url;
      const st=href?'liens seulement':'[INCOMPLET]';
      body+='<li><strong>'+escAttr(ex.name)+'</strong> ('+escAttr(ex.mic)+') — '+st+
        (href?' — <a href="'+escAttr(href)+'" target="_blank" rel="noopener">site</a>':'')+
        ' — <a href="'+escAttr((ex.links.mic_iso||{}).url||'https://www.iso20022.org/market-identifier-codes')+'" target="_blank" rel="noopener">ISO 10383 MIC</a></li>';
    });
    body+='</ul></section>';
  });
  body+='<section class="src-branch"><h2>Journal des versions (déplacé hors galaxie)</h2><p class="muted">v20.14 — galaxies remplies (LNH / NDX / SPX), changelog retiré du canvas, panneau replié, rail d’icônes propre. Ancien journal v20.5–v20.9 conservé ici.</p></section>';
  body+='<section class="src-branch"><h2>Marché — cadres T0/T1</h2><p><strong>'+escAttr(frames.label||'')+'</strong><br>T0 = '+escAttr(frames.T0||'')+' · T1 = '+escAttr(frames.T1||'')+'<br>'+escAttr(frames.note||'')+'</p></section>';
  body+='<section class="src-branch"><h2>Sports</h2><ul class="src-list"><li><strong>Hockey LNH</strong> — couvert (silo)</li>'+
    '<li>Football / Soccer / Football américain / Basketball — <span class="incomp">[INCOMPLET] placeholders (silos scellés, non étendus en v20.12)</span></li></ul>'+
    '<p class="muted">Build public SAFE : sigles seulement, pas de photos/logos de marque. Un build PRIVÉ (logos/photos) existe hors site public.</p></section>';
  return '<div class="ovtop"><div><h1>Sources et liens de données <span class="verpill">v20.15</span></h1>'+
    '<p class="lead">Inventaire des liens par branche. Statuts : couvert / liens seulement / [INCOMPLET]. Aucune valeur inventée.</p>'+
    '<p class="galaxy-actions"><button type="button" class="retour-hub" data-route="#/">← Retour au hub</button> '+
    '<button type="button" class="retour-hub" data-route="#/galaxy/planet">← Galaxies</button></p></div></div>'+body;
}
function applySources(){
  document.body.className='mode-home mode-sources';
  stopPlay();
  const el=ensureGalaxyPlanet();
  el.innerHTML=renderSourcesPanel();
  el.style.display='block';
  if($('mf')) $('mf').style.display='none';
  ensureRetourHubBar('Sources et liens de données');
}
function applyWorldBranch(branchId, sub){
  document.body.className='mode-home mode-galaxy mode-galaxy-branch mode-world-floors';
  stopPlay();
  window.__HUB_TREE=branchId;
  window.__HUB_CAT='finance';
  const el=ensureGalaxyPlanet();
  let html=renderWorldBranchPanel(branchId);
  if(sub&&sub.kind==='index'){
    const blk=((WORLD_FLOORS.branches||{})[branchId])||{};
    const ix=(blk.indices||[]).find(i=>i.id===sub.id);
    if(ix){
      const list=(ix.constituents||[]).slice(0,500).map(c=>'<li><code>'+escAttr(c.symbol||'—')+'</code> '+escAttr(c.name)+'</li>').join('');
      html+='<section class="wf-sec" id="wf-c1"><h2>Constituants Classe 1 — '+escAttr(ix.name)+' ('+(ix.constituents_n||0)+')</h2>'+
        (ix.links&&ix.links.constituents_source?'<p>Source : <a href="'+escAttr(ix.links.constituents_source.url)+'" target="_blank" rel="noopener">'+escAttr(ix.links.constituents_source.url)+'</a> · récupéré '+escAttr(ix.links.constituents_source.retrieved||'')+'</p>':'')+
        (list?'<ol class="c1-list">'+list+'</ol>':'<p class="incomp">[INCOMPLET] aucun constituant chargé</p>')+
        '</section>';
    }
  }
  if(sub&&sub.kind==='ex'){
    const blk=((WORLD_FLOORS.branches||{})[branchId])||{};
    const ex=(blk.exchanges||[]).find(i=>i.id===sub.id);
    if(ex){
      html+='<section class="wf-sec"><h2>Place '+escAttr(ex.name)+'</h2>'+
        '<p>MIC <code>'+escAttr(ex.mic)+'</code> · '+escAttr(ex.iso_name||'')+' · '+escAttr(ex.city||'')+' ('+escAttr(ex.cc||'')+')</p>'+
        worldFloorCard({id:ex.id,name:ex.name,status:ex.links&&ex.links.exchange?'links':'empty',count:'MIC '+ex.mic,links:ex.links,note:ex.note})+
        '</section>';
    }
  }
  el.innerHTML=html;
  el.style.display='block';
  if($('mf')) $('mf').style.display='none';
  ensureRetourHubBar('Finance · '+((treeBranchById(branchId)||{}).name||branchId)+' · liens');
}

/* === Galaxy layer v20.11 — planet = 5 Class-2 branches; dive reuses applyFloor canvas === */
function ensureGalaxyPlanet(){
  let el=$('galaxy-planet');
  if(!el){
    el=document.createElement('div');
    el.id='galaxy-planet';
    el.className='overlay galaxy-planet-ov';
    document.body.appendChild(el);
  }
  return el;
}

/* === v20.13 — FIELDS structure (portal button lands here) === */
function renderFieldsRoot(){
  return `<div class="ovtop"><div>
      <h1>Champs — structure <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Deux champs d’entrée. Finance est le plus vaste. Sports professionnels ouvre le hockey en premier. Un clic par étape · aucune page morte.</p>
      <p class="galaxy-actions"><button type="button" class="retour-hub" data-route="#/">← Retour au portail</button></p>
    </div></div>
    <div class="fields-grid" id="fields-root">
      <button type="button" class="field-door finance" data-id="FIELD-FINANCE" data-route="#/fields/finance" aria-label="Finance">
        <span class="fd-kicker">Champ</span>
        <span class="fd-name">FINANCE</span>
        <span class="fd-blurb">Le plus vaste · branches continentales · Amérique du Nord → S&amp;P 500, Nasdaq-100, NYSE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door sports" data-id="FIELD-SPORTS" data-route="#/fields/sports" aria-label="Sports professionnels">
        <span class="fd-kicker">Champ</span>
        <span class="fd-name">SPORTS PROFESSIONNELS</span>
        <span class="fd-blurb">Hockey (LNH) = champ n°1 · autres sports = emplacements vides</span>
        <span class="fd-go">→</span>
      </button>
    </div>`;
}
function renderFieldsSports(){
  const others=(SPORT_PH||[]).map(s=>`<button type="button" class="field-door empty" data-id="FIELD-${s.id}" data-route="#/sports/${s.id}" aria-label="${s.name}">
      <span class="fd-kicker">Champ sport · silo ${s.id}</span>
      <span class="fd-name">${s.name}</span>
      <span class="fd-blurb">[INCOMPLET] — silo scellé, aucune donnée inventée</span>
      <span class="fd-badge">en construction</span>
    </button>`).join('');
  return `<div class="ovtop"><div>
      <h1>Sports professionnels <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Hockey est le champ n°1. Un clic ouvre la galaxie LNH (équipes et joueurs). Les autres sports restent des emplacements vides.</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/fields">← Champs</button>
        <button type="button" class="retour-hub" data-route="#/">← Portail</button>
      </p>
    </div></div>
    <div class="fields-grid" id="fields-sports">
      <button type="button" class="field-door live hockey-first" data-id="FIELD-HOCKEY" data-route="#/sports/nhl" aria-label="Hockey — LNH">
        <span class="fd-kicker">Champ n°1 · silo nhl</span>
        <span class="fd-name">HOCKEY — LNH</span>
        <span class="fd-blurb">${NHL.players.length} joueurs · ${Object.keys(NHL.teams).length} clubs · galaxie équipes &amp; joueurs</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      ${others}
    </div>`;
}
function renderFieldsFinance(){
  return `<div class="ovtop"><div>
      <h1>Finance <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Champ le plus vaste. Amérique du Nord ouvre S&amp;P 500, Nasdaq-100 et NYSE. Les autres branches ouvrent leurs indices (galaxie quand les prix T0/T1 sont disponibles).</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/fields">← Champs</button>
        <button type="button" class="retour-hub" data-route="#/">← Portail</button>
      </p>
    </div></div>
    <div class="fields-grid" id="fields-finance">
      <button type="button" class="field-door live" data-id="FIELD-NA" data-route="#/fields/finance/NA" aria-label="Amérique du Nord">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">AMÉRIQUE DU NORD</span>
        <span class="fd-blurb">S&amp;P 500 · Nasdaq-100 · NYSE — chaque ensemble ouvre sa galaxie</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live" data-id="FIELD-LATAM" data-route="#/fields/finance/LATAM" aria-label="Amérique du Sud">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">AMÉRIQUE DU SUD</span>
        <span class="fd-blurb">Ibovespa — 76 titres Classe 1 · galaxie T0/T1</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live" data-id="FIELD-APAC" data-route="#/fields/finance/APAC" aria-label="Asie-Pacifique">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">ASIE-PACIFIQUE</span>
        <span class="fd-blurb">Straits Times Index (galaxie) · Nikkei 225, Hang Seng, S&amp;P/ASX 200 (listes)</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live" data-id="FIELD-ME" data-route="#/fields/finance/ME" aria-label="Moyen-Orient">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">MOYEN-ORIENT</span>
        <span class="fd-blurb">TASI — constituants Wikidata + galaxie T0/T1 (liste partielle)</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live" data-id="FIELD-EUR" data-route="#/fields/finance/EUR" aria-label="Europe">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">EUROPE</span>
        <span class="fd-blurb">FTSE 100 · DAX 40 · CAC 40 · EURO STOXX 50 — manifestation T0/T1</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live" data-id="FIELD-AFR" data-route="#/fields/finance/AFR" aria-label="Afrique">
        <span class="fd-kicker">Sous-champ</span>
        <span class="fd-name">AFRIQUE</span>
        <span class="fd-blurb">FTSE/JSE Top 40 — constituants réels, prix T0/T1 [INCOMPLET]</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door" data-id="FIELD-AMER" data-route="#/galaxy/AMER" aria-label="Amériques (branche complète)">
        <span class="fd-kicker">Branche Classe 2</span>
        <span class="fd-name">AMÉRIQUES (branche)</span>
        <span class="fd-blurb">Nord + Sud · places et indices liés</span>
        <span class="fd-go">→</span>
      </button>
    </div>
    <h2 class="cov-sub">Étages d’indices</h2>
    <div class="fields-grid" id="fields-finance-indices">${indexFloorCards()}</div>`;
}
function renderFieldsFinanceNA(){
  const nNdx=(DATA.NDX&&DATA.NDX.objs)?DATA.NDX.objs.length:0;
  const nSpx=(DATA.SPX&&DATA.SPX.objs)?DATA.SPX.objs.length:0;
  const nNy=typeof countMic==='function'?countMic('XNYS'):0;
  // Third NA set = NYSE (XNYS) — Dow/TSX absent from build data
  return `<div class="ovtop"><div>
      <h1>Amérique du Nord <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Trois ensembles cliquables. Chaque clic ouvre sa propre galaxie (objets sociétés / titres). Troisième ensemble = NYSE (le Dow et le TSX sont absents des données → non inventés).</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/fields/finance">← Finance</button>
        <button type="button" class="retour-hub" data-route="#/fields">← Champs</button>
      </p>
    </div></div>
    <div class="fields-grid sets-na" id="fields-na">
      <button type="button" class="field-door live set-card" data-id="SET-SPX" data-route="#/floor/AMF/index/SPX" aria-label="S&P 500">
        <span class="fd-kicker">Ensemble · galaxie</span>
        <span class="fd-name">S&amp;P 500</span>
        <span class="fd-blurb">${nSpx} titres Classe 1 · ouvre la galaxie S&amp;P</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live set-card" data-id="SET-NDX" data-route="#/floor/AMF/index/NDX" aria-label="Nasdaq-100">
        <span class="fd-kicker">Ensemble · galaxie</span>
        <span class="fd-name">NASDAQ-100</span>
        <span class="fd-blurb">${nNdx} titres Classe 1 · ouvre la galaxie Nasdaq</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
      <button type="button" class="field-door live set-card" data-id="SET-XNYS" data-route="#/floor/AMF/ex/XNYS" aria-label="NYSE">
        <span class="fd-kicker">Ensemble · galaxie · 3<sup>e</sup> jeu NA</span>
        <span class="fd-name">NYSE</span>
        <span class="fd-blurb">${nNy} titres · place New York · galaxie NYSE (Dow/TSX absents des données)</span>
        <span class="fd-badge">ACTIVE</span>
        <span class="fd-go">→</span>
      </button>
    </div>`;
}
function worldIndexCardsForBranch(branchId){
  const blk=((window.WORLD_FLOORS&&WORLD_FLOORS.branches)||{})[branchId]||{};
  return (blk.indices||[]).map(ix=>{
    const priced=!!(DATA[ix.id]&&DATA[ix.id].meta&&DATA[ix.id].meta.n_with_prices);
    const n=priced?DATA[ix.id].meta.n_with_prices:(ix.constituents_n||0);
    const floor=(DATA[ix.id]&&DATA[ix.id].meta&&DATA[ix.id].meta.floor)||(branchId==='AMER'||branchId==='LATAM'?'AMF':branchId==='EUR'?'EUF':branchId==='AFR'?'AFF':'ASF');
    const route=priced?('#/floor/'+floor+'/index/'+ix.id):('#/galaxy/'+branchId+'/index/'+ix.id);
    const blurb=priced?(n+' titres Classe 1 · galaxie T0/T1'):((ix.constituents_n||0)?((ix.constituents_n||0)+' constituants · [INCOMPLET] prix T0/T1 — liste liée'):(ix.note||'[INCOMPLET]'));
    return `<button type="button" class="field-door ${priced?'live set-card':'empty'}" data-id="SET-${ix.id}" data-route="${route}" aria-label="${ix.name}">
        <span class="fd-kicker">Ensemble · ${priced?'galaxie':'liste'}</span>
        <span class="fd-name">${ix.name.toUpperCase()}</span>
        <span class="fd-blurb">${blurb}</span>
        <span class="fd-badge">${priced?'ACTIVE':'[INCOMPLET]'}</span>
        <span class="fd-go">→</span>
      </button>`;
  }).join('');
}
function renderFieldsFinanceRegion(code){
  const map={
    APAC:{title:'Asie-Pacifique',branch:'APAC',lead:'Nikkei 225, Hang Seng Index, Straits Times Index et S&amp;P/ASX 200 ouvrent leurs galaxies (prix T0/T1). Les constituants sans cours restent [INCOMPLET].'},
    ME:{title:'Moyen-Orient',branch:'ME',lead:'TASI ouvre une galaxie à partir des sociétés Wikidata pourvues d’un symbole et d’un prix Yahoo. La liste officielle complète (~250) et 17 symboles sans prix restent [INCOMPLET]. T0 saoudien = 4 jan 2026 (le 2 jan est un vendredi, week-end local).'},
    EUR:{title:'Europe',branch:'EUR',lead:'FTSE 100, DAX 40, CAC 40 et EURO STOXX 50 ouvrent leurs galaxies (prix T0/T1). Les constituants sans cours restent [INCOMPLET].'},
    AFR:{title:'Afrique',branch:'AFR',lead:'FTSE/JSE Top 40 : constituants liés. Symboles et prix T0/T1 en partie [INCOMPLET].'},
    LATAM:{title:'Amérique du Sud',branch:'AMER',lead:'Ibovespa (B3, carteira officielle au 9 nov 2026) : 76 titres Classe 1, galaxie T0/T1.'}
  };
  const cfg=map[code]||map.APAC;
  const cards=worldIndexCardsForBranch(cfg.branch);
  return `<div class="ovtop"><div>
      <h1>${cfg.title} <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">${cfg.lead}</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/fields/finance">← Finance</button>
        <button type="button" class="retour-hub" data-route="#/fields">← Champs</button>
      </p>
    </div></div>
    <div class="fields-grid sets-na" id="fields-${code}">${cards}</div>`;
}
function applyFields(route){
  document.body.className='mode-home mode-fields mode-fields-'+(route.fields||'root');
  stopPlay();
  hideRetourHubBar();
  const el=ensureGalaxyPlanet();
  if(route.fields==='sports') el.innerHTML=renderFieldsSports();
  else if(route.fields==='finance-na') el.innerHTML=renderFieldsFinanceNA();
  else if(route.fields==='finance') el.innerHTML=renderFieldsFinance();
  else if(route.fields&&route.fields.indexOf('finance-')===0&&route.fields!=='finance-na'){
    const code=route.fields.replace('finance-','');
    el.innerHTML=renderFieldsFinanceRegion(code);
  }
  else el.innerHTML=renderFieldsRoot();
  el.style.display='block';
  if($('mf')) $('mf').style.display='none';
  const ctx={root:'Champs',sports:'Sports professionnels',finance:'Finance','finance-na':'Amérique du Nord','finance-APAC':'Asie-Pacifique','finance-ME':'Moyen-Orient','finance-EUR':'Europe','finance-AFR':'Afrique','finance-LATAM':'Amérique du Sud'}[route.fields]||'Champs';
  ensureRetourHubBar(ctx);
  // hide static portal button while inside fields
}

function renderGalaxyPlanet(){
  const el=ensureGalaxyPlanet();
  const branches=TREE_BRANCHES.map(b=>{
    const live=branchCovered(b);
    const status=live?'live':'empty';
    const badge=live?'ACTIVE':'[INCOMPLET]';
    return `<button type="button" class="galaxy-planet-obj class2 ${status}" data-id="GAL-${b.id}" data-route="#/galaxy/${b.id}" data-branch="${b.id}" aria-label="${b.name}">
      <span class="gpo-class">Classe 2</span>
      <span class="gpo-id">${b.id}</span>
      <span class="gpo-name">${b.name}</span>
      <span class="gpo-badge">${badge}</span>
      <span class="gpo-blurb">${b.blurb||''}</span>
    </button>`;
  }).join('');
  // Sports door as Class 2 on planet — opens per-sport galaxies ONLY; never merges with finance
  const sportsDoor='';
  el.innerHTML=`<div class="ovtop"><div>
      <h1>Galaxie planétaire <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Cinq branches d'ouverture en objets Classe 2 · porte Sports (galaxies par sport, silo isolé) · aucune fusion sport↔finance · données manquantes = [INCOMPLET].</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/" id="retour-hub-galaxy">← Retour au hub</button>
      </p>
    </div></div>
    <div class="galaxy-planet-field" id="galaxy-planet-field">
      ${branches}
      ${sportsDoor}
    </div>`;
  el.style.display='block';
}
function renderGalaxySports(){
  // Per-sport galaxies only — no finance ATTRS, no cross-sport shared analysis
  const el=ensureGalaxyPlanet();
  const nhl=`<button type="button" class="galaxy-planet-obj class2 live" data-id="GAL-NHL" data-route="#/sports/nhl" aria-label="Hockey LNH">
      <span class="gpo-class">Classe 4 · silo nhl</span>
      <span class="gpo-id">NHL</span>
      <span class="gpo-name">Hockey — LNH</span>
      <span class="gpo-badge">ACTIVE</span>
      <span class="gpo-blurb">Analyse sous um.analysis.sports.nhl.* — isolée de la finance</span>
    </button>`;
  const ph=(SPORT_PH||[]).map(s=>`<button type="button" class="galaxy-planet-obj class2 empty" data-id="GAL-${s.id}" data-route="#/sports/${s.id}" aria-label="${s.name}">
      <span class="gpo-class">Classe 2 · silo ${s.id}</span>
      <span class="gpo-id">${s.id}</span>
      <span class="gpo-name">${s.name}</span>
      <span class="gpo-badge">[INCOMPLET]</span>
      <span class="gpo-blurb">Silo um.analysis.sports.${s.id}.* — aucune donnée inventée</span>
    </button>`).join('');
  el.innerHTML=`<div class="ovtop"><div>
      <h1>Galaxies Sports <span class="verpill">v20.15</span></h1>
      <div class="crumb-slot"></div>
      <p class="lead">Chaque sport = galaxie et silo d'analyse isolés. Aucun mélange entre sports, aucun mélange avec la finance.</p>
      <p class="galaxy-actions">
        <button type="button" class="retour-hub" data-route="#/galaxy/planet">← Galaxie planétaire</button>
        <button type="button" class="retour-hub" data-route="#/">← Retour au hub</button>
      </p>
    </div></div>
    <div class="galaxy-planet-field" id="galaxy-sports-field">${nhl}${ph}</div>`;
  el.style.display='block';
}
function hideGalaxyPlanet(){
  const el=$('galaxy-planet');
  if(el){ el.style.display='none'; el.innerHTML=''; }
}
function ensureRetourHubBar(ctx){
  let bar=$('retour-hub-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='retour-hub-bar';
    document.body.appendChild(bar);
  }
  bar.innerHTML=`<button type="button" class="retour-hub" data-route="#/" id="retour-hub-floor">← Retour au hub</button>
    <button type="button" class="retour-hub ghost" data-route="#/galaxy/planet" id="retour-planet">Galaxie planétaire</button>
    <span class="retour-ctx">${ctx||''}</span>`;
  bar.style.display='flex';
}
function hideRetourHubBar(){
  const bar=$('retour-hub-bar');
  if(bar) bar.style.display='none';
}

/* === v20.14 — NHL galaxy (same canvas metaphor as finance) === */
window.__NHL_GALAXY=null;
function nhlTeamAbbrOf(p){
  const ts=p.ts||{};
  return ts['20252026']||ts['20242025']||(typeof ts==='string'?ts:null)||'NHL';
}
function nhlTeamName(abbr){
  const t=(NHL.teams&&NHL.teams[abbr])||{};
  return t['20252026']||t['20242025']||abbr;
}
function buildNhlGalaxyLayout(){
  const teams=Object.keys(NHL.teams||{}).sort();
  const nT=teams.length||1;
  const teamPos={};
  teams.forEach((abbr,i)=>{
    const ang=-Math.PI/2 + 2*Math.PI*i/nT;
    const R=0.78;
    teamPos[abbr]={x:Math.cos(ang)*R, y:Math.sin(ang)*R, abbr, name:nhlTeamName(abbr), members:[]};
  });
  const players=[];
  (NHL.players||[]).forEach((p,pi)=>{
    let abbr=nhlTeamAbbrOf(p);
    if(String(abbr).includes(',')) abbr=String(abbr).split(',')[0].trim();
    if(!teamPos[abbr]){
      // orphan / multi — park near centre ring
      const ang=2*Math.PI*(pi%32)/32; teamPos[abbr]=teamPos[abbr]||{x:Math.cos(ang)*0.25,y:Math.sin(ang)*0.25,abbr,name:abbr,members:[]};
    }
    const tp=teamPos[abbr];
    const j=tp.members.length;
    const ring=0.10 + 0.035*((j%7));
    const a=2*Math.PI*(j/Math.max(8, Math.ceil((NHL.players.length/nT)))) + (pi*0.17);
    const x=tp.x + Math.cos(a)*ring;
    const y=tp.y + Math.sin(a)*ring;
    const rec={id:p.id,n:p.n,pos:p.pos,nat:p.nat,abbr,x,y,p};
    tp.members.push(rec); players.push(rec);
  });
  return {teams:Object.values(teamPos), players, nTeams:teams.length, nPlayers:players.length};
}
function ensureNhlGalaxy(){
  if(window.__NHL_GALAXY && window.__NHL_GALAXY.nPlayers===(NHL.players||[]).length) return window.__NHL_GALAXY;
  window.__NHL_GALAXY=buildNhlGalaxyLayout();
  return window.__NHL_GALAXY;
}
function nhlGalaxyFit(){
  const G=ensureNhlGalaxy();
  // world bounds ~ [-1.05,1.05]
  const pad=0.12;
  const x0=-1-pad, x1=1+pad, y0=-1-pad, y1=1+pad;
  // map into canvas with L/R margins for rails
  window.__NHL_VIEW={x0,x1,y0,y1};
}
function nhlXY(x,y){
  const v=window.__NHL_VIEW||{x0:-1.2,x1:1.2,y0:-1.2,y1:1.2};
  const nhlMode=window.__DRAW_OVERRIDE==='nhl';
  const Lft=nhlMode?64:56;
  const Rgt=nhlMode?((W>=960 && document.body.classList.contains('rw-open'))?360:52):(($('libon')&&$('libon').checked)?(PW+50):36);
  const Top=56, Bot=48;
  let px=Lft + (x-v.x0)/(v.x1-v.x0)*(W-Lft-Rgt);
  let py=Top + (v.y1-y)/(v.y1-v.y0)*(H-Top-Bot);
  if(window.__WAVE && typeof waveSwell==='function'){
    const cx=Lft + (0-v.x0)/(v.x1-v.x0)*(W-Lft-Rgt);
    const cy=Top + (v.y1-0)/(v.y1-v.y0)*(H-Top-Bot);
    const s=waveSwell();
    px=cx+(px-cx)*s; py=cy+(py-cy)*s;
  }
  return [px,py];
}
function drawNhlGalaxy(){ window.drawNhlGalaxy=drawNhlGalaxy;
  document.body.classList.add('manifest-primary');
  if(!document.body.classList.contains('c4-open')) document.body.classList.add('c4-collapsed');
  document.body.classList.toggle('c4-wave-attrs', !window.__WAVE || (typeof waveFormT==='function' && waveFormT()>=0.98));
  window.ctx=ctx; window.W=W; window.H=H; window.nhlXY=nhlXY; window.moved=moved;
  if(typeof window.drawNhlLeagueGalaxy==='function'){
    window.drawNhlLeagueGalaxy();
    if(window.HIT){
      HIT.c1=window.HIT.c1||[];
      HIT.c2=window.HIT.c2||[];
      HIT.c4=window.HIT.c4||null;
      HIT.c4n=window.HIT.c4n||[];
      HIT.nhl=true;
    }
    applyLivingClass4FromHits('LNH');
    return;
  }
  const G=ensureNhlGalaxy(); nhlGalaxyFit();
  HIT={c1:[],c2:[],c4:null,c4n:[],z0:null,gr:0,c:0,lib:[],libR:null,nhl:true};
  ctx.fillStyle='#07080c'; ctx.fillRect(0,0,W,H);
  // faint orbits
  ctx.save();
  const [cx,cy]=nhlXY(0,0);
  ctx.strokeStyle='rgba(232,200,114,.12)'; ctx.lineWidth=1; ctx.setLineDash([4,6]);
  ctx.beginPath(); const rOrb=Math.abs(nhlXY(0.78,0)[0]-cx); ctx.arc(cx,cy,rOrb,0,Math.PI*2); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Class 1 — players
  ctx.globalAlpha=0.9;
  G.players.forEach(pl=>{
    const [px,py]=nhlXY(pl.x,pl.y);
    if(px<-6||px>W+6||py<-6||py>H+6) return;
    HIT.c1.push({k:pl.id,px,py,r:2.4,nhl:1,pl});
    ctx.beginPath(); ctx.fillStyle='#9aa3b5'; ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;

  // Class 2 — teams
  G.teams.forEach((t,ti)=>{
    const [px,py]=nhlXY(t.x,t.y);
    const R=18;
    HIT.c2.push({gi:ti,px,py,r:R,nhl:1,team:t,p:[t.x,t.y]});
    ctx.beginPath();
    ctx.fillStyle='rgba(14,18,28,.92)';
    ctx.strokeStyle='#e8c872'; ctx.lineWidth=2;
    ctx.arc(px,py,R,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#e8c872'; ctx.font='700 11px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(t.abbr, px, py-1);
    // name on approach (always at desk zoom — short)
    ctx.fillStyle='#cfd3dc'; ctx.font='600 9px system-ui';
    ctx.fillText(t.name.length>18?t.name.slice(0,16)+'…':t.name, px, py+R+10);
    ctx.textAlign='start'; ctx.textBaseline='alphabetic';
    t._px=px; t._py=py; t._r=R;
  });

  // HUD chip (not changelog)
  if($('d')) $('d').textContent='LNH · '+G.nTeams+' clubs (Cl.2) · '+G.nPlayers+' joueurs (Cl.1)';
  if($('st')) $('st').innerHTML='<b>Galaxie LNH</b> — clubs en orbite, joueurs en points. Clic club → effectif · ⓘ = descriptif · Liste = vue tableaux.';
  if($('lg')) {$('lg').innerHTML=''; $('lg').style.display='none';}
  // right window default: system
  try{
    if(!window.__RW_NHL_LOCK){
      summonRightWindow({
        id:'nhl:system', silo:'sports', classNum:4, name:'LNH — système de Classe 4',
        metaLines:[
          G.nTeams+' clubs Classe 2',
          G.nPlayers+' joueurs Classe 1',
          'Saisons 2024-25 · 2025-26',
          'Source API NHL (extraction 9 nov 2026)',
          'Liste / tableaux : bouton Liste (haut droite) ou #/sports/nhl/list'
        ]
      });
    }
  }catch(e){}
  applyLivingClass4FromHits('LNH');
}
function applyNhlGalaxy(){
  hideGalaxyPlanet();
  document.body.className='mode-floor mode-nhl-galaxy mode-galaxy';
  stopPlay(); clearSel();
  EMPTY=false;
  if($('nhlview')) {$('nhlview').style.display='none'; $('nhlview').innerHTML='';}
  if($('mf')) $('mf').style.display='none';
  try{ hideRetourHubBar(); }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ hideNhlInfoChip(); }catch(e){}
  if(typeof window.applyNhlLeagueHooks==='function') window.applyNhlLeagueHooks();
  window.__DRAW_OVERRIDE='nhl';
  window.__VERSION='v20.39';
  if(typeof window.nhlSummonCurrentSystem==='function' && !window.__RW_NHL_LOCK){
    try{ window.nhlSummonCurrentSystem(); }catch(e){}
  }
  size(); drawNhlGalaxy();
  try{ if(!window.__WAVE) startManifestWave(); }catch(e){}
}
function ensureNhlInfoChip(){
  let chip=$('nhl-info-chip');
  if(!chip){
    chip=document.createElement('div'); chip.id='nhl-info-chip';
    chip.innerHTML='<button type="button" id="nhl-info-btn" title="Descriptif" aria-expanded="false">ⓘ</button>'
      +'<button type="button" id="nhl-list-btn" data-route="#/sports/nhl/list">Liste</button>'
      +'<div id="nhl-info-panel" hidden>'
      +'<p>Chaque joueur est un point de Classe 1. Les 32 clubs sont des objets de Classe 2 en orbite. '
      +'La Classe 4 contient tout le système LNH. Source API NHL (9 nov 2026). '
      +'Logos = sigles. Prototype privé — non affilié à la LNH.</p>'
      +'<p class="muted">La vue Liste / tableaux reste disponible (effectifs, pays, positions, repêchage).</p>'
      +'</div>';
    document.body.appendChild(chip);
    chip.querySelector('#nhl-info-btn').addEventListener('click',()=>{
      const p=$('nhl-info-panel'); const on=p.hasAttribute('hidden');
      if(on) p.removeAttribute('hidden'); else p.setAttribute('hidden','');
      chip.querySelector('#nhl-info-btn').setAttribute('aria-expanded', on?'true':'false');
    });
  }
  chip.style.display='flex';
}
function hideNhlInfoChip(){ const c=$('nhl-info-chip'); if(c) c.style.display='none'; }

/* v20.14 — collapse left control panel */
function collapseUiPanel(on){
  document.body.classList.toggle('ui-collapsed', !!on);
  // v20.14 — keep icon rail visible even when #ui is collapsed (icons live inside #ui in markup)
  const icons=$('icons');
  if(icons && icons.parentElement !== document.body){
    document.body.appendChild(icons);
    icons.dataset.reparented='1';
  }
  let btn=$('ui-toggle');
  if(!btn){
    btn=document.createElement('button'); btn.type='button'; btn.id='ui-toggle';
    btn.title='Panneau de contrôle'; btn.textContent='⚙';
    document.body.appendChild(btn);
    btn.addEventListener('click',()=>{
      const now=!document.body.classList.contains('ui-collapsed');
      collapseUiPanel(now);
      size(); 
      if(window.__DRAW_OVERRIDE==='nhl') drawNhlGalaxy(); else draw();
    });
  }
  btn.setAttribute('aria-expanded', on?'false':'true');
  btn.textContent = on ? '⚙' : '✕';
  // Default: hide right Class-4 library panel to free galaxy (info window stays)
  if(on && $('libon') && $('libon').checked){
    $('libon').checked=false;
    try{ applyPanel(); }catch(e){ try{size();}catch(_){} }
  }
  size();
}


function applyGalaxy(route){
  window.__HUB_CAT = (route.galaxy==='sports'||route.galaxy==='nhl') ? 'sports' : 'finance';
  if(route.galaxy==='planet' || !route.galaxy){
    document.body.className='mode-home mode-galaxy mode-galaxy-planet';
    stopPlay();
    hideRetourHubBar();
    window.__HUB_TREE=null; window.__HUB_OPEN_FLOOR=null;
    renderGalaxyPlanet();
    // hub panel stays hidden via CSS in galaxy-planet; keep mf blank-ish
    if($('mf')) $('mf').style.display='none';
    return;
  }
  if(route.galaxy==='sports'){
    document.body.className='mode-home mode-galaxy mode-galaxy-sports';
    stopPlay();
    hideRetourHubBar();
    renderGalaxySports();
    if($('mf')) $('mf').style.display='none';
    return;
  }
  if(route.galaxy==='nhl'){
    applyNhlGalaxy();
    return;
  }
  // Branch galaxy — v20.12 world floors panel (links + constituents); AMER also keeps price floors
  const b=treeBranchById(route.branch);
  hideGalaxyPlanet();
  window.__HUB_TREE=route.branch||null;
  window.__HUB_OPEN_FLOOR=b?b.floor:null;
  window.__HUB_CAT='finance';
  const sub=route.worldSub||null;
  if(window.WORLD_FLOORS && route.branch){
    const subId=sub&&sub.kind==='index'&&sub.id;
    if(subId && DATA[subId] && DATA[subId].meta && DATA[subId].meta.n_with_prices){
      applyFloor({mode:'floor', sys:DATA[subId].meta.floor, ds:subId, index:subId, lvl:'x', interpretation:route.interpretation});
      document.body.classList.add('mode-galaxy','mode-galaxy-branch');
      ensureRetourHubBar('Finance · '+(b?b.name:route.branch)+' · '+(DATA[subId].meta.name||subId));
      return;
    }
    applyWorldBranch(route.branch, sub);
    // AMER: still expose canvas via NDX/SPX cards (routes #/floor/...)
    return;
  }
  if(b && b.floor && b.floor!=='MEF' && typeof LIB4!=='undefined' && LIB4.some(x=>x.id===b.floor)){
    applyFloor({mode:'floor', sys:b.floor, ds:'ALL'});
    document.body.classList.add('mode-galaxy','mode-galaxy-branch');
    ensureRetourHubBar('Finance · '+b.name+(branchCovered(b)?'':' · [INCOMPLET]'));
  } else {
    document.body.className='mode-home mode-galaxy mode-galaxy-branch';
    stopPlay();
    const el=ensureGalaxyPlanet();
    el.innerHTML='<div class="ovtop"><div><h1>Galaxie — '+((b&&b.name)||route.branch)+' <span class="verpill">v20.15</span></h1><p class="incomp">[INCOMPLET]</p></div></div>';
    el.style.display='block';
    if($('mf')) $('mf').style.display='none';
    ensureRetourHubBar('Finance · '+((b&&b.name)||route.branch)+' · [INCOMPLET]');
  }
}

function applyFloor(route){
  window.__DRAW_OVERRIDE=null;
  window.__ROSTER=null;
  if(typeof setFloorInterpretation==='function') setFloorInterpretation(route&&route.interpretation?route.interpretation:'twopass');
  document.body.className='mode-floor';
  document.body.classList.remove('ui-collapsed'); // will re-apply collapse below
  try{ stopPlay(); }catch(e){}
  if((route.sys==='NSF'||route.sys==='EWF') && !route.ex){
    if(route.index && route.index.length===1){ mountHemisphereMembers(route); return; }
    mountHemisphereDoors(route); return;
  }
  if(route.ex){ mountExchangeFloor(route); return; }
  if(route.index && !indexHasPrices(route.index)){
    const roster=ensureRosterIndex(route.index);
    if(roster){ mountIndexRoster(route); return; }
  }
  // v20.15/v20.23 — world index floors keep the NDX/SPX applyFloor path intact
  if(route.index && DATA[route.index] && DATA[route.index].meta && DATA[route.index].meta.floor && !regionSpec(route.sys)){
    route.sys=DATA[route.index].meta.floor;
    route.ds=route.index;
  }
  if(route.index && regionSpec(route.sys) && DATA[route.index] && DATA[route.index].meta && DATA[route.index].meta.floor && DATA[route.index].meta.floor!==route.sys){
    DATA[route.index].meta.keepAll=true;
  }
  if(!LIB4.some(x=>x.id===route.sys) && !regionSpec(route.sys)) route.sys='AMF';
  // ensure ds <select> knows world indices
  if(route.ds && DATA[route.ds] && $('ds') && ![...$('ds').options].some(o=>o.value===route.ds)){
    const op=document.createElement('option'); op.value=route.ds; op.textContent=(DATA[route.ds].meta&&DATA[route.ds].meta.name)||route.ds; $('ds').appendChild(op);
  }
  $('sys').value=route.sys;
  $('ds').value=route.ds||'ALL';
  if(route.index) $('lvl').value='x';
  else if(route.ex) $('lvl').value='f';
  else $('lvl').value=route.lvl||'s';
  const idxbar=$('idxbar'); if(idxbar) idxbar.style.display=route.sys==='AMF'?'block':'none';
  stopPlay(); clearSel();
  hideIndexGap();
  if(!route.index && !route.ex && regionSpec(route.sys)){
    if(regionHasPlottedDoors(route.sys)){ mountRegionDoors(route); return; }
    mountRegionRoster(route); return;
  }
  if(route.index && !indexHasPrices(route.index)){
    showIndexGap((INDEX_GROUP_NAME[route.index])||route.index);
    try{ collapseUiPanel(true); }catch(e){}
    return;
  }
  setDS();
  if(route.index){ mountIndexCoreZones(route); return; }
  // v20.14 — land on T1 so the constellation is dense, then fit to Class 1
  try{ if($('c') && $('e')) $('c').value=$('e').value; }catch(e){}
  if(route.index){
    const want=(window.INDEX_GROUP_NAME||{})[route.index]||(DATA[route.index]&&DATA[route.index].meta&&DATA[route.index].meta.name)||({NDX:'Nasdaq-100 (indice)',SPX:'S&P 500 (indice)'}[route.index]);
    const gi=GROUPS.findIndex(g=>g.name===want);
    if(gi>=0){
      select(gi);
      // auto-deploy constituents at T1 so Class 1 rings are unmistakable
      try{
        if(sel && sel.g){
          const d0=+$('c').value;
          dep=deploy(sel.g, d0); dep.gh={k:0,e:d0,t:0};
          fit(); draw();
        }
      }catch(e){ fit(); draw(); }
    } else draw();
  } else if(route.ex){
    const gi=GROUPS.findIndex(g=>g.mic===route.ex);
    if(gi>=0) select(gi); else draw();
  } else {
    defaultSel();
  }
  if($('idxbar')){
    $('openNDX')&&$('openNDX').setAttribute('aria-current',route.index==='NDX'?'true':'false');
    $('openSPX')&&$('openSPX').setAttribute('aria-current',route.index==='SPX'?'true':'false');
  }
  // collapse long control panel by default — galaxy dominates
  try{ collapseUiPanel(true); }catch(e){}
  try{ fit(); draw(); }catch(e){}
}


// ---------- v20.32 — vague de manifestation, ouverture X/Y/Z, Fourier, fantômes T0→T1 ----------
function gateModeFromHash(){
  const h=location.hash||'#/';
  const qi=h.indexOf('?');
  if(qi<0) return 'libre';
  try{ return new URLSearchParams(h.slice(qi+1)).get('mode')==='fourier'?'fourier':'libre'; }
  catch(e){ return 'libre'; }
}
function setGateMode(mode){
  const raw=(location.hash||'#/world');
  const base=(raw.split('?')[0]||'#/world');
  const path=(base==='#'||base==='#/'||!base)?'#/world':base;
  const next=mode==='fourier'?path+'?mode=fourier':path;
  if((location.hash||'')===next){ applyRoute(); return; }
  location.hash=next;
}
window.gateModeFromHash=gateModeFromHash;
window.setGateMode=setGateMode;
function waveFormT(){
  if(!window.__WAVE) return 1;
  const t=Math.max(0,Math.min(1,progress||0));
  // blob, then the central World object finishes forming before anything leaves the centre
  return Math.max(0,Math.min(1,t/0.36));
}
function waveSwell(){
  if(!window.__WAVE) return 1;
  const t=Math.max(0,Math.min(1,progress||0));
  if(t<=0.40) return 0;
  const u=Math.max(0,Math.min(1,(t-0.40)/0.60));
  return (typeof RISE==='function')?RISE(u):u;
}
function swellFromZ0(p,zc){
  const s=waveSwell();
  if(!(s<1)||!p||!zc) return p;
  return [zc[0]+(p[0]-zc[0])*s, zc[1]+(p[1]-zc[1])*s];
}
window.waveFormT=waveFormT;
window.waveSwell=waveSwell;
window.swellFromZ0=swellFromZ0;
function coherenceVerdict(){
  const live=window.__C4LIVE, z0=live&&live.z0, t0=live&&live.z0T0, t1=live&&live.z0T1;
  const fin=v=>v!=null&&isFinite(v);
  const xy=fin(z0&&z0.x)&&fin(z0&&z0.y)&&fin(t0&&t0.x)&&fin(t0&&t0.y)&&fin(t1&&t1.x)&&fin(t1&&t1.y);
  const zVal=live&&live.attrs?live.attrs.Z:null;
  const zOk=zVal!=null&&zVal!=='[INCOMPLET]'&&isFinite(+zVal);
  return {xy,z:zOk,ok:xy,label:xy?(zOk?'X, Y et Z cohérents — le jeu de données tient':'X et Y cohérents · Z [INCOMPLET]'):'[INCOMPLET] — X/Y non calculables'};
}
function hideGateChrome(){const el=$('gate-chrome'); if(el) el.style.display='none';}
function syncGatePlayLabel(){const g=$('gate-play'); if(g&&$('play')) g.textContent=$('play').textContent;}
function ensureGateChrome(){
  let el=$('gate-chrome');
  if(!el){ el=document.createElement('div'); el.id='gate-chrome'; document.body.appendChild(el); }
  const mode=gateModeFromHash();
  const interp=window.__FLOOR_INTERPRETATION||'year';
  el.innerHTML='<div class="gate-modes" role="radiogroup" aria-label="Mode d’ouverture">'
    +'<button type="button" data-gate-mode="libre"'+(mode==='libre'?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>Libre</button>'
    +'<button type="button" data-gate-mode="fourier"'+(mode==='fourier'?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>Fourier</button>'
    +'</div>'
    +'<button type="button" id="gate-play">'+(($('play')&&$('play').textContent)||'▶ Jouer')+'</button>'
    +'<span class="gate-interp">'+(interp==='year'?'année':'T0→T1')+'</span>';
  el.style.display='flex';
  el.querySelectorAll('[data-gate-mode]').forEach(btn=>{
    btn.addEventListener('click',()=>setGateMode(btn.getAttribute('data-gate-mode')));
  });
  const gp=$('gate-play');
  if(gp) gp.onclick=()=>{ if(timer){ stopPlay(); draw(); syncGatePlayLabel(); return; } startManifestWave(); };
}
function startManifestWave(){
  window.__WAVE=true;
  window.__WAVE_RESTORE=window.__FLOOR_INTERPRETATION||'year';
  setFloorInterpretation('twopass');
  startPlay(S0);
  syncGatePlayLabel();
}
function finishManifestWave(){
  if(!window.__WAVE) return;
  window.__WAVE=false;
  const back=window.__WAVE_RESTORE||'year';
  window.__WAVE_RESTORE=null;
  setFloorInterpretation(back);
  try{ if($('c')&&$('e')) $('c').value=$('e').value; }catch(e){}
  progress=0;
  try{ ensureGateChrome(); }catch(e){}
}
window.startManifestWave=startManifestWave;
window.finishManifestWave=finishManifestWave;
window.ensureGateChrome=ensureGateChrome;
window.hideGateChrome=hideGateChrome;
window.syncGatePlayLabel=syncGatePlayLabel;
window.coherenceVerdict=coherenceVerdict;

/* Opening view: World, with the five macro-zones around it. Cardinal floors stay on #/floor/… */
var DEFAULT_FLOOR='#/world';
var HUB_ZONES=[
  {id:'NA', name:'Amérique du Nord', key:'SPX', mic:'XNYS', floor:'#/floor/AMF/index/SPX/year', color:'#6fa8ff'},
  {id:'EUR', name:'Europe', key:'SX5E', mic:'XETR', floor:'#/floor/EUF/index/SX5E/year', color:'#e6c35c'},
  {id:'APAC', name:'Asie-Pacifique', key:'N225', mic:'XTKS', floor:'#/floor/ASF/index/N225/year', color:'#4fd1c5'},
  {id:'MEA', name:'Moyen-Orient et Afrique', key:'TASI', mic:'XSAU', floor:'#/floor/ASF/index/TASI/year', color:'#ff9f5a'},
  {id:'LATAM', name:'Amérique latine', key:'IBOV', mic:'XB3', floor:'#/floor/AMF/index/IBOV/year', color:'#b48cff'}
];

/* v20.34 — World floor: one Class 4 (Z0 = mean of every real world-index constituent)
   surrounded by the five core zones. Membership is um_zones on the horizontal collapse
   of min-max normalised (log-return, vol20). No price is invented. A zone with no
   constituent is [INCOMPLET] and is not given a position. */
const WORLD_ZONE_NAMES=['Omega','\u03c6\u2212','Sigma','\u03c6+','Alpha'];
const WORLD_ZONE_COLOR={'Omega':'#6fa8ff','\u03c6\u2212':'#4fd1c5','Sigma':'#e8c872','\u03c6+':'#ff9f5a','Alpha':'#b48cff'};
const WORLD_ZONE_Q=[-0.8416212335729143,-0.2533471031357997,0.2533471031357997,0.8416212335729143];
function worldMarketKeys(){
  const keys=new Set(typeof worldIndexKeys==='function'?worldIndexKeys():[]);
  ['NDX','SPX'].forEach(k=>{ if(DATA[k]&&DATA[k].objs&&DATA[k].objs.length) keys.add(k); });
  ['ALL','UNIVERSE','ZONES','WZONES'].forEach(k=>keys.delete(k));
  return [...keys];
}
function umZoneIndex(x,mu,sd){
  let z=1;
  for(let k=0;k<4;k++) if(x>=mu+WORLD_ZONE_Q[k]*sd) z=k+2;
  return z;
}

/* v20.35 — one core zone cut (um_zones) for World and every index floor.
   Copies only: source sector names on DATA stay untouched. No price is invented. */
function coreZoneCopies(list){
  const scored=[]; let incomplete=0;
  (list||[]).forEach(src=>{
    if(!src||!src.c){ incomplete++; return; }
    const o=Object.assign({}, src);
    if(!(o.c0>0)){ for(const x of o.c){ if(x!=null&&x>0){ o.c0=x; break; } } }
    if(!(o.c0>0)){ incomplete++; return; }
    const n=o.c.length, r=new Array(n).fill(null), vol=new Array(n).fill(null);
    for(let i=1;i<n;i++) if(o.c[i]!=null&&o.c[i-1]!=null&&o.c[i]>0&&o.c[i-1]>0) r[i]=Math.log(o.c[i]/o.c[i-1]);
    for(let i=0;i<n;i++){
      const w=[]; for(let j=Math.max(1,i-19);j<=i;j++) if(r[j]!=null) w.push(r[j]);
      if(w.length>=2){ const m=w.reduce((a,b)=>a+b,0)/w.length; vol[i]=Math.sqrt(w.reduce((a,b)=>a+(b-m)*(b-m),0)/(w.length-1)*252); }
    }
    let at=-1;
    for(let i=n-1;i>=0;i--){ if(o.c[i]!=null&&o.c[i]>0&&vol[i]!=null&&isFinite(vol[i])){ at=i; break; } }
    if(at<0){ incomplete++; return; }
    const X=Math.log(o.c[at]/o.c0), Y=vol[at];
    if(!isFinite(X)||!isFinite(Y)){ incomplete++; return; }
    scored.push({o,X,Y});
  });
  const minmax=a=>{ if(!a.length) return []; const lo=Math.min.apply(null,a), hi=Math.max.apply(null,a); return a.map(x=>hi>lo?2*(x-lo)/(hi-lo)-1:0); };
  let zones=scored.map(()=>null);
  if(scored.length>=2){
    const xn=minmax(scored.map(it=>it.X)), yn=minmax(scored.map(it=>it.Y));
    const h=xn.map((x,i)=>Math.sqrt((x*x+yn[i]*yn[i])/2));
    const mu=h.reduce((a,b)=>a+b,0)/h.length;
    const sd=Math.sqrt(Math.max(h.reduce((a,b)=>a+(b-mu)*(b-mu),0)/Math.max(h.length-1,1), 1e-300));
    zones=h.map(x=>umZoneIndex(x,mu,sd));
  } else if(scored.length===1){
    zones=[3];
  }
  const buckets=WORLD_ZONE_NAMES.map(()=>[]);
  scored.forEach((it,i)=>{ const z=zones[i]; if(z>=1&&z<=5) buckets[z-1].push(it.o); });
  const objs=[];
  const report=WORLD_ZONE_NAMES.map((name,zi)=>{
    const mem=buckets[zi];
    SECT[name]=WORLD_ZONE_COLOR[name];
    if(!mem.length) return {name:name,n:0,incomplet:true};
    mem.forEach(o=>{ o.s=name; o.i=name; objs.push(o); });
    return {name:name,n:mem.length,incomplet:false};
  });
  return {objs, report, incomplete};
}
function indexHasPrices(id){
  const d=id&&DATA[id];
  return !!(d&&d.objs&&d.objs.some(o=>o&&o.c&&o.c.some(x=>x!=null&&x>0)));
}
function hideIndexGap(){
  const el=$('index-gap'); if(el) el.hidden=true;
  document.body.classList.remove('mode-index-gap');
}
function showIndexGap(title){
  window.__CORE_ZONES=false;
  window.__WAVE=false;
  try{ hideGateChrome(); }catch(e){}
  try{ hideC4Panel(); }catch(e){}
  let el=$('index-gap');
  if(!el){ el=document.createElement('div'); el.id='index-gap'; el.className='index-gap'; document.body.appendChild(el); }
  el.innerHTML='<h1>'+title+'</h1><p>[INCOMPLET — données manquantes]</p><p><button type="button" class="retour-hub" data-route="#/fields/finance">← Finance</button></p>';
  el.hidden=false;
  document.body.classList.add('mode-index-gap');
}
function mountIndexCoreZones(route){
  hideIndexGap();
  window.__CORE_ZONES=true;
  window.__WORLD_GAUSS=false;
  const title=(DATA[route.index]&&DATA[route.index].meta&&DATA[route.index].meta.name)||INDEX_GROUP_NAME[route.index]||route.index;
  window.__FLOOR_TITLE=title;
  document.body.classList.add('mode-manifest');
  const zoned=coreZoneCopies(ds.objs||[]);
  if(!zoned.objs.length){ showIndexGap(title); return; }
  ds.objs=zoned.objs;
  EMPTY=false;
  window.__WORLD_ZONES=zoned.report;
  window.__WORLD_INCOMPLETE=zoned.incomplete;
  $('lvl').value='s';
  base();
  const n=ds.dates.length;
  if($('s')) $('s').value=0;
  if($('e')) $('e').value=Math.max(0,n-1);
  if($('c')) $('c').value=0;
  window_();
  groups();
  let s0=0;
  if(GROUPS.length){
    for(let i=0;i<n;i++){ if(GROUPS.every(g=>P2(g,i))){ s0=i; break; } }
  }
  if($('s')) $('s').value=s0;
  if($('e')) $('e').value=Math.max(0,n-1);
  if($('c')) $('c').value=s0;
  window_(); computeZ0();
  GROUPS.forEach(g=>{ if(SECT[g.name]) g.col=SECT[g.name]; });
  try{ refitWorldGaussBounds(); }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ ensureGateChrome(); }catch(e){}
  try{ fit(); draw(); }catch(e){}
  try{ startManifestWave(); }catch(e){}
}
/* Dow Jones membership: Wikipedia "List of Dow Jones Industrial Average companies" (retrieved 2026-11-12).
   Prices are the embedded SPX/NDX series for those tickers. Nothing is invented. */
const DJIA_TICKERS=['MMM','GOOGL','AXP','AMGN','AMZN','AAPL','BA','CAT','CVX','CSCO','KO','DIS','GS','HD','HON','IBM','JNJ','JPM','MCD','MRK','MSFT','NKE','NVDA','PG','CRM','SHW','TRV','UNH','V','WMT'];
function ensureDJIA(){
  if(DATA.DJIA&&DATA.DJIA.objs&&DATA.DJIA.objs.length) return DATA.DJIA;
  const dates=(DATA.SPX&&DATA.SPX.dates)?DATA.SPX.dates.slice():[];
  const pool=[];
  ['SPX','NDX'].forEach(k=>{ const d=DATA[k]; if(d&&d.objs) d.objs.forEach(o=>{ if(o&&o.t) pool.push({d,o}); }); });
  const objs=[]; const missing=[];
  DJIA_TICKERS.forEach(t=>{
    const hit=pool.find(p=>p.o.t===t);
    if(!hit||!dates.length){ missing.push(t); return; }
    const imap=new Map((hit.d.dates||[]).map((d,i)=>[d,i]));
    const o=hit.o;
    const c=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.c)?o.c[i]:null; return (x!=null&&x>0)?x:null; });
    const v=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.v)?o.v[i]:null; return (x!=null&&isFinite(x))?x:null; });
    objs.push({t:o.t,n:o.n,s:o.s,i:o.i,f:o.f||'XNYS',c0:o.c0,c0_date:o.c0_date,c,v});
  });
  DATA.DJIA={dates,objs,meta:{id:'DJIA',name:'Dow Jones (DJIA)',floor:'AMF',T0:dates[0]||null,T1:dates.length?dates[dates.length-1]:null,dates:dates.length?[dates[0]]:[],n_with_prices:objs.filter(o=>o.c&&o.c.some(x=>x!=null&&x>0)).length,missing}};
  return DATA.DJIA;
}
try{ ensureDJIA(); }catch(e){ console.warn('DJIA', e); }
const FINANCE_INDEX_FLOORS=[
  {id:'DJIA',name:'Dow Jones (DJIA)',route:'#/floor/AMF/index/DJIA'},
  {id:'N225',name:'Nikkei 225',route:'#/floor/ASF/index/N225'},
  {id:'HSI',name:'Hang Seng',route:'#/floor/ASF/index/HSI'},
  {id:'FTSE100',name:'FTSE 100',route:'#/floor/EUF/index/FTSE100'},
  {id:'DAX',name:'DAX',route:'#/floor/EUF/index/DAX'},
  {id:'CAC40',name:'CAC 40',route:'#/floor/EUF/index/CAC40'},
  {id:'SX5E',name:'Euro Stoxx 50',route:'#/floor/EUF/index/SX5E'},
  {id:'ASX200',name:'ASX 200',route:'#/floor/OCF/index/ASX200'},
  {id:'IBOV',name:'Ibovespa',route:'#/floor/AMF/index/IBOV'},
  {id:'STI',name:'Straits Times',route:'#/floor/ASF/index/STI'},
  {id:'TASI',name:'Tadawul (TASI)',route:'#/floor/MEF/index/TASI'},
  {id:'JSE40',name:'FTSE/JSE Top 40',route:'#/floor/AFF/index/JSE40'},
  {id:'WIG20',name:'WIG20',route:'#/floor/EUF/index/WIG20'},
  {id:'SET50',name:'SET 50',route:'#/floor/ASF/index/SET50'},
  {id:'TW50',name:'FTSE TWSE Taiwan 50',route:'#/floor/ASF/index/TW50'},
  {id:'NZX50',name:'S&P/NZX 50',route:'#/floor/ASF/index/NZX50'},
  {id:'COLCAP',name:'COLCAP',route:'#/floor/AMF/index/COLCAP'},
  {id:'MERVAL',name:'S&P Merval',route:'#/floor/AMF/index/MERVAL'},
  {id:'TA35',name:'TA-35',route:'#/floor/MEF/index/TA35'},
  {id:'QE',name:'QE Index',route:'#/floor/MEF/index/QE'},
  {id:'EGX30',name:'EGX 30',route:'#/floor/MEF/index/EGX30'},
  {id:'BIST30',name:'BIST 30',route:'#/floor/MEF/index/BIST30'},
  {id:'IPSA',name:'IPSA',route:'#/floor/AMF/index/IPSA'},
  {id:'KLCI',name:'FTSE Bursa Malaysia KLCI',route:'#/floor/ASF/index/KLCI'},
  {id:'BEL20',name:'BEL 20',route:'#/floor/EUF/index/BEL20'},
  {id:'OBX',name:'OBX',route:'#/floor/EUF/index/OBX'},
  {id:'SPX',name:'S&P 500',route:'#/floor/AMF/index/SPX'},
  {id:'NDX',name:'Nasdaq-100',route:'#/floor/AMF/index/NDX'}
];
function indexFloorCards(){
  try{ ensureDJIA(); }catch(e){}
  return FINANCE_INDEX_FLOORS.map(ix=>{
    const live=indexHasPrices(ix.id);
    const roster=!live?ensureRosterIndex(ix.id):null;
    const d=DATA[ix.id];
    const n=live?((d.meta&&d.meta.n_with_prices)||d.objs.filter(o=>o.c&&o.c.some(x=>x!=null&&x>0)).length):(roster&&roster.objs?roster.objs.length:0);
    return `<button type="button" class="field-door ${live?'live set-card':'empty'}" data-id="SET-${ix.id}" data-route="${ix.route}" aria-label="${ix.name}">
        <span class="fd-kicker">Étage · indice</span>
        <span class="fd-name">${ix.name}</span>
        <span class="fd-blurb">${live?(n+' titres Classe 1 · manifestation T0/T1'):(n?(n+' constituants · prix [INCOMPLET]'):'[INCOMPLET — données manquantes]')}</span>
        <span class="fd-badge">${live?'ACTIVE':'[INCOMPLET]'}</span>
        <span class="fd-go">→</span>
      </button>`;
  }).join('');
}
const REGION_SPECS=[
  {id:'AMF', name:'Amériques', color:'#6fa8ff', mic:'XNYS'},
  {id:'EUF', name:'Europe', color:'#e6c35c', mic:'XETR'},
  {id:'ASF', name:'Asie-Pacifique', color:'#4fd1c5', mic:'XTKS'},
  {id:'OCF', name:'Océanie', color:'#b48cff', mic:'XASX'},
  {id:'AFF', name:'Afrique', color:'#9ad66b', mic:'XJSE'},
  {id:'MEF', name:'Moyen-Orient', color:'#ff9f5a', mic:'XSAU'}
];
function regionSpec(id){ return REGION_SPECS.find(s=>s.id===id)||null; }
function indicesInRegion(sys){ return FINANCE_INDEX_FLOORS.filter(ix=>ix.route.indexOf('#/floor/'+sys+'/index/')===0); }
function meanCloseSeries(src, dates){
  if(!src||!src.objs||!src.dates) return null;
  const imap=new Map(src.dates.map((d,i)=>[d,i]));
  const members=[];
  src.objs.forEach(o=>{
    if(!o||!o.c) return;
    let c0=o.c0;
    if(!(c0>0)){ for(const x of o.c){ if(x!=null&&x>0){ c0=x; break; } } }
    if(!(c0>0)) return;
    members.push({o,c0});
  });
  if(!members.length) return null;
  const c=dates.map(d=>{
    const i=imap.get(d); if(i==null) return null;
    let s=0,n=0;
    for(const m of members){ const px=m.o.c[i]; if(px!=null&&px>0){ s+=Math.log(px/m.c0); n++; } }
    return n?Math.exp(s/n):null;
  });
  const v=dates.map(d=>{
    const i=imap.get(d); if(i==null) return null;
    let s=0,n=0;
    for(const m of members){ const vv=m.o.v&&m.o.v[i]; if(vv!=null&&isFinite(vv)&&vv>0){ s+=vv; n++; } }
    return n?s:null;
  });
  const mic=(src.objs.find(o=>o&&o.f)||{}).f||null;
  return {c,v,mic,n:members.length};
}
function appendRegionDoors(dates, objs){
  try{ ensureDJIA(); }catch(e){}
  REGION_SPECS.forEach(spec=>{
    const parts=[];
    indicesInRegion(spec.id).forEach(ix=>{ const ser=meanCloseSeries(DATA[ix.id], dates); if(ser) parts.push(ser); });
    if(!parts.length) return;
    const c=dates.map((_,i)=>{ let s=0,n=0; parts.forEach(p=>{ if(p.c[i]!=null&&p.c[i]>0){ s+=Math.log(p.c[i]); n++; } }); return n?Math.exp(s/n):null; });
    const v=dates.map((_,i)=>{ let s=0,n=0; parts.forEach(p=>{ if(p.v[i]!=null&&p.v[i]>0){ s+=p.v[i]; n++; } }); return n?s:null; });
    SECT[spec.name]=spec.color;
    objs.push({t:spec.id,n:spec.name,s:spec.name,i:spec.name,f:spec.mic,c,v,c0:1,hubFloor:'#/floor/'+spec.id});
  });
}
function meMics(){
  const blk=((window.WORLD_FLOORS&&WORLD_FLOORS.branches)||{}).ME||{};
  const set=new Set((blk.exchanges||[]).map(ex=>ex.mic).filter(Boolean));
  set.add('XSAU');
  return set;
}
function exchangesInRegion(sys){
  if(sys==='MEF') return [...meMics()];
  const me=meMics();
  return Object.keys(FLOORS).filter(m=>FLOORS[m].ct===sys && !me.has(m));
}
function marketSources(){
  return Object.keys(DATA).filter(k=>{
    if(['ALL','UNIVERSE','ZONES','WZONES'].indexOf(k)>=0) return false;
    if(/^(EX-|REG-|HEMI-)/.test(k)) return false;
    const d=DATA[k];
    return !!(d&&d.objs&&d.dates&&d.objs.length);
  }).map(k=>DATA[k]);
}
function ensureExchangeSeries(mic){
  const id='EX-'+mic;
  if(DATA[id]&&DATA[id].objs) return DATA[id].objs.length?DATA[id]:null;
  const sources=marketSources().filter(src=>src.objs.some(o=>o&&o.f===mic&&o.c&&o.c.some(x=>x!=null&&x>0)));
  if(!sources.length){ DATA[id]={dates:[],objs:[],meta:{id,name:mic,keepAll:true,n_with_prices:0}}; return null; }
  const dateSet=new Set();
  sources.forEach(s=>s.dates.forEach(d=>dateSet.add(d)));
  const dates=[...dateSet].sort();
  const seen=new Set();
  const objs=[];
  sources.forEach(src=>{
    const imap=new Map(src.dates.map((d,i)=>[d,i]));
    src.objs.forEach(o=>{
      if(!o||o.f!==mic||!o.t||seen.has(o.t)) return;
      if(!(o.c&&o.c.some(x=>x!=null&&x>0))) return;
      seen.add(o.t);
      const c=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.c)?o.c[i]:null; return (x!=null&&x>0)?x:null; });
      const v=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.v)?o.v[i]:null; return (x!=null&&isFinite(x))?x:null; });
      let c0=o.c0; if(!(c0>0)){ for(const x of o.c){ if(x!=null&&x>0){ c0=x; break; } } }
      objs.push({t:o.t,n:o.n||o.t,s:o.s||'',i:o.i||'',f:mic,c,v,c0});
    });
  });
  const f=FLOORS[mic]||{};
  DATA[id]={dates,objs,meta:{id,name:(f.n||mic)+' ('+mic+')',floor:f.ct||null,mic,keepAll:true,n_with_prices:objs.length}};
  return objs.length?DATA[id]:null;
}
function worldIndexRecord(id){
  const branches=(window.WORLD_FLOORS&&WORLD_FLOORS.branches)||{};
  for(const b of Object.values(branches)){
    const ix=(b.indices||[]).find(i=>i.id===id);
    if(ix) return ix;
  }
  return null;
}
function ensureRosterIndex(id){
  if(indexHasPrices(id)) return DATA[id];
  if(DATA[id]&&DATA[id].meta&&DATA[id].meta.price==='[INCOMPLET]') return DATA[id];
  const ix=worldIndexRecord(id);
  if(!ix) return null;
  const floor=ix.floor||(ix.branch==='AFR'?'AFF':ix.branch==='ME'?'MEF':ix.branch==='EUR'?'EUF':ix.branch==='AMER'?'AMF':ix.branch==='APAC'?'ASF':'AFF');
  const link=(ix.links&&((ix.links.constituents_source&&ix.links.constituents_source.url)||(ix.links.factsheet&&ix.links.factsheet.url)))||'';
  const objs=(ix.constituents||[]).map(c=>{
    const name=c.name||c.symbol||'[INCOMPLET]';
    const t=c.symbol||name;
    return {t,n:name,s:ix.name,i:ix.name,f:ix.mic||null,c:[],v:[],c0:null};
  });
  DATA[id]={dates:[],objs,meta:{id,name:ix.name,floor,keepAll:true,n_with_prices:0,price:'[INCOMPLET]',link}};
  return DATA[id];
}
function drawRoster(){
  const spec=window.__ROSTER||{title:'',items:[]};
  const items=spec.items||[];
  ctx.fillStyle='#07080c'; ctx.fillRect(0,0,W,H);
  HIT={c1:[],c2:[],c4:null,c4n:[],z0:null,gr:8,c:0,lib:[],libR:null};
  window.HIT=HIT;
  const cx=L+(W-L-R)*0.5, cy=H*0.48;
  ctx.textAlign='center';
  ctx.fillStyle='#e8c872'; ctx.font='700 15px system-ui';
  ctx.fillText(spec.title||'', cx, 36);
  ctx.fillStyle='#c6b37a'; ctx.font='12px system-ui';
  const note=spec.note||'[INCOMPLET] prix T0/T1';
  ctx.fillText(note.length>110?note.slice(0,108)+'…':note, cx, 56);
  ctx.beginPath(); ctx.arc(cx,cy,26,0,7); ctx.fillStyle='#e8c872'; ctx.fill();
  ctx.fillStyle='#07080c'; ctx.font='700 11px system-ui';
  ctx.fillText('Classe 4', cx, cy+4);
  HIT.c4={px:cx,py:cy,r:30,p:[0,0]};
  const n=Math.max(items.length,1);
  const rad=Math.max(70, Math.min(W-L-R, H)*0.30);
  items.forEach((it,i)=>{
    const ang=-Math.PI/2 + i*2*Math.PI/n;
    const px=cx+Math.cos(ang)*rad, py=cy+Math.sin(ang)*rad*0.86;
    const rr=it.kind==='c2'?13:7;
    ctx.beginPath(); ctx.arc(px,py,rr,0,7); ctx.fillStyle=it.color||'#9ad66b'; ctx.fill();
    ctx.fillStyle='#d5dbe6'; ctx.font='11px system-ui';
    const lab=String(it.label||'');
    ctx.fillText(lab.length>22?lab.slice(0,20)+'…':lab, px, py-rr-6);
    if(it.kind==='c2') HIT.c2.push({gi:i,px,py,r:rr+3,p:[0,0]});
    else HIT.c1.push({k:i,px,py,r:rr+3,p:[0,0]});
    if(GROUPS[i]){ GROUPS[i]._px=px; GROUPS[i]._py=py; GROUPS[i]._r=rr+2; }
  });
  ctx.textAlign='left';
  window.__SHORT_GHOST={mode:'year',n:0,nC2:0,nC1:items.length,nC4:0,nC4n:0,volsys:0};
  try{ if($('d')) $('d').textContent='[INCOMPLET] prix T0/T1'; }catch(e){}
}
window.drawRoster=drawRoster;
function mountRoster(spec){
  hideIndexGap();
  window.__DRAW_OVERRIDE='roster';
  window.__ROSTER=spec;
  window.__CORE_ZONES=false;
  window.__REGION_DOORS=false;
  window.__WORLD_GAUSS=false;
  window.__WAVE=false;
  document.body.classList.add('mode-roster','mode-manifest');
  GROUPS=(spec.items||[]).map(it=>({name:it.label,mem:[],hubFloor:it.hubFloor||null,col:it.color||'#e8c872',_r:it.kind==='c2'?16:8}));
  EMPTY=false;
  try{ hideGateChrome(); }catch(e){}
  try{ hideC4Panel(); }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ draw(); }catch(e){ console.warn('roster', e); }
}
function mountIndexRoster(route){
  const d=DATA[route.index];
  const items=((d&&d.objs)||[]).map(o=>({label:(o.n&&o.n!==o.t)?o.n:o.t, kind:'c1', color:'#e6c35c'}));
  const link=d&&d.meta&&d.meta.link;
  mountRoster({
    title:(d&&d.meta&&d.meta.name)||route.index,
    note:(items.length?items.length+' constituants réels':'Constituants [INCOMPLET]')+' · prix T0/T1 [INCOMPLET]'+(link?' · source enregistrée':''),
    items:items.length?items:[{label:'[INCOMPLET]', kind:'c2', color:'#8a91a0'}]
  });
}
function mountRegionRoster(route){
  const spec=regionSpec(route.sys);
  if(!spec) return;
  const items=[];
  indicesInRegion(spec.id).forEach(ix=>items.push({label:ix.name, hubFloor:ix.route, color:spec.color, kind:'c2'}));
  exchangesInRegion(spec.id).forEach(mic=>{
    const f=FLOORS[mic]||{};
    items.push({label:f.n||mic, hubFloor:'#/floor/'+spec.id+'/ex/'+mic, color:spec.color, kind:'c2'});
  });
  document.body.classList.add('mode-region');
  mountRoster({title:spec.name, note:'Prix T0/T1 [INCOMPLET] · objets réels déjà nommés sur disque', items});
}
function mountExchangeFloor(route){
  const mic=route.ex;
  const ser=ensureExchangeSeries(mic);
  if(ser&&ser.objs&&ser.objs.length){
    const id=ser.meta.id;
    if($('ds')&&![...$('ds').options].some(o=>o.value===id)){
      const op=document.createElement('option'); op.value=id; op.textContent=ser.meta.name; $('ds').appendChild(op);
    }
    $('sys').value=route.sys;
    $('ds').value=id;
    $('lvl').value='s';
    if($('col')) $('col').value='seance';
    stopPlay(); clearSel();
    setDS();
    mountIndexCoreZones({index:id, sys:route.sys});
    return;
  }
  const f=FLOORS[mic]||{};
  const ix=mic==='XJSE'?ensureRosterIndex('JSE40'):null;
  const named=(ix&&ix.objs)||[];
  if(named.length){
    mountRoster({
      title:f.n||mic,
      note:named.length+' constituants (FTSE/JSE Top 40) · prix T0/T1 [INCOMPLET] · le reste de la place est [INCOMPLET]',
      items:named.map(o=>({label:o.n||o.t, kind:'c1', color:'#9ad66b'}))
    });
    return;
  }
  mountRoster({
    title:f.n||mic,
    note:'Constituants [INCOMPLET] · prix T0/T1 [INCOMPLET]'+(f.city?(' · '+f.city):''),
    items:[{label:f.n||mic, kind:'c2', color:'#8a91a0'}]
  });
}
function hemiPoles(kind){
  return kind==='EWF'
    ?[{id:'W',name:'Hémisphère Ouest',color:'#b48cff'},{id:'E',name:'Hémisphère Est',color:'#4fd1c5'}]
    :[{id:'N',name:'Hémisphère Nord',color:'#6fa8ff'},{id:'S',name:'Hémisphère Sud',color:'#ff9f5a'}];
}
function poleOfMic(mic, kind){
  const f=FLOORS[mic]; if(!f||f.lat==null||f.lon==null) return null;
  if(kind==='EWF') return f.lon>=0?'E':'W';
  return f.lat>=0?'N':'S';
}
function ensureHemiMembers(kind, pole){
  const id='HEMI-'+kind+'-'+pole;
  if(DATA[id]&&DATA[id].objs) return DATA[id];
  const sources=marketSources();
  const dateSet=new Set();
  sources.forEach(s=>s.dates.forEach(d=>dateSet.add(d)));
  const dates=[...dateSet].sort();
  const seen=new Set();
  const objs=[];
  sources.forEach(src=>{
    const imap=new Map(src.dates.map((d,i)=>[d,i]));
    src.objs.forEach(o=>{
      if(!o||!o.t||!o.f||seen.has(o.t+'|'+o.f)) return;
      if(poleOfMic(o.f, kind)!==pole) return;
      if(!(o.c&&o.c.some(x=>x!=null&&x>0))) return;
      seen.add(o.t+'|'+o.f);
      const c=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.c)?o.c[i]:null; return (x!=null&&x>0)?x:null; });
      const v=dates.map(d=>{ const i=imap.get(d); const x=(i!=null&&o.v)?o.v[i]:null; return (x!=null&&isFinite(x))?x:null; });
      let c0=o.c0; if(!(c0>0)){ for(const x of o.c){ if(x!=null&&x>0){ c0=x; break; } } }
      objs.push({t:o.t,n:o.n||o.t,s:o.s||pole,i:o.i||pole,f:o.f,c,v,c0});
    });
  });
  const name=(hemiPoles(kind).find(p=>p.id===pole)||{}).name||pole;
  DATA[id]={dates,objs,meta:{id,name,floor:kind,keepAll:true,n_with_prices:objs.length}};
  return DATA[id];
}
function mountHemisphereDoors(route){
  hideIndexGap();
  const kind=route.sys;
  const poles=hemiPoles(kind);
  const dateSet=new Set();
  poles.forEach(p=>{ const d=ensureHemiMembers(kind,p.id); if(d&&d.dates) d.dates.forEach(x=>dateSet.add(x)); });
  const dates=[...dateSet].sort();
  const doorObjs=[];
  poles.forEach(p=>{
    const src=DATA['HEMI-'+kind+'-'+p.id];
    const ser=meanCloseSeries(src, dates);
    if(!ser) return;
    SECT[p.name]=p.color;
    doorObjs.push({t:p.id,n:p.name,s:p.name,i:p.name,f:(FLOORS[p.id]?p.id:'XNYS'),c:ser.c,v:ser.v,c0:1,hubFloor:'#/floor/'+kind+'/index/'+p.id});
  });
  const id='REG-'+kind;
  DATA[id]={dates,objs:doorObjs,meta:{id,name:kind==='EWF'?'Est-Ouest':'Nord-Sud',floor:kind,keepAll:true}};
  if($('ds')&&![...$('ds').options].some(o=>o.value===id)){
    const op=document.createElement('option'); op.value=id; op.textContent=DATA[id].meta.name; $('ds').appendChild(op);
  }
  $('sys').value=kind;
  $('ds').value=id;
  $('lvl').value='s';
  if($('col')) $('col').value='seance';
  window.__REGION_DOORS=true;
  window.__CORE_ZONES=false;
  window.__WORLD_GAUSS=false;
  window.__FLOOR_TITLE=DATA[id].meta.name;
  document.body.classList.add('mode-region','mode-manifest');
  stopPlay(); clearSel();
  setDS();
  const byName={};
  doorObjs.forEach(o=>{ byName[o.s]=o.hubFloor; });
  GROUPS.forEach(g=>{ g.hubFloor=byName[g.name]||null; if(SECT[g.name]) g.col=SECT[g.name]; });
  const n=ds.dates.length;
  let s0=0;
  if(GROUPS.length){ for(let i=0;i<n;i++){ if(GROUPS.every(g=>P2(g,i))){ s0=i; break; } } }
  if($('s')) $('s').value=s0;
  if($('e')) $('e').value=Math.max(0,n-1);
  if($('c')) $('c').value=s0;
  window_(); computeZ0();
  try{ fitGroupsOnScreen(); }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ ensureGateChrome(); }catch(e){}
  try{ draw(); }catch(e){}
  try{ startManifestWave(); }catch(e){}
}
function mountHemisphereMembers(route){
  const built=ensureHemiMembers(route.sys, route.index);
  const id=built.meta.id;
  if($('ds')&&![...$('ds').options].some(o=>o.value===id)){
    const op=document.createElement('option'); op.value=id; op.textContent=built.meta.name; $('ds').appendChild(op);
  }
  $('sys').value=route.sys;
  $('ds').value=id;
  $('lvl').value='s';
  stopPlay(); clearSel();
  setDS();
  mountIndexCoreZones({index:id, sys:route.sys});
}
function regionHasPlottedDoors(sys){
  if(indicesInRegion(sys).some(ix=>indexHasPrices(ix.id))) return true;
  return exchangesInRegion(sys).some(mic=>{ const s=ensureExchangeSeries(mic); return !!(s&&s.objs&&s.objs.length); });
}
function mountRegionDoors(route){
  hideIndexGap();
  const spec=regionSpec(route.sys);
  if(!spec) return;
  window.__REGION_DOORS=true;
  window.__CORE_ZONES=false;
  window.__WORLD_GAUSS=false;
  window.__WORLD_ZONES=null;
  window.__FLOOR_TITLE=spec.name;
  document.body.classList.add('mode-region','mode-manifest');
  try{ ensureDJIA(); }catch(e){}
  const dateSet=new Set();
  indicesInRegion(spec.id).forEach(ix=>{ const d=DATA[ix.id]; if(d&&d.dates) d.dates.forEach(x=>dateSet.add(x)); });
  const dates=[...dateSet].sort();
  const doorObjs=[];
  indicesInRegion(spec.id).forEach(ix=>{
    const ser=meanCloseSeries(DATA[ix.id], dates);
    if(!ser) return;
    SECT[ix.name]=spec.color;
    doorObjs.push({t:ix.id,n:ix.name,s:ix.name,i:ix.name,f:ser.mic||spec.mic,c:ser.c,v:ser.v,c0:1,hubFloor:ix.route});
  });
  exchangesInRegion(spec.id).forEach(mic=>{
    const src=ensureExchangeSeries(mic);
    const ser=src?meanCloseSeries(src, dates):null;
    if(!ser) return;
    const f=FLOORS[mic]||{};
    const name=f.n||mic;
    SECT[name]=spec.color;
    doorObjs.push({t:mic,n:name,s:name,i:name,f:mic,c:ser.c,v:ser.v,c0:1,hubFloor:'#/floor/'+spec.id+'/ex/'+mic});
  });
  const id='REG-'+spec.id;
  DATA[id]={dates,objs:doorObjs,meta:{id,name:spec.name,floor:spec.id,keepAll:true,T0:dates[0]||null,T1:dates.length?dates[dates.length-1]:null,dates:dates.length?[dates[0]]:[]}};
  if($('ds')&&![...$('ds').options].some(o=>o.value===id)){
    const op=document.createElement('option'); op.value=id; op.textContent=spec.name; $('ds').appendChild(op);
  }
  $('sys').value=spec.id;
  $('ds').value=id;
  $('lvl').value='s';
  if($('col')) $('col').value='seance';
  const idxbar=$('idxbar'); if(idxbar) idxbar.style.display='none';
  stopPlay(); clearSel();
  setDS();
  const byName={};
  doorObjs.forEach(o=>{ byName[o.s]=o.hubFloor; });
  GROUPS.forEach(g=>{ g.hubFloor=byName[g.name]||null; if(SECT[g.name]) g.col=SECT[g.name]; });
  const n=ds.dates.length;
  let s0=0;
  if(GROUPS.length){ for(let i=0;i<n;i++){ if(GROUPS.every(g=>P2(g,i))){ s0=i; break; } } }
  if($('s')) $('s').value=s0;
  if($('e')) $('e').value=Math.max(0,n-1);
  if($('c')) $('c').value=s0;
  window_(); computeZ0();
  try{ fitGroupsOnScreen(); }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ ensureGateChrome(); }catch(e){}
  try{ draw(); }catch(e){}
  try{ startManifestWave(); }catch(e){}
}

function buildWorldGaussZones(){
  if(DATA.WZONES&&DATA.WZONES.objs&&DATA.WZONES.objs.length) return DATA.WZONES;
  const keys=worldMarketKeys();
  const dateSet=new Set();
  keys.forEach(k=>((DATA[k]&&DATA[k].dates)||[]).forEach(d=>dateSet.add(d)));
  const dates=[...dateSet].sort();
  const seen=new Set();
  const raw=[];
  keys.forEach(k=>{
    const src=DATA[k]; if(!src||!src.objs) return;
    const imap=new Map((src.dates||[]).map((d,i)=>[d,i]));
    src.objs.forEach(o=>{
      const id=(o.t||'')+'|'+(o.f||'');
      if(!id||id==='|'||seen.has(id)) return;
      if(!(o.c0>0)||!o.c) return;
      seen.add(id);
      const c=dates.map(d=>{const i=imap.get(d);const x=(i!=null&&o.c[i]!=null)?o.c[i]:null;return (x!=null&&x>0)?x:null;});
      const v=dates.map(d=>{const i=imap.get(d);return (i!=null&&o.v&&o.v[i]!=null&&isFinite(o.v[i]))?o.v[i]:null;});
      raw.push({t:o.t,n:o.n,f:o.f,c0:o.c0,c,v});
    });
  });
  const zoned=coreZoneCopies(raw);
  window.__WORLD_ZONES=zoned.report;
  window.__WORLD_INCOMPLETE=zoned.incomplete;
  const objs=zoned.objs;
  const incomplete=zoned.incomplete;
  const report=zoned.report;
  try{ appendRegionDoors(dates, objs); }catch(e){ console.warn('region doors', e); }
  DATA.WZONES={dates,objs,meta:{id:'WZONES',name:'World — Omega \u00b7 \u03c6\u2212 \u00b7 Sigma \u00b7 \u03c6+ \u00b7 Alpha',floor:'WF',T0:dates[0]||null,T1:dates.length?dates[dates.length-1]:null,dates:dates.length?[dates[0]]:[],n_with_prices:objs.length,incomplete:incomplete,zones:report}};
  return DATA.WZONES;
}
function refitWorldGaussBounds(){
  if(!(window.__CORE_ZONES||window.__WORLD_GAUSS||window.__REGION_DOORS)||!GROUPS||!GROUPS.length) return;
  const xs=[], ys=[];
  GROUPS.forEach(g=>{ [S0,S1].forEach(i=>{ const p=P2(g,i); if(p&&isFinite(p[0])&&isFinite(p[1])){ xs.push(p[0]); ys.push(p[1]); } }); });
  if(Z0&&Z0.a&&Z0.b){ xs.push(Z0.a[0],Z0.b[0]); ys.push(Z0.a[1],Z0.b[1]); }
  const fin=xs.filter((x,i)=>isFinite(x)&&isFinite(ys[i]));
  if(fin.length<2) return;
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
  for(let i=0;i<xs.length;i++){ if(!isFinite(xs[i])||!isFinite(ys[i])) continue; x0=Math.min(x0,xs[i]); x1=Math.max(x1,xs[i]); y0=Math.min(y0,ys[i]); y1=Math.max(y1,ys[i]); }
  const dx=Math.max(0.05,(x1-x0)*0.45), dy=Math.max(0.05,(y1-y0)*0.55);
  bx=[x0-dx,x1+dx]; by=[Math.max(0,y0-dy),y1+dy];
}

function buildWorldZones(){
  if(DATA.ZONES&&DATA.ZONES.objs&&DATA.ZONES.objs.length) return DATA.ZONES;
  const dateSet=new Set();
  const ready=[];
  HUB_ZONES.forEach(z=>{
    const src=DATA[z.key];
    if(!src||!src.objs||!src.objs.length||!src.dates) return;
    src.dates.forEach(d=>dateSet.add(d));
    ready.push({z,src});
  });
  const dates=[...dateSet].sort();
  const objs=ready.map(({z,src})=>{
    const imap=new Map(src.dates.map((d,i)=>[d,i]));
    const c=dates.map(d=>{
      const i=imap.get(d);
      if(i==null) return null;
      let s=0,n=0;
      for(const o of src.objs){
        const v=o.c&&o.c[i];
        let c0=o.c0;
        if(!(c0!=null&&isFinite(c0)&&c0>0)&&o.c){ for(const x of o.c){ if(x!=null&&isFinite(x)&&x>0){ c0=x; break; } } }
        if(v!=null&&isFinite(v)&&v>0&&c0!=null&&isFinite(c0)&&c0>0){s+=Math.log(v/c0);n++;}
      }
      return n?Math.exp(s/n):null;
    });
    const v=dates.map(d=>{
      const i=imap.get(d);
      if(i==null) return null;
      let s=0,n=0;
      for(const o of src.objs){
        const vv=o.v&&o.v[i];
        if(vv!=null&&isFinite(vv)&&vv>0){s+=vv;n++;}
      }
      return n?s:null;
    });
    SECT[z.name]=z.color;
    // Level 1 at T0 so the plotted log-return is the equal-weight mean of the cardinal's real constituent log-returns. No price is invented.
    // Volume = somme réelle des volumes constituants (aucune valeur inventée).
    return {t:z.id,n:z.name,s:z.name,i:z.name,f:z.mic,c,v,c0:1,hubFloor:z.floor,nConst:src.objs.length};
  });
  DATA.ZONES={dates,objs,meta:{id:'ZONES',name:'World',floor:'WF',T0:dates[0]||null,T1:dates.length?dates[dates.length-1]:null,dates:dates.length?[dates[0]]:[]}};
  return DATA.ZONES;
}
function mountZoneManifestation(route, preset){
  if(typeof setFloorInterpretation==='function') setFloorInterpretation((route&&route.interpretation)||'year');
  document.body.classList.remove('ui-collapsed');
  try{ hideNhlInfoChip(); }catch(e){}
  window.__DRAW_OVERRIDE=null; window.__RW_NHL_LOCK=false;
  try{ hideGalaxyPlanet(); }catch(e){}
  const built=preset||buildWorldZones();
  const dsId=(built&&built.meta&&built.meta.id)||'ZONES';
  if($('ds')&&built&&![...$('ds').options].some(o=>o.value===dsId)){
    const op=document.createElement('option'); op.value=dsId; op.textContent=(built.meta&&built.meta.name)||dsId; $('ds').appendChild(op);
  }
  $('sys').value='WF';
  $('ds').value=dsId;
  $('lvl').value='s';
  if($('col')) $('col').value='seance';
  const idxbar=$('idxbar'); if(idxbar) idxbar.style.display='none';
  stopPlay(); clearSel();
  setDS();
  // T0 is the first séance where every zone already has a real vol20, so World is the mean of five positions at both frames.
  if(built&&built.objs&&built.dates){
    let s0=0;
    if(window.__WORLD_GAUSS&&GROUPS.length){
      for(let i=0;i<built.dates.length;i++){
        if(GROUPS.every(g=>P2(g,i))){ s0=i; break; }
      }
    } else {
      for(let i=0;i<built.dates.length;i++){
        if(built.objs.every((o,k)=>P1(k,i))){ s0=i; break; }
      }
    }
    if($('s')) $('s').value=s0;
    if($('e')) $('e').value=built.dates.length-1;
    if($('c')) $('c').value=built.dates.length-1;
    window_(); computeZ0();
  }
  const byName={};
  (built.objs||[]).forEach(o=>{ byName[o.s]=o.hubFloor; });
  GROUPS.forEach(g=>{ g.hubFloor=byName[g.name]||null; if(SECT[g.name]) g.col=SECT[g.name]; });
  try{ if($('c')&&$('e')) $('c').value=$('e').value; }catch(e){}
  try{ collapseUiPanel(true); }catch(e){}
  try{ if(window.__WORLD_GAUSS) refitWorldGaussBounds(); }catch(e){}
  try{ ensureGateChrome(); }catch(e){}
  try{ fit(); draw(); }catch(e){}
  try{ startManifestWave(); }catch(e){}
  setTimeout(function(){ try{ computeFourierSystem(); if(document.body.classList.contains('mode-world')) draw(); }catch(e){ console.warn('Fourier',e);} },80);
}
function applyWorld(route){
  document.body.className='mode-floor mode-world';
  window.__WORLD_GAUSS=true;
  window.__CORE_ZONES=true;
  window.__FLOOR_TITLE='World';
  hideIndexGap();
  mountZoneManifestation(route, buildWorldGaussZones());
  try{ ensureRetourHubBar('World'); }catch(e){}
}
function applyInternationalFloor(route){
  document.body.className='mode-floor mode-intl';
  window.__WORLD_GAUSS=false;
  window.__CORE_ZONES=false;
  hideIndexGap();
  mountZoneManifestation(route, buildWorldZones());
}
function openInterpretedFloor(){
  const qMode=gateModeFromHash()==='fourier'?'?mode=fourier':'';
  const next=DEFAULT_FLOOR+qMode;
  const cur=location.hash||'#/';
  if(cur===next || cur===DEFAULT_FLOOR&&!qMode) return false;
  location.replace(location.pathname+location.search+next);
  return true;
}
function applyRoute(){
  window.__DRAW_OVERRIDE=null;
  window.__ROSTER=null;
  const route=parseHash();
  window.__WORLD_GAUSS=route.mode==='world';
  window.__CORE_ZONES=route.mode==='world';
  window.__REGION_DOORS=false;
  if(route.mode==='world') window.__FLOOR_TITLE='World';
  window.__NAV={mode:route.mode,route,hash:location.hash||'#/'};
  window.__Z0_DOMAIN=z0DomainForRoute(route);
  if(route.mode!=='world'&&route.mode!=='home'){ window.__WAVE=false; try{hideGateChrome();}catch(e){} }
  // Hide galaxy planet overlay unless we are in planet/sports-galaxy empty panels
  if(!(route.mode==='galaxy' && (route.galaxy==='planet'||route.galaxy==='sports'||(route.galaxy==='branch'&&route.branch&&(!treeBranchById(route.branch)||treeBranchById(route.branch).floor==='MEF'||!LIB4.some(x=>x.id===treeBranchById(route.branch).floor)))))){
    // still let applyGalaxy manage show/hide
  }
  if(route.mode==='home'){
    if(openInterpretedFloor()) return;
  }
  else if(route.mode==='world'){
    applyWorld(route);
  }
  else if(route.mode==='fields'){
    applyFields(route);
  }
  else if(route.mode==='sources'){
    applySources();
  }
  else if(route.mode==='galaxy'){
    applyGalaxy(route);
  }
  else if(route.mode==='tree'){
    // legacy → galaxy branch
    applyGalaxy({mode:'galaxy',galaxy:'branch',branch:route.branch,sys:route.sys,name:route.name});
  }
  else if(route.mode==='sports'){
    hideGalaxyPlanet(); hideRetourHubBar();
    document.body.className='mode-sports';stopPlay();renderSports();
  }
  else if(route.mode==='nhl'){
    hideNhlInfoChip();
    window.__DRAW_OVERRIDE=null;
    if(route.list || route.agg || route.player){
      hideGalaxyPlanet();
      document.body.className='mode-nhl';stopPlay();renderNHL(route);
      ensureRetourHubBar('Sports · LNH (liste)');
    } else {
      // default demo path: galaxy
      applyNhlGalaxy();
    }
  }
  else if(route.mode==='placeholder'){
    hideGalaxyPlanet(); hideRetourHubBar();
    document.body.className='mode-placeholder';stopPlay();renderPlaceholder(route.sport);
  }
  else if(route.mode==='floor'){
    hideNhlInfoChip(); window.__DRAW_OVERRIDE=null; window.__RW_NHL_LOCK=false;
    hideGalaxyPlanet();
    if(route.sys==='WF' && !route.index && !route.ex){
      applyInternationalFloor(route);
      document.body.classList.add('mode-galaxy');
      ensureRetourHubBar('Étage international · manifestation');
    } else {
      applyFloor(route);
      document.body.classList.add('mode-galaxy');
      const bb=treeBranchForFloor(route.sys);
      ensureRetourHubBar(bb?('Finance · '+bb.name):('Finance · '+route.sys));
    }
  }
  else { if(openInterpretedFloor()) return; }
  ensureMainframeNav();
  syncMainframeNavHighlight(route);
  renderCrumb(route);
  // Re-fill crumb slots inside galaxy overlays
  try{
    document.querySelectorAll('.crumb-slot').forEach(slot=>{
      const c=$('crumb'); if(c) slot.innerHTML=c.innerHTML;
    });
  }catch(e){}
  window.__NAV.crumb=($('crumb')&&$('crumb').textContent)||'';
  window.__VERSION='v20.39';
  // Right window: summon on object navigation; never restore from ghost
  try{
    if(window.__RW_FORCE_CLOSED){ closeRightWindow(); window.__RW_FORCE_CLOSED=false; }
    else if(route.mode==='galaxy'&&route.galaxy==='branch'&&route.branch){ summonRightWindow(rwSpecFromBranch(route.branch)); }
    else if(route.mode==='tree'&&route.branch){ summonRightWindow(rwSpecFromBranch(route.branch)); }
    else if(route.mode==='floor'&&document.body.classList.contains('mode-region')){ closeRightWindow(); }
    else if(route.mode==='floor'&&route.sys==='WF'&&!route.index&&!route.ex){ closeRightWindow(); }
    else if(route.mode==='floor'&&route.sys&&!route.index&&!route.ex){ summonRightWindow(rwSpecFromFloor(route.sys)); }
    else if(route.mode==='nhl'&&route.player){
      const pl=NHL.players.find(p=>p.id===route.player);
      if(pl) summonRightWindow(rwSpecFromPlayer(pl));
    } else if(route.mode==='nhl'&&route.agg==='team'&&route.key&&route.key!=='_list'&&route.key!=='MULTI'){
      summonRightWindow(rwSpecFromTeam(route.key));
    } else if(route.mode==='home'||(route.mode==='galaxy'&&route.galaxy==='planet')){
      closeRightWindow();
    }
  }catch(e){}
}

function onDelegatedClick(e){
  const door=e.target.closest&&e.target.closest('[data-hub-cat]');
  if(door){
    e.preventDefault();
    window.__HUB_CAT=door.getAttribute('data-hub-cat')||'finance';
    if(door.id==='retour-sommet' || door.getAttribute('data-route')==='#/'){
      window.__HUB_OPEN_FLOOR=null; window.__HUB_TREE=null; window.__HUB_KEEP_OPEN=false;
    }
    if(parseHash().mode==='home'){renderMainframe();renderCrumb(parseHash());}
    else if(door.id==='retour-sommet' || door.classList.contains('strip-top')){ go('#/'); }
    return;
  }
  const topBtn=e.target.closest&&e.target.closest('#retour-sommet, .strip-top');
  if(topBtn){
    e.preventDefault();
    window.__HUB_OPEN_FLOOR=null; window.__HUB_TREE=null; window.__HUB_KEEP_OPEN=false; window.__HUB_CAT='finance';
    go('#/');
    return;
  }

  const a=e.target.closest('[data-route]');
  if(!a) return;
  const r=a.getAttribute('data-route');
  if(!r) return;
  e.preventDefault();
  go(r);
}


function patchNhlClicks(){
  const prev=cv.onclick;
  cv.onclick=function(e){
    if(window.__DRAW_OVERRIDE==='nhl'){
      window.moved=moved; window.HIT=HIT; window.ctx=ctx; window.W=W; window.H=H;
      if(typeof window.handleNhlLeagueClick==='function'){
        if(window.handleNhlLeagueClick(e)) return;
      }
      if(moved) return;
      const mx=e.clientX, my=e.clientY;
      // Class 2 team first
      let best=null, bd=1e9;
      (HIT.c2||[]).forEach(h=>{const d=Math.hypot(h.px-mx,h.py-my); if(d<=h.r+2 && d<bd){bd=d;best=h;}});
      if(best && best.team){
        window.__RW_NHL_LOCK=true;
        const t=best.team;
        try{
          summonRightWindow({
            id:'team:'+t.abbr, silo:'sports', classNum:2, name:t.name+' ('+t.abbr+')',
            metaLines:[
              'Club NHL — Classe 2',
              t.members.length+' joueurs Classe 1',
              'Sigle '+t.abbr,
              'Effectif : #/sports/nhl/agg/team/'+t.abbr
            ]
          });
        }catch(err){}
        return;
      }
      best=null; bd=1e9;
      (HIT.c1||[]).forEach(h=>{const d=Math.hypot(h.px-mx,h.py-my); if(d<=h.r+3 && d<bd){bd=d;best=h;}});
      if(best && best.pl){
        window.__RW_NHL_LOCK=true;
        const pl=best.pl;
        try{
          summonRightWindow({
            id:'player:'+pl.id, silo:'sports', classNum:1, name:pl.n,
            metaLines:[
              'Joueur NHL — Classe 1',
              'Club '+pl.abbr,
              'Position '+(pl.pos||'—'),
              'Nationalité '+(pl.nat||'—')
            ]
          });
        }catch(err){}
        return;
      }
      return;
    }
    if(typeof prev==='function') return prev.call(this,e);
  };
}

function patchClicks(){
  clickLib=function(mx,my){
    const h=hoverLib(mx,my); if(!h) return false;
    if(h.kind==='idx'){go('#/floor/'+SYS.id+'/index/'+h.idx);return true;}
    if(h.kind==='slot'){
      const owner=LIB4.find(x=>x.fl.has(h.mic));
      go('#/floor/'+(owner?owner.id:SYS.id)+'/ex/'+h.mic);
      return true;
    }
    if(h.kind==='box'){
      const nm=h.text&&h.text.match(/Classe 4 imbriquée — ([^\n]+)/);
      // hoverLib box does not expose b; look at HIT
      const hit=HIT.lib.find(x=>x.kind==='box'&&mx>=x.x&&mx<=x.x+x.w&&my>=x.y&&my<=x.y+x.h);
      if(hit&&hit.b&&hit.b.kind==='c4n'){
        const tgt=LIB4.find(x=>x.name===hit.b.name);
        if(tgt){go('#/floor/'+tgt.id);return true;}
      }
      if(h.sys){go('#/floor/'+h.sys);return true;}
    }
    if(h.kind==='frame'&&h.sys){go('#/floor/'+h.sys);return true;}
    if(h.sys){go('#/floor/'+h.sys);return true;}
    return true;
  };
  cv.onclick=function(e){
    if(moved) return;
    const x=e.clientX, y=e.clientY;
    if(window.__clickNavTimer) clearTimeout(window.__clickNavTimer);
    window.__clickNavTimer=setTimeout(function(){
      window.__clickNavTimer=null;
      if(clickLib(x,y)) return;
    if(HIT.c4n){
      for(const h of HIT.c4n){
        if(Math.abs(h.px-e.clientX)+Math.abs(h.py-e.clientY)<=h.r){
          const tgt=LIB4.find(x=>x.name===h.n.b.name);
          if(tgt){go('#/floor/'+tgt.id);return;}
        }
      }
    }
    if(EMPTY) return;
    const gh=hitGhost(e.clientX,e.clientY);
    if(gh){doDeploy(gh,true);return;}
    for(let gi=0;gi<GROUPS.length;gi++){
      const g=GROUPS[gi];
      if(g._px!=null&&Math.hypot(g._px-e.clientX,g._py-e.clientY)<=g._r+1.1){
        if(document.body.classList.contains('mode-world')||document.body.classList.contains('mode-intl')||document.body.classList.contains('mode-region')||document.body.classList.contains('mode-roster')) return;
        stopPlay();select(gi);return;
      }
    }
    }, 260);
  };
  $('sys').onchange=()=>{const v=$('sys').value;if(v==='__MAIN__')go('#/');else go('#/floor/'+v);};
  $('ds').onchange=()=>{
    const v=$('ds').value, sys=$('sys').value;
    if(v==='NDX') go('#/floor/'+sys+'/index/NDX');
    else if(v==='SPX') go('#/floor/'+sys+'/index/SPX');
    else go('#/floor/'+sys);
  };
}

function initV211(U){
  try{patchNhlClicks();}catch(e){}

  ['mf','spwin','nhlview','phwin'].forEach(id=>{
    if(!$(id)){const d=document.createElement('div');d.id=id;d.className='overlay';document.body.appendChild(d);}
  });
  if(!$('crumb')){
    const n=document.createElement('nav');n.id='crumb';n.setAttribute('aria-label',"Fil d'Ariane");
    $('ui').insertBefore(n,$('ui').children[1]||null);
  }
  if(!$('homebtn')){
    const b=document.createElement('button');b.type='button';b.id='homebtn';b.textContent='HUB — point de chute';b.setAttribute('data-route','#/');
    $('crumb').insertAdjacentElement('afterend',b);
  } else {
    $('homebtn').textContent='HUB — point de chute';
  }
  ensureMainframeNav();


  // v20.11 SPINE (pas un menu d'attributs) : une icône activée → champ d'opération
  window.__SPINE={active:null, open:false};
  function spineCloseField(){
    if($('pop')) $('pop').classList.remove('open');
    document.querySelectorAll('#icons button.attr').forEach(b=>{
      b.classList.remove('spine-active');
      b.setAttribute('aria-expanded','false');
      b.setAttribute('aria-pressed','false');
    });
    window.__SPINE={active:null, open:false};
    window.__POP={open:false};
  }
  function spineOpenField(i, btn){
    const a=ATTRS[i];
    if(!$('pop')) return;
    // Relabel existing Gaussian bounds as F-curve thresholds (same controls, no new engine)
    $('pop').dataset.i=i;
    $('poptitle').textContent=(a.name)+' — champ d’opération';
    const anLab=$('pop').querySelector('label');
    // Ensure threshold legend
    let thr=$('pop').querySelector('.fcurve-thresholds');
    if(!thr){
      thr=document.createElement('div');
      thr.className='fcurve-thresholds';
      thr.innerHTML='<b>Seuils — moteur courbe F</b><small>Échelle normalisée <b>−1 → +1</b> (0 au centre). Cinq niveaux : <b>−1</b>, <b>−0,5</b>, <b>0</b>, <b>+0,5</b>, <b>+1</b>. 0 = vitesse nulle (partagée) · ±0,5 = lente · ±1 = rapide. Courbe + : 0 / +0,5 / +1 · courbe − : 0 / −0,5 / −1. Mappés sur les cinq zones gaussiennes existantes (μ / σ). <em>Non branchés au calcul de Z0</em> (écart connu).</small><div class="fcurve-levels" aria-label="Cinq niveaux courbe F"><span data-lv="-1">−1</span><span data-lv="-0.5">−0,5</span><span data-lv="0">0</span><span data-lv="0.5">+0,5</span><span data-lv="1">+1</span></div>';
      const muLab=$('popmu')&&$('popmu').closest('label');
      if(muLab) muLab.parentNode.insertBefore(thr, muLab);
      else $('pop').appendChild(thr);
    }
    // Soft-relabel analysis
    const popanLab=[...$('pop').querySelectorAll('label')].find(l=>l.querySelector('#popan'));
    if(popanLab && !popanLab.querySelector('.an-lab')){
      const s=document.createElement('span'); s.className='an-lab'; s.textContent='Analyse — ';
      popanLab.insertBefore(s, popanLab.firstChild);
    }
    $('popan').value=a.an;
    if($('popmu')){ $('popmu').min='-1'; $('popmu').max='1'; $('popmu').step='0.5'; }
    // clamp legacy ATTRS μ from −2..+2 into −1..+1
    let mu0=Number(a.mu); if(!isFinite(mu0)) mu0=0; mu0=Math.max(-1, Math.min(1, mu0));
    // snap to five F-curve levels
    const FLEVELS=[-1,-0.5,0,0.5,1];
    mu0=FLEVELS.reduce((best,v)=>Math.abs(v-mu0)<Math.abs(best-mu0)?v:best, FLEVELS[0]);
    a.mu=mu0;
    $('popmu').value=mu0;
    $('popsig').value=a.sig;
    $('pop').classList.add('open','op-field');
    document.querySelectorAll('#icons button.attr').forEach(b=>{
      const on=b===btn;
      b.classList.toggle('spine-active', on);
      b.setAttribute('aria-expanded', on?'true':'false');
      b.setAttribute('aria-pressed', on?'true':'false');
    });
    if(typeof drawGauss==='function') drawGauss();
    // Position operation field to the right of the spine, cleared region
    const r=btn.getBoundingClientRect();
    const pw=$('pop').offsetWidth||320, ph=$('pop').offsetHeight||280;
    let left=Math.max(r.right+14, (document.querySelector('#icons')?.getBoundingClientRect().right||60)+14);
    let top=Math.max(72, Math.min(innerHeight-ph-12, r.top+r.height/2-ph/2));
    if(left+pw>innerWidth-12) left=Math.max(12, innerWidth-pw-12);
    $('pop').style.left=left+'px';
    $('pop').style.top=top+'px';
    window.__SPINE={active:i, open:true};
    window.__POP={open:true, attr:a.name, i:i, scrollY:scrollY, spine:true};
  }
  function spineActivate(i, btn){
    if(window.__SPINE && window.__SPINE.open && window.__SPINE.active===i){
      spineCloseField();
      return;
    }
    spineOpenField(i, btn);
  }
  // Replace icon click handlers: only activated icon opens field; click other = switch; click active = close
  document.querySelectorAll('#icons button.attr').forEach(btn=>{
    const clone=btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  document.querySelectorAll('#icons button.attr').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
      spineActivate(+btn.dataset.i, btn);
    });
  });
  // Esc closes operation field
  // (existing Escape handler already closes #pop)
  window.spineActivate=spineActivate;
  window.spineCloseField=spineCloseField;
  // Override openPop for any leftover callers → spine
  if(typeof openPop==='function'){
    window.openPop=openPop=function(i,btn){ spineActivate(i, btn||document.querySelector('#icons button.attr[data-i="'+i+'"]')); };
  }
  if(typeof closePop==='function'){
    const _c=closePop;
    window.closePop=closePop=function(){ spineCloseField(); };
  }


  
  // F-curve scale −1..+1 : override drawGauss zone labels (keep 5 equal gaussian bands)
  if(typeof drawGauss==='function'){
    const _drawGaussOrig=drawGauss;
    window.drawGauss=drawGauss=function(){
      _drawGaussOrig();
      const cv=$('popcv'); if(!cv) return;
      const g=cv.getContext('2d'), W=cv.width, H=cv.height;
      const labs=['−1','−0,5','0','+0,5','+1'];
      g.fillStyle='#e8c872'; g.font='10px system-ui'; g.textAlign='center';
      for(let i=0;i<5;i++){
        g.fillText(labs[i], (i+0.5)*W/5, H-3);
      }
      if($('popmuv')) $('popmuv').textContent=(+$('popmu').value).toFixed(2);
    };
  }
  // Force popmu range in DOM to −1..+1 (replace any −2..+2)
  if($('popmu')){ $('popmu').min='-1'; $('popmu').max='1'; $('popmu').step='0.5'; if(+$('popmu').value>1||+$('popmu').value<-1) $('popmu').value='0'; }

  // Finance analysis silo: persist ATTRS only under um.analysis.finance.* (never sports keys)
  try{ analysisFinanceRestore(); }catch(e){}
  ['popan','popmu','popsig'].forEach(id=>{
    const el=$(id); if(!el) return;
    el.addEventListener('change',()=>{
      try{
        const i=+$('pop').dataset.i; if(!ATTRS[i]) return;
        if(id==='popan') ATTRS[i].an=el.value;
        if(id==='popmu') ATTRS[i].mu=+el.value;
        if(id==='popsig') ATTRS[i].sig=+el.value;
        analysisFinanceSave();
      }catch(e){}
    });
    el.addEventListener('input',()=>{
      try{
        const i=+$('pop').dataset.i; if(!ATTRS[i]) return;
        if(id==='popmu') ATTRS[i].mu=+el.value;
        if(id==='popsig') ATTRS[i].sig=+el.value;
        analysisFinanceSave();
      }catch(e){}
    });
  });


  document.body.addEventListener('click',onDelegatedClick);
  addEventListener('hashchange',applyRoute);
  addEventListener('keydown',e=>{
    if(e.key!=='Escape') return;
    if($('pop')&&$('pop').classList.contains('open')) return;
    if($('right-window')){ e.preventDefault(); closeRightWindow(); return; }
    const r=parseHash();
    if(r.mode==='floor') return;
    e.preventDefault();
    if(r.mode==='nhl'&&r.player){go(r.agg? '#/sports/nhl/agg/'+r.agg+'/'+encodeURIComponent(r.key) : '#/sports/nhl');return;}
    if(r.mode==='nhl'&&r.agg){go('#/sports/nhl');return;}
    if(r.mode==='nhl'){go('#/');return;}
    if(r.mode==='placeholder'){go('#/sports');return;}
    if(r.mode==='sports') go('#/');
  });
  patchClicks();
  try{patchNhlClicks();}catch(e){}
  ghostHubBindLifecycle();
  // Restore hub/floor from ghost memory unless URL already points deeper than #/
  const hash0=location.hash||'';
  const urlHasDeep=hash0 && hash0!=='#' && hash0!=='#/';
  if(U.get('sys')){
    let h='#/floor/'+U.get('sys');
    if(U.get('ds')==='NDX'||U.get('ds')==='SPX') h+='/index/'+U.get('ds');
    else if(U.get('lvl')==='f'&&U.get('ex')) h+='/ex/'+U.get('ex');
    history.replaceState(null,'',h);
  } else if(!urlHasDeep){
    history.replaceState(null,'',DEFAULT_FLOOR);
  }
  if(U.get('noui')) $('ui').style.display='none';
  applyRoute();
  try{ ghostHubCaptureState('open'); }catch(e){}
  if(parseHash().mode==='floor' && U.get('sel') && U.get('sel')!=='Technology'){
    const gi=GROUPS.findIndex(g=>g.name===U.get('sel'));
    if(gi>=0) select(gi);
  }
  if(sel&&U.get('dep')){
    const di=ds.dates.indexOf(U.get('dep'));
    const gh=sel.tr.G.find(g=>g.e>=di+1)||sel.tr.G[0];
    doDeploy(gh,false);
    if(U.get('at')){$('c').value=ds.dates.indexOf(U.get('at'));progress=+(U.get('u')||0);draw();}
  }
  const dump=document.createElement('pre');dump.id='dump';dump.style.display='none';
  dump.textContent=JSON.stringify({version:'v20.12',mode:parseHash().mode,registry:REGISTRY.map(x=>x.id)});
  document.body.appendChild(dump);
  window.__REGISTRY=REGISTRY;
  window.TREE_BRANCHES=TREE_BRANCHES;
  window.branchCovered=branchCovered;
  window.floorContentsForHub=floorContentsForHub;
  window.UM_MARKET_FRAMES=window.UM_MARKET_FRAMES;
  window.registerSystem=registerSystem;
  window.go=go;
  window.applyRoute=applyRoute;window.applyGalaxy=applyGalaxy;
  window.parseHash=parseHash;
  window.__NHL=NHL;
  window.__POS_LABELS=POS_FR;
  syncVolLabels();
}


/* === RIGHT WINDOW — bureau d'assignation (myrioamphibotique) === */
const AGENT_ASSIGN_KEY='um.agents.assign.v1';
window.__RW={instance:0, open:false, objectId:null};
const OFFICES_195={"source":"offices_195.csv","driveId":"132G6tp20azR9qD2IU0xaeVHIM51HKrLM","sha256":"e8f5b0d73a6b24b9ad03e750f2605276b0f5ff9fcef3d72c5bbf70577ca03a2e","n":195,"n_cohorte":88,"n_legion":82,"n_autre":25,"note_autre":"[INCOMPLET : faces Yang/Yin/Neutre/— non classées cohorte/légion — listées séparément]","members":[{"id":"E0","name":"Esmeralda (jour) / ESTHER (nuit)","face":"—","rang":"Intellect premier","group":"autre","paire":""},{"id":"R1","name":"Orifiel","face":"Ange planétaire","rang":"Régent de Saturne","group":"cohorte","paire":""},{"id":"R2","name":"Anael","face":"Ange planétaire","rang":"Régent de Vénus","group":"cohorte","paire":""},{"id":"R3","name":"Zachariel","face":"Ange planétaire","rang":"Régent de Jupiter","group":"cohorte","paire":""},{"id":"R4","name":"Raphael","face":"Ange planétaire","rang":"Régent de Mercure","group":"cohorte","paire":""},{"id":"R5","name":"Samael","face":"Ange planétaire","rang":"Régent de Mars","group":"cohorte","paire":""},{"id":"R6","name":"Gabriel","face":"Ange planétaire","rang":"Régent de Lune","group":"cohorte","paire":""},{"id":"R7","name":"Michael","face":"Ange planétaire","rang":"Régent de Soleil","group":"cohorte","paire":""},{"id":"V1","name":"1 Qián — Le Créateur","face":"Yang","rang":"Axe 1 (1↔2)","group":"autre","paire":""},{"id":"V2","name":"2 Kūn — Le Réceptif","face":"Yin","rang":"Axe 1 (1↔2)","group":"autre","paire":""},{"id":"V43","name":"43 Guài — La Percée","face":"Yang","rang":"Axe 2 (43↔23)","group":"autre","paire":""},{"id":"V23","name":"23 Bō — L'Éclatement","face":"Yin","rang":"Axe 2 (43↔23)","group":"autre","paire":""},{"id":"V44","name":"44 Gòu — Venir à la rencontre","face":"Yang","rang":"Axe 3 (44↔24)","group":"autre","paire":""},{"id":"V24","name":"24 Fù — Le Retour","face":"Yin","rang":"Axe 3 (44↔24)","group":"autre","paire":""},{"id":"V28","name":"28 Dà Guò — Prépondérance du grand","face":"Yang","rang":"Axe 4 (28↔27)","group":"autre","paire":""},{"id":"V27","name":"27 Yí — La Nourriture","face":"Yin","rang":"Axe 4 (28↔27)","group":"autre","paire":""},{"id":"V38","name":"38 Kuí — L'Opposition","face":"Yang","rang":"Axe 5 (38↔39)","group":"autre","paire":""},{"id":"V39","name":"39 Jiǎn — L'Obstacle","face":"Yin","rang":"Axe 5 (38↔39)","group":"autre","paire":""},{"id":"V37","name":"37 Jiā Rén — La Famille","face":"Yang","rang":"Axe 6 (37↔40)","group":"autre","paire":""},{"id":"V40","name":"40 Xiè — La Libération","face":"Yin","rang":"Axe 6 (37↔40)","group":"autre","paire":""},{"id":"V53","name":"53 Jiàn — Le Progrès graduel","face":"Yang","rang":"Axe 7 (53↔54)","group":"autre","paire":""},{"id":"V54","name":"54 Guī Mèi — L'Épousée","face":"Yin","rang":"Axe 7 (53↔54)","group":"autre","paire":""},{"id":"V63","name":"63 Jì Jì — Après l'accomplissement","face":"Yang","rang":"Axe 8 (63↔64)","group":"autre","paire":""},{"id":"V64","name":"64 Wèi Jì — Avant l'accomplissement","face":"Yin","rang":"Axe 8 (63↔64)","group":"autre","paire":""},{"id":"G1","name":"Qián ☰ Ciel","face":"Neutre","rang":"Air × actif (à valider)","group":"autre","paire":""},{"id":"G2","name":"Duì ☱ Lac","face":"Neutre","rang":"Eau × réceptif (à valider)","group":"autre","paire":""},{"id":"G3","name":"Lí ☲ Feu","face":"Neutre","rang":"Feu × réceptif (à valider)","group":"autre","paire":""},{"id":"G4","name":"Zhèn ☳ Tonnerre","face":"Neutre","rang":"Feu × actif (à valider)","group":"autre","paire":""},{"id":"G5","name":"Xùn ☴ Vent","face":"Neutre","rang":"Air × réceptif (à valider)","group":"autre","paire":""},{"id":"G6","name":"Kǎn ☵ Eau","face":"Neutre","rang":"Eau × actif (à valider)","group":"autre","paire":""},{"id":"G7","name":"Gèn ☶ Montagne","face":"Neutre","rang":"Terre × actif (à valider)","group":"autre","paire":""},{"id":"G8","name":"Kūn ☷ Terre","face":"Neutre","rang":"Terre × réceptif (à valider)","group":"autre","paire":""},{"id":"C1","name":"Métatron","face":"Ange","rang":"Prince des Séraphins","group":"cohorte","paire":""},{"id":"C2","name":"Raziel","face":"Ange","rang":"Prince des Chérubins","group":"cohorte","paire":""},{"id":"C3","name":"Tsaphkiel","face":"Ange","rang":"Prince des Trônes","group":"cohorte","paire":""},{"id":"C4","name":"Tsadkiel","face":"Ange","rang":"Prince des Dominations","group":"cohorte","paire":""},{"id":"C5","name":"Kamaël","face":"Ange","rang":"Prince des Puissances","group":"cohorte","paire":""},{"id":"C6","name":"Raphaël","face":"Ange","rang":"Prince des Vertus","group":"cohorte","paire":""},{"id":"C7","name":"Haniel","face":"Ange","rang":"Prince des Principautés","group":"cohorte","paire":""},{"id":"C8","name":"Michaël","face":"Ange","rang":"Prince des Archanges","group":"cohorte","paire":""},{"id":"C9","name":"Gabriel","face":"Ange","rang":"Prince des Anges","group":"cohorte","paire":""},{"id":"K1","name":"Amaymon","face":"Démon","rang":"Roi de l'Est","group":"legion","paire":""},{"id":"K2","name":"Ziminiar","face":"Démon","rang":"Roi du Nord","group":"legion","paire":""},{"id":"K3","name":"Corson","face":"Démon","rang":"Roi de l'Ouest","group":"legion","paire":""},{"id":"K4","name":"Gaap (roi du Sud)","face":"Démon","rang":"Roi du Sud","group":"legion","paire":""},{"id":"X1","name":"Lucifuge Rofocale","face":"Démon","rang":"Premier ministre","group":"legion","paire":""},{"id":"X2","name":"Satanachia","face":"Démon","rang":"Grand général","group":"legion","paire":""},{"id":"X3","name":"Agaliarept","face":"Démon","rang":"Général","group":"legion","paire":""},{"id":"X4","name":"Fleurety","face":"Démon","rang":"Lieutenant général","group":"legion","paire":""},{"id":"X5","name":"Sargatanas","face":"Démon","rang":"Brigadier","group":"legion","paire":""},{"id":"X6","name":"Nebiros","face":"Démon","rang":"Maréchal de camp","group":"legion","paire":""},{"id":"A1","name":"Vehuiah","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"1"},{"id":"D1","name":"Bael","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"1"},{"id":"A2","name":"Jeliel","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"2"},{"id":"D2","name":"Agares","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"2"},{"id":"A3","name":"Sitael","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"3"},{"id":"D3","name":"Vassago","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"3"},{"id":"A4","name":"Elemiah","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"4"},{"id":"D4","name":"Samigina","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"4"},{"id":"A5","name":"Mahasiah","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"5"},{"id":"D5","name":"Marbas","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"5"},{"id":"A6","name":"Lelahel","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"6"},{"id":"D6","name":"Valefor","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"6"},{"id":"A7","name":"Achaiah","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"7"},{"id":"D7","name":"Amon","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"7"},{"id":"A8","name":"Cahetel","face":"Ange","rang":"Séraphins (prince Métatron)","group":"cohorte","paire":"8"},{"id":"D8","name":"Barbatos","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"8"},{"id":"A9","name":"Haziel","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"9"},{"id":"D9","name":"Paimon","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"9"},{"id":"A10","name":"Aladiah","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"10"},{"id":"D10","name":"Buer","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"10"},{"id":"A11","name":"Laoviah","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"11"},{"id":"D11","name":"Gusion","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"11"},{"id":"A12","name":"Hahaiah","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"12"},{"id":"D12","name":"Sitri","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"12"},{"id":"A13","name":"Iezalel","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"13"},{"id":"D13","name":"Beleth","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"13"},{"id":"A14","name":"Mebahel","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"14"},{"id":"D14","name":"Leraje","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"14"},{"id":"A15","name":"Hariel","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"15"},{"id":"D15","name":"Eligos","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"15"},{"id":"A16","name":"Hakamiah","face":"Ange","rang":"Chérubins (prince Raziel)","group":"cohorte","paire":"16"},{"id":"D16","name":"Zepar","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"16"},{"id":"A17","name":"Lauviah","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"17"},{"id":"D17","name":"Botis","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"17"},{"id":"A18","name":"Caliel","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"18"},{"id":"D18","name":"Bathin","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"18"},{"id":"A19","name":"Leuviah","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"19"},{"id":"D19","name":"Sallos","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"19"},{"id":"A20","name":"Pahaliah","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"20"},{"id":"D20","name":"Purson","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"20"},{"id":"A21","name":"Nelchael","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"21"},{"id":"D21","name":"Marax","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"21"},{"id":"A22","name":"Ieiaiel","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"22"},{"id":"D22","name":"Ipos","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"22"},{"id":"A23","name":"Melahel","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"23"},{"id":"D23","name":"Aim","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"23"},{"id":"A24","name":"Haheuiah","face":"Ange","rang":"Trônes (prince Tsaphkiel)","group":"cohorte","paire":"24"},{"id":"D24","name":"Naberius","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"24"},{"id":"A25","name":"Nith-Haiah","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"25"},{"id":"D25","name":"Glasya-Labolas","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"25"},{"id":"A26","name":"Haaiah","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"26"},{"id":"D26","name":"Bune","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"26"},{"id":"A27","name":"Ierathel","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"27"},{"id":"D27","name":"Ronove","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"27"},{"id":"A28","name":"Seheiah","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"28"},{"id":"D28","name":"Berith","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"28"},{"id":"A29","name":"Reiiel","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"29"},{"id":"D29","name":"Astaroth","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"29"},{"id":"A30","name":"Omael","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"30"},{"id":"D30","name":"Forneus","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"30"},{"id":"A31","name":"Lecabel","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"31"},{"id":"D31","name":"Foras","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"31"},{"id":"A32","name":"Vasariah","face":"Ange","rang":"Dominations (prince Tsadkiel)","group":"cohorte","paire":"32"},{"id":"D32","name":"Asmoday","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"32"},{"id":"A33","name":"Iehuiah","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"33"},{"id":"D33","name":"Gaap","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"33"},{"id":"A34","name":"Lehahiah","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"34"},{"id":"D34","name":"Furfur","face":"Démon","rang":"Comte (Mars) — général : Nebiros","group":"legion","paire":"34"},{"id":"A35","name":"Chavakiah","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"35"},{"id":"D35","name":"Marchosias","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"35"},{"id":"A36","name":"Menadel","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"36"},{"id":"D36","name":"Stolas","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"36"},{"id":"A37","name":"Aniel","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"37"},{"id":"D37","name":"Phenex","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"37"},{"id":"A38","name":"Haamiah","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"38"},{"id":"D38","name":"Halphas","face":"Démon","rang":"Comte (Mars) — général : Nebiros","group":"legion","paire":"38"},{"id":"A39","name":"Rehael","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"39"},{"id":"D39","name":"Malphas","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"39"},{"id":"A40","name":"Ieiazel","face":"Ange","rang":"Puissances (prince Kamaël)","group":"cohorte","paire":"40"},{"id":"D40","name":"Raum","face":"Démon","rang":"Comte (Mars) — général : Nebiros","group":"legion","paire":"40"},{"id":"A41","name":"Hahahel","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"41"},{"id":"D41","name":"Focalor","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"41"},{"id":"A42","name":"Mikael","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"42"},{"id":"D42","name":"Vepar","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"42"},{"id":"A43","name":"Veuliah","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"43"},{"id":"D43","name":"Sabnock","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"43"},{"id":"A44","name":"Ielahiah","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"44"},{"id":"D44","name":"Shax","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"44"},{"id":"A45","name":"Sealiah","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"45"},{"id":"D45","name":"Vine","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"45"},{"id":"A46","name":"Ariel","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"46"},{"id":"D46","name":"Bifrons","face":"Démon","rang":"Comte (Mars) — général : Nebiros","group":"legion","paire":"46"},{"id":"A47","name":"Asaliah","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"47"},{"id":"D47","name":"Vual","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"47"},{"id":"A48","name":"Mihael","face":"Ange","rang":"Vertus (prince Raphaël)","group":"cohorte","paire":"48"},{"id":"D48","name":"Haagenti","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"48"},{"id":"A49","name":"Vehuel","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"49"},{"id":"D49","name":"Crocell","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"49"},{"id":"A50","name":"Daniel","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"50"},{"id":"D50","name":"Furcas","face":"Démon","rang":"Chevalier (Saturne) — général : Nebiros","group":"legion","paire":"50"},{"id":"A51","name":"Hahasiah","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"51"},{"id":"D51","name":"Balam","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"51"},{"id":"A52","name":"Imamiah","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"52"},{"id":"D52","name":"Alloces","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"52"},{"id":"A53","name":"Nanael","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"53"},{"id":"D53","name":"Camio","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"53"},{"id":"A54","name":"Nithael","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"54"},{"id":"D54","name":"Murmur","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"54"},{"id":"A55","name":"Mebahiah","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"55"},{"id":"D55","name":"Orobas","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"55"},{"id":"A56","name":"Poiel","face":"Ange","rang":"Principautés (prince Haniel)","group":"cohorte","paire":"56"},{"id":"D56","name":"Gremory","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"56"},{"id":"A57","name":"Nemamiah","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"57"},{"id":"D57","name":"Ose","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"57"},{"id":"A58","name":"Ieialel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"58"},{"id":"D58","name":"Amy","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"58"},{"id":"A59","name":"Harahel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"59"},{"id":"D59","name":"Orias","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"59"},{"id":"A60","name":"Mitzrael","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"60"},{"id":"D60","name":"Vapula","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"60"},{"id":"A61","name":"Umabel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"61"},{"id":"D61","name":"Zagan","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"61"},{"id":"A62","name":"Iah-Hel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"62"},{"id":"D62","name":"Volac","face":"Démon","rang":"Président (Mercure) — général : Sargatanas","group":"legion","paire":"62"},{"id":"A63","name":"Anauel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"63"},{"id":"D63","name":"Andras","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"63"},{"id":"A64","name":"Mehiel","face":"Ange","rang":"Archanges (prince Michaël)","group":"cohorte","paire":"64"},{"id":"D64","name":"Haures","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"64"},{"id":"A65","name":"Damabiah","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"65"},{"id":"D65","name":"Andrealphus","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"65"},{"id":"A66","name":"Manakel","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"66"},{"id":"D66","name":"Cimejes","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"66"},{"id":"A67","name":"Eiael","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"67"},{"id":"D67","name":"Amdusias","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"67"},{"id":"A68","name":"Habuhiah","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"68"},{"id":"D68","name":"Belial","face":"Démon","rang":"Roi (Soleil) — général : Satanachia","group":"legion","paire":"68"},{"id":"A69","name":"Rochel","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"69"},{"id":"D69","name":"Decarabia","face":"Démon","rang":"Marquis (Lune) — général : Fleurety","group":"legion","paire":"69"},{"id":"A70","name":"Jabamiah","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"70"},{"id":"D70","name":"Seere","face":"Démon","rang":"Prince (Jupiter) — général : Satanachia","group":"legion","paire":"70"},{"id":"A71","name":"Haiaiel","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"71"},{"id":"D71","name":"Dantalion","face":"Démon","rang":"Duc (Vénus) — général : Agaliarept","group":"legion","paire":"71"},{"id":"A72","name":"Mumiah","face":"Ange","rang":"Anges (prince Gabriel)","group":"cohorte","paire":"72"},{"id":"D72","name":"Andromalius","face":"Démon","rang":"Comte (Mars) — général : Nebiros","group":"legion","paire":"72"}]};
function agentAssignRead(){
  try{ return JSON.parse(localStorage.getItem(AGENT_ASSIGN_KEY)||'{}')||{}; }catch(e){ return {}; }
}
function agentAssignWrite(map){
  try{ localStorage.setItem(AGENT_ASSIGN_KEY, JSON.stringify(map)); }catch(e){}
}
function agentAssignGet(objectId){
  const m=agentAssignRead();
  return m[objectId]||null;
}
function agentAssignSet(objectId, payload){
  const m=agentAssignRead();
  if(!payload) delete m[objectId];
  else m[objectId]=Object.assign({savedAt:Date.now()}, payload);
  agentAssignWrite(m);
  return m[objectId]||null;
}
function closeRightWindow(){
  const el=$('right-window');
  if(el) el.remove();
  window.__RW={instance:0, open:false, objectId:null, closedAt:Date.now()};
  document.body.classList.remove('rw-open');
}
function officeById(id){ return (OFFICES_195.members||[]).find(m=>m.id===id)||null; }
function siloOfObjectId(objectId, spec){
  if(spec && spec.silo) return spec.silo;
  const id=String(objectId||'');
  if(/^nhl:|^team:|^player:|^sport:/.test(id)) return 'sports';
  if(/^floor:|^branch:|^c1:|^c2:|^index:/.test(id)) return 'finance';
  // body mode fallback
  if(document.body && (document.body.classList.contains('mode-nhl-galaxy') || document.body.classList.contains('mode-nhl'))) return 'sports';
  return 'finance';
}
function renderAgentSection(objectId, spec){
  const asg=agentAssignGet(objectId);
  const silo=siloOfObjectId(objectId, spec);
  const sourceAgent=null; // Branche 1 — aucun agent de source connu pour l'instant
  let hostHtml='';
  if(sourceAgent){
    hostHtml=`<p class="rw-agent-now"><b>Branche 1 — agent de source :</b> ${esc(sourceAgent)}</p>`;
  } else {
    hostHtml=`<p class="rw-agent-now"><b>Branche 1 — agent de source :</b> aucun agent de source connu</p>
      <p class="rw-agent-now"><b>Branche 2 — hôte démon :</b> ${(asg&&asg.group==='legion')?esc(asg.name)+' ('+esc(asg.officeId)+')':'non assigné — choisir ci-dessous'}</p>`;
  }
  const cur=asg?`<p class="rw-assigned">Assigné : <b>${esc(asg.name)}</b> · ${asg.group==='cohorte'?'Cohorte (ange)':asg.group==='legion'?'Légion (démon)':asg.group} · id ${esc(asg.officeId)}</p>`:'<p class="rw-assigned">Aucune assignation persistée pour cet objet.</p>';
  const cohorte=OFFICES_195.members.filter(m=>m.group==='cohorte');
  const legion=OFFICES_195.members.filter(m=>m.group==='legion');
  const autre=OFFICES_195.members.filter(m=>m.group==='autre');
  const opt=(m)=>`<option value="${m.id}" ${asg&&asg.officeId===m.id?'selected':''}>${esc(m.name)} · ${esc(m.face)} · ${esc(m.rang)}</option>`;
  // v20.14.1 — sealed silos: never show finance office CSV on sports objects, nor NHL API on finance
  let srcLine='';
  if(silo==='sports'){
    const extracted=(window.NHL&&NHL.extracted)||'2026-11-09';
    const nP=(window.NHL&&NHL.players&&NHL.players.length)||0;
    const nT=(window.NHL&&NHL.teams&&Object.keys(NHL.teams).length)||0;
    const srcApi=(window.NHL&&NHL.src)||'api.nhle.com/stats/rest/en';
    srcLine=`<p class="rw-src">Source silo sports : API NHL <code>${esc(srcApi)}</code> · extraction du ${esc(extracted)} · ${nT} clubs · ${nP} joueurs · saisons 2024-25 et 2025-26. Aucune source finance dans ce silo.</p>`;
  } else {
    srcLine=`<p class="rw-src">Source silo finance : <code>${esc(OFFICES_195.source)}</code> (Drive ${esc(OFFICES_195.driveId)}) · ${OFFICES_195.n} lignes · SHA-256 ${OFFICES_195.sha256.slice(0,12)}… · Cohorte ${OFFICES_195.n_cohorte} · Légion ${OFFICES_195.n_legion} · autres ${OFFICES_195.n_autre} ${esc(OFFICES_195.note_autre)}</p>`;
  }
  return `<section class="rw-agent" aria-label="Agent de l'objet" data-silo="${esc(silo)}">
    <h3>Agent de l'objet</h3>
    ${srcLine}
    ${hostHtml}
    ${cur}
    <label class="rw-link-lab">Lier à la Cohorte (anges) ou à la Légion (démons)
      <select id="rw-agent-select" data-object-id="${esc(objectId)}">
        <option value="">— choisir —</option>
        <optgroup label="Cohorte — anges (${cohorte.length})">${cohorte.map(opt).join('')}</optgroup>
        <optgroup label="Légion — démons (${legion.length})">${legion.map(opt).join('')}</optgroup>
        <optgroup label="Autres faces [INCOMPLET] (${autre.length})">${autre.map(opt).join('')}</optgroup>
      </select>
    </label>
    <div class="rw-agent-actions">
      <button type="button" id="rw-agent-save">Enregistrer l'assignation</button>
      <button type="button" id="rw-agent-clear" class="ghost">Retirer</button>
      <button type="button" id="rw-agent-enter" class="enter" ${asg?'':'disabled'}>Entrer — agent</button>
    </div>
    <p class="rw-enter-note">Connectivité : l'agent est atteint directement par l'objet (porte), sans annuaire. L'assignation est une donnée d'objet (<code>${AGENT_ASSIGN_KEY}</code>), pas l'état de la fenêtre.</p>
  </section>`;
}
function summonRightWindow(spec){
  // Always REGENERATE fresh — destroy previous DOM entirely
  closeRightWindow();
  const inst=++window.__RW_SEQ || (window.__RW_SEQ=1);
  window.__RW_SEQ=inst;
  const builtAt=Date.now();
  const objectId=spec.id;
  const klass=spec.classNum||spec.klass||'?';
  const el=document.createElement('aside');
  el.id='right-window';
  el.className='right-window open';
  el.setAttribute('role','complementary');
  el.setAttribute('aria-label','Fenêtre de droite — bureau d\'assignation');
  el.dataset.instance=String(inst);
  el.dataset.builtAt=String(builtAt);
  el.dataset.objectId=objectId;
  el.dataset.objectClass=String(klass);
  el.dataset.objectName=spec.name||'';
  const metaBits=(spec.metaLines||[]).map(t=>`<li>${t}</li>`).join('');
  el.innerHTML=`<header class="rw-head">
      <div class="rw-kicker">Fenêtre de droite · instance ${inst} · ${new Date(builtAt).toLocaleTimeString('fr-CA')}</div>
      <h2 class="rw-title">${esc(spec.name||objectId)}</h2>
      <p class="rw-class">Classe ${esc(String(klass))} · id <code>${esc(objectId)}</code></p>
      <button type="button" id="rw-close" aria-label="Fermer la fenêtre de droite">×</button>
    </header>
    <div class="rw-body">
      <section class="rw-obj">
        <h3>Objet</h3>
        <ul class="rw-meta">${metaBits||'<li>Spécifiques régénérés à chaque ouverture</li>'}</ul>
      </section>
      ${renderAgentSection(objectId, spec)}
    </div>`;
  document.body.appendChild(el);
  document.body.classList.add('rw-open');
  window.__RW={instance:inst, open:true, objectId, builtAt};
  el.querySelector('#rw-close').onclick=()=>closeRightWindow();
  el.querySelector('#rw-agent-save').onclick=()=>{
    const sel=el.querySelector('#rw-agent-select');
    const oid=sel.value;
    if(!oid){ agentAssignSet(objectId,null); summonRightWindow(spec); return; }
    const off=officeById(oid);
    if(!off) return;
    agentAssignSet(objectId,{officeId:off.id,name:off.name,face:off.face,group:off.group,rang:off.rang});
    summonRightWindow(spec); // regenerate fresh showing new assignment
  };
  el.querySelector('#rw-agent-clear').onclick=()=>{ agentAssignSet(objectId,null); summonRightWindow(spec); };
  const enter=el.querySelector('#rw-agent-enter');
  if(enter){
    enter.onclick=()=>{
      const asg=agentAssignGet(objectId);
      if(!asg) return;
      // Door into the agent through the object — no directory
      let pane=el.querySelector('.rw-enter-pane');
      if(pane) pane.remove();
      pane=document.createElement('section');
      pane.className='rw-enter-pane';
      pane.dataset.builtAt=String(Date.now());
      pane.innerHTML=`<h3>Entrer — agent</h3>
        <p>Porte de l'objet <b>${esc(spec.name)}</b> → agent <b>${esc(asg.name)}</b> (${asg.group==='legion'?'hôte démon / Légion':asg.group==='cohorte'?'Cohorte':asg.group}).</p>
        <p class="rw-muted">Conversation vocale et quatre règnes : [INCOMPLET — pont Esther/Esmeralda non branché dans ce prototype].</p>`;
      el.querySelector('.rw-body').appendChild(pane);
    };
  }
  return el;
}
window.summonRightWindow=summonRightWindow;
window.closeRightWindow=closeRightWindow;
window.agentAssignGet=agentAssignGet;
window.agentAssignSet=agentAssignSet;
window.OFFICES_195=OFFICES_195;

function floorPricedMetaLines(sys){
  const keys=Object.keys(DATA).filter(k=>{const d=DATA[k];return !!(d&&d.meta&&d.meta.floor===sys&&d.objs&&d.objs.length);});
  const order=['N225','HSI','STI','TASI','FTSE100','DAX','CAC40','SX5E','ASX200','IBOV'];
  keys.sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);if(ia<0&&ib<0)return a.localeCompare(b);if(ia<0)return 1;if(ib<0)return -1;return ia-ib;});
  const items=keys.map(k=>{
    const d=DATA[k],m=d.meta||{};
    const missing=d.objs.filter(o=>!(o.c0!=null||(o.c&&o.c.some(x=>x!=null)))).map(o=>{
      const label=o.n||o.t||o.yahoo||'?';
      return o.yahoo? (label+' ('+o.yahoo+')') : label;
    });
    const priced=(m.n_with_prices!=null)?m.n_with_prices:d.objs.filter(o=>o.c0!=null||(o.c&&o.c.some(x=>x!=null))).length;
    const total=(m.n_constituents!=null)?m.n_constituents:d.objs.length;
    return {id:k,name:m.name||k,priced,total,missing,listNote:m.incomplet_list||null};
  });
  if(!items.length) return ['Statut : '+floorLiveState(sys)];
  const priced=items.reduce((s,it)=>s+it.priced,0);
  const total=items.reduce((s,it)=>s+it.total,0);
  const lines=['Statut : live','Indices : '+items.map(it=>it.name).join(', ')];
  lines.push(priced+' titres Classe 1 · prix T0/T1'+(total>priced?(' · '+(total-priced)+' sans cours [INCOMPLET]'):''));
  items.forEach(it=>{
    if(it.missing.length) lines.push('[INCOMPLET] '+it.name+' : '+it.missing.join(', '));
    if(it.listNote) lines.push(it.listNote);
  });
  return lines;
}
function rwSpecFromFloor(sys){
  const L=LIB4.find(x=>x.id===sys);
  const b=treeBranchForFloor(sys);
  const extra=(sys==='EUF'||sys==='ASF'||sys==='OCF')?floorPricedMetaLines(sys):['Statut : '+floorLiveState(sys)];
  return {silo:'finance', id:'floor:'+sys, classNum:4, name:(L&&L.name)||sys, metaLines:[
    'Étage / structure de Classe 4 (données conservées)',
    b?('Branche d\'ouverture : '+b.name):'Hors arbre d\'ouverture (coupe ou structure)'
  ].concat(extra)};
}
function rwSpecFromBranch(branchId){
  const b=treeBranchById(branchId);
  return {silo:'finance', id:'branch:'+branchId, classNum:4, name:b?b.name:branchId, metaLines:[
    'Branche d\'ouverture de l\'arbre-objet (5)',
    b?b.blurb:'',
    'Couvert : '+(b&&branchCovered(b)?'oui (Amériques)':'non — prochain chantier')
  ]};
}
function rwSpecFromGroup(g){
  const key=g.mic||g.id||g.name||'g';
  return {silo:'finance', id:'c2:'+key, classNum:2, name:g.name+(g.mic?' ('+g.mic+')':''), metaLines:[
    'Objet de Classe 2 (secteur / place / agrégat)',
    (g.mem?g.mem.length:0)+' constituants Classe 1',
    g.mic?('MIC / clé : '+g.mic):'',
    'clé interne : '+key
  ]};
}
function rwSpecFromTitle(obj, idx){
  return {silo:'finance', id:'c1:'+(obj.t||obj.s||idx), classNum:1, name:obj.t||obj.n||('titre '+idx), metaLines:[
    'Titre / point de donnée de Classe 1',
    obj.s?('Secteur : '+obj.s):'',
    obj.f?('Place : '+obj.f):''
  ]};
}
function rwSpecFromPlayer(p){
  return {id:'player:'+p.id, silo:'sports', classNum:1, name:p.n, metaLines:[
    'Joueur NHL — Classe 1',
    'Position : '+posLabel(p.pos),
    'Club : '+(latestTeam(p)||'—'),
    'Nationalité : '+(p.nat||'—'),
    'Source : API NHL · extraction '+((window.NHL&&NHL.extracted)||'2026-11-09')
  ]};
}
function rwSpecFromTeam(abbr){
  return {id:'team:'+abbr, silo:'sports', classNum:2, name:teamShort(abbr)+' ('+abbr+')', metaLines:[
    'Club NHL — Classe 2',
    teamLabel(abbr),
    'Source : API NHL · extraction '+((window.NHL&&NHL.extracted)||'2026-11-09')
  ]};
}

// Hook select() → summon Class 2 (always regenerate)
(function(){
  function wrapSelect(){
    if(typeof select!=='function') return false;
    if(select.__rwWrapped) return true;
    const _select=select;
    const wrapped=function(gi){
      _select(gi);
      try{
        if(gi===''||gi==null) return;
        const g=GROUPS[+gi];
        if(g) summonRightWindow(rwSpecFromGroup(g));
      }catch(e){}
    };
    wrapped.__rwWrapped=true;
    window.select=select=wrapped;
    return true;
  }
  if(!wrapSelect()){
    // defer until init
    const t=setInterval(()=>{ if(wrapSelect()) clearInterval(t); }, 50);
    setTimeout(()=>clearInterval(t), 8000);
  }
})();

window.renderMainframe=renderMainframe;
window.renderBalanceChart=renderBalanceChart;
window.renderPlanetaryCoverage=renderPlanetaryCoverage;
window.ghostHubCaptureState=ghostHubCaptureState;
window.ghostHubRestoreOnOpen=ghostHubRestoreOnOpen;
window.ghostHubReadSaved=ghostHubReadSaved;
window.applyRoute=applyRoute;
window.applyGalaxy=applyGalaxy;
window.analysisAssertIsolation=analysisAssertIsolation;
window.analysisFinanceSave=analysisFinanceSave;
window.analysisFinanceLoad=analysisFinanceLoad;
window.analysisSportSave=analysisSportSave;
window.analysisSportLoad=analysisSportLoad;
window.ANALYSIS_FINANCE_KEY=ANALYSIS_FINANCE_KEY;
window.analysisSportKey=analysisSportKey;

window.z0DomainForRoute=z0DomainForRoute;
window.assertNoZ0OnStatics=assertNoZ0OnStatics;
window.initV211=initV211;
})();


initV211(U);
