"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReportJob = void 0;
const date_fns_1 = require("date-fns");
const report_setting_model_1 = __importDefault(require("../../models/report-setting.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const report_service_1 = require("../../services/report.service");
const report_model_1 = __importStar(require("../../models/report.model"));
const helper_1 = require("../../utils/helper");
const report_mailer_1 = require("../../mailers/report.mailer");
const processReportJob = async () => {
    const now = new Date();
    let processedCount = 0;
    let failedCount = 0;
    //Today july 1, then run report for -> june 1 - 30 
    //Get Last Month because this will run on the first of the month
    const from = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1));
    const to = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1));
    // const from = "2025-04-01T23:00:00.000Z";
    // const to = "2025-04-T23:00:00.000Z";
    try {
        const reportSettingCursor = report_setting_model_1.default.find({
            isEnabled: true,
            nextReportDate: { $lte: now },
        })
            .populate("userId")
            .cursor();
        console.log("Running report ");
        for await (const setting of reportSettingCursor) {
            const user = setting.userId;
            if (!user) {
                console.log(`User not found for setting: ${setting._id}`);
                continue;
            }
            const session = await mongoose_1.default.startSession();
            try {
                const report = await (0, report_service_1.generateReportService)(user.id, from, to);
                console.log(report, "resport data");
                let emailSent = false;
                if (report) {
                    try {
                        await (0, report_mailer_1.sendReportEmail)({
                            email: user.email,
                            username: user.name,
                            report: {
                                period: report.period,
                                totalIncome: report.summary.income,
                                totalExpenses: report.summary.expenses,
                                availableBalance: report.summary.balance,
                                savingsRate: report.summary.savingsRate,
                                topSpendingCategories: report.summary.topCategories,
                                insights: report.insights,
                            },
                            frequency: setting.frequency,
                        });
                        emailSent = true;
                    }
                    catch (error) {
                        console.log(`Email failed for ${user.id}`);
                    }
                }
                await session.withTransaction(async () => {
                    const bulkReports = [];
                    const bulkSettings = [];
                    if (report && emailSent) {
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period: report.period,
                                    status: report_model_1.ReportStatusEnum.SENT,
                                    createdAt: now,
                                    updatedAt: now,
                                },
                            },
                        });
                        bulkSettings.push({
                            updateOne: {
                                filter: { _id: setting._id },
                                update: {
                                    $set: {
                                        lastSentDate: now,
                                        nextReportDate: (0, helper_1.calulateNextReportDate)(now),
                                        updatedAt: now,
                                    },
                                },
                            },
                        });
                    }
                    else {
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period: report?.period ||
                                        `${(0, date_fns_1.format)(from, "MMMM d")}–${(0, date_fns_1.format)(to, "d, yyyy")}`,
                                    status: report
                                        ? report_model_1.ReportStatusEnum.FAILED
                                        : report_model_1.ReportStatusEnum.NO_ACTIVITY,
                                    createdAt: now,
                                    updatedAt: now,
                                },
                            },
                        });
                        bulkSettings.push({
                            updateOne: {
                                filter: { _id: setting._id },
                                update: {
                                    $set: {
                                        lastSentDate: null,
                                        nextReportDate: (0, helper_1.calulateNextReportDate)(now),
                                        updatedAt: now,
                                    },
                                },
                            },
                        });
                    }
                    await Promise.all([
                        report_model_1.default.bulkWrite(bulkReports, { ordered: false }),
                        report_setting_model_1.default.bulkWrite(bulkSettings, { ordered: false }),
                    ]);
                }, {
                    maxCommitTimeMS: 10000,
                });
                processedCount++;
            }
            catch (error) {
                console.log(`Failed to process report`, error);
                failedCount++;
            }
            finally {
                await session.endSession();
            }
        }
        console.log(`✅Processed: ${processedCount} report`);
        console.log(`❌ Failed: ${failedCount} report`);
        return {
            success: true,
            processedCount,
            failedCount,
        };
    }
    catch (error) {
        console.error("Error processing reports", error);
        return {
            success: false,
            error: "Report process failed",
        };
    }
};
exports.processReportJob = processReportJob;
