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
exports.generateReportService = exports.updateReportSettingService = exports.getAllReportsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const report_setting_model_1 = __importDefault(require("../models/report-setting.model"));
const report_model_1 = __importDefault(require("../models/report.model"));
const transaction_model_1 = __importStar(require("../models/transaction.model"));
const app_error_1 = require("../utils/app-error");
const helper_1 = require("../utils/helper");
const format_currency_1 = require("../utils/format-currency");
const date_fns_1 = require("date-fns");
const google_ai_config_1 = require("../config/google-ai.config");
const genai_1 = require("@google/genai");
const prompt_1 = require("../utils/prompt");
const getAllReportsService = async (userId, pagination) => {
    const query = { userId };
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;
    const [reports, totalCount] = await Promise.all([
        report_model_1.default.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
        report_model_1.default.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
        reports,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};
exports.getAllReportsService = getAllReportsService;
const updateReportSettingService = async (userId, body) => {
    const { isEnabled } = body;
    let nextReportDate = null;
    const existingReportSetting = await report_setting_model_1.default.findOne({
        userId,
    });
    if (!existingReportSetting)
        throw new app_error_1.NotFoundException("Report setting not found");
    //   const frequency =
    //     existingReportSetting.frequency || ReportFrequencyEnum.MONTHLY;
    if (isEnabled) {
        const currentNextReportDate = existingReportSetting.nextReportDate;
        const now = new Date();
        if (!currentNextReportDate || currentNextReportDate <= now) {
            nextReportDate = (0, helper_1.calulateNextReportDate)(existingReportSetting.lastSentDate);
        }
        else {
            nextReportDate = currentNextReportDate;
        }
    }
    console.log(nextReportDate, "nextReportDate");
    existingReportSetting.set({
        ...body,
        nextReportDate,
    });
    await existingReportSetting.save();
};
exports.updateReportSettingService = updateReportSettingService;
const generateReportService = async (userId, fromDate, toDate) => {
    const results = await transaction_model_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                date: { $gte: fromDate, $lte: toDate },
            },
        },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalIncome: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", transaction_model_1.TransactionTypeEnum.INCOME] },
                                        { $abs: "$amount" },
                                        0,
                                    ],
                                },
                            },
                            totalExpenses: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", transaction_model_1.TransactionTypeEnum.EXPENSE] },
                                        { $abs: "$amount" },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                ],
                categories: [
                    {
                        $match: { type: transaction_model_1.TransactionTypeEnum.EXPENSE },
                    },
                    {
                        $group: {
                            _id: "$category",
                            total: { $sum: { $abs: "$amount" } },
                        },
                    },
                    {
                        $sort: { total: -1 },
                    },
                    {
                        $limit: 5,
                    },
                ],
            },
        },
        {
            $project: {
                totalIncome: {
                    $arrayElemAt: ["$summary.totalIncome", 0],
                },
                totalExpenses: {
                    $arrayElemAt: ["$summary.totalExpenses", 0],
                },
                categories: 1,
            },
        },
    ]);
    if (!results?.length ||
        (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0))
        return null;
    const { totalIncome = 0, totalExpenses = 0, categories = [], } = results[0] || {};
    console.log(results[0], "results");
    const byCategory = categories.reduce((acc, { _id, total }) => {
        acc[_id] = {
            amount: (0, format_currency_1.convertToDollarUnit)(total),
            percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
        };
        return acc;
    }, {});
    const availableBalance = totalIncome - totalExpenses;
    const savingsRate = calculateSavingRate(totalIncome, totalExpenses);
    const periodLabel = `${(0, date_fns_1.format)(fromDate, "MMMM d")} - ${(0, date_fns_1.format)(toDate, "d, yyyy")}`;
    const insights = await generateInsightsAI({
        totalIncome,
        totalExpenses,
        availableBalance,
        savingsRate,
        categories: byCategory,
        periodLabel: periodLabel,
    });
    return {
        period: periodLabel,
        summary: {
            income: (0, format_currency_1.convertToDollarUnit)(totalIncome),
            expenses: (0, format_currency_1.convertToDollarUnit)(totalExpenses),
            balance: (0, format_currency_1.convertToDollarUnit)(availableBalance),
            savingsRate: Number(savingsRate.toFixed(1)),
            topCategories: Object.entries(byCategory)?.map(([name, cat]) => ({
                name,
                amount: cat.amount,
                percent: cat.percentage,
            })),
        },
        insights,
    };
};
exports.generateReportService = generateReportService;
async function generateInsightsAI({ totalIncome, totalExpenses, availableBalance, savingsRate, categories, periodLabel, }) {
    try {
        const prompt = (0, prompt_1.reportInsightPrompt)({
            totalIncome: (0, format_currency_1.convertToDollarUnit)(totalIncome),
            totalExpenses: (0, format_currency_1.convertToDollarUnit)(totalExpenses),
            availableBalance: (0, format_currency_1.convertToDollarUnit)(availableBalance),
            savingsRate: Number(savingsRate.toFixed(1)),
            categories,
            periodLabel,
        });
        const result = await google_ai_config_1.genAI.models.generateContent({
            model: google_ai_config_1.genAIModel,
            contents: [(0, genai_1.createUserContent)([prompt])],
            config: {
                responseMimeType: "application/json",
            },
        });
        const response = result.text;
        const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
        if (!cleanedText)
            return [];
        const data = JSON.parse(cleanedText);
        return data;
    }
    catch (error) {
        return [];
    }
}
function calculateSavingRate(totalIncome, totalExpenses) {
    if (totalIncome <= 0)
        return 0;
    const savingRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    return parseFloat(savingRate.toFixed(2));
}
