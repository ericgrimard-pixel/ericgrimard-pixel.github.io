# GROK — SANTÉ — Treillis v1.1 — 20 nov 2026
v1.1 sits alongside v1: the v1 files are unchanged. It is a sandbox only. The live hub, the repo and the Manifestation protocol were not touched, and nothing was pushed. Every value carries its source, table, year and URL, and gaps are OPEN [INCOMPLET]. Nothing is derived or transferred.

## What v1.1 adds, and where it sits
Geographic chain: Zone → Country → **Region (new)** → City. Each node carries Sex × Age × Quintile cells.
1. **Relative-value overlays** at country level, with zone aggregates population-weighted (PROVISIONAL below 50% population coverage). Overlays are not split by sex, age or quintile, so those split cells are OPEN.
   - **VSL_VM2017**: Viscusi & Masterman (2017), Table 7. USD million in 2015 dollars, income-elasticity 1.0 transfer of the US $9.631M base using 2015 GNI per capita (Atlas). Flagged **source-modelled, not national-official**.
   - **VSL_OFFICIAL**, verbatim:
     - US DOT: $14.2M (base year 2025)
     - US EPA: $7.4M ($2006)
     - UK DfT TAG data book v2.03 Table A4.1.1, fatal casualty: willingness to pay £2,483,360, total £2,652,796 (2023 prices and values)
     - Canada TBS: CAD 6.5M (2007 CAD)
     - Australia Office of Impact Analysis: AUD 5.87M (2025 dollars), VLY AUD 253,000
   - **Regional VSL base**, OECD (2012): OECD USD 3.0M (range 1.5–4.5), EU-27 USD 3.6M (range 1.8–5.4), both 2005 USD.
   - **BIGMAC**: The Economist big-mac-data, July 2026 release (2026-07-01; repo commit 0d97104, 4 Aug 2026). Local price, dollar price, raw and GDP-adjusted USD index. The euro-area entry (EUZ) applies to the 21 euro members, including Bulgaria, flagged as a "euro-area aggregate", never as a national value. Taiwan is kept as a non-lattice entity.
2. **REGION tier**: 1,718 regions in 136 countries.
   - NUTS 2 (Eurostat): 295 regions in 36 countries
   - US state FIPS: 51
   - Canada SGC: 13
   - OPHI/DHS-MICS survey regions: 1,359 in 101 countries
   - Every other country has an OPEN branch with a suggested source.
3. **WORKFORCE_*** indicators:
   - WHO NHWA: doctors, nursing/midwifery, dentists, pharmacists (density per 10,000 and counts); share of doctors and nursing by sex
   - ILOSTAT ISCO-08: group 2 Professionals and sub-majors 21–26, by sex
   - Eurostat LFS lfsa_egai2d: ISCO 2 and 21–26 by sex, 34 countries
   - Regions: Eurostat hlth_rs_physreg physicians by NUTS 2; BLS OEWS May 2024 by state (SOC 23-1011 lawyers, 29-1215 family medicine, 29-1141 registered nurses, 29-1021 dentists, 29-1051 pharmacists, 29-1161 nurse midwives)
4. **POVERTY_*** indicators:
   - Country: WDI headcount at $3.00, $4.20 and $8.30 a day (2021 PPP) and at the national line; OPHI/UNDP Global MPI 2025 headcount
   - Regions: OPHI subnational MPI; Eurostat ilc_li41 at-risk-of-poverty by NUTS 2; Census SAIPE 2023 by state (all ages, 0–17, 0–4); StatCan 11-10-0135 MBM by province (by sex and by age)
   - Cities: StatCan 11-10-0135 MBM for 8 CMAs
5. **Schema**: cell-schema-v1.1.json and indicators-v1.1.json (43 new indicators). They add the region level, region_code_system, the overlay fields, poverty_line verbatim and occupation_code_system.

## Country coverage (out of 217)
| Zone | n | VSL V&M | VSL official | Big Mac national | Big Mac euro agg. | Doctors /10k | Doctors by sex | Nurses /10k | Dentists | Pharmacists | ISCO 2 | ISCO 26 | Poverty $3.00 | National line | MPI | Region tier |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Africa | 48 | 46 | 0 | 1 | 0 | 48 | 37 | 48 | 48 | 48 | 43 | 36 | 46 | 47 | 42 | 40 |
| Europe | 53 | 47 | 1 | 13 | 21 | 47 | 47 | 47 | 47 | 47 | 44 | 40 | 45 | 45 | 7 | 37 |
| East | 31 | 30 | 0 | 12 | 0 | 29 | 24 | 29 | 28 | 29 | 26 | 22 | 24 | 23 | 23 | 22 |
| Middle East | 20 | 17 | 0 | 10 | 0 | 19 | 15 | 19 | 19 | 19 | 15 | 9 | 15 | 11 | 9 | 9 |
| South Pacific | 19 | 14 | 1 | 2 | 0 | 14 | 11 | 14 | 14 | 13 | 13 | 12 | 12 | 11 | 8 | 6 |
| America | 46 | 35 | 2 | 14 | 0 | 35 | 22 | 35 | 35 | 33 | 33 | 24 | 29 | 24 | 20 | 22 |
| **Total** | 217 | **189** | **4** | **52** | **21** | 192 | 156 | 192 | 191 | 189 | 174 | 143 | 171 | 161 | 109 | 136 |

**Zone overlays, population-weighted:**
- **VSL V&M (USD million, 2015):** Africa 0.28, East 0.95, Middle East 1.44, Europe 4.53, America 4.54, South Pacific 7.06. All zones have at least 93% population coverage. These are source-modelled values.
- **Big Mac (USD):** East 3.17, America 5.80 and South Pacific 5.82 are FILLED.
  - Europe is PROVISIONAL at 6.21 with national entries only (37% coverage). It becomes 6.67 if the euro-area aggregate is included (79%).
  - Middle East is PROVISIONAL at 3.83 (40% coverage).
  - Africa is PROVISIONAL at 3.49 (South Africa only, 5% coverage).

## Regional tier: sex / age / quintile
- **Fully covered on sex and age (life expectancy at birth and at 65 by T/M/F, plus poverty by sex and all ages):** 9 Canadian provinces (NL, NS, NB, QC, ON, MB, SK, AB, BC). PEI, Yukon, NWT and Nunavut have no StatCan life table: poverty is there, life expectancy is OPEN.
- **NUTS 2 (295):** life expectancy by sex at birth and at 65 in 267 regions (2024). The 28 gaps are North Macedonia MK00, Norway NO0B and all 26 Türkiye regions. At-risk-of-poverty covers 263 regions (2025), total only, with no sex or age split. Physicians cover 241 regions in 24 countries, total only. The UK is not in Eurostat NUTS data, so its region tier is OPEN.
- **US states (51):** life expectancy at birth by sex (2021). Life expectancy at 65 is OPEN (NVSR 74-12 has state life tables). SAIPE poverty covers all ages, 0–17 and 0–4, with no sex split and no 65+. OEWS covers lawyers in 50 states, registered nurses and pharmacists in 51, and family medicine in 49. There is no total physician count at state level (only detailed SOCs, some suppressed), so it is OPEN.
- **OPHI regions (1,359):** MPI headcount total only. Sex, age and life expectancy are OPEN.
- **Quintile:** OPEN in every region. No regional source publishes health by income quintile.

## Workforce matrix: profession × level × coverage
| Profession | Country | Region | City |
|---|---|---|---|
| Doctors | WHO NHWA, 192/217; by sex 156 | Eurostat NUTS 2: 241 regions / 24 countries (total only). US: family medicine 49 states (total physicians OPEN). Canada OPEN (CIHI) | OPEN everywhere |
| Nurses / midwives | 192; nursing by sex 166 | US registered nurses 51, nurse midwives 35. EU and Canada OPEN | OPEN |
| Dentists | 191 | US 29-1021: 48 | OPEN |
| Pharmacists | 189 | US 29-1051: 51 | OPEN |
| Lawyers | ISCO 261 OPEN everywhere. ISCO 26 (legal + social + cultural, an upper bound only): 143 countries by sex | US 23-1011: 50 states. EU and Canada OPEN | OPEN |
| ISCO 2 Professionals; 21, 22, 23, 24, 25 | ILO/Eurostat: 174; 146, 146, 146, 145, 137 (by sex) | OPEN (Eurostat lfst_r_lfe2en2 has NUTS 2 by ISCO major group; not pulled) | OPEN |

**Where workforce data breaks down:**
1. Legal professionals at the 3-digit ISCO level, everywhere.
2. All professions at city level, in every zone.
3. The region tier outside the EU and the US: Africa, East, Middle East and South Pacific have no workforce data at region level.
4. Sex splits stop at country level.

## Poverty: lowest level reached
| Zone | Lowest level | Source and where it stops |
|---|---|---|
| Africa | Region (574 OPHI regions, 40 countries) | MPI by region with no sex or age split. WDI is country only. |
| East | Region (307 OPHI regions, 22 countries) | Same as Africa |
| Middle East | Region (126 OPHI regions, 9 countries) | Same as Africa |
| South Pacific | Region (46 OPHI regions, 6 countries) | Australia and New Zealand have no regional poverty (OPEN) |
| Europe | Region (263 NUTS 2 regions, 33 countries, plus 37 OPHI regions) | ilc_li41 is NUTS 2 total only. Cities OPEN (Urban Audit not pulled) |
| America | City for Canada (8 CMAs, MBM by sex and age); region for the US (51 states) and Canada (13) plus OPHI (269 regions, 20 countries) | US places OPEN: the ACS API needs a key. SAIPE counties exist but were not ingested |

At country level, sex is OPEN everywhere: WDI/PIP don't publish poverty by sex. Age splits are OPEN in v1.1; OPHI Table 3 has MPI by age group but wasn't pulled.

## Key caveats
- V&M VSLs are transfers made in 2015 dollars from 2015 GNI. Official VSLs mix currencies and price years. They are never compared or averaged here.
- Poverty lines differ across sources and are never mixed.
- Zone aggregates mix value years (shown as ranges).
- WHO counts, ILO counts and US OEWS employment have different definitions (practising vs licensed vs employed).

## Next pass, to dig
- EU/ECHA, New Zealand, Japan and Korea official VSLs
- OECD (2014) country VSLs (source-modelled)
- OPHI Table 3 (MPI by age)
- Eurostat lfst_r_lfe2en2 (NUTS 2 by ISCO)
- CIHI physicians by province
- NVSR 74-12 state LE65
- ACS S1701 by place (needs an API key)
- Eurostat Urban Audit poverty
- BLS OEWS MSA file for city workforce
- CCBE/ABA lawyer counts
- Global Data Lab SHDI for a global regional life-expectancy tier
