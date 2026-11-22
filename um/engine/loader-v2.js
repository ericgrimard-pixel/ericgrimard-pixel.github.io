/* SANTÉ — chargeur de paquets v2 (référence pour le moteur ; aucune dépendance).
   Lit les DEUX formats déjà livrés, sans que le moteur ait à choisir :
     - sante-pack-index/1  (values_v1.3 : colonnes fixes, provenance groupée)
     - sante-pack-index/1g (générique : en-tête et colonnes dictionnaires déclarés dans l'index)
   Même discipline que v1 : index d'abord, paquet seulement à la demande, SHA-256 contrôlé avant usage,
   décompression native, cache LRU borné en lignes, lectures simultanées plafonnées.
   Rien n'est converti : chaque valeur est rendue telle que la source l'a écrite (texte). */
(function (root) {
  'use strict';
  async function sha256hex(buf) {
    const h = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function gunzipJSON(buf) {
    const s = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(s).text());
  }
  const FORMATS = { 'sante-pack-index/1': 'v1', 'sante-pack-index/1g': 'v1g' };

  function SantePacks(baseUrl, opts) {
    opts = opts || {};
    this.base = baseUrl.replace(/\/?$/, '/');
    this.maxRows = opts.maxResidentRows || 120000;
    this.maxParallel = opts.maxParallel || 2;
    this.cache = new Map(); this.resident = 0; this.inflight = new Map(); this.active = 0; this.queue = [];
    this.index = null; this.dict = null; this.kind = null; this.header = null;
  }
  SantePacks.prototype._fetchChecked = async function (path, sha) {
    const r = await fetch(this.base + path);
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + path);
    const buf = await r.arrayBuffer();
    if (await sha256hex(buf) !== sha) throw new Error('SHA-256 refusé pour ' + path);
    return gunzipJSON(buf);
  };
  SantePacks.prototype.open = async function () {
    const r = await fetch(this.base + 'index.json');
    if (!r.ok) throw new Error('HTTP ' + r.status + ' index.json');
    this.index = await r.json();
    this.kind = FORMATS[this.index.format];
    if (!this.kind) throw new Error('format de paquet inconnu : ' + this.index.format);  // refus explicite, pas de devinette
    const d = await this._fetchChecked(this.index.dict.path, this.index.dict.sha256_gz);
    this.dict = this.kind === 'v1g' ? d.dicts : d;
    this.header = this.kind === 'v1g' ? this.index.header : this.index.source_columns;
    return this.index;
  };
  /* Clés communes aux deux formats pour filtrer : zone, geo (= iso3 ou code source), level, indicator. */
  SantePacks.prototype.find = function (f) {
    f = f || {};
    const geo = f.geo || f.iso3;
    return this.index.shards.filter(m =>
      (!f.zone || m.zone === f.zone) &&
      (!geo || (m.geo || m.iso3) === geo) &&
      (!f.level || m.level === f.level) &&
      (!f.indicator || !m.indicators || m.indicators.includes(f.indicator)));
  };
  SantePacks.prototype._slot = function () {
    if (this.active < this.maxParallel) { this.active++; return Promise.resolve(); }
    return new Promise(res => this.queue.push(res));
  };
  SantePacks.prototype._release = function () { const n = this.queue.shift(); if (n) n(); else this.active--; };
  SantePacks.prototype._evict = function (keep) {
    for (const [k, v] of this.cache) {
      if (this.resident <= this.maxRows) break;
      if (k === keep) continue;
      this.cache.delete(k); this.resident -= v.rows;
    }
  };
  SantePacks.prototype.shard = async function (m) {
    if (this.cache.has(m.path)) { const v = this.cache.get(m.path); this.cache.delete(m.path); this.cache.set(m.path, v); return v.data; }
    if (this.inflight.has(m.path)) return this.inflight.get(m.path);
    const p = (async () => {
      await this._slot();
      try {
        const s = await this._fetchChecked(m.path, m.sha256_gz);
        if (s.cols.seq.length !== m.rows) throw new Error('nombre de lignes ≠ index : ' + m.path);
        this.cache.set(m.path, { rows: m.rows, data: s }); this.resident += m.rows; this._evict(m.path);
        return s;
      } finally { this._release(); this.inflight.delete(m.path); }
    })();
    this.inflight.set(m.path, p); return p;
  };
  /* Lignes décodées à la demande ; chaque ligne est un objet {colonne source: texte source}, plus _seq. */
  SantePacks.prototype.rows = function* (s) {
    const D = this.dict, c = s.cols, n = c.seq.length;
    if (this.kind === 'v1') {
      for (let j = 0; j < n; j++) {
        const u = s.units[c.u[j]], pv = D.prov[c.prov[j]];
        yield { _seq: c.seq[j], level: s.level, zone: s.zone, iso3: s.iso3, unit_code: u[0], unit_name: u[1],
          indicator: D.indicator[c.ind[j]], sex: D.sex[c.sex[j]], age: D.age[c.age[j]],
          value: c.value[j], unit: D.unit[c.unit[j]], year: D.year[c.year[j]],
          flag: pv[0], source: pv[1], table: pv[2], url: pv[3] };
      }
      return;
    }
    const H = this.header, G = this.index.geo_column;
    for (let j = 0; j < n; j++) {
      const r = { _seq: c.seq[j], _zone: s.zone };
      for (const h of H) r[h] = h === G ? s.geo : (D[h] ? D[h][c[h][j]] : c[h][j]);
      yield r;
    }
  };
  root.SantePacks = SantePacks;
})(typeof window !== 'undefined' ? window : globalThis);
