# Password Compatibility Proof

Generated at: 2026-05-20T00:44:31.862Z
Overall status: FAIL

| User | Exists | Role | Hash Prefix | Hash Format | bcrypt async | bcrypt sync | JWT issued | JWT verified | Hints |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pilot | true | ADMIN | $2b$ | valid | false | false | false | false | missing_password_env_for_compare |
| AyhanEkici | true | USER | $2b$ | valid | false | false | false | false | missing_password_env_for_compare, role_hydration_mismatch |
| Mahir | true | USER | $2b$ | valid | false | false | false | false | missing_password_env_for_compare |

