# P2.1A-FIX No-Drift Check

- generatedAt: 2026-05-22T04:24:27.6292090+03:00
- overallStatus: PASS

## Interpretation
- No forbidden runtime additions detected; TUCBS endpoint keys remain in config/guidance/docs/proof context only and do not imply activation.

## Query Assessments
- intelligenceRoutes: MATCHES_ONLY_IN_PROOF
- AdminScoringDiagnostics: MATCHES_ONLY_IN_PROOF
- MEGSIS: MATCHES_ONLY_IN_PROOF
- undetected-chromedriver: MATCHES_ONLY_IN_PROOF
- selenium: MATCHES_ONLY_IN_PROOF
- captcha: MATCHES_ONLY_IN_PROOF
- CONNECTOR_TUCBS_WMS_ENDPOINT: MATCHES_INCLUDE_SOURCE
- CONNECTOR_TUCBS_WMTS_ENDPOINT: MATCHES_INCLUDE_SOURCE
- CONNECTOR_TUCBS_WFS_ENDPOINT: MATCHES_INCLUDE_SOURCE

## Raw Grep Results
- intelligenceRoutes: matches in historical proof files only.
- AdminScoringDiagnostics: matches in historical proof files only.
- MEGSIS: matches in historical proof files only.
- undetected-chromedriver: single match in proof assertion text.
- selenium: single match in proof assertion text.
- captcha: single match in proof assertion text.
- CONNECTOR_TUCBS_WMS_ENDPOINT: matches in connector config metadata, diagnostics guidance, docs/env placeholders, and proof files.
- CONNECTOR_TUCBS_WMTS_ENDPOINT: matches in connector diagnostics guidance/docs/proof and env placeholder contexts.
- CONNECTOR_TUCBS_WFS_ENDPOINT: matches in connector diagnostics guidance/docs/proof and env placeholder contexts.
