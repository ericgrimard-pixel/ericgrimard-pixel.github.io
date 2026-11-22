/* Universal Metaphor — empreintes des clés d'administration (hub v20.88).
   Une clé par administrateur ; seule l'empreinte SHA-256 est publiée ici, jamais une clé.
   Éric est maître : il décide qui reçoit une clé. Rotation : remplacer l'empreinte ci-dessous (et le secret du Worker).
   Sur un site statique, ceci CACHE les fonctions d'administration ; la vraie protection est le point d'entrée serveur. */
(function(){
  var FP=[{"id": "eric-grimard", "name": "Éric Grimard", "master": true, "sha256": "99586c5df0d284519808ba5f46c9da178d19b063d794c9fd2ed7252bb4466978"}, {"id": "gary-kivenko", "name": "Gary Kivenko", "master": false, "sha256": "ebe5862239bee51211fd4de64f597f69d41d0c86b25ad8c29376c911cadef0cb"}, {"id": "samuel-le-flaguais", "name": "Samuel Le Flaguais", "master": false, "sha256": "ce069173abbde924b8f6a161c380c0bb3f1b46e5e9a233c3aff5072c5c876b2a"}];
  var LS='um.hubGuestKey';
  function hex(buf){ return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join(''); }
  function check(key){
    if(typeof key!=='string'||!/^[A-Za-z0-9_-]{22,128}$/.test(key)||!window.crypto||!crypto.subtle) return Promise.resolve(null);
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)).then(function(b){ var h=hex(b); return FP.filter(function(a){return a.sha256===h;})[0]||null; });
  }
  function stored(){ try{ return localStorage.getItem(LS); }catch(e){ return null; } }
  window.UM_ADMIN={FP:FP,LS:LS,check:check,
    current:function(){ return check(stored()); },
    key:stored,
    save:function(k){ try{ localStorage.setItem(LS,k); return true; }catch(e){ return false; } },
    forget:function(){ try{ localStorage.removeItem(LS); }catch(e){} }};
})();
