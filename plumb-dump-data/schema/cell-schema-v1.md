# Cell-schema v1 — treillis Santé

Written 20 Nov 2026, 22:34 America/Toronto, so Claude can align per-country CSVs and so the plumb-dump-data door v2 and the lattice share one contract.

Sources: `/workspace/sante-lattice/lattice.json` and `coverage.csv`; Claude notes 1wyesVck… §4 and 1_AggmzUV… (passage 26).

## Rules

- Nothing is derived or invented. Unmappable columns or rows are **OPEN / unmapped**, never guessed.
- Country → zone comes only from `country-zone.csv` (extracted from the lattice). Unknown countries stay unmapped.
- Quintiles stay **Q1–Q5** (or ALL). They are **not** mapped onto Ω φ⁻ Σ φ⁺ α.
- City definitions and ethnic-group labels are kept verbatim from the source and are never merged or harmonised.
- Age bands stay as the source wrote them.
- `provisional` is true only when `weight_coverage` is present and is below 50 %.
- `value_age` is the whole number of calendar years between `period_year` and `read_date` when both are known.

## Cell key

zone / country_iso3 / city (source code + definition + verbatim label) / ethnic group (source label verbatim) / sex (T/M/F) / age_band_source / income_quintile (ALL or Q1–Q5).

## Per value

value, unit, indicator_code, indicator_label, source_org, source_table, period_year, url, read_date, file_sha256, value_age, weight_coverage, provisional, status (FILLED/OPEN), quality_note, unmapped_fields, row_disposition.

Column order is in `cell-schema-v1.json` (`csv_column_order`). Indicators: `indicators.json`. Country → zone: `country-zone.csv`.

Companion copies live in `/workspace/sante-lattice/schema/` so the lattice and the door use the same files.
