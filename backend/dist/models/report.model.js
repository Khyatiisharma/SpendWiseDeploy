"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportStatusEnum = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var ReportStatusEnum;
(function (ReportStatusEnum) {
    ReportStatusEnum["SENT"] = "SENT";
    ReportStatusEnum["PENDING"] = "PENDING";
    ReportStatusEnum["FAILED"] = "FAILED";
    ReportStatusEnum["NO_ACTIVITY"] = "NO_ACTIVITY";
})(ReportStatusEnum || (exports.ReportStatusEnum = ReportStatusEnum = {}));
const reportSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    period: {
        type: String,
        required: true,
    },
    sentDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ReportStatusEnum),
        default: ReportStatusEnum.PENDING,
    },
}, {
    timestamps: true,
});
const ReportModel = mongoose_1.default.model("Report", reportSchema);
exports.default = ReportModel;
