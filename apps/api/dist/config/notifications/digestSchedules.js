"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIGEST_SCHEDULES = void 0;
exports.DIGEST_SCHEDULES = {
    daily: {
        label: 'Daily',
        cronHint: '0 8 * * *',
    },
    weekly: {
        label: 'Weekly',
        cronHint: '0 8 * * 1',
    },
    off: {
        label: 'Disabled',
        cronHint: '-',
    },
};
