# Password Reset Proof Bundle

Generated at: 2026-05-20T01:48:19.682Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| passwordResetModelProof | PASS | Password reset token model exists with hashed token storage, expiry, used/revoked tracking, and TTL cleanup. |
| forgotPasswordEndpointProof | PASS | Forgot-password endpoint returns a generic success message. |
| resetPasswordEndpointProof | PASS | Reset-password endpoint updates passwordHash and invalidates prior sessions via passwordChangedAt. |
| hashedTokenProof | PASS | Reset tokens are generated securely and stored only as hashes. |
| tokenExpiryProof | PASS | Reset tokens expire after a bounded TTL. |
| oneTimeUseProof | PASS | Reset tokens are one-time-use and are marked used after success. |
| passwordStrengthProof | PASS | Password strength validation is enforced before reset. |
| noUserEnumerationProof | PASS | Forgot/reset responses remain generic and do not reveal account existence. |
| emailNotConfiguredProof | PASS | Email-provider state is exposed internally and safely handled when SMTP is absent. |
| uiRoutesProof | PASS | Frontend routes for forgot/reset password exist. |
| loginLinkProof | PASS | Login page includes a forgot-password link. |
| clientHelpersProof | PASS | Client auth API exposes forgotPassword and resetPassword helpers. |
| forgotPasswordPageProof | PASS | Forgot-password page uses the required generic success message. |
| resetPasswordPageProof | PASS | Reset-password page reads token from the URL and shows the success path. |
| routeRegistrationProof | PASS | Password reset routes are registered under /auth. |

## Email Provider State

- EMAIL_NOT_CONFIGURED

