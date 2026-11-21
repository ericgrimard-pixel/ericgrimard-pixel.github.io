# GROK — SANTÉ — Treillis v1.3 — 21 nov 2026 — Résumé

v1.3 is additive: the v1, v1.1 and v1.2 files are unchanged.
- **Size:** 253,347 values from public sources, with no login or registration.
- **Traceability:** each value carries its source, table, year and URL.
- **Rules:** nothing is derived; gaps are marked OPEN [INCOMPLET].
- **New schema:** cell-schema-v1.3.json and indicators-v1.3.json, with 31 new indicators.
- **New levels:** district, municipality and ward.

## Lowest level reached per zone (v1 → v1.3 combined)

| Zone | Lowest level | Unit counts (source) | Next level up |
|---|---|---|---|
| America | City / place | 29,923 US places (CDC PLACES 2025, 8 measures kept in long format, all measures in wide format) | 3,144 US counties (SAIPE, v1.2); 2,469 Mexican municipalities (CONEVAL 2020); 393 US metro areas; 27 Brazilian states (IBGE projection); US and Canadian states/provinces; DHS regions in 12 Latin American and Caribbean countries |
| Europe | Ward | 7,563 Great Britain wards, child low income FYE 2025 (DWP) | 348 GB local authorities (ONS life expectancy 2021–23, LE0 and LE65 by sex); 281 Urban Audit cities (v1.2); NUTS2 regions (v1.2); DHS regions (ALB, ARM, MDA, TUR, UKR…) |
| East | District | 616 Indian districts (NITI national MPI 2023, NFHS-5) | 47 Japanese prefectures (MHLW 2020, by sex); DHS regions in 19 countries; OPHI regions (v1.1) |
| South Pacific | City / LGA | 565 Australian LGAs (ABS SEIFA 2021, disadvantage index) | 88 Australian SA4 regions (ABS LE 2022–24, by sex); 8 states and territories (LE0 and LE65); 16 NZ regional councils (Stats NZ LE 2017–19, by sex); DHS regions (PNG and others) |
| Africa | Region | DHS regions in 40 countries (96.9% of the zone's population); 9 South African provinces (Stats SA LE 2021–26, by sex) | OPHI regions (v1.1) |
| Middle East | Region | DHS regions in 5 countries (EGY, JOR, MAR, TUN, YEM) plus OPHI regions (v1.1) | — |

Subnational coverage added in v1.3, measured against the zone's population:
- Africa: 96.9%.
- South Pacific: 92.4%.
- America: 83.2%.
- East: 64.8%.
- Middle East: 42.1% (PROVISIONAL).
- Europe: 25.0% (PROVISIONAL), but NUTS2 data from v1.2 already covers most of Europe.

## Sources added in v1.3

1. **DHS Program STATcompiler API**, subnational breakdown, latest preferred survey per country. There are 11 indicators; regions and countries covered are:

| Indicator | Regions | Countries |
|---|---|---|
| Under-5 mortality (U5MR) | 1,320 | 84 |
| Stunting | 1,154 | 71 |
| Total fertility rate (TFR) | 1,323 | 84 |
| Population in the lowest wealth quintile | 1,281 | 78 |
| Female literacy | 1,130 | 64 |
| Male literacy | 1,046 | 58 |
| Skilled birth attendance | 1,349 | 84 |
| Full vaccination | 1,280 | 77 |
| HIV prevalence, women | 467 | 37 |
| HIV prevalence, men | 448 | 37 |
| Female obesity | 1,169 | 71 |

   Sex is split only where the indicator itself is defined for women or men.
2. **CDC PLACES 2025, place level:** 29,923 places. The estimates are model-based (BRFSS 2023).
3. **ABS:**
   - Life expectancy 2022–24: 88 SA4 regions plus states (LE0 and LE65).
   - SEIFA 2021 disadvantage index (IRSD) by LGA: 565 LGAs.
4. **Stats NZ:** regional life tables 2017–19, from the graph data published on the release page.
5. **IBGE SIDRA table 7362:** life expectancy by state and sex for 2023 and 2024. These are **projections** from the 2018 revision.
6. **CONEVAL 2020, municipal level:** multidimensional poverty, extreme poverty and income below the poverty line, in 2,469 municipalities.
7. **NITI Aayog national MPI 2023:** headcount (H), intensity (A) and MPI by district, from NFHS-5. 616 of about 700 district rows were parsed; the rest have names that wrap across lines in the PDF and are left OPEN.
8. **Stats SA mid-year estimates 2026 (P0302):** provincial life expectancy by sex, averaged over 2021–2026, from the Figure 11 and 12 data labels.
9. **MHLW prefectural life tables 2020, Table 1:** 47 prefectures by sex.
10. **ONS life expectancy for local areas (2021–23):** 348 local authorities plus regions.
11. **DWP children in low-income families, FYE 2025:**
    - Local-authority level: relative low income after housing costs (AHC).
    - Ward level: relative low income before housing costs (BHC).
    - Values are proportions from 0 to 1, kept as published.
12. **CCBE lawyer statistics, retried:** ccbe.eu still returns 404. A 2015 table survives on a third-party mirror (juridice.ro). From it, 23 countries were transcribed: total and women members of the Bar. Countries with several bar bodies (BEL, GBR) were not summed. These are flagged as a dated copy from a third-party site.

## Remaining OPEN gaps

- **China provinces:** NBS was not scriptable.
- **Korea:** the KOSIS API needs a key.
- **Indonesia:** the BPS API needs a key.
- **Japan, municipal level:** e-Stat needs an appId (MHLW was used for prefectures instead).
- **US city poverty from the ACS:** the API needs a key. The bulk summary file was not processed.
- **Brazil:** municipal life expectancy and poverty, CFM physician counts and DATASUS.
- **Health workforce in Australia:** AIHW/HWD is only a dashboard.
- **New Zealand, territorial-authority level:** life expectancy not found as a file.
- **WHO / World Bank city data:** no consolidated public dataset found.
- **Global Data Lab:** registration required.
- **Current CCBE statistics** (post-2015).
- **About 90 Indian district rows:** names wrap across lines in the PDF.
- **Middle East below region level.**
- **Africa below region level** (except provinces).

## Files

- `values_v1.3_core.csv`: everything except the PLACES long rows.
- `values_v1.3.csv.gz`: the full long table.
- `places_city_v1.3.csv`: PLACES in wide format, all measures.
- `coverage_v1.3.csv`, `lowest_level_v1.3.csv`, `lowest_level_by_country_v1.3.csv`, `open_gaps_v1.3.csv`.
- Schema files: `cell-schema-v1.3.json` and `indicators-v1.3.json`.
