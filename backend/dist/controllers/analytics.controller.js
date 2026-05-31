"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensePieChartBreakdownController = exports.chartAnalyticsController = exports.summaryAnalyticsController = void 0;
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const http_config_1 = require("../config/http.config");
const analytics_service_1 = require("../services/analytics.service");
exports.summaryAnalyticsController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const stats = await (0, analytics_service_1.summaryAnalyticsService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Summary fetched successfully",
        data: stats,
    });
});
exports.chartAnalyticsController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const chartData = await (0, analytics_service_1.chartAnalyticsService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Chart fetched successfully",
        data: chartData,
    });
});
exports.expensePieChartBreakdownController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const pieChartData = await (0, analytics_service_1.expensePieChartBreakdownService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Expense breakdown fetched successfully",
        data: pieChartData,
    });
});
