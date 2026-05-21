# Auth Invalidation Runtime Trace

Generated at: 2026-05-21T17:33:03.501Z
Overall status: FAIL
Root cause: comparison_logic_or_clock_path
First invalidation phase: auth_me_3

## Phase Values
- login: status=200, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=false, invalidationReason=null
- auth_me_1: status=200, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=false, invalidationReason=null
- auth_me_2: status=200, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=false, invalidationReason=null
- auth_me_3: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_4: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_5: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_6: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_7: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_8: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_9: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- auth_me_10: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- admin_route: status=401, tokenIatSeconds=1779384760, tokenIatMs=1779384760000, passwordChangedAtIso=null, passwordChangedAtMs=null, deltaMs=null, invalidated=true, invalidationReason=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT

