"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportController = exports.updateReportSettingController = exports.getAllReportsController = void 0;
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const http_config_1 = require("../config/http.config");
const report_service_1 = require("../services/report.service");
const report_validator_1 = require("../validators/report.validator");
exports.getAllReportsController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const pagination = {
        pageSize: parseInt(req.query.pageSize) || 20,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const result = await (0, report_service_1.getAllReportsService)(userId, pagination);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Reports history fetched successfully",
        ...result,
    });
});
exports.updateReportSettingController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const body = report_validator_1.updateReportSettingSchema.parse(req.body);
    await (0, report_service_1.updateReportSettingService)(userId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Reports setting updated successfully",
    });
});
exports.generateReportController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const result = await (0, report_service_1.generateReportService)(userId, fromDate, toDate);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Report generated successfully",
        ...result,
    });
});
