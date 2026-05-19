"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkspaceAnalytics = buildWorkspaceAnalytics;
const Organization_1 = __importDefault(require("../models/Organization"));
const OrganizationMember_1 = __importDefault(require("../models/OrganizationMember"));
const WorkspacePortfolio_1 = __importDefault(require("../models/WorkspacePortfolio"));
const WorkspaceWatchlist_1 = __importDefault(require("../models/WorkspaceWatchlist"));
const SharedAnalysis_1 = __importDefault(require("../models/SharedAnalysis"));
async function buildWorkspaceAnalytics() {
    const [organizations, activeMembers, sharedPortfolio, sharedWatchlist, sharedAnalyses] = await Promise.all([
        Organization_1.default.countDocuments({ status: 'ACTIVE' }),
        OrganizationMember_1.default.countDocuments({ status: 'ACTIVE' }),
        WorkspacePortfolio_1.default.countDocuments({}),
        WorkspaceWatchlist_1.default.countDocuments({ status: 'ACTIVE' }),
        SharedAnalysis_1.default.countDocuments({}),
    ]);
    return {
        organizations,
        activeMembers,
        sharedPortfolio,
        sharedWatchlist,
        sharedAnalyses,
        workspaceState: organizations > 0 ? 'ACTIVE' : 'READY',
    };
}
