# Password Mutation Trace

Generated at: 2026-05-21T16:39:41.416Z
Overall status: PASS
Mutation detected: false
Mutation phase: none

## Timeline
- beforeLogin.passwordChangedAt: null
- afterLogin1.passwordChangedAt: null
- afterAuthMe.passwordChangedAt: null
- afterLogin2.passwordChangedAt: null
- beforeLogin.updatedAt: 2026-05-17T02:31:08.992Z
- afterLogin1.updatedAt: 2026-05-17T02:31:08.992Z
- afterAuthMe.updatedAt: 2026-05-17T02:31:08.992Z
- afterLogin2.updatedAt: 2026-05-17T02:31:08.992Z
- beforeLogin.passwordHashFingerprint: null
- afterLogin1.passwordHashFingerprint: null
- afterAuthMe.passwordHashFingerprint: null
- afterLogin2.passwordHashFingerprint: null

## Comparison
- beforeToAfterLogin1PasswordChangedAtChanged: false
- afterLogin1ToAfterAuthMePasswordChangedAtChanged: false
- afterAuthMeToAfterLogin2PasswordChangedAtChanged: false
- passwordHashFingerprintChanged: false

## Request Status
- login1: 200
- authMe: 200
- login2: 200

Note: No passwordChangedAt/hash mutation detected across normal login and /auth/me trace.

