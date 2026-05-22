# TUCBS UCBP Access Strategy

## Current Connector State
- TUCBS remains NOT_CONFIGURED.
- Candidate public WMS and WFS endpoints passed as TEST_ONLY.
- Official WMS and WFS candidates timed out.
- WMTS has no verified candidate.
- No ACTIVE connector.

## Correct Access Path
1. ParselRadar or company applies for official UCBP or TUCBS access.
2. Determine access model: individual, company, institution, or project-based.
3. Determine whether static IP registration is required.
4. Determine whether layer or service-level approval is required.
5. Determine whether WMS, WFS, and WMTS endpoints are exposed after approval.
6. Determine whether tokens or client credentials are issued.
7. Only configure environment variables after approval.

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
