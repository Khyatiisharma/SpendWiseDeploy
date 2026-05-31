"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportSettingSchema = exports.reportSettingSchema = void 0;
const zod_1 = require("zod");
exports.reportSettingSchema = zod_1.z.object({
    isEnabled: zod_1.z.boolean().default(true),
});
exports.updateReportSettingSchema = exports.reportSettingSchema.partial();
