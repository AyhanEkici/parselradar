# CONTROLLED BETA PILOT CHECKLIST

## 1) Beta Status
- User-flow: CONTROLLED_BETA_CANDIDATE
- Admin access: VERIFIED
- Known tester beta status: READY_FOR_KNOWN_TESTERS
- Public launch: NOT_READY

## 2) Who May Be Invited
- Known testers only
- No public advertising
- Admin supervision required

## 3) Tester Journey
1. Register/login
2. Create Yeni Mulk
3. Upload evidence
4. Review readiness
5. Run analysis buttons
6. Check report readiness
7. Report bugs

## 4) Admin Journey
1. Login as admin
2. Open /admin/cms
3. Inspect users/properties/evidence flows
4. Verify normal user cannot access CMS
5. Monitor user submissions

## 5) Known Operational Limitations
- Email provider: CONFIG_REQUIRED
- SPF/DKIM/DMARC: CONFIG_REQUIRED
- Public launch is blocked
- CSV is preview-only
- Uploaded evidence is supporting information only
- No official legal/tapu/imar proof claim

## 6) Required Before Public Launch
1. Configure SMTP provider and deployment secret store variables
2. Verify SPF/DKIM/DMARC with operator-provided DNS proof
3. Rotate MongoDB database-user password
4. Rotate temporary admin password
5. Re-run production readiness audit

## 7) Go/No-Go Checklist
- Admin login verified
- Normal-user CMS block verified
- User-flow verified
- Backup/document restore pass
- No P0/P1 live blockers open

## Gate Decision Rule
- Known-tester controlled beta can proceed with admin supervision.
- Public launch remains NOT_READY until email and DNS launch gates are fully verified.
