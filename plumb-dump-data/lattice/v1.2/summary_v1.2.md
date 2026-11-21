# GROK — SANTÉ — Treillis v1.2 — 21 nov 2026 — Résumé

The v1.2 pass is additive. The v1 and v1.1 files are unchanged, and nothing touches the hub, the repo or the protocol.
- Every value is taken verbatim from its source, with the source, table, year and URL recorded (values_v1.2.csv).
- Nothing is derived. Gaps are marked OPEN [INCOMPLET].
- A zone aggregate is marked PROVISIONAL when its countries cover less than 50% of the zone's population.
- 25,648 sourced values in total; 34 new indicators (indicators-v1.2.json).

## Additions by item

| # | Item | Added | Coverage |
|---|---|---|---|
| 1 | Official VSL | **EU (ECHA):** €3.5M, cancer-specific reference WTP value (2016). Secondary-reported because the primary PDF could not be retrieved.<br>**NZ (MoT, via ITF/OECD 2023):** NZD 12.5M (2021 prices) and NZD 13.3M (2022 prices).<br>**Japan (MLIT, FY2024 revision):** ¥601M per fatality. This is a human-loss value, not a pure WTP VSL; the previous value was ¥226M.<br>**Korea (KRIHS PB 443):** about ₩440M (2009). Secondary-reported, and an accident-cost unit rather than a VSL. | 3 countries and the EU. The official set now covers 7 countries (US, UK, CA, AU from v1.1, plus NZ, JP, KR) and the EU. |
| 1b | OECD (2014) *Cost of Air Pollution*, Table 2.13 | Country VSL for 2005 and 2010 (USD M, PPP). Source-modelled: base USD 3M, income elasticity 0.8. | 34 OECD countries |
| 2 | OPHI MPI by age (Table 3.1, 2025) | MPI, H, A and severe poverty for ages 0-9, 10-17, 18-59, 60+ and 0-17 | 109 countries (Africa 42, East 23, America 20, Middle East 9, South Pacific 8, Europe 7) |
| 3 | Eurostat hlth_rs_prsrg, NUTS2, latest year 2013–2021 | Doctors | 300 regions, 33 countries |
| | | Nurses and midwives | 235 regions |
| | | Dentists | 254 regions |
| | | Pharmacists | 210 regions |
| | | Physiotherapists | 225 regions |
| | | Values are given as N and as per 100k. | |
| 3b | Eurostat cens_11ao_r2 (2011 census, dated) | Employed ISCO-1 and ISCO-2 by sex (T/M/F), NUTS2 | 311 regions, 32 countries |
| 3c | Eurostat ilc_peps11n | AROPE % by NUTS2, 2024/2025 | 263 regions, 33 countries |
| 4 | Canadian physicians, CIHI SMDB 2024 (Methodology Notes, Table 5) | Family medicine, specialists and total, by province | 13 of 13 provinces and territories (total 99,555). No sex or age split (OPEN). |
| 5 | US LE by state, NVSR 74-12 (2022), Tables A and B | LE0 and LE65 by sex (T/M/F) | 51 of 51 (50 states + DC) |
| 6 | Global Data Lab subnational LE | — | **OPEN**: requires registration on the owner's account; not attempted |
| 7 | SAIPE 2023 counties (new **county** level) | Poverty % for all ages, 0-17 and 5-17, plus median household income | 3,144 counties |
| 8 | European city poverty, Urban Audit urb_clivcon (no credentials needed) | At risk of poverty after social transfers (AROP), % | 281 cities |
| | | AROPE, % | 32 cities |
| | | Median disposable household income, EUR | 216 cities |
| | | Countries reporting (8): DE 127, FR 75, NL 47, BG 18, FI 9, EE 3, LV 1, MT 1 | |
| 9 | BLS OEWS May 2024, MSA (city/metro level) | Lawyers 23-1011 | 389 MSAs |
| | | Registered nurses | 391 MSAs |
| | | Pharmacists | 389 MSAs |
| | | Family medicine physicians | 258 MSAs |
| | | General dentists | 314 MSAs |
| | | Nurse midwives | 38 MSAs |
| | | Total employment | 393 MSAs |
| | | Values are given as N and per 1,000 jobs. Suppressed cells are left OPEN. | |
| 10 | Lawyers, ABA National Lawyer Population Survey 2025 | Resident active attorneys | 51 (50 states + DC) and 5 territories. Sum of the rows: 1,374,677; national total reported: 1,374,720; the gap is not reconciled. |
| 10b | Lawyers, CCBE | — | **OPEN**: ccbe.eu statistics PDFs return 404 from the box |

## Lowest level now reached per zone (v1 + v1.1 + v1.2)

| Zone | Lowest level | What sits there |
|---|---|---|
| America | County | US: 3,144 counties (SAIPE poverty) |
| | City | 393 US MSAs (workforce); 8 Canadian CMAs (poverty, v1.1) |
| | Region | US states (LE0/LE65 2022, lawyers); Canadian provinces (physicians 2024) |
| Europe | City | 281 Urban Audit cities (poverty), in 8 countries |
| | Region | NUTS2 (professions 2013–21, AROPE 2024/25, 2011 census ISCO-2 by sex) |
| Africa | Region | OPHI survey regions (v1.1) |
| | Country | MPI by age |
| East | Region | OPHI survey regions (v1.1) |
| | Country | MPI by age; OECD VSL for Japan and Korea |
| Middle East | Region | OPHI survey regions (v1.1) |
| | Country | MPI by age; OECD VSL for Israel and Turkey |
| South Pacific | Region | OPHI regions for PNG and other Pacific countries (v1.1); AUS and NZL regions are OPEN |
| | Country | OECD VSL for AUS and NZL; official VSL for NZ |

## Zone aggregates (zone_aggregates_v1.2.csv)

- OECD-2014 VSL (2010):
  - FILLED in Europe (68.9% population coverage), South Pacific (69.6%) and America (51.0%).
  - PROVISIONAL in East (4.0%) and Middle East (1.9%).
  - OPEN in Africa.
- MPI by age:
  - FILLED in Africa (97%), East (93–94%), Middle East (62%) and America (57%).
  - PROVISIONAL in Europe (3.4%) and South Pacific (26.5%).
  - These are weighted by total population, not by the population of each age group.

## Remaining gaps (open_gaps_v1.2.csv)

- CCBE lawyers.
- GDL subnational LE (needs registration).
- Canadian physicians by sex and age (the CIHI xlsx returns 403 from the box).
- The all-physician total for US MSAs (no broad OEWS code).
- An official Korean WTP VSL.
- The ECHA primary document.
- Urban Audit poverty outside the 8 reporting countries.
- Subnational coverage outside Europe and North America beyond the OPHI regions: ABS/Stats NZ, IBGE, INEGI, China NBS, India SRS.
