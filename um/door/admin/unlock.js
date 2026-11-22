/* Universal Metaphor — lien d'administration en un clic (hub v20.88).
   /um/door/#k=<clé> : la clé est lue dans le fragment (jamais envoyé au serveur), retirée aussitôt de la barre
   d'adresse et de l'historique, comparée à une empreinte SHA-256, puis gardée dans ce navigateur si elle est reconnue.
   Clé inconnue : rien n'est affiché, rien n'est gardé. Aucun envoi d'aucune sorte. */
(function(){
  var m=(location.hash||'').match(/(?:^#|&)k=([A-Za-z0-9_-]{22,128})/);
  var fresh=m?m[1]:null;
  if(m&&history.replaceState) history.replaceState(null,'',location.pathname+location.search); /* retire la clé tout de suite */
  if(!window.UM_ADMIN) return;
  var pending=fresh?UM_ADMIN.check(fresh).then(function(a){ if(a){ UM_ADMIN.save(fresh); } return a; }):UM_ADMIN.current();
  pending.then(function(me){ if(me) panel(me); });
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function panel(me){
    var css=document.createElement('style');
    css.textContent='#um-admin{position:relative;z-index:20;max-width:1100px;margin:14px auto;padding:14px 16px;border:2px solid #7fd1ff;border-radius:8px;background:#0b1620;color:#e6eef6;font:14px/1.45 system-ui,sans-serif}'
      +'#um-admin h2{margin:0 0 8px;font:600 12px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#bfe8ff}'
      +'#um-admin .row{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0}'
      +'#um-admin a.b,#um-admin button{display:inline-block;font:600 14px system-ui;padding:9px 14px;border-radius:6px;border:1px solid #2d4a60;background:#12263a;color:#e6eef6;text-decoration:none;cursor:pointer}'
      +'#um-admin a.b.m{border-color:#e8c872;color:#ffe9a8}'
      +'#um-admin .blk{background:#3a0e0b;border:2px solid #e0533f;color:#ffd9d2;font-weight:700;padding:6px 9px;border-radius:5px;margin-top:6px}'
      +'#um-admin .n{color:#9aa3ad;font-size:12px}';
    document.head.appendChild(css);
    var prev='/um/door/card/#preview='+btoa(unescape(encodeURIComponent(JSON.stringify({issuer:me.name,meetings:{},when:null,lang:'fr'}))));
    var d=document.createElement('section'); d.id='um-admin'; d.setAttribute('aria-label','Administration');
    d.innerHTML='<h2>Administration · '+esc(me.name)+(me.master?' · maître':'')+'</h2>'
      +'<div class="row">'
      +'<a class="b" href="/um/?guest=1">Guest · inviter (Hub)</a>'
      +'<a class="b" href="'+prev+'" target="_blank" rel="noopener">Aperçu de la carte d\'invitation</a>'
      +'<a class="b" href="/um/door/admin/invites/">Mes invités</a>'
      +(me.master?'<a class="b m" href="/um/door/admin/cle/">Clés d\'administration (maître)</a>':'')
      +'<button type="button" id="um-admin-forget">Oublier la clé ici</button></div>'
      +'<div class="blk">Envoi bloqué — en attente du feu vert d\'Éric sur les modèles</div>'
      +'<div class="n">Déverrouillé dans ce navigateur (aussi sur /um/). La clé n\'est plus dans l\'adresse. Sur un site statique, ceci cache les fonctions d\'administration sans les protéger ; la vraie protection est le point d\'entrée serveur (endpoint non déployé [INCOMPLET]).</div>';
    document.body.insertBefore(d,document.body.firstChild);
    d.querySelector('#um-admin-forget').onclick=function(){ UM_ADMIN.forget(); d.remove(); };
    try{ d.scrollIntoView({block:'start'}); }catch(e){}
  }
})();
