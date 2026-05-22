# UCBP Access Constraint Record

## 1. Manual Observation Summary
During manual UCBP access review, firm or personnel authorization surfaces were observed:
- Yonetim Paneli
- Kullanici Yonetimi
- Kurum/Firma Personeli Basvurusu
- Firma Personel Yetki Basvurusu

Visible form fields included:
- MERSIS No
- Firma Unvani
- Il
- Ilce
- masked T.C. Kimlik field observed
- Adi Soyadi
- Firma E-posta Adresi
- Cep Telefonu No

## 2. Sensitive Data Handling
- Do not store T.C. Kimlik.
- Do not store personal identity screen captures.
- Do not record e-Devlet credentials.
- Do not record session tokens or cookies.
- Do not commit screenshots containing identity data.

## 3. Access Interpretation
- Individual e-Devlet login may allow manual viewing depending on permission scope.
- Firm or personnel authorization appears to require MERSIS or company context.
- ParselRadar cannot assume company-level UCBP access without Turkish company or institution setup.
- Current owner does not want Turkish company registration at this stage.
- MVP should not depend on company-level connector activation.

## 4. Product Decision
- Keep TUCBS NOT_CONFIGURED.
- Do not move to ACTIVE.
- Do not move to TEST_PASSED.
- Allowed state after current manual observation: READY_FOR_MANUAL_REVIEW only.
- User-uploaded evidence flow remains the practical MVP path.

## 5. Future Access Options
- Continue individual manual evidence capture.
- Later create Turkish legal entity if strategically justified.
- Later partner with authorized Turkish company or institution.
- Later request official access if business and legal case matures.
- Only then evaluate READY_FOR_STAGING_TEST.

## 6. 2026 Matrix Update
Reported 2026 update values:
- total layers: 730
- open data: 177
- tasnif disi: 369
- hizmete ozel: 184

Operational meaning:
- Layer expansion improves future connector opportunity.
- Data classification and authorization constraints still apply.
- Expansion does not grant automatic production rights.

## 7. ParselRadar Impact
- UCBP or TUCBS data remains supporting or informational unless separately verified.
- Official-use limitation remains active.
- Reports must not claim government-certified parcel, imar, or tapu status.
