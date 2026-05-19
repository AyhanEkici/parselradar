import React from 'react';

export default function GovernanceRestrictionCard({
  compliance,
}: {
  compliance?: { complianceState?: string; allTermsAccepted?: boolean; legalReviewRequired?: boolean; restrictedSourceCount?: number };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Governance Restrictions</h3>
      <p className="mt-1 text-xs text-gray-700">State: {compliance?.complianceState || '-'}</p>
      <p className="text-xs text-gray-700">Terms Accepted: {compliance?.allTermsAccepted ? 'Yes' : 'No'}</p>
      <p className="text-xs text-gray-700">Legal Review Required: {compliance?.legalReviewRequired ? 'Yes' : 'No'}</p>
      <p className="text-xs text-gray-700">Restricted Sources: {compliance?.restrictedSourceCount ?? '-'}</p>
    </div>
  );
}
