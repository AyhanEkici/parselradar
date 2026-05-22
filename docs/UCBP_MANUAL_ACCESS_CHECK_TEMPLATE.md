# UCBP Manual Access Check Template

## Purpose
A manual checklist for the project owner to inspect UCBP or TUCBS access after logging in personally via e-Devlet.

## Security Reminders
- Do not share e-Devlet password.
- Do not paste T.C. Kimlik into ParselRadar.
- Do not upload screenshots containing identity or session details.
- Do not copy session cookies or bearer tokens.
- Do not use browser automation.
- Do not give credentials to VS Code, ChatGPT, ParselRadar, or any agent.

## Manual Login Path
1. Open UCBP or TUCBS portal manually.
2. Choose e-Devlet login.
3. Complete login yourself.
4. Inspect access or dashboard manually.
5. Do not automate.

## What To Check
- user type: individual, company, institution, or other
- whether project or application creation exists
- whether private sector access is available
- whether service request is possible
- whether static IP registration is requested
- whether WMS, WFS, and WMTS services are listed
- whether endpoint URLs are visible
- whether layer catalog is visible
- whether approval or reference number is shown
- whether API token or client credentials are offered
- whether legal or usage terms are visible
- whether rate limits are visible

## Output Decision
- NO_ACCESS
- MANUAL_REVIEW_NEEDED
- APPLICATION_REQUIRED
- PENDING_APPROVAL
- ENDPOINT_VISIBLE_BUT_NOT_APPROVED
- READY_FOR_STAGING_TEST
- REJECTED_OR_NOT_AVAILABLE

## Guardrail
This template is evidence-oriented only. It does not permit connector activation or implementation work.
