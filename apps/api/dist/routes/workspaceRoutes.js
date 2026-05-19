"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const workspaceController_1 = require("../controllers/workspaceController");
const router = express_1.default.Router();
router.get('/workspace/:organizationId/dashboard', auth_1.auth, workspaceController_1.getWorkspaceDashboard);
router.get('/workspace/:organizationId/portfolios', auth_1.auth, workspaceController_1.getWorkspacePortfolios);
router.get('/workspace/:organizationId/watchlist', auth_1.auth, workspaceController_1.getWorkspaceWatchlist);
router.get('/workspace/:organizationId/activity', auth_1.auth, workspaceController_1.getWorkspaceActivity);
router.post('/workspace/:organizationId/portfolios', auth_1.auth, workspaceController_1.addWorkspacePortfolioProperty);
router.post('/workspace/:organizationId/watchlist', auth_1.auth, workspaceController_1.addWorkspaceWatchlistProperty);
exports.default = router;
