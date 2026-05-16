# First Real Pilot User Checklist

## 1. Pilot User Flow
- [ ] Invite pilot user (send invite email or instructions)
- [ ] User creates account (registers via /register)
- [ ] User logs in
- [ ] User purchases 25 credits (Stripe test checkout)
- [ ] User uploads or enters property data (property form)
- [ ] User runs first analysis (quick score)
- [ ] Verify credits are deducted exactly once
- [ ] Verify result is saved and visible on dashboard
- [ ] Collect user feedback (notes, issues, suggestions)

## 2. Credit Consumption Logic
- [ ] Analysis requires sufficient credits
- [ ] Credits are deducted only once per analysis
- [ ] Failed analysis does not deduct credits
- [ ] Duplicate/refresh/submit does not double-charge

## 3. Property Intake Flow
- [ ] All required fields validated
- [ ] File/screenshot/url upload works
- [ ] Result is persisted in DB
- [ ] User can only see their own properties/analyses

## 4. Admin Visibility
- [ ] Admin can see all users
- [ ] Admin can see credit ledger for all users
- [ ] Admin can see all submitted analyses/properties

## 5. Build & Seed
- [ ] `npm run build --prefix apps/web` passes
- [ ] `npm run build --prefix apps/api` passes
- [ ] `npm run seed --prefix apps/api` passes

## 6. Remaining Blockers
- [ ] List any issues found during pilot flow

---

**Instructions:**
- Use this checklist to guide the first real pilot user through the full ParselRadar flow.
- Mark each item as completed and note any blockers or feedback for follow-up.
