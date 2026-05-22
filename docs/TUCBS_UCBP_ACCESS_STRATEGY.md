# TUCBS UCBP Access Strategy

## Current Connector State
- TUCBS remains NOT_CONFIGURED.
- Candidate public WMS and WFS endpoints passed as TEST_ONLY.
- Official WMS and WFS candidates timed out.
- WMTS has no verified candidate.
- No ACTIVE connector.

## Manual Access Constraint Observation (2026)
- Firm or personnel authorization flow was observed in manual UCBP review.
- Visible forms include MERSIS No and company identity fields.
- Turkish identity field exists in the portal flow; masked T.C. Kimlik field observed.
- Company contact fields are requested in the visible process.
- Current owner has individual access but no Turkish company registration and does not want company setup now.

Operational interpretation:
- Individual e-Devlet login may allow manual viewing depending on permissions.
- Company or personnel authorization appears to require MERSIS or company context.
- ParselRadar cannot assume company-level UCBP access without legal entity or institution setup.
- MVP must not depend on company-level connector activation.

## Correct Access Path
1. ParselRadar or company applies for official UCBP or TUCBS access.
2. Determine access model: individual, company, institution, or project-based.
3. Determine whether static IP registration is required.
4. Determine whether layer or service-level approval is required.
5. Determine whether WMS, WFS, and WMTS endpoints are exposed after approval.
6. Determine whether tokens or client credentials are issued.
7. Only configure environment variables after approval.

## 2026 Matrix Expansion Snapshot
- Total layers: 730
- New data definitions: 126
- Cancelled data definitions: 26
- Open data: 177
- Tasnif disi: 369
- Hizmete ozel: 184

Implication for ParselRadar:
- Layer growth increases future connector opportunity.
- Data class and authorization constraints still apply.
- Expansion does not create automatic legal right to production use.

## Connector State Machine
- NOT_CONFIGURED
- READY_FOR_MANUAL_REVIEW
- PENDING_APPROVAL
- READY_FOR_STAGING_TEST
- TEST_PASSED
- ACTIVE

## ACTIVE Requirements
ACTIVE requires all of the following:
- legal approval
- endpoint and configuration present
- static IP or auth configured if required
- passed GetCapabilities test
- explicit admin activation decision
- proof artifact

Current governance decision:
- Keep TUCBS NOT_CONFIGURED.
- Allowed state after current manual observation is READY_FOR_MANUAL_REVIEW only.
- Do not move to TEST_PASSED or ACTIVE in this phase.

Future options:
- Continue individual manual evidence capture.
- Create Turkish legal entity later if strategically justified.
- Partner with an authorized Turkish company or institution.
- Request official access later when business and legal case matures.

## Environment Placeholders
Do not fill actual values.

CONNECTOR_TUCBS_WMS_ENDPOINT=
CONNECTOR_TUCBS_WMTS_ENDPOINT=
CONNECTOR_TUCBS_WFS_ENDPOINT=
CONNECTOR_TUCBS_ACCESS_MODE=
CONNECTOR_TUCBS_ALLOWED_IP=
CONNECTOR_TUCBS_APPROVAL_REFERENCE=
CONNECTOR_TUCBS_CLIENT_ID=
CONNECTOR_TUCBS_CLIENT_SECRET=
