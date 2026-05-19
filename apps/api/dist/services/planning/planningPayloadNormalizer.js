"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePlanningPayload = normalizePlanningPayload;
function asRecord(input) {
    return (input && typeof input === 'object' ? input : {});
}
function normalizeLayerAvailability(input) {
    const payload = asRecord(input);
    const layers = asRecord(payload.layers);
    const scales = ['1/100000', '1/25000', '1/5000', '1/1000'];
    return scales.map((scale) => {
        const layer = asRecord(layers[scale]);
        const available = Boolean(layer.available);
        return {
            scale,
            available,
            layerName: typeof layer.layerName === 'string' ? layer.layerName : undefined,
            source: typeof layer.source === 'string' ? layer.source : undefined,
            note: typeof layer.note === 'string' ? layer.note : undefined,
        };
    });
}
function normalizePlanningPayload(input) {
    const payload = asRecord(input);
    const planningLayers = normalizeLayerAvailability(payload);
    const verifiedFacts = [];
    const derivedAnalytics = [];
    const heuristicSignals = [];
    const incompleteData = [];
    const city = typeof payload.city === 'string' ? payload.city : null;
    const district = typeof payload.district === 'string' ? payload.district : null;
    const source = typeof payload.source === 'string' ? payload.source : undefined;
    if (city) {
        verifiedFacts.push({ classification: 'VERIFIED_FACT', key: 'city', label: 'City', value: city, source });
    }
    else {
        incompleteData.push({ classification: 'INCOMPLETE_DATA', key: 'city', label: 'City', value: null, source, note: 'Missing city.' });
    }
    if (district) {
        verifiedFacts.push({ classification: 'VERIFIED_FACT', key: 'district', label: 'District', value: district, source });
    }
    else {
        incompleteData.push({
            classification: 'INCOMPLETE_DATA',
            key: 'district',
            label: 'District',
            value: null,
            source,
            note: 'Missing district.',
        });
    }
    const availableCount = planningLayers.filter((l) => l.available).length;
    derivedAnalytics.push({
        classification: 'DERIVED_ANALYTIC',
        key: 'planning_layer_coverage',
        label: 'Planning layer coverage',
        value: { availableLayers: availableCount, totalLayers: planningLayers.length },
        source,
        note: 'Coverage derived from layer availability flags. This is not a zoning guarantee.',
    });
    if (availableCount > 0) {
        heuristicSignals.push({
            classification: 'HEURISTIC_SIGNAL',
            key: 'planning_pressure_signal',
            label: 'Planning pressure signal',
            value: 'planning pressure signal',
            source,
            note: 'Presence of planning layers can be an urbanization indicator; human review advised.',
        });
    }
    else {
        incompleteData.push({
            classification: 'INCOMPLETE_DATA',
            key: 'planning_layers',
            label: 'Planning layers',
            value: [],
            source,
            note: 'No planning layers reported as available.',
        });
    }
    const humanReviewRequired = incompleteData.length > 0 ||
        heuristicSignals.some((s) => s.key === 'planning_pressure_signal') ||
        planningLayers.some((layer) => layer.available && (layer.note || '').toLowerCase().includes('review'));
    if (humanReviewRequired) {
        heuristicSignals.push({
            classification: 'HUMAN_REVIEW_ADVISED',
            key: 'human_review_advised',
            label: 'Human review advised',
            value: true,
            source,
            note: 'Planning data can be incomplete or jurisdiction-specific; do not infer guaranteed zoning outcomes.',
        });
    }
    return {
        planningLayers,
        verifiedFacts,
        derivedAnalytics,
        heuristicSignals,
        incompleteData,
        humanReviewRequired,
    };
}
