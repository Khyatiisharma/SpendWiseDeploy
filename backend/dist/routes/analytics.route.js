"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analyticsRoutes = (0, express_1.Router)();
analyticsRoutes.get("/summary", analytics_controller_1.summaryAnalyticsController);
analyticsRoutes.get("/chart", analytics_controller_1.chartAnalyticsController);
analyticsRoutes.get("/expense-breakdown", analytics_controller_1.expensePieChartBreakdownController);
exports.default = analyticsRoutes;
