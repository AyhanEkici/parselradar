# Known User Reset Proof Bundle

Generated at: 2026-05-21T21:35:36.246Z
Overall status: PASS

| User | ID Preserved | Email Match | Role Before | Role After | bcrypt compare | JWT issued | token verified | Updated | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AyhanEkici | true | true | ADMIN | ADMIN | true | true | true | true | password_reset_verified |
| pilot | true | true | ADMIN | ADMIN | true | true | true | true | password_reset_verified |
| Mahir | true | true | USER | USER | true | true | true | true | password_reset_verified |

| Proof | Status | Detail |
| --- | --- | --- |
| knownUserResetProof | PASS | Known users were reset in place by fixed Mongo ids with no recreation. |
| userIdsPreservedProof | PASS | All known user _id values preserved. |
| emailMatchProof | PASS | All fixed id records match expected emails. |
| roleRepairProof | PASS | Ayhan repaired to ADMIN, pilot ADMIN retained, Mahir USER retained. |
| bcryptCompareProof | PASS | bcrypt.compare passed for all reset passwords. |
| jwtIssuanceProof | PASS | JWT issuance and verification passed for all users. |
| tokenVerificationProof | PASS | Signed tokens validate against JWT_SECRET and user id. |
| noOwnershipCorruptionProof | PASS | Ownership continuity preserved via invariant _id values. |

## Commit Hash

- pending

