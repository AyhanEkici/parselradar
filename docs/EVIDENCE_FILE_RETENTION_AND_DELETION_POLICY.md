# EVIDENCE FILE RETENTION AND DELETION POLICY

## Policy Goals
- Minimize sensitive-data exposure
- Ensure traceable retention/deletion operations
- Preserve evidentiary integrity for allowed retention windows

## Classification
- Supporting evidence (user-provided official-source)
- Public-source evidence
- Operational artifacts

## Retention Rules
- Supporting evidence: default 90 days unless legal hold requires longer
- Public-source evidence references: policy-driven retention by source terms
- Operational artifacts: per security/observability retention policy

## Deletion Rules
- User-requested deletion processed after ownership verification
- Legal/incident hold supersedes routine deletion
- Administrative deletion requires audit reason

## Sensitive Data Restrictions
- Do not store credentials, sessions, tokens, private keys, or payment secrets in evidence files
- Do not persist T.C. Kimlik/e-Devlet sensitive fields by default
- Apply minimization and redaction where possible

## Audit and Governance
- Every retention/deletion decision must be auditable
- Policy exceptions require explicit approval and recorded rationale

## Operational Controls
- Quarterly policy conformance review
- Restore drill checks include retention/deletion consistency

## Disclaimer
User-provided official-source evidence is supporting evidence only and must not be treated as fully authoritative without approved validation.
