/* v20.19 — Hockey galaxy: league → conference/division → club → players.
   Sealed sports silo. Original conference/division glyphs (not NHL trademarks).
   Club logos self-hosted. Player mugshots are not used on the public site. */
(function(w){
'use strict';

var ALIGN = w.NHL_ALIGN || {};
var LOGOS = w.NHL_LOGOS || {};
var JERSEYS = w.NHL_JERSEYS || {};
var logoImgs = {};
var AS_OF = '2026-11-09';

function $(id){ return document.getElementById(id); }
function nhl(){ return w.NHL || {}; }

function teamAbbrOf(p){
  var ts = (p && p.ts) || {};
  var a = ts['20252026'] || ts['20242025'] || '';
  if(typeof a === 'string' && a.indexOf(',') >= 0) a = a.split(',')[0].trim();
  return a || '';
}
function teamName(abbr){
  var t = (nhl().teams || {})[abbr] || {};
  return t['20252026'] || t['20242025'] || abbr;
}
function divById(id){
  var list = ALIGN.divisions || [];
  for(var i=0;i<list.length;i++) if(list[i].id === id) return list[i];
  return null;
}
function confById(id){
  var list = ALIGN.conferences || [];
  for(var i=0;i<list.length;i++) if(list[i].id === id) return list[i];
  return null;
}
function divOfTeam(abbr){
  var list = ALIGN.divisions || [];
  for(var i=0;i<list.length;i++){
    if((list[i].teams || []).indexOf(abbr) >= 0) return list[i];
  }
  return null;
}
function playersOfTeam(abbr){
  return (nhl().players || []).filter(function(p){ return teamAbbrOf(p) === abbr; });
}
function jerseyOf(p){
  var rec = JERSEYS[p && p.id] || JERSEYS[String(p && p.id)] || null;
  return rec;
}
function ageOf(bd){
  if(!bd) return null;
  var b = new Date(String(bd) + 'T00:00:00');
  var a = new Date(AS_OF + 'T00:00:00');
  if(isNaN(b.getTime())) return null;
  var age = a.getFullYear() - b.getFullYear();
  var m = a.getMonth() - b.getMonth();
  if(m < 0 || (m === 0 && a.getDate() < b.getDate())) age--;
  return age;
}
function posCode(p){
  var rec = jerseyOf(p);
  return (rec && rec.pos) || (p && p.pos) || '';
}
function logoImg(abbr){
  if(!logoImgs[abbr]){
    var im = new Image();
    var rec = LOGOS[abbr] || {};
    im.src = rec.file || ('logos/' + abbr + '.svg');
    im.onload = function(){
      if(w.__DRAW_OVERRIDE === 'nhl' && typeof w.drawNhlLeagueGalaxy === 'function'){
        try{ w.drawNhlLeagueGalaxy(); }catch(e){}
      }
    };
    logoImgs[abbr] = im;
  }
  return logoImgs[abbr];
}

/* ---- original glyphs (canvas) — not NHL trademarks ---- */
function glyphPath(ctx, kind, x, y, s){
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#e8c872';
  ctx.fillStyle = '#e8c872';
  ctx.lineWidth = Math.max(1.5, s * 0.08);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if(kind === 'nhl'){
    ctx.beginPath(); ctx.arc(0,0,s*0.46,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,s*0.22,0,Math.PI*2); ctx.stroke();
  } else if(kind === 'east'){
    ctx.beginPath();
    ctx.moveTo(-s*0.22,-s*0.34); ctx.lineTo(s*0.32,0); ctx.lineTo(-s*0.22,s*0.34);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s*0.38,0); ctx.lineTo(s*0.28,0); ctx.stroke();
  } else if(kind === 'west'){
    ctx.beginPath();
    ctx.moveTo(s*0.22,-s*0.34); ctx.lineTo(-s*0.32,0); ctx.lineTo(s*0.22,s*0.34);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.38,0); ctx.lineTo(-s*0.28,0); ctx.stroke();
  } else if(kind === 'atlantic'){
    ctx.beginPath();
    for(var i=0;i<=16;i++){
      var t = i/16;
      var px = -s*0.42 + t*s*0.84;
      var py = Math.sin(t*Math.PI*2)*s*0.14 - s*0.08;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.beginPath();
    for(i=0;i<=16;i++){
      t = i/16;
      px = -s*0.42 + t*s*0.84;
      py = Math.sin(t*Math.PI*2 + 0.6)*s*0.12 + s*0.14;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
  } else if(kind === 'metropolitan'){
    var hs = [-0.36,-0.14,0.08,0.3];
    var hh = [0.22,0.42,0.32,0.18];
    ctx.beginPath();
    ctx.moveTo(-s*0.46, s*0.28);
    for(i=0;i<hs.length;i++){
      ctx.lineTo(s*hs[i], s*0.28);
      ctx.lineTo(s*hs[i], -s*hh[i]);
      ctx.lineTo(s*(hs[i]+0.18), -s*hh[i]);
      ctx.lineTo(s*(hs[i]+0.18), s*0.28);
    }
    ctx.lineTo(s*0.46, s*0.28);
    ctx.stroke();
  } else if(kind === 'central'){
    ctx.beginPath();
    ctx.moveTo(0,-s*0.42); ctx.lineTo(0,s*0.42);
    ctx.moveTo(-s*0.42,0); ctx.lineTo(s*0.42,0);
    ctx.moveTo(-s*0.28,-s*0.28); ctx.lineTo(s*0.28,s*0.28);
    ctx.moveTo(s*0.28,-s*0.28); ctx.lineTo(-s*0.28,s*0.28);
    ctx.stroke();
  } else if(kind === 'pacific'){
    ctx.beginPath(); ctx.arc(0,-s*0.06,s*0.16,0,Math.PI*2); ctx.stroke();
    for(i=0;i<8;i++){
      var a = i*Math.PI/4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*s*0.24, -s*0.06+Math.sin(a)*s*0.24);
      ctx.lineTo(Math.cos(a)*s*0.36, -s*0.06+Math.sin(a)*s*0.36);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-s*0.4, s*0.32);
    ctx.quadraticCurveTo(-s*0.16, s*0.12, 0, s*0.32);
    ctx.quadraticCurveTo(s*0.16, s*0.48, s*0.4, s*0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function glyphSVG(kind){
  var inner = '';
  if(kind==='nhl') inner = '<circle cx="16" cy="16" r="10" fill="none"/><circle cx="16" cy="16" r="4.5" fill="none"/>';
  else if(kind==='east') inner = '<path d="M10 6 L22 16 L10 26" fill="none"/><path d="M8 16 H21" fill="none"/>';
  else if(kind==='west') inner = '<path d="M22 6 L10 16 L22 26" fill="none"/><path d="M24 16 H11" fill="none"/>';
  else if(kind==='atlantic') inner = '<path d="M5 12 C9 6 13 18 17 12 C21 6 25 14 27 12" fill="none"/><path d="M5 22 C9 16 13 28 17 22 C21 16 25 24 27 22" fill="none"/>';
  else if(kind==='metropolitan') inner = '<path d="M4 24 V14 H9 V8 H14 V12 H19 V16 H24 V24 Z" fill="none"/>';
  else if(kind==='central') inner = '<path d="M16 5 V27 M5 16 H27 M8 8 L24 24 M24 8 L8 24" fill="none"/>';
  else if(kind==='pacific') inner = '<circle cx="16" cy="13" r="4" fill="none"/><path d="M16 6 V8 M16 18 V20 M9 13 H11 M21 13 H23 M11 8 L12.2 9.2 M20 8 L18.8 9.2 M11 18 L12.2 16.8 M20 18 L18.8 16.8" fill="none"/><path d="M5 25 Q11 20 16 25 Q21 29 27 24" fill="none"/>';
  else if(kind==='home') inner = '<path d="M6 16 L16 7 L26 16 V25 H6 Z" fill="none"/><path d="M13 25 V19 H19 V25" fill="none"/>';
  else if(kind==='back') inner = '<path d="M20 8 L10 16 L20 24" fill="none"/>';
  return '<svg viewBox="0 0 32 32" aria-hidden="true"><g stroke="#e8c872" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">'+inner+'</g></svg>';
}

/* rink: attacking toward +y in world, toward top of SVG */
function posZone(code, index){
  var base;
  if(code==='G') base = {x:0.50, y:0.14};
  else if(code==='C') base = {x:0.50, y:0.58};
  else if(code==='L') base = {x:0.22, y:0.62};
  else if(code==='R') base = {x:0.78, y:0.62};
  else if(code==='D'){
    // L/R unknown — alternate points, mark [INCOMPLET] in info
    base = (index % 2 === 0) ? {x:0.30, y:0.32} : {x:0.70, y:0.32};
  } else base = {x:0.50, y:0.48};
  var ring = Math.floor(index / (code==='D'?2:1));
  if(code!=='D') ring = Math.floor(index);
  var ang = index * 2.2;
  var rad = 0.028 * (ring % 6);
  return {x: base.x + Math.cos(ang)*rad, y: base.y + Math.sin(ang)*rad*0.7};
}
function posColor(code){
  if(code==='G') return '#f2f4f8';
  if(code==='C') return '#e8c872';
  if(code==='L') return '#7ec8e3';
  if(code==='R') return '#e39b6b';
  if(code==='D') return '#8aa0c8';
  return '#9aa3b5';
}

function rinkSVG(highlight, opts){
  opts = opts || {};
  var w = opts.w || 240, h = opts.h || 140;
  var code = highlight || '';
  var counts = {};
  var z = posZone(code, 0);
  var cx = (z.x * 184 + 8).toFixed(1);
  var cy = ((1-z.y) * 124 + 8).toFixed(1);
  return '<svg class="nhl-mini-rink" viewBox="0 0 200 140" width="'+w+'" height="'+h+'" aria-hidden="true">'
    + '<rect x="8" y="8" width="184" height="124" rx="22" fill="#0b1a28" stroke="#cfd6e0" stroke-width="2"/>'
    + '<line x1="100" y1="8" x2="100" y2="132" stroke="#c44" stroke-width="1.6"/>'
    + '<line x1="8" y1="46" x2="192" y2="46" stroke="#4aa3e0" stroke-width="1.4"/>'
    + '<line x1="8" y1="94" x2="192" y2="94" stroke="#4aa3e0" stroke-width="1.4"/>'
    + '<circle cx="100" cy="70" r="16" fill="none" stroke="#c44" stroke-width="1.2"/>'
    + '<circle cx="100" cy="70" r="1.6" fill="#c44"/>'
    + '<circle cx="55" cy="46" r="10" fill="none" stroke="#c44" stroke-width="1"/>'
    + '<circle cx="145" cy="46" r="10" fill="none" stroke="#c44" stroke-width="1"/>'
    + '<circle cx="55" cy="94" r="10" fill="none" stroke="#c44" stroke-width="1"/>'
    + '<circle cx="145" cy="94" r="10" fill="none" stroke="#c44" stroke-width="1"/>'
    + '<path d="M78 132 C78 118 122 118 122 132" fill="none" stroke="#c44" stroke-width="1.4"/>'
    + '<rect x="92" y="128" width="16" height="4" fill="none" stroke="#cfd6e0" stroke-width="1"/>'
    + (code ? ('<circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#e8c872" stroke="#fff3c4" stroke-width="1.5"/>') : '')
    + '</svg>';
}

function drawRink(ctx, x, y, w, h){
  ctx.save();
  var r = Math.min(w,h)*0.08;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = 'rgba(11,26,40,.92)';
  ctx.fill();
  ctx.strokeStyle = '#cfd6e0';
  ctx.lineWidth = 2;
  ctx.stroke();
  var x0=x, y0=y, x1=x+w, y1=y+h;
  var midX = x+w/2;
  var blue1 = y + h*0.27;
  var blue2 = y + h*0.73;
  ctx.beginPath(); ctx.strokeStyle='#c44'; ctx.lineWidth=2;
  ctx.moveTo(x0+2, y+h/2); ctx.lineTo(x1-2, y+h/2); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle='#4aa3e0'; ctx.lineWidth=1.6;
  ctx.moveTo(x0+2, blue1); ctx.lineTo(x1-2, blue1);
  ctx.moveTo(x0+2, blue2); ctx.lineTo(x1-2, blue2); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle='#c44'; ctx.lineWidth=1.2;
  ctx.arc(midX, y+h/2, Math.min(w,h)*0.09, 0, Math.PI*2); ctx.stroke();
  function face(fx, fy){
    ctx.beginPath(); ctx.arc(fx, fy, Math.min(w,h)*0.055, 0, Math.PI*2); ctx.stroke();
  }
  ctx.strokeStyle='#c44';
  face(x+w*0.28, blue1); face(x+w*0.72, blue1);
  face(x+w*0.28, blue2); face(x+w*0.72, blue2);
  // crease at bottom (own net) — attacking toward top
  ctx.beginPath();
  ctx.moveTo(midX - w*0.11, y1-3);
  ctx.bezierCurveTo(midX - w*0.11, y1-h*0.11, midX + w*0.11, y1-h*0.11, midX + w*0.11, y1-3);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function zoomState(){
  var z = w.__NHL_ZOOM || {};
  return {
    level: z.level || 'league',
    conf: z.conf || null,
    div: z.div || null,
    team: z.team || null
  };
}

function currentXY(x, y){
  if(typeof w.nhlXY === 'function') return w.nhlXY(x,y);
  return [x, y];
}

function fitWorld(x0,x1,y0,y1){
  w.__NHL_VIEW = {x0:x0, x1:x1, y0:y0, y1:y1};
}

function drawDisk(ctx, px, py, r, fill, stroke){
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI*2);
  ctx.fillStyle = fill;
  ctx.fill();
  if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawLogoInCircle(ctx, abbr, px, py, r){
  var im = logoImg(abbr);
  drawDisk(ctx, px, py, r, 'rgba(14,18,28,.94)', '#e8c872');
  if(im && im.complete && im.naturalWidth){
    ctx.save();
    ctx.beginPath(); ctx.arc(px, py, r-3, 0, Math.PI*2); ctx.clip();
    var s = (r-4)*2;
    ctx.drawImage(im, px-s/2, py-s/2, s, s);
    ctx.restore();
  }
}

function pushHit(kind, rec){
  w.HIT = w.HIT || {c1:[], c2:[], c4:null};
  if(kind==='c1') w.HIT.c1.push(rec);
  else if(kind==='c4') w.HIT.c4 = rec;
  else w.HIT.c2.push(rec);
}

function drawSuper(ctx, spec){
  var xy = currentXY(spec.x, spec.y);
  var px = xy[0], py = xy[1];
  var r = spec.r || 36;
  drawDisk(ctx, px, py, r, spec.fill || 'rgba(14,18,28,.94)', spec.stroke || '#e8c872');
  if(spec.glyph) glyphPath(ctx, spec.glyph, px, py, r*0.92);
  if(spec.logo) drawLogoInCircle(ctx, spec.logo, px, py, r);
  var hit = {kind:spec.kind, id:spec.id, px:px, py:py, r:r, nhl:1};
  if(spec.kind==='league') pushHit('c4', hit);
  else if(spec.kind==='player') pushHit('c1', hit);
  else pushHit('c2', hit);
  return hit;
}

function clubLayout(n){
  var cols = n <= 4 ? n : 4;
  var rows = Math.ceil(n / cols);
  var pts = [];
  for(var i=0;i<n;i++){
    var c = i % cols;
    var r = Math.floor(i / cols);
    var x = (c - (cols-1)/2) * 0.52;
    var y = 0.05 - (r - (rows-1)/2) * 0.52;
    pts.push({x:x, y:y});
  }
  return pts;
}

function drawNhlLeagueGalaxy(){
  var ctx = w.ctx, W = w.W, H = w.H;
  if(!ctx) return;
  w.HIT = {c1:[], c2:[], c4:null, c4n:[], z0:null, gr:0, c:0, lib:[], libR:null, nhl:true};
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0,0,W,H);
  var z = zoomState();
  fitWorld(-1.35, 1.35, -1.05, 1.15);

  if(z.level === 'team' && z.team){
    drawTeamView(ctx, z);
  } else if(z.level === 'div' && z.div){
    drawDivView(ctx, z);
  } else if(z.level === 'conf' && z.conf){
    drawConfView(ctx, z);
  } else {
    drawLeagueView(ctx);
  }

  if($('d')){
    var nP = (nhl().players||[]).length;
    $('d').textContent = 'LNH · 2 associations · 4 divisions · 32 clubs · '+nP+' joueurs';
  }
  if($('st')) $('st').innerHTML = '';
  if($('lg')){ $('lg').innerHTML=''; $('lg').style.display='none'; }
}

function drawLeagueView(ctx){
  drawSuper(ctx, {kind:'league', id:'nhl', x:0, y:0.78, r:48, glyph:'nhl'});
  drawSuper(ctx, {kind:'conf', id:'east', x:-0.58, y:0.22, r:40, glyph:'east'});
  drawSuper(ctx, {kind:'conf', id:'west', x: 0.58, y:0.22, r:40, glyph:'west'});
  drawSuper(ctx, {kind:'div', id:'atlantic', x:-0.96, y:-0.48, r:42, glyph:'atlantic'});
  drawSuper(ctx, {kind:'div', id:'metropolitan', x:-0.32, y:-0.48, r:42, glyph:'metropolitan'});
  drawSuper(ctx, {kind:'div', id:'central', x: 0.32, y:-0.48, r:42, glyph:'central'});
  drawSuper(ctx, {kind:'div', id:'pacific', x: 0.96, y:-0.48, r:42, glyph:'pacific'});
}

function drawCollapsedRail(ctx, except){
  except = except || {};
  var items = [
    {kind:'league', id:'nhl', glyph:'nhl'},
    {kind:'conf', id:'east', glyph:'east'},
    {kind:'conf', id:'west', glyph:'west'},
    {kind:'div', id:'atlantic', glyph:'atlantic'},
    {kind:'div', id:'metropolitan', glyph:'metropolitan'},
    {kind:'div', id:'central', glyph:'central'},
    {kind:'div', id:'pacific', glyph:'pacific'}
  ];
  var shown = items.filter(function(it){
    if(except.league && it.kind==='league') return false;
    if(except.conf && it.id===except.conf) return false;
    if(except.div && it.id===except.div) return false;
    return true;
  });
  var n = shown.length;
  shown.forEach(function(it, i){
    var x = (i - (n-1)/2) * 0.36;
    drawSuper(ctx, {kind:it.kind, id:it.id, x:x, y:0.92, r:22, glyph:it.glyph});
  });
}

function drawConfView(ctx, z){
  var conf = confById(z.conf);
  if(!conf){ drawLeagueView(ctx); return; }
  drawCollapsedRail(ctx, {conf: conf.id});
  drawSuper(ctx, {kind:'conf', id:conf.id, x:0, y:0.42, r:36, glyph:conf.id});
  var divs = conf.divisions || [];
  divs.forEach(function(did, i){
    var x = (i === 0 ? -0.55 : 0.55);
    drawSuper(ctx, {kind:'div', id:did, x:x, y:-0.15, r:44, glyph:did});
  });
}

function drawDivView(ctx, z){
  var div = divById(z.div);
  if(!div){ drawLeagueView(ctx); return; }
  drawCollapsedRail(ctx, {div: div.id});
  drawSuper(ctx, {kind:'div', id:div.id, x:0, y:0.48, r:30, glyph:div.id});
  var teams = div.teams || [];
  var pts = clubLayout(teams.length);
  teams.forEach(function(abbr, i){
    drawSuper(ctx, {kind:'team', id:abbr, x:pts[i].x, y:pts[i].y - 0.18, r:36, logo:abbr});
  });
}

function drawTeamView(ctx, z){
  var abbr = z.team;
  var div = divOfTeam(abbr);
  drawCollapsedRail(ctx, {});
  // other clubs of the same division as collapsed logos under the rail
  if(div){
    var others = (div.teams || []).filter(function(t){ return t !== abbr; });
    others.forEach(function(t, i){
      var x = (i - (others.length-1)/2) * 0.28;
      drawSuper(ctx, {kind:'team', id:t, x:x, y:0.55, r:18, logo:t});
    });
  }
  drawSuper(ctx, {kind:'team', id:abbr, x:0, y:0.22, r:28, logo:abbr});

  var xy0 = currentXY(-0.82, -0.92);
  var xy1 = currentXY(0.82, -0.05);
  var rx = Math.min(xy0[0], xy1[0]);
  var ry = Math.min(xy0[1], xy1[1]);
  var rw = Math.abs(xy1[0]-xy0[0]);
  var rh = Math.abs(xy1[1]-xy0[1]);
  drawRink(ctx, rx, ry, rw, rh);

  var plist = playersOfTeam(abbr);
  var byPos = {G:[], D:[], C:[], L:[], R:[], X:[]};
  plist.forEach(function(p){
    var code = posCode(p) || 'X';
    if(!byPos[code]) byPos.X.push(p); else byPos[code].push(p);
  });
  ['G','D','C','L','R','X'].forEach(function(code){
    (byPos[code]||[]).forEach(function(p, idx){
      var zpos = posZone(code === 'X' ? 'C' : code, idx);
      var wx = -0.82 + zpos.x * 1.64;
      var wy = -0.92 + zpos.y * 0.87;
      var xy = currentXY(wx, wy);
      var col = posColor(code === 'X' ? '' : code);
      drawDisk(ctx, xy[0], xy[1], 6.5, col, 'rgba(255,255,255,.35)');
      pushHit('c1', {kind:'player', id:p.id, px:xy[0], py:xy[1], r:16, nhl:1, pl:p, abbr:abbr});
    });
  });
}

function handleNhlLeagueClick(e){
  if(w.__DRAW_OVERRIDE !== 'nhl') return false;
  if(w.moved) return true;
  var mx = e.clientX, my = e.clientY;
  var HIT = w.HIT || {};
  function pick(arr, pad){
    var best=null, bd=1e9;
    (arr||[]).forEach(function(h){
      var d = Math.hypot(h.px-mx, h.py-my);
      if(d <= (h.r||10)+pad && d < bd){ bd=d; best=h; }
    });
    return best;
  }
  var h = pick(HIT.c1, 4);
  if(!h) h = pick(HIT.c2, 2);
  if(!h && HIT.c4){
    var d = Math.hypot(HIT.c4.px-mx, HIT.c4.py-my);
    if(d <= HIT.c4.r + 2) h = HIT.c4;
  }
  if(!h) return true;
  if(h.kind === 'league'){ goHash('#/sports/nhl'); openLeagueInfo(); }
  else if(h.kind === 'conf'){ goHash('#/sports/nhl/conf/'+h.id); }
  else if(h.kind === 'div'){ goHash('#/sports/nhl/div/'+h.id); }
  else if(h.kind === 'team'){ goHash('#/sports/nhl/team/'+h.id); }
  else if(h.kind === 'player'){ openPlayerInfo(h.pl || findPlayer(h.id), h.abbr); }
  return true;
}

function findPlayer(id){
  return (nhl().players||[]).find(function(p){ return p.id === id || String(p.id)===String(id); });
}
function goHash(h){
  w.__RW_NHL_LOCK = false;
  if(typeof w.go === 'function') w.go(h);
  else location.hash = h;
}

function openLeagueInfo(){
  w.__RW_NHL_LOCK = true;
  var nP = (nhl().players||[]).length;
  summon({
    id:'nhl:league', silo:'sports', classNum:4, name:'LNH — ligue',
    metaLines:[
      'Super-instanciateur de ligue',
      '2 associations · 4 divisions · 32 clubs',
      nP+' joueurs Classe 1',
      'Alignement 2025-26 — source API LNH (standings), relevé '+ALIGN.retrieved+' (America/Toronto)',
      'Silo hockey — aucune donnée finance'
    ]
  });
}
function openConfInfo(id){
  var c = confById(id); if(!c) return;
  var n = 0;
  (c.divisions||[]).forEach(function(did){ var d=divById(did); n += (d && d.teams || []).length; });
  summon({
    id:'nhl:conf:'+id, silo:'sports', classNum:2, name:c.name,
    metaLines:[
      'Association — super-instanciateur Classe 2',
      (c.divisions||[]).length+' divisions · '+n+' clubs',
      'Alignement 2025-26 — source API LNH (standings), relevé '+ALIGN.retrieved+' (America/Toronto)',
      'Glyphe original (non officiel)'
    ]
  });
}
function openDivInfo(id){
  var d = divById(id); if(!d) return;
  var c = confById(d.conf);
  summon({
    id:'nhl:div:'+id, silo:'sports', classNum:2, name:'Division '+d.name,
    metaLines:[
      'Division — super-instanciateur Classe 2',
      c ? ('Association : '+c.name) : '',
      (d.teams||[]).length+' clubs',
      'Membres : '+(d.teams||[]).join(', '),
      'Alignement 2025-26 — source API LNH (standings), relevé '+ALIGN.retrieved+' (America/Toronto)',
      'Glyphe original (non officiel)'
    ].filter(Boolean)
  });
}
function openTeamInfo(abbr){
  var d = divOfTeam(abbr);
  var c = d && confById(d.conf);
  var rec = LOGOS[abbr] || {};
  var n = playersOfTeam(abbr).length;
  var lic = rec.license || '[INCOMPLET]';
  var srcLine = rec.source === 'commons'
    ? ('Logo : Wikimedia Commons — '+ (rec.commonsTitle||'') + ' · licence '+lic)
    : (lic || 'Marque déposée — © LNH/club, source assets.nhle.com');
  summon({
    id:'nhl:team:'+abbr, silo:'sports', classNum:2, name:teamName(abbr)+' ('+abbr+')',
    metaLines:[
      'Club — super-instanciateur Classe 2',
      d ? ('Division '+d.name) : 'Division [INCOMPLET]',
      c ? ('Association : '+c.name) : '',
      n+' joueurs Classe 1',
      srcLine,
      rec.commonsPage ? rec.commonsPage : (rec.url || 'source assets.nhle.com'),
      'Alignement 2025-26 — source API LNH, relevé '+ALIGN.retrieved+' (America/Toronto)'
    ].filter(Boolean)
  });
}
function openPlayerInfo(p, abbrHint){
  if(!p) return;
  w.__RW_NHL_LOCK = true;
  var rec = jerseyOf(p) || {};
  var abbr = abbrHint || teamAbbrOf(p);
  var d = divOfTeam(abbr);
  var num = rec.n;
  var bd = rec.bd || p.bd || '';
  var age = ageOf(bd);
  var code = rec.pos || p.pos || '';
  var sideNote = (code === 'D') ? 'Côté défense L/R : [INCOMPLET]' : '';
  var el = summon({
    id:'nhl:player:'+p.id, silo:'sports', classNum:1, name:p.n || p.id,
    metaLines:[
      'Joueur — Classe 1',
      'Club : '+(teamName(abbr)||abbr)+' ('+abbr+')',
      d ? ('Division '+d.name) : '',
      'Position nominale : '+(code || '[INCOMPLET]')+' (source API LNH)',
      sideNote,
      num != null ? ('Dossard : '+num+' (source API LNH, saison '+(rec.season||'20252026')+')') : 'Dossard : [INCOMPLET]',
      age != null ? ('Âge au '+AS_OF+' (America/Toronto) : '+age+' ans') : 'Âge : [INCOMPLET]',
      bd ? ('Naissance : '+bd) : '',
      p.nat ? ('Nationalité : '+p.nat) : '',
      'position nominale, source API LNH — pas de données de tracking',
      'Source API LNH · extraction '+((nhl().extracted)||AS_OF)+' (America/Toronto)'
    ].filter(Boolean)
  });
  if(el){
    var sec = document.createElement('section');
    sec.className = 'rw-rink';
    sec.innerHTML = '<h3>Position nominale</h3>'+rinkSVG(code)+'<p class="rw-muted">position nominale, source API LNH</p>';
    var body = el.querySelector('.rw-body');
    if(body) body.insertBefore(sec, body.children[1] || null);
  }
}
function summon(spec){
  if(typeof w.summonRightWindow !== 'function') return null;
  try{ return w.summonRightWindow(spec); }catch(e){ return null; }
}

function summonCurrentSystem(){
  var z = zoomState();
  if(z.level==='team' && z.team) openTeamInfo(z.team);
  else if(z.level==='div' && z.div) openDivInfo(z.div);
  else if(z.level==='conf' && z.conf) openConfInfo(z.conf);
  else openLeagueInfo();
  w.__RW_NHL_LOCK = false;
}

function backHash(){
  var z = zoomState();
  if(z.level==='team' && z.team){
    var d = divOfTeam(z.team);
    return d ? '#/sports/nhl/div/'+d.id : '#/sports/nhl';
  }
  if(z.level==='div' || z.level==='conf') return '#/sports/nhl';
  return '#/';
}

function ensureNhlSpine(){
  var bar = $('nhl-spine');
  if(!bar){
    bar = document.createElement('nav');
    bar.id = 'nhl-spine';
    bar.setAttribute('aria-label', 'Navigation hockey');
    document.body.appendChild(bar);
  }
  var z = zoomState();
  var btns = [
    {id:'home', glyph:'home', route:'#/', title:'Hub'},
    {id:'back', glyph:'back', route: backHash(), title:'Niveau supérieur'},
    {id:'nhl', glyph:'nhl', route:'#/sports/nhl', title:'Ligue'},
    {id:'east', glyph:'east', route:'#/sports/nhl/conf/east', title:'Association de l\'Est'},
    {id:'west', glyph:'west', route:'#/sports/nhl/conf/west', title:'Association de l\'Ouest'},
    {id:'atlantic', glyph:'atlantic', route:'#/sports/nhl/div/atlantic', title:'Atlantique'},
    {id:'metropolitan', glyph:'metropolitan', route:'#/sports/nhl/div/metropolitan', title:'Métropolitaine'},
    {id:'central', glyph:'central', route:'#/sports/nhl/div/central', title:'Centrale'},
    {id:'pacific', glyph:'pacific', route:'#/sports/nhl/div/pacific', title:'Pacifique'}
  ];
  bar.innerHTML = btns.map(function(b){
    var on = (b.id==='nhl' && z.level==='league')
      || (b.id===z.conf) || (b.id===z.div);
    return '<button type="button" class="nhl-spine-btn'+(on?' on':'')+'" data-route="'+b.route+'" title="'+b.title+'" aria-label="'+b.title+'">'+glyphSVG(b.glyph)+'</button>';
  }).join('');
  bar.style.display = 'flex';
}

function hideNhlSpine(){
  var bar = $('nhl-spine');
  if(bar) bar.style.display = 'none';
}

function applyNhlLeagueHooks(){
  var route = (typeof w.parseHash === 'function') ? null : null;
  try{
    // parseHash inside IIFE is patched in app.js; read from location here too
  }catch(e){}
  var raw = decodeURIComponent((location.hash||'#/').replace(/^#/,''));
  var p = raw.split('/').filter(Boolean);
  var zoom = {level:'league', conf:null, div:null, team:null};
  if(p[0]==='sports' && p[1]==='nhl'){
    if(p[2]==='conf' && p[3]){ zoom.level='conf'; zoom.conf=String(p[3]).toLowerCase(); }
    else if(p[2]==='div' && p[3]){ zoom.level='div'; zoom.div=String(p[3]).toLowerCase(); }
    else if(p[2]==='team' && p[3]){ zoom.level='team'; zoom.team=String(p[3]).toUpperCase(); }
  }
  w.__NHL_ZOOM = zoom;
  hideNhlSpine();
  ensureNhlSpine();
  if(typeof w.hideRetourHubBar === 'function') try{ w.hideRetourHubBar(); }catch(e){}
  var old = $('nhl-info-chip'); if(old) old.style.display='none';
}

/* Domain-map hub — two domain doors.
   Hockey opens Claude's real NHL galaxy (#nhl).
   Finance opens Claude's UM engine:
   primary #sp500y (année, 2 janv. → 4 nov.), secondary #sp500 (deux séances T0/T1).
   The hub's own hockey route #/sports/nhl and finance placeholder #/galaxy/planet
   stay at their URLs (not doors). */
var UM_ENGINE_BASE = String(w.UM_ENGINE_URL || 'https://claude.ai/artifact/Mr4cUjAuszjdrQU8U6YRig').split('#')[0];
var UM_HOCKEY = UM_ENGINE_BASE + '#nhl';
var UM_FINANCE_YEAR = UM_ENGINE_BASE + '#sp500y';
var UM_FINANCE_TWO = UM_ENGINE_BASE + '#sp500';

function renderDomainMap(){
  var el = $('mf');
  if(!el) return;
  document.body.classList.add('mode-home-vignette');
  hideNhlSpine();
  var finGlyph = '<svg viewBox="0 0 32 32" aria-hidden="true"><g stroke="#e8c872" stroke-width="2" fill="none" stroke-linecap="round"><circle cx="16" cy="16" r="11"/><path d="M16 5 C20 10 20 22 16 27 M16 5 C12 10 12 22 16 27 M5 16 H27 M7 11 H25 M7 21 H25"/></g></svg>';
  el.innerHTML =
    '<div class="domain-map" id="domain-map">'
    + '<div class="dm-grid">'
    +   '<a class="dm-tile dm-hockey" href="'+UM_HOCKEY+'" data-id="DOM-HOCKEY">'
    +     '<span class="dm-glyph" aria-hidden="true">'+glyphSVG('nhl')+'</span>'
    +     '<span class="dm-name">Hockey</span>'
    +   '</a>'
    +   '<div class="dm-tile dm-finance" data-id="DOM-FINANCE">'
    +     '<a class="dm-finance-body" href="'+UM_FINANCE_YEAR+'">'
    +       '<span class="dm-glyph" aria-hidden="true">'+finGlyph+'</span>'
    +       '<span class="dm-name">Finance</span>'
    +     '</a>'
    +     '<div class="dm-finance-modes">'
    +       '<a class="dm-mode dm-mode-primary" href="'+UM_FINANCE_YEAR+'">S&amp;P 500 · année (2 janv. → 4 nov.)</a>'
    +       '<a class="dm-mode dm-mode-secondary" href="'+UM_FINANCE_TWO+'">S&amp;P 500 · deux séances (T₀ / T₁)</a>'
    +     '</div>'
    +   '</div>'
    + '</div></div>';
}

w.drawNhlLeagueGalaxy = drawNhlLeagueGalaxy;
w.handleNhlLeagueClick = handleNhlLeagueClick;
w.ensureNhlSpine = ensureNhlSpine;
w.hideNhlSpine = hideNhlSpine;
w.applyNhlLeagueHooks = applyNhlLeagueHooks;
w.renderDomainMap = renderDomainMap;
w.nhlSummonCurrentSystem = summonCurrentSystem;
w.nhlOpenPlayerInfo = openPlayerInfo;
w.nhlRinkSVG = rinkSVG;

})(window);
