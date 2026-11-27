# Reconstruction générique : vérifie chaque SHA-256, rebâtit le CSV et imprime son SHA-256.
import csv, gzip, json, hashlib, sys, io
pk, outcsv = sys.argv[1], sys.argv[2]
I = json.load(open(pk + '/index.json', encoding='utf-8'))
def load(p, sha):
    b = open(pk + '/' + p, 'rb').read()
    assert hashlib.sha256(b).hexdigest() == sha, ('SHA', p)
    return json.loads(gzip.decompress(b))
D = load(I['dict']['path'], I['dict']['sha256_gz'])['dicts']
H = I['header']; R = [None] * I['source_rows']
for m in I['shards']:
    s = load(m['path'], m['sha256_gz']); c = s['cols']
    assert len(c['seq']) == m['rows']
    for j, k in enumerate(c['seq']):
        R[k] = [s['geo'] if h == I['geo_column'] else (D[h][c[h][j]] if h in D else c[h][j]) for h in H]
assert all(r is not None for r in R)
buf = io.StringIO(newline='')
w = csv.writer(buf, lineterminator=I['line_terminator']); w.writerow(H); w.writerows(R)
data = buf.getvalue().encode('utf-8')
open(outcsv, 'wb').write(data)
print(hashlib.sha256(data).hexdigest(), len(data))
