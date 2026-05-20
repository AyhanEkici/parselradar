# Runtime Boot Proof Bundle

Generated at: 2026-05-20T12:57:10.835Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| startupPhaseProof | PASS | Startup phase: mongo_connected |
| degradedRuntimeProof | PASS | Degraded runtime is visible. |
| optionalSubsystemDisableProof | PASS | Optional subsystem states are present. |
| stripeDegradedProof | PASS | Stripe is not configured. |
| redisDegradedProof | PASS | REDIS_URL is not configured. |
| bullmqDegradedProof | PASS | BullMQ distributed runtime is disabled. |
| workerDegradedProof | PASS | Background workers disabled by configuration. |
| healthProof | PASS | Health endpoint returned JSON. |
| buildInfoProof | PASS | Build info endpoint returned JSON. |
| authRouteProof | PASS | OPTIONS /auth/login returned 204. |
| forgotPasswordRouteProof | PASS | OPTIONS /auth/forgot-password returned 204. |
| resetPasswordRouteProof | PASS | OPTIONS /auth/reset-password returned 204. |
| noHtmlResponseProof | PASS | Boot endpoints did not return HTML. |
| bootFailureProof | PASS | No startup crash observed during probe window. |

## Commit Hash

- 

