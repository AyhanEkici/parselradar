# P2.2A — Product Hardening / User-Visible Completeness Baseline

## Goal

Start P2.2 with real user-visible completeness work rather than marker-only remediation.

## Implemented

- Added a reusable PageStatePanel component for loading, empty, error, and locked states.
- Hardened AccessDenied with clear recovery actions.
- Hardened NotFound with clear navigation recovery actions.
- Kept official-verification, connector, scraping, and geodata guardrails unchanged.

## Guardrails

- no connector activation
- no scraping
- no full Turkey import
- no production swap
- no fake OCR
- no official verification claim
- commit only after all gates pass