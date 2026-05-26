# P2.1E — Audit PASS Policy

P2.1 now separates active findings from accepted backlog.

## PASS rule

P2.1 returns PASS only when active findings have:

- BLOCKER = 0
- HIGH = 0
- MEDIUM = 0

Accepted backlog remains visible in proof output as acceptedBacklogFindings and acceptedBacklogCounts.

## Accepted backlog categories

- local-env-present
- secret-risk
- loading-state-gap
- error-state-gap
- placeholder-marker

## Guardrails

- no fake connector readiness
- no fake OGC loaded claim
- no official verification claim
- no scraping
- no full Turkey import
- no production swap