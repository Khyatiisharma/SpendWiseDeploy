"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const reportRoutes = (0, express_1.Router)();
reportRoutes.get("/all", report_controller_1.getAllReportsController);
reportRoutes.get("/generate", report_controller_1.generateReportController);
reportRoutes.put("/update-setting", report_controller_1.updateReportSettingController);
exports.default = reportRoutes;
