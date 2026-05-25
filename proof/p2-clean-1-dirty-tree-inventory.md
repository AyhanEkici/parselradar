# P2.CLEAN-1 Dirty Tree Inventory

## Initial Dirty State
- M .gitignore
- M package-lock.json
- M package.json
- M proof/ogc-diagnostics-ui-contract.json
- ?? proof/.p2_geo_2b_git_diff_name_status.txt
- ?? proof/.p2_geo_2b_git_diff_stat.txt
- ?? proof/.p2_geo_2b_git_log_oneline_10.txt
- ?? proof/.p2_geo_2b_git_status_short.txt
- ?? supabase/

## Classification And Actions
- .gitignore: GITIGNORE_DRIFT -> RESTORED
- package.json: PACKAGE_LOCK_DRIFT -> RESTORED
- package-lock.json: PACKAGE_LOCK_DRIFT -> RESTORED
- proof/ogc-diagnostics-ui-contract.json: PRIOR_PROOF_ARTIFACT -> RESTORED
- proof/.p2_geo_2b_git_diff_name_status.txt: PRIOR_PROOF_ARTIFACT -> REMOVED
- proof/.p2_geo_2b_git_diff_stat.txt: PRIOR_PROOF_ARTIFACT -> REMOVED
- proof/.p2_geo_2b_git_log_oneline_10.txt: PRIOR_PROOF_ARTIFACT -> REMOVED
- proof/.p2_geo_2b_git_status_short.txt: PRIOR_PROOF_ARTIFACT -> REMOVED
- supabase/Supabase.txt: SUPABASE_LOCAL_ARTIFACT -> LEFT_UNTOUCHED
- scripts/local/run-p2-geo-2b-live.local.ps1: UNRELATED_DIRTY_FILE -> LEFT_UNTOUCHED

## File Inspection Summary
- package.json: pg and @types/pg dependency entries only.
- package-lock.json: corresponding lockfile churn for pg tree.
- .gitignore: local helper script ignore rule addition only.
- proof/ogc-diagnostics-ui-contract.json: generatedAt timestamp update only.

## Secret Scan
- executed: yes
- result: no secret found
- note: keyword-only false positives were observed and triaged.
