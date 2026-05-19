"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMAND_LEVEL_SCORES = exports.REGIONAL_DEMAND_MATRIX = void 0;
exports.REGIONAL_DEMAND_MATRIX = [
    { city: 'istanbul', district: 'beylikduzu', demandLevel: 'active', residentialDemand: 78, commercialDemand: 82, industrialDemand: 75 },
    { city: 'istanbul', district: 'acibadem', demandLevel: 'active', residentialDemand: 82, commercialDemand: 85, industrialDemand: 60 },
    { city: 'istanbul', district: 'kadikoy', demandLevel: 'high_growth', residentialDemand: 88, commercialDemand: 92, industrialDemand: 45 },
    { city: 'istanbul', district: 'atasehir', demandLevel: 'active', residentialDemand: 80, commercialDemand: 88, industrialDemand: 70 },
    { city: 'istanbul', district: 'pendik', demandLevel: 'high_growth', residentialDemand: 76, commercialDemand: 72, industrialDemand: 85 },
    { city: 'istanbul', district: 'sisli', demandLevel: 'stable', residentialDemand: 70, commercialDemand: 80, industrialDemand: 50 },
    { city: 'ankara', district: 'cankaya', demandLevel: 'stable', residentialDemand: 68, commercialDemand: 75, industrialDemand: 55 },
    { city: 'ankara', district: 'kecioren', demandLevel: 'active', residentialDemand: 72, commercialDemand: 68, industrialDemand: 70 },
    { city: 'izmir', district: 'alsancak', demandLevel: 'stable', residentialDemand: 65, commercialDemand: 72, industrialDemand: 50 },
    { city: 'izmir', district: 'karsiyaka', demandLevel: 'active', residentialDemand: 75, commercialDemand: 70, industrialDemand: 65 },
    { city: 'bursa', district: 'osmangazi', demandLevel: 'active', residentialDemand: 72, commercialDemand: 68, industrialDemand: 80 },
    { city: 'antalya', district: 'muratpasa', demandLevel: 'high_growth', residentialDemand: 82, commercialDemand: 85, industrialDemand: 60 },
    { city: 'kayseri', district: 'melikgazi', demandLevel: 'active', residentialDemand: 70, commercialDemand: 65, industrialDemand: 78 },
    { city: 'gaziantep', demandLevel: 'stable', residentialDemand: 62, commercialDemand: 60, industrialDemand: 72 },
    { city: 'adana', demandLevel: 'stable', residentialDemand: 60, commercialDemand: 58, industrialDemand: 68 },
    { city: 'konya', demandLevel: 'cold', residentialDemand: 55, commercialDemand: 52, industrialDemand: 65 },
];
exports.DEMAND_LEVEL_SCORES = {
    cold: 40,
    stable: 60,
    active: 78,
    high_growth: 88,
};
