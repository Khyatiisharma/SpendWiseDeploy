"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportFrequencyEnum = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var ReportFrequencyEnum;
(function (ReportFrequencyEnum) {
    ReportFrequencyEnum["MONTHLY"] = "MONTHLY";
})(ReportFrequencyEnum || (exports.ReportFrequencyEnum = ReportFrequencyEnum = {}));
const reportSettingSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    frequency: {
        type: String,
        enum: Object.values(ReportFrequencyEnum),
        default: ReportFrequencyEnum.MONTHLY,
    },
    isEnabled: {
        type: Boolean,
        default: false,
    },
    nextReportDate: {
        type: Date,
    },
    lastSentDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
const ReportSettingModel = mongoose_1.default.model("ReportSetting", reportSettingSchema);
exports.default = ReportSettingModel;
