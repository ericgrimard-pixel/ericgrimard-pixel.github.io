/* Asset resolver for the split v20.9 SAFE site.
   Photos and flags stay in window.__ASSET_MAP (data URIs).
   Club marks resolve to logos/{ABBR}.svg files (abbreviation badges). */
window.__ASSET_MAP = window.__ASSET_MAP || {};
(function(){
  function resolve(src){
    if(!src || typeof src !== "string") return src;
    if(src.indexOf("data:")===0 || src.indexOf("blob:")===0 || src.indexOf("http:")===0 || src.indexOf("https:")===0) return src;
    var key = src.replace(/^\.\//,"").split("?")[0].split("#")[0];
    var m = key.match(/(?:^|\/)((?:photos|logos|drapeaux)\/[^\/]+)$/);
    if(m) key = m[1];
    if(/^logos\/[A-Z]{3}\.png$/.test(key)) key = key.replace(/\.png$/, ".svg");
    var M = window.__ASSET_MAP || {};
    if(M[key]) return M[key];
    return key.indexOf("logos/")===0 ? key : src;
  }
  window.__resolveAsset = resolve;
  try{
    var desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if(desc && desc.set){
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        configurable: true,
        enumerable: desc.enumerable,
        get: function(){ return desc.get.call(this); },
        set: function(v){ desc.set.call(this, resolve(v)); }
      });
    }
  }catch(e){}
  var sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(n, v){
    if(String(n).toLowerCase()==="src" && this instanceof HTMLImageElement) v = resolve(v);
    return sa.call(this, n, v);
  };
  function rewriteImg(img){
    if(!img || img.nodeType!==1) return;
    var raw = img.getAttribute("src");
    if(!raw) return;
    var r = resolve(raw);
    if(r !== raw) sa.call(img, "src", r);
  }
  function scan(root){
    if(!root || !root.querySelectorAll) return;
    var imgs = root.querySelectorAll("img");
    for(var i=0;i<imgs.length;i++) rewriteImg(imgs[i]);
  }
  var mo = new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var mu = muts[i];
      if(mu.type==="attributes" && mu.attributeName==="src" && mu.target && mu.target.tagName==="IMG") rewriteImg(mu.target);
      if(mu.addedNodes){
        for(var j=0;j<mu.addedNodes.length;j++){
          var n = mu.addedNodes[j];
          if(n.nodeType===1){
            if(n.tagName==="IMG") rewriteImg(n);
            else scan(n);
          }
        }
      }
    }
  });
  function arm(){
    scan(document);
    mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:["src"]});
  }
  if(document.documentElement) arm();
  else document.addEventListener("DOMContentLoaded", arm);
})();
