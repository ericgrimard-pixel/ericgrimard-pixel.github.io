# SANTÉ — paquets consommables v1, version générique (tout CSV long).
# Usage : pack_generic.py <source.csv> <dossier> <colonne_pays> [country-zone.csv]
# - Découpe par zone × pays (zone lue UNIQUEMENT dans country-zone.csv ; code inconnu → "_NON_RATTACHE", jamais deviné).
# - Toutes les colonnes gardées en texte verbatim ; colonnes répétitives encodées par dictionnaire.
# - seq = rang d'origine : reconstruction octet pour octet (contrôlée par unpack_generic.py).
import csv, gzip, json, hashlib, os, sys, collections, io
src, out, geo = sys.argv[1], sys.argv[2], sys.argv[3]
cz = sys.argv[4] if len(sys.argv) > 4 else None
MAXROWS = 40000
raw = open(src, 'rb').read()
term = '\r\n' if b'\r\n' in raw[:65536] else '\n'
text = raw.decode('utf-8')
rd = csv.reader(io.StringIO(text, newline=''))
head = next(rd); rows = list(rd)
gi = head.index(geo)
Z = {}
if cz:
    for x in csv.DictReader(open(cz, encoding='utf-8')): Z[x['iso3']] = x['zone']
# colonnes à dictionnaire : cardinalité < 5 % des lignes
card = [len({r[i] for r in rows}) for i in range(len(head))]
dict_cols = [i for i in range(len(head)) if i != gi and card[i] < max(50, len(rows) // 20)]
plain_cols = [i for i in range(len(head)) if i != gi and i not in dict_cols]
G = {head[i]: [] for i in dict_cols}; GI = {head[i]: {} for i in dict_cols}
def gid(c, v):
    d = GI[c]
    if v not in d: d[v] = len(G[c]); G[c].append(v)
    return d[v]
os.makedirs(out + '/shards', exist_ok=True)
groups = collections.OrderedDict()
for i, r in enumerate(rows):
    z = Z.get(r[gi], '_NON_RATTACHE') if cz else '_'
    groups.setdefault((z, r[gi]), []).append(i)
def safe(s): return ''.join(ch if ch.isalnum() or ch in '-_' else '_' for ch in s)
M = []
def emit(name, z, geov, idx, part):
    c = {head[i]: [] for i in dict_cols + plain_cols}; c['seq'] = []
    for k in idx:
        r = rows[k]
        for i in dict_cols: c[head[i]].append(gid(head[i], r[i]))
        for i in plain_cols: c[head[i]].append(r[i])
        c['seq'].append(k)
    body = json.dumps({'format': 'sante-pack-shard/1g', 'zone': z, 'geo': geov, 'part': part, 'cols': c}, ensure_ascii=False, separators=(',', ':')).encode()
    gz = gzip.compress(body, 9, mtime=0); p = 'shards/' + name + '.json.gz'
    open(out + '/' + p, 'wb').write(gz)
    M.append({'path': p, 'zone': z, 'geo': geov, 'part': part, 'rows': len(idx), 'bytes_gz': len(gz), 'bytes_json': len(body),
              'sha256_gz': hashlib.sha256(gz).hexdigest(), 'sha256_json': hashlib.sha256(body).hexdigest()})
for (z, g), idx in groups.items():
    base = f"{safe(z)}__{safe(g)}"
    for k in range(0, len(idx), MAXROWS):
        emit(base + (f"__{k // MAXROWS}" if len(idx) > MAXROWS else ''), z, g, idx[k:k + MAXROWS], k // MAXROWS)
dic = json.dumps({'format': 'sante-pack-dict/1g', 'dicts': G}, ensure_ascii=False, separators=(',', ':')).encode()
dgz = gzip.compress(dic, 9, mtime=0); open(out + '/dict.json.gz', 'wb').write(dgz)
idx = {'format': 'sante-pack-index/1g', 'source_file': os.path.basename(src), 'source_sha256': hashlib.sha256(raw).hexdigest(),
       'source_bytes': len(raw), 'source_rows': len(rows), 'header': head, 'geo_column': geo, 'line_terminator': term,
       'dict_columns': [head[i] for i in dict_cols], 'plain_columns': [head[i] for i in plain_cols],
       'zone_table': os.path.basename(cz) if cz else None, 'dict': {'path': 'dict.json.gz', 'sha256_gz': hashlib.sha256(dgz).hexdigest(), 'bytes_gz': len(dgz)},
       'max_rows_per_shard': MAXROWS, 'shards': M}
open(out + '/index.json', 'w', encoding='utf-8').write(json.dumps(idx, ensure_ascii=False, indent=1))
nr = sum(m['rows'] for m in M if m['zone'] == '_NON_RATTACHE')
print(len(M), 'paquets ; non rattachés :', nr, 'lignes ; max gz', max(m['bytes_gz'] for m in M), '; total gz', sum(m['bytes_gz'] for m in M) + len(dgz))
