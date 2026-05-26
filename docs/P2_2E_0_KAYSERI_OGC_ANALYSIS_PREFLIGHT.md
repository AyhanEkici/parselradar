# P2.2E-0 — Kayseri OGC + Analysis Report Hard Preflight

## Purpose

This phase verifies whether Kayseri OGC/geodata is actually wired into property check and analysis report surfaces before claiming Browser E2E readiness.

## Hard rule

P2.2E must block unless Kayseri OGC/geodata is configured and visible through analysis/report-facing code or proof artifacts.

## This is not allowed

- no fake OGC loaded claim
- no fake official data claim
- no connector activation without explicit configuration
- no scraping
- no full Turkey import
- no production swap

## Next if this blocks

Configure/activate the Kayseri OGC/geodata source properly, then rerun the E2E browser smoke.