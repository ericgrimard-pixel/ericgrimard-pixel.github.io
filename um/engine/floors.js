/* Floors on the real engine. Each new system is a subset of one library:
   the same date array and the same constituent objects. No price, name,
   country, industry or sector is invented. */
(function(){
  const ZONES=[
    {id:'sp500y', key:'na', name:'Amérique du Nord', libs:['sp500y','ndx100','djia','sp500'], cardinal:'W', heading:-Math.PI/2},
    {id:'sx5e', key:'eur', name:'Europe', libs:['sx5e','ftse100','dax','cac40'], cardinal:'N', heading:0},
    {id:'n225', key:'apac', name:'Asie-Pacifique', libs:['n225','hsi','sti','asx200'], cardinal:'E', heading:Math.PI/2},
    {id:'tasi', key:'mea', name:'Moyen-Orient et Afrique', libs:['tasi'], cardinal:'S', heading:Math.PI},
    {id:'ibov', key:'latam', name:'Amérique latine', libs:['ibov'], cardinal:'SW', heading:Math.PI*1.25}
  ];
  const ZONE_OF={
    sp500y:'sp500y', ndx100:'sp500y', djia:'sp500y', sp500:'sp500y',
    sx5e:'sx5e', ftse100:'sx5e', dax:'sx5e', cac40:'sx5e',
    n225:'n225', hsi:'n225', sti:'n225', asx200:'n225',
    tasi:'tasi', ibov:'ibov'
  };
  const MIC={
    XNYS:['na','United States'], XNAS:['na','United States'], BATS:['na','United States'],
    XLON:['eur','United Kingdom'], XPAR:['eur','France'], XETR:['eur','Germany'], XWAR:['eur','Poland'], XBRU:['eur','Belgium'], XOSL:['eur','Norway'], XWBO:['eur','Austria'], XCSE:['eur','Denmark'], XHEL:['eur','Finland'], XLIS:['eur','Portugal'], XDUB:['eur','Ireland'],
    XTKS:['apac','Japan'], XHKG:['apac','Hong Kong'], XSES:['apac','Singapore'],
    XASX:['apac','Australia'], XBKK:['apac','Thailand'], XNZE:['apac','New Zealand'], XTAI:['apac','Taiwan'], XKLS:['apac','Malaysia'], XIDX:['apac','Indonesia'], XSTC:['apac','Vietnam'],
    XSAU:['mea','Saudi Arabia'], XTAE:['mea','Israel'], DSMD:['mea','Qatar'], XCAI:['mea','Egypt'], XIST:['mea','Turkey'],
    XB3:['latam','Brazil'], XBOG:['latam','Colombia'], XBUE:['latam','Argentina'], XSGO:['latam','Chile']
  };
  function sys(id){ return LIB.find(x=>x.id===id); }
  function slug(s){
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'x';
  }
  function esc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  const floors=[];
  const by={};
  function addFloor(f){ floors.push(f); by[f.id]=f; if(!f.children) f.children=[]; }
  addFloor({id:'world', name:'Finance', level:'world', parent:null, children:ZONES.map(z=>z.id)});
  ZONES.forEach(z=>addFloor({id:z.id, name:z.name, level:'zone', parent:'world', children:[], n:(sys(z.id)&&sys(z.id).data.t.length)||0, source:z.id}));
  ['ndx100','djia','sp500','ftse100','dax','cac40','hsi','sti','asx200'].forEach(id=>{
    const s=sys(id); if(!s) return;
    addFloor({id:id, name:s.name, level:'index', parent:ZONE_OF[id], children:[], n:s.data.t.length, source:id});
    const z=by[ZONE_OF[id]];
    if(z&&!z.children.includes(id)) z.children.unshift(id);
  });
  const seen=new Set(LIB.map(x=>x.id));
  function addSys(meta, sourceId, rows){
    if(seen.has(meta.id)||!rows.length) return;
    const src=sys(sourceId);
    LIB.push({
      id:meta.id, name:meta.name, silo:meta.silo, cur:src.cur,
      source:esc(meta.name)+' — '+rows.length+' titres réels de <code>'+esc(sourceId)+'</code>. Même calendrier, mêmes clôtures, mêmes pays, industries et secteurs. Rien n’est inventé.',
      data:{dates:src.data.dates, t:rows}
    });
    seen.add(meta.id);
    addFloor(meta);
  }
  ZONES.forEach(z=>{
    const best={};
    z.libs.forEach(lid=>{
      const s=sys(lid); if(!s||!s.data||!s.data.t) return;
      const g={};
      s.data.t.forEach(t=>{
        if(!t||!t.cty||t.cty==='n/d') return;
        (g[t.cty]||(g[t.cty]=[])).push(t);
      });
      Object.keys(g).forEach(cty=>{
        if(!best[cty]||g[cty].length>best[cty].rows.length) best[cty]={lib:lid, rows:g[cty]};
      });
    });
    Object.keys(best).sort().forEach(cty=>{
      const pack=best[cty];
      if(pack.rows.length<2) return;
      const cid='cty-'+z.key+'-'+slug(cty);
      addSys({id:cid, name:cty, level:'country', parent:z.id, children:[], n:pack.rows.length, source:pack.lib, silo:'Finance · '+z.name, zone:z.key, cty:cty}, pack.lib, pack.rows);
      by[z.id].children.push(cid);
      by[z.id].children.sort((a,b)=>by[b].n-by[a].n);
      const bySec={};
      pack.rows.forEach(t=>{ if(t.sec) (bySec[t.sec]||(bySec[t.sec]=[])).push(t); });
      Object.keys(bySec).sort().forEach(sec=>{
        const rs=bySec[sec];
        if(rs.length<8) return;
        const sid='sec-'+z.key+'-'+slug(cty)+'-'+slug(sec);
        addSys({id:sid, name:sec, level:'sector', parent:cid, children:[], n:rs.length, source:pack.lib, silo:'Finance · '+z.name, zone:z.key, cty:cty, sec:sec}, pack.lib, rs);
        by[cid].children.push(sid);
        const byInd={};
        rs.forEach(t=>{ if(t.ind) (byInd[t.ind]||(byInd[t.ind]=[])).push(t); });
        const inds=Object.keys(byInd).filter(ind=>byInd[ind].length>=6 && byInd[ind].length<rs.length).sort((a,b)=>byInd[b].length-byInd[a].length);
        inds.slice(0,1).forEach(ind=>{
          const rows=byInd[ind];
          const iid='ind-'+z.key+'-'+slug(cty)+'-'+slug(ind);
          addSys({id:iid, name:ind, level:'industry', parent:sid, children:[], n:rows.length, source:pack.lib, silo:'Finance · '+z.name, zone:z.key, cty:cty, sec:sec, ind:ind}, pack.lib, rows);
          by[sid].children.push(iid);
        });
      });
    });
  });
  const redir={
    'floor/WF':'world', 'floor/world':'world', 'world':'world',
    'floor/AMF':'sp500y', 'floor/EUF':'sx5e', 'floor/ASF':'n225', 'floor/MEF':'tasi', 'floor/OCF':'',
    'floor/AMF/index/SPX':'sp500y', 'floor/AMF/index/NDX':'ndx100', 'floor/AMF/index/DJIA':'djia', 'floor/AMF/index/IBOV':'ibov',
    'floor/EUF/index/SX5E':'sx5e', 'floor/EUF/index/FTSE100':'ftse100', 'floor/EUF/index/DAX':'dax', 'floor/EUF/index/CAC40':'cac40',
    'floor/ASF/index/N225':'n225', 'floor/ASF/index/HSI':'hsi', 'floor/ASF/index/STI':'sti', 'floor/ASF/index/TASI':'tasi',
    'floor/MEF/index/TASI':'tasi', 'floor/OCF/index/ASX200':'asx200',
    'floor/AFF':'jse40', 'floor/AFF/index/JSE40':'jse40', 'floor/MEF/index/JSE40':'jse40',
    'floor/EUF/index/WIG20':'wig20',
    'floor/ASF/index/SET50':'set50', 'floor/ASF/index/TW50':'tw50',
    'floor/ASF/index/NZX50':'nzx50', 'floor/OCF/index/NZX50':'nzx50',
    'floor/AMF/index/COLCAP':'colcap', 'floor/AMF/index/MERVAL':'merval', 'floor/AMF/index/IPSA':'ipsa',
    'floor/AMF/index/IBRX50':'ibrx50', 'floor/AMF/index/SMLL':'smll', 'floor/AMF/index/IFNC':'ifnc', 'floor/AMF/index/IMOB':'imob', 'floor/AMF/index/IDIV':'idiv',
    'floor/MEF/index/TA35':'ta35', 'floor/MEF/index/QE':'qe', 'floor/MEF/index/EGX30':'egx30', 'floor/MEF/index/BIST30':'bist30',
    'floor/ASF/index/KLCI':'klci',
    'floor/EUF/index/BEL20':'bel20', 'floor/EUF/index/OBX':'obx',
    'floor/EUF/index/ATX':'atx', 'floor/EUF/index/OMXC25':'omxc25', 'floor/EUF/index/OMXH25':'omxh25', 'floor/EUF/index/PSI':'psi', 'floor/EUF/index/ISEQ20':'iseq20',
    'floor/ASF/index/LQ45':'lq45', 'floor/ASF/index/VN30':'vn30',
    'floor/NSF':'', 'floor/EWF':''
  };
  const ocf=floors.find(f=>f.level==='country'&&f.zone==='apac'&&f.cty==='Australia');
  if(ocf) redir['floor/OCF']=ocf.id;
  Object.keys(MIC).forEach(mic=>{
    const hit=floors.find(f=>f.level==='country'&&f.zone===MIC[mic][0]&&f.cty===MIC[mic][1]);
    ['floor/AMF/ex/','floor/EUF/ex/','floor/ASF/ex/','floor/OCF/ex/','floor/MEF/ex/','floor/AFF/ex/'].forEach(p=>{
      redir[p+mic]=hit?hit.id:'';
    });
  });
  const nhl=sys('nhl'), music=sys('music');
  addFloor({id:'art', name:'Art', level:'silo', parent:'world', children:music?['music']:[], n:1});
  addFloor({id:'sports', name:'Sports', level:'silo', parent:'world', children:nhl?['nhl']:[], n:1});
  if(music) addFloor({id:'music', name:music.name, level:'index', parent:'art', children:[], n:music.data.t.length, source:'music'});
  if(nhl) addFloor({id:'nhl', name:nhl.name, level:'index', parent:'sports', children:[], n:nhl.data.t.length, source:'nhl'});
  if(by.world&&!by.world.children.includes('art')) by.world.children.push('art');
  if(by.world&&!by.world.children.includes('sports')) by.world.children.push('sports');
  const ZONE_NAME={
    'Amérique du Nord':'sp500y','Europe':'sx5e','Asie-Pacifique':'n225',
    'Moyen-Orient et Afrique':'tasi','Moyen-Orient':'tasi','Amérique latine':'ibov'
  };
  LIB.forEach(s=>{
    if(!s.market||by[s.id]) return;
    const parent=ZONE_NAME[s.zone]||'world';
    addFloor({id:s.id, name:s.name, level:'index', parent:parent, children:[], n:(s.data&&s.data.t&&s.data.t.length)||0, source:s.id});
    const p=by[parent];
    if(p&&!p.children.includes(s.id)) p.children.unshift(s.id);
  });
  const cardinal={};
  ZONES.forEach(z=>{ cardinal[z.id]={h:z.cardinal, a:z.heading, name:z.name}; });
  window.UM_CARDINAL=cardinal;
  window.UM_FLOORS=floors;
  window.UM_FLOOR_BY=by;
  window.UM_REDIR=redir;
  window.UM_WHY={
    'floor/NSF':'Les bibliothèques n’ont pas d’hémisphère. Mélanger leurs calendriers inventerait une série.',
    'floor/EWF':'Les bibliothèques n’ont pas d’est ni d’ouest. Mélanger leurs calendriers inventerait une série.'
  };
  window.UM_RESOLVE=function(raw){
    if(!raw||raw==='world') return 'world';
    const key=String(raw).replace(/\/(year|t0t1)$/,'');
    if(Object.prototype.hasOwnProperty.call(redir, key)) return redir[key]||'';
    if(LIB.some(x=>x.id===raw&&x.data)) return raw;
    return '';
  };
})();
