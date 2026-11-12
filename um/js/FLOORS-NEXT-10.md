# Floors that were staged — now live

Hub v20.39. `um/index.html` still does not load this file. It records what the
ten staged floors became once the Hub drew them.

The thirteen priced index floors (Dow, Nikkei, Hang Seng, FTSE, DAX, CAC,
Euro Stoxx, ASX, Ibovespa, Straits Times, Tadawul, S&P, Nasdaq) are the
manifestation routes below. FTSE/JSE Top 40 is the one staged floor with
constituent names and no price series: its floor lists those names and tags
the price `[INCOMPLET]`. No price was invented.

Region floors `#/floor/AMF`, `#/floor/EUF`, `#/floor/ASF`, `#/floor/OCF`,
`#/floor/MEF` and `#/floor/AFF` are the level between World and these indices.
An exchange that already has constituent closes on disk is a manifestation
floor (`#/floor/{region}/ex/{MIC}`). An exchange with only a verified link
is a floor whose constituents and prices stay `[INCOMPLET]`.

| Id | Route | What is on it |
| --- | --- | --- |
| NDX | `#/floor/AMF/index/NDX` | Nasdaq-100 closes |
| DJIA | `#/floor/AMF/index/DJIA` | Dow names whose closes already sit in S&P or Nasdaq |
| SPX | `#/floor/AMF/index/SPX` | S&P 500 closes |
| HSI | `#/floor/ASF/index/HSI` | Hang Seng closes |
| STI | `#/floor/ASF/index/STI` | Straits Times closes |
| ASX200 | `#/floor/OCF/index/ASX200` | S&P/ASX 200 closes |
| FTSE100 | `#/floor/EUF/index/FTSE100` | FTSE 100 closes |
| DAX | `#/floor/EUF/index/DAX` | DAX 40 closes |
| CAC40 | `#/floor/EUF/index/CAC40` | CAC 40 closes |
| JSE40 | `#/floor/AFF/index/JSE40` | 40 constituent names, price `[INCOMPLET]` |

```json
{
  "id": "FLOORS-NEXT-10",
  "enabled": true,
  "loaded_by_index_html": false,
  "floors": [
    {"id": "NDX", "route": "#/floor/AMF/index/NDX", "price_data": true},
    {"id": "DJIA", "route": "#/floor/AMF/index/DJIA", "price_data": true, "note": "Closes copied from the embedded S&P 500 and Nasdaq-100 series for the Dow names. Nothing invented."},
    {"id": "SPX", "route": "#/floor/AMF/index/SPX", "price_data": true},
    {"id": "HSI", "route": "#/floor/ASF/index/HSI", "price_data": true},
    {"id": "STI", "route": "#/floor/ASF/index/STI", "price_data": true},
    {"id": "ASX200", "route": "#/floor/OCF/index/ASX200", "price_data": true},
    {"id": "FTSE100", "route": "#/floor/EUF/index/FTSE100", "price_data": true},
    {"id": "DAX", "route": "#/floor/EUF/index/DAX", "price_data": true},
    {"id": "CAC40", "route": "#/floor/EUF/index/CAC40", "price_data": true},
    {"id": "JSE40", "route": "#/floor/AFF/index/JSE40", "price_data": false, "note": "Constituent names from WORLD_FLOORS. Price T0/T1 is [INCOMPLET]."}
  ]
}
```
