# Checksums of the published tree

`SHA256SUMS-PUBLIC` lists SHA-256 of each file **as it is on this path**.

Source deposits are identified by the SHA-256 of the original deposited bytes (see each `systems/*/meta.json`). Two cases differ:

1. **Byte-identical on the live path** (snapshot engine, wrappers, landing page, schema JSON/MD, indicators, LF-native CSV sources including finance, hockey, cas-limites, NHL long, and `synthetic-health-le0.csv` after a CRLF restore).
2. **CRLF originals published as LF** (the text uploader normalized `
` to `
`). The files are otherwise identical. Original vs live:

- `schema/country-zone.csv` — original f58f832a991d9a268381d7a8ce3483112d5d06651507ec2a144394ae3fbc8604 (15500 bytes); live 078e469430f1ce62802587b6d21b8b2cfb2f76a2cf6d6cd1397d77cf1d5e3f5e (15282 bytes, LF).
- `systems/0cf92c4aa33c-sante-treillis-extrait/cells.csv` — original f2b7a076da2bdd388eab5a2f1b43b7c098ce8780ef80799e3b491c3e9a036327 (9048 bytes); live dec23daba5e4d19776c84b2b74851f08752586a78d554d1b6c8a63b3a4b0916b (9017 bytes, LF).
- `systems/0cf92c4aa33c-sante-treillis-extrait/lattice-excerpt-le0-pop-hale0.csv` — original 0cf92c4aa33cc0c930b414e8a3d436cf07f33a562bd6133208ba3e80ce4016fa (4771 bytes); live 57ceea2e351009437605538ae9856467f3707c3fdc48a570fcd9b6b75abed434 (4740 bytes, LF).
- `systems/b88b16afff76-sante-synthetic-le0-xlsx/cells.csv` — original db9d5d45d80291d9107880a55ce319e8551460911b288995d65c55e723027fef (2429 bytes); live ab9350ff1ea6a4c1dd8c2edf287cebfde053329014f6693e0336e8912191b9e9 (2420 bytes, LF).
- `systems/e07d07936ce5-sante-synthetic-le0-csv/cells.csv` — original 9ca8f9fb391eac1924e7c826980a82715847841b28480287b3f3b06f266eb296 (2429 bytes); live 80325a2d7baec3e11dc3b5e348aba31760930ee9730aa016846caf98d3fb8df9 (2420 bytes, LF).

Two xlsx source workbooks could not be uploaded through the text-only GitHub connector (binary ZIP). They stay in the local public tree only. The viewers and `lib-intake.js` are live. Original SHA-256:

- `systems/b88b16afff76-sante-synthetic-le0-xlsx/synthetic-health-le0.xlsx` — b88b16afff7647260f33b15803e435ab5522456670d325e971ca617f3509b3c3
- `systems/907b94d35964-deux-onglets-xlsx/SAMPLE-deux-onglets.xlsx` — 907b94d35964c6d4c3112afafe96598d06c57f6517be6432cc0d6b85edf77355

`lattice.json` (~19.7 MB) is not published.
