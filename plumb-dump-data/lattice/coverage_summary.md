# GROK — SANTÉ — Treillis v1 — 20 nov 2026 — Coverage summary
Status: v1, preliminary, sandbox. Not linked to the live hub or repo; Manifestation protocol untouched. Gaps tagged [INCOMPLET].

## Structure
World → 6 zones (Éric said "five" but named six; six used) → 217 countries/territories (all **193 UN member states** + 24 territories in the World Bank economy list) → per country: Sex (T/M/F) × Age (ALL, 0-14, 15-64, 65+) × Income quintile (ALL, Q1–Q5, edges 20/40/60/80) + **Cities** (UN WUP agglomerations ≥300k) + **Ethnic groups** (all OPEN this pass).
Not covered (not in WB list): Taiwan, Cook Islands, Niue, Holy See, Western Sahara → OPEN.

## Zone assignment rule
Base = World Bank region. Africa = WB Sub-Saharan Africa (48). Middle East = WB Middle East & North Africa, so North Africa (DZA, EGY, LBY, MAR, TUN) + Djibouti are here (20). Europe = WB Europe & Central Asia minus Central Asia, incl. Türkiye, Caucasus, Russia; + Malta (override) (53). East = WB East Asia (minus Oceania) + South Asia + Central Asia + AFG/PAK (override) (31). South Pacific = Oceania incl. AUS/NZL/PNG (19). America = WB Latin America & Caribbean + North America + Greenland (override) (46).
Overlaps documented: SDN/SOM are WHO EMRO but here Africa; North Africa is African continent but here Middle East; TUR/CYP/Caucasus here Europe.

## Population-weighted zone headlines (latest year)
| Zone | Countries (UN members) | Pop. (M, 2025) | LE birth M / F / both (2024) | HALE M / F (2023) | GNI pc PPP $ (yrs) | Mean monthly earnings PPP M / F (wt cov.) | U5MR | UHC | Health exp. pc PPP | Gini (pop-wtd mean) |
|---|---|---|---|---|---|---|---|---|---|---|
| Africa | 48 (48) | 1,322 | 60.7 / 65.0 / 62.8 | 55.0 / 56.9 | 5,616 ([2011, 2025]) | 523 / 372 (94.5%) | 70.4 | 47 | 229 | 39.0 |
| Europe | 53 (48) | 849 | 76.2 / 82.3 / 79.2 | 65.6 / 68.6 | 56,931 ([2023, 2025]) | 4,363 / 3,331 (98.6%) | 5.4 | 82 | 4,820 | 32.7 |
| East | 31 (29) | 4,395 | 72.1 / 76.8 / 74.4 | 62.9 / 65.2 | 20,231 ([2024, 2025]) | 1,190 / 905 (99.2%) | 23.4 | 73 | 954 | 30.9 |
| Middle East | 20 (19) | 528 | 73.2 / 76.9 / 75.0 | 63.6 / 64.0 | 23,030 ([2013, 2025]) | 1,683 / 1,195 (48.8%) | 19.8 | 71 | 1,129 | 32.2 |
| South Pacific | 19 (14) | 47 | 76.1 / 80.6 / 78.3 | 65.7 / 66.9 | 49,345 ([2025, 2025]) | 4,339 / 3,172 (76.4%) | 17.8 | 74 | 5,264 | 35.9 |
| America | 46 (35) | 1,050 | 74.4 / 79.8 / 77.1 | 63.4 / 65.6 | 46,521 ([2007, 2025]) | 3,477 / 2,584 (95.1%) | 12.5 | 82 | 5,787 | 44.2 |
| WORLD | 217 (193) | 8,192 | 71.1 / 75.9 / 73.4 | 62.0 / 64.2 | 25,381 ([2007, 2025]) | 1,901 / 1,440 (94.6%) | 33.3 | 71 | 1,895 | 34.2 |
LE birth = WDI/UN WPP 2024; HALE = WHO 2023; population 2025. GNI year range shows the oldest/newest country value used (ERI 2011, VEN 2011, YEM 2013, SSD 2015, GRL 2007 are stale). Earnings are ILO employee earnings, latest year 2005–2025 (median 2023), weighted by pop 15-64 of that sex as a proxy, so treat them as indicative; Middle East covers only 48.8% of the weight (no data for DZA, IRN, IRQ, LBY, MAR, OMN, SYR). Gini = pop-weighted mean of national Ginis (years 1992–2025, median 2021).

## Coverage (country level, coverage.csv)
At each indicator's native granularity (the cells the sources publish): **86.1% FILLED** (11,067 cells); UN members 91.6%.
| Indicator | Native cells filled | Cross-tabs |
|---|---|---|
| Population by sex × broad age | 100% | × income quintile: OPEN (0%) |
| Life expectancy at birth, by sex | 100% | × quintile OPEN |
| LE at 60, HALE, HALE at 60, by sex | 85.3% | × quintile OPEN |
| Under-5 mortality by sex | 90.3% | × quintile OPEN (DHS has it) |
| Adult mortality 15-60 by sex | 100% | × quintile OPEN |
| NCD mortality 30-70 by sex | 85.3% | × quintile OPEN |
| Obesity 18+ by sex | 90.3% | × quintile OPEN |
| Tobacco 15+ by sex | 76.5% | × quintile OPEN |
| GNI pc PPP (total) | 93.1% | by sex 0% (not published), × quintile OPEN |
| Mean earnings PPP by sex | 75–77% | × age band OPEN (ILO age series not pulled) |
| Income share Q1–Q5 / Gini | 78.8% | — |
| UHC index / health exp. per capita | 88.9% | — |
Full target grid (every indicator × sex × age × quintile): 16.9% FILLED of 56,420 cells. By dimension: sex T 21.9%, M/F 14.5%; age bands 14.3%; quintile cells 1.9% (only the income shares themselves).
**Cities:** 1,841 agglomerations in 153 countries with population (2015 estimate + 2020 projection); every city health indicator OPEN; 64 countries have no city in the list (OPEN). City cells overall 12.4% filled.
**Ethnic groups:** 0% filled; 217 OPEN branches with suggested sources (868 cells).

## Biggest gaps → next-pass dig list
1. Health × income quintile (LE, U5MR, obesity, tobacco): DHS STATcompiler & MICS wealth-quintile tables (low/middle income); national linked mortality–income studies (US Health Inequality Project, StatCan CanCHEC, ONS deprivation deciles).
2. Ethnic groups: UNSD Demographic Yearbook census "population by national/ethnic group" (data.un.org blocked from the box this pass); CDC NCHS LE by race/Hispanic origin; ONS ethnic LE; StatCan Census + Indigenous LE; Stats NZ Māori life tables; ABS Indigenous LE; IBGE (Brazil); Stats SA.
3. Cities health: OECD Functional Urban Areas, Eurostat Urban Audit, US CDC USALEEP/500 Cities, StatCan CMA life tables; UNSD DYB Table 8 for city population by sex.
4. Earnings by age: ILOSTAT EAR_EMTA_SEX_AGE_CUR_NB_A; weights by employees (ILOSTAT EES_TEES_SEX_NB).
5. 5-year age groups and pop 60+: UN WPP 2024 CSV (single-age by sex) to replace the 65+ and 0-14 proxy weights.
6. Microstates and small islands with no HALE/LE60/Gini (AND, LIE, MCO, SMR, MHL, NRU, PLW, TUV, DMA, KNA) and missing earnings (31 UN members incl. DZA, IRN, IRQ, MAR, VEN, CUB, PRK): national statistics offices.
7. Not in WB list: Taiwan, Cook Islands, Niue → DGBAS/MOHW Taiwan, WHO GHO (COK, NIU).
