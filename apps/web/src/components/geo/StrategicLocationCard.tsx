import React from 'react';

interface StrategicLocationCardProps {
  strategicLocationSignals: string[];
}

export const StrategicLocationCard: React.FC<StrategicLocationCardProps> = ({ strategicLocationSignals = [] }) => {
  const signalLabels: Record<string, string> = {
    airport_proximity: '✈️ Airport Proximity',
    osb_cluster_opportunity: '🏭 OSB Cluster',
    logistics_hub_proximity: '🚚 Logistics Hub',
    tourism_opportunity: '🏖️ Tourism Zone',
    developer_expansion_zone: '🏗️ Expansion Zone',
  };

  const signalColors: Record<string, string> = {
    airport_proximity: 'bg-blue-100 text-blue-900 border-blue-200',
    osb_cluster_opportunity: 'bg-orange-100 text-orange-900 border-orange-200',
    logistics_hub_proximity: 'bg-yellow-100 text-yellow-900 border-yellow-200',
    tourism_opportunity: 'bg-pink-100 text-pink-900 border-pink-200',
    developer_expansion_zone: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Strategic Location</h3>
        <p className="text-sm text-gray-600">Opportunity signals</p>
      </div>

      <div className="space-y-2">
        {strategicLocationSignals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {strategicLocationSignals.map((signal) => (
              <div
                key={signal}
                className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${
                  signalColors[signal] || 'bg-gray-100 text-gray-900 border-gray-200'
                }`}
              >
                {signalLabels[signal] || signal}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-600">No strategic signals detected for this location.</p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600">
          {strategicLocationSignals.length > 0
            ? `${strategicLocationSignals.length} strategic opportunity signal${strategicLocationSignals.length > 1 ? 's' : ''} identified.`
            : 'Location does not match predefined strategic zones.'}
        </p>
      </div>
    </div>
  );
};
