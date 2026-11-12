/* data-finance-zones.js — HUB finance macro-zones · v20.27 · 12 nov 2026
   Five Class-2 opening members around the World Floor (Éric, 12 nov 2026, voice:
   North America, Europe, Asia-Pacific, Middle East & Africa merged, Latin America;
   each zone carries a cardinal; at least one financial floor per zone; ordered by
   importance downward).
   “Cardinal” follows PROJET MONDE §6.2 / Compilation mathématique Rev. 2.0:
   Classe 2 = agrégats / cardinaux (collapse of constituents). One cardinal index
   per zone — the flagship live floor already present in the Manifestation engine.
   Caps: World Federation of Exchanges, domestic equity market capitalisation,
   USD millions, August 2026
   (https://focus.world-exchanges.org/issue/october-2026/market-statistics,
   published Sep 2026). Exchange totals are summed as WFE publishes them (dual
   listings may overlap). No prices are invented: an index without T0/T1 in the
   Hub keeps status [INCOMPLET] and has no engine door.
   Loaded by um/index.html. The zone table is reference data for the five macro-zones. */
window.FINANCE_ZONES = {
  "version": "v20.27",
  "generated": "2026-11-12",
  "timezone": "America/Toronto",
  "source": {
    "name": "World Federation of Exchanges — Focus Market Statistics, October 2026 issue",
    "url": "https://focus.world-exchanges.org/issue/october-2026/market-statistics",
    "published": "2026-09",
    "series": "Equity — Domestic market capitalisation (USD millions)",
    "as_of": "2026-08"
  },
  "order": ["NA", "APAC", "EUR", "MEA", "LATAM"],
  "zones": {
    "NA": {
      "id": "NA",
      "name": "Amérique du Nord",
      "name_en": "North America",
      "group_title": "Finance · Amérique du Nord",
      "floor": "AMF",
      "cardinal": "sp500y",
      "importance_rank": 1,
      "market_cap_usd_millions": 83126615.8,
      "market_cap_note": "Sum of WFE Aug 2026 domestic caps: Nasdaq - US 44,260,543.84 + NYSE 33,605,298.26 + TMX Group 5,245,117.03 + Canadian Securities Exchange 15,656.67. Bermuda (2,620.19) is in the WFE Americas total but is not assigned to this zone.",
      "floors": [
        {"anchor": "sp500y", "id": "SPX", "label": "S&P 500 2026 · année", "cardinal": true, "status": "couvert_prix_T0_T1", "mic": "XNYS"},
        {"anchor": "ndx100", "id": "NDX", "label": "Nasdaq-100 2026 · année", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XNAS"},
        {"anchor": "djia", "id": "DJIA", "label": "Dow Jones 2026 · année", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XNYS"},
        {"anchor": "sp500", "id": "SPX_T0T1", "label": "S&P 500 · deux séances", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XNYS", "note": "Two-session (T0→T1) view of the same S&P 500 set; not a second market."}
      ]
    },
    "APAC": {
      "id": "APAC",
      "name": "Asie-Pacifique",
      "name_en": "Asia-Pacific",
      "group_title": "Finance · Asie-Pacifique",
      "floor": "ASF",
      "includes_floors": ["ASF", "OCF"],
      "cardinal": "n225",
      "importance_rank": 2,
      "market_cap_usd_millions": 57445161.17,
      "market_cap_note": "WFE Aug 2026 total for APAC. Shanghai (10,358,419.47) and Shenzhen (6,705,389.80) are larger than Japan Exchange Group (8,854,050.58) but have no T0/T1 floor in the Hub ([INCOMPLET]). Cardinal among live Hub floors is Nikkei 225 (JPX).",
      "floors": [
        {"anchor": "n225", "id": "N225", "label": "Nikkei 225", "cardinal": true, "status": "couvert_prix_T0_T1", "mic": "XTKS", "exchange_cap_usd_millions": 8854050.58},
        {"anchor": "hsi", "id": "HSI", "label": "Hang Seng", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XHKG", "exchange_cap_usd_millions": 6016162.32},
        {"anchor": "asx200", "id": "ASX200", "label": "S&P/ASX 200", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XASX", "exchange_cap_usd_millions": 2236214.54},
        {"anchor": "sti", "id": "STI", "label": "Straits Times", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XSES", "exchange_cap_usd_millions": 935943.30}
      ]
    },
    "EUR": {
      "id": "EUR",
      "name": "Europe",
      "name_en": "Europe",
      "group_title": "Finance · Europe",
      "floor": "EUF",
      "cardinal": "sx5e",
      "importance_rank": 3,
      "market_cap_usd_millions": 19703964.29,
      "market_cap_note": "WFE Aug 2026 EMEA total 25,901,093.30 minus Middle East 4,186,535.14 minus Africa 2,010,593.87 (Istanbul remains in Europe, consistent with data-floors.js ct:EUF). LSE is absent from this WFE table ([INCOMPLET] as a cap source). Euronext group cap 8,413,722.86; Deutsche Boerse 2,968,490.36. Cardinal is EURO STOXX 50, the only pan-European index already live in the engine.",
      "floors": [
        {"anchor": "sx5e", "id": "SX5E", "label": "EURO STOXX 50", "cardinal": true, "status": "couvert_prix_T0_T1"},
        {"anchor": "ftse100", "id": "FTSE100", "label": "FTSE 100", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XLON"},
        {"anchor": "dax", "id": "DAX", "label": "DAX 40", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XETR", "exchange_cap_usd_millions": 2968490.36},
        {"anchor": "cac40", "id": "CAC40", "label": "CAC 40", "cardinal": false, "status": "couvert_prix_T0_T1", "mic": "XPAR"}
      ]
    },
    "MEA": {
      "id": "MEA",
      "name": "Moyen-Orient et Afrique",
      "name_en": "Middle East & Africa",
      "group_title": "Finance · Moyen-Orient et Afrique",
      "floor": "MEA",
      "includes_floors": ["MEF", "AFF"],
      "merges": ["ME", "AFR"],
      "cardinal": "tasi",
      "importance_rank": 4,
      "market_cap_usd_millions": 6197129.01,
      "market_cap_note": "WFE Aug 2026: Middle East 4,186,535.14 (Tadawul 2,545,201.60 + ADX, Dubai, Kuwait, Qatar, and other WFE ME reporters) + Africa 2,010,593.87 (JSE 1,554,046.37 + other WFE Africa reporters).",
      "floors": [
        {"anchor": "tasi", "id": "TASI", "label": "Tadawul (TASI)", "cardinal": true, "status": "couvert_prix_T0_T1", "mic": "XSAU", "exchange_cap_usd_millions": 2545201.60},
        {"anchor": null, "id": "JSE40", "label": "FTSE/JSE Top 40", "cardinal": false, "status": "[INCOMPLET] prix T0/T1", "mic": "XJSE", "exchange_cap_usd_millions": 1554046.37, "note": "Constituents exist in WORLD_FLOORS (liens). No T0/T1 series in ÉCHANGE or the Hub; no Manifestation engine door is added."}
      ]
    },
    "LATAM": {
      "id": "LATAM",
      "name": "Amérique latine",
      "name_en": "Latin America",
      "group_title": "Finance · Amérique latine",
      "floor": "AMF",
      "cardinal": "ibov",
      "importance_rank": 5,
      "market_cap_usd_millions": 2499427.39,
      "market_cap_note": "WFE Aug 2026 Latin America and the Caribbean, including Mexico (UN M49): B3 1,070,948.08 + BMV 604,570.21 + Santiago 282,907.50 + Bolsa Electronica de Chile 180,434.32 + Colombia 172,447.50 + Lima 135,519.65 + Latinex 35,743.00 + Jamaica 13,553.76 + Costa Rica 3,303.37. Mexico has no T0/T1 index in the Hub ([INCOMPLET]).",
      "floors": [
        {"anchor": "ibov", "id": "IBOV", "label": "Ibovespa · deux séances", "cardinal": true, "status": "couvert_prix_T0_T1", "mic": "XB3", "exchange_cap_usd_millions": 1070948.08}
      ]
    }
  },
  "sports": [
    ["Sport · Hockey", [["nhl", "LNH 2024-25 → 2025-26"]]]
  ]
};
