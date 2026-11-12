# Next ten floors — staged, not live

Hub v20.30. This file is a disabled spec. `um/index.html` does not load it.
Nothing here adds a route, a door href, or a script tag. The live Hub still
draws only the five cardinals already in the renderer:

| Cardinal | Zone | Id | Route |
| --- | --- | --- | --- |
| S&P 500 | Amérique du Nord | SPX | `#/floor/AMF/index/SPX/year` and `/t0t1` |
| Nikkei 225 | Asie-Pacifique | N225 | `#/floor/ASF/index/N225/year` and `/t0t1` |
| EURO STOXX 50 | Europe | SX5E | `#/floor/EUF/index/SX5E/year` and `/t0t1` |
| Tadawul | Moyen-Orient | TASI | `#/floor/ASF/index/TASI/year` and `/t0t1` |
| Ibovespa | Amérique latine | IBOV | `#/floor/AMF/index/IBOV/year` and `/t0t1` |

The ten below are the next wave. Nine are the secondary doors already named in
`data-finance-zones.js`. The tenth is FTSE/JSE Top 40: it is the only other
index that file already names, it is the Africa flagship, and it has no door
because it has no price series.

`enabled` is false on every row. Do not flip it without a separate change that
wires the route.

```json
{
  "id": "FLOORS-NEXT-10",
  "enabled": false,
  "loaded_by_index_html": false,
  "floors": [
    {
      "enabled": false,
      "zone": "NA",
      "zone_name": "Amérique du Nord",
      "floor": "AMF",
      "anchor": "ndx100",
      "id": "NDX",
      "label": "Nasdaq-100",
      "source": "um/js/data-ndx.js → window.DATA.NDX",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "NA",
      "zone_name": "Amérique du Nord",
      "floor": "AMF",
      "anchor": "djia",
      "id": "DJIA",
      "label": "Dow Jones Industrial Average",
      "source": "um/js/data-finance-zones.js door only. No window.DATA.DJIA and no series file.",
      "price_data": false,
      "note": "The zone row says couvert_prix_T0_T1, but the renderer has no Dow series to read. Do not invent prices."
    },
    {
      "enabled": false,
      "zone": "NA",
      "zone_name": "Amérique du Nord",
      "floor": "AMF",
      "anchor": "sp500",
      "id": "SPX",
      "label": "S&P 500 · deux séances",
      "source": "um/js/data-spx-meta.js + data-spx-objs-*.js → window.DATA.SPX",
      "price_data": true,
      "note": "Same series as the live cardinal. The T0→T1 reading is already the live /t0t1 route. This row does not add a second floor."
    },
    {
      "enabled": false,
      "zone": "APAC",
      "zone_name": "Asie-Pacifique",
      "floor": "ASF",
      "anchor": "hsi",
      "id": "HSI",
      "label": "Hang Seng",
      "source": "um/js/data-world-indices.js → window.DATA.HSI (meta.floor ASF, mic XHKG)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "APAC",
      "zone_name": "Asie-Pacifique",
      "floor": "OCF",
      "anchor": "asx200",
      "id": "ASX200",
      "label": "S&P/ASX 200",
      "source": "um/js/data-world-indices.js → window.DATA.ASX200 (meta.floor OCF, mic XASX)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "APAC",
      "zone_name": "Asie-Pacifique",
      "floor": "ASF",
      "anchor": "sti",
      "id": "STI",
      "label": "Straits Times",
      "source": "um/js/data-world-indices.js → window.DATA.STI (meta.floor ASF, mic XSES)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "EUR",
      "zone_name": "Europe",
      "floor": "EUF",
      "anchor": "ftse100",
      "id": "FTSE100",
      "label": "FTSE 100",
      "source": "um/js/data-world-indices.js → window.DATA.FTSE100 (meta.floor EUF, mic XLON)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "EUR",
      "zone_name": "Europe",
      "floor": "EUF",
      "anchor": "dax",
      "id": "DAX",
      "label": "DAX 40",
      "source": "um/js/data-world-indices.js → window.DATA.DAX (meta.floor EUF, mic XETR)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "EUR",
      "zone_name": "Europe",
      "floor": "EUF",
      "anchor": "cac40",
      "id": "CAC40",
      "label": "CAC 40",
      "source": "um/js/data-world-indices.js → window.DATA.CAC40 (meta.floor EUF, mic XPAR)",
      "price_data": true,
      "note": "Series is already on disk. Not wired as a new live floor by this change."
    },
    {
      "enabled": false,
      "zone": "MEA",
      "zone_name": "Moyen-Orient et Afrique",
      "floor": "AFF",
      "anchor": null,
      "id": "JSE40",
      "label": "FTSE/JSE Top 40",
      "source": "um/js/data-finance-zones.js (anchor null, status [INCOMPLET]). Constituent links only in WORLD_FLOORS. No window.DATA.JSE40.",
      "price_data": false,
      "note": "Justified tenth: the only other index already named in the zone file, and the Africa flagship. No T0/T1 series, so it stays without a door."
    }
  ]
}
```
