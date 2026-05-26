# P2.GEO-3F — Staged Signal Freshness and Duplicate-Run Cleanup Policy

## Purpose

P2.GEO-3F defines and verifies a read-only operational policy for staged geodata freshness and duplicate-run handling.

This phase does not delete or mutate database rows.

## Why this exists

During local geodata development, repeated dry-runs and staged imports can create multiple `geo_import_runs` rows for the same source. Without a policy, diagnostics may become confusing because multiple runs can look valid.

## Policy

### Canonical run selection

For staged signal diagnostics, ParselRadar must prefer:

1. latest successful `P2.GEO-3C` run,
2. status `STAGED_IMPORT_PASS`,
3. newest `completed_at`,
4. highest `id` as deterministic tiebreaker.

### Duplicate-run handling

Duplicate runs are defined as multiple successful P2.GEO-3C runs sharing the same `source_checksum`.

The policy is:

- keep the latest run per `source_checksum` as canonical;
- treat older same-checksum runs as redundant diagnostic history;
- do not delete automatically during this phase;
- expose cleanup candidates in proof output only;
- allow future manual/admin cleanup only after a separate explicit phase.

### Freshness handling

Current stage has no scheduler and no automatic refresh. Freshness is therefore advisory:

- latest run exists: required;
- feature count > 0: required;
- staged adapter points to latest P2.GEO-3C run: required;
- run age is reported;
- if stale later, product UI must label it as staged diagnostic data, not live official data.

## Not allowed

- database deletion
- database update
- new import
- full Turkey import
- production table swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- official verification claim
