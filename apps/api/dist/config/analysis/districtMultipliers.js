"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DISTRICT_MULTIPLIER = exports.DISTRICT_KEYWORD_MULTIPLIERS = void 0;
exports.DISTRICT_KEYWORD_MULTIPLIERS = {
    premium: {
        multiplier: 1.16,
        keywords: ['merkez', 'center', 'sahil', 'beach', 'kadikoy', 'besiktas', 'sisli', 'bornova'],
    },
    cityEdge: {
        multiplier: 0.98,
        keywords: ['kenar', 'edge', 'cevre', 'periphery', 'disi'],
    },
    rural: {
        multiplier: 0.86,
        keywords: ['kirsal', 'koy', 'village', 'mezra'],
    },
    industrial: {
        multiplier: 0.93,
        keywords: ['sanayi', 'organize', 'osb'],
    },
};
exports.DEFAULT_DISTRICT_MULTIPLIER = 1;
