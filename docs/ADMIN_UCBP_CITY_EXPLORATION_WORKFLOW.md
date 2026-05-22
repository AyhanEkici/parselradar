# Admin UCBP City Exploration Workflow

## Purpose
Define a safe manual process for ParselRadar admin city/province opportunity research through personal e-Devlet access without credential automation, scraping, or connector activation.

## Manual Exploration Workflow
1. Admin logs in personally via e-Devlet outside ParselRadar.
2. Admin opens UCBP/TUCBS and manually searches province, district, mahalle, location, and parcel context.
3. Admin turns on relevant map layers for planning, risk, infrastructure, and access review.
4. Admin captures redacted screenshots/evidence (no personal identity/session artifacts).
5. Admin records non-sensitive observations in ParselRadar notes.
6. Evidence is labeled as ADMIN_MANUAL_OBSERVATION or ACCESS_CONTROLLED_INFORMATIONAL_SOURCE.

## Safe Recording Rules
- Record only non-sensitive findings relevant to opportunity quality.
- Keep source context, date, and layer summary.
- Never store personal identity values or session artifacts.

## Required Source Classification
- ADMIN_MANUAL_OBSERVATION
- ACCESS_CONTROLLED_INFORMATIONAL_SOURCE
- PUBLIC_SOURCE
- USER_PROVIDED_OFFICIAL_EVIDENCE
- UNVERIFIED
- MISSING
- NEEDS_OFFICIAL_VERIFICATION

## Forbidden Actions
- no e-Devlet credential automation
- no session/cookie/token capture
- no scraping authenticated portals
- no official legal/tapu/imar guarantee
- no connector activation

## AI Future Impact
- AI may rank opportunities later only after source classification.
- AI responses must show source/evidence labels.
- AI must separate fact from inference.
- AI must show missing verification steps.
