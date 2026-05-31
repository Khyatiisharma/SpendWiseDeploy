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
exports.scanReceiptService = exports.bulkTransactionService = exports.bulkDeleteTransactionService = exports.deleteTransactionService = exports.updateTransactionService = exports.duplicateTransactionService = exports.getTransactionByIdService = exports.getAiTransactionSuggestionsService = exports.getAllTransactionService = exports.createTransactionService = void 0;
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importStar(require("../models/transaction.model"));
const app_error_1 = require("../utils/app-error");
const helper_1 = require("../utils/helper");
const prompt_1 = require("../utils/prompt");
const format_currency_1 = require("../utils/format-currency");
const groq_config_1 = require("../config/groq.config");
const getAiErrorStatus = (error) => {
    const err = error;
    return err?.response?.status || err?.status;
};
const getAiErrorMessage = (error) => {
    const err = error;
    return (err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        String(error));
};
const isAiRateLimitError = (error) => {
    const status = getAiErrorStatus(error);
    const message = getAiErrorMessage(error);
    return (status === 429 ||
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.toLowerCase().includes("rate limit") ||
        message.toLowerCase().includes("quota"));
};
const isAiAuthError = (error) => {
    const status = getAiErrorStatus(error);
    const message = getAiErrorMessage(error);
    const lowerMessage = message.toLowerCase();
    return (status === 400 ||
        status === 401 ||
        status === 403 ||
        message.includes("401") ||
        message.includes("403") ||
        message.includes("API_KEY_INVALID") ||
        message.includes("INVALID_ARGUMENT") ||
        message.includes("PERMISSION_DENIED") ||
        lowerMessage.includes("api key") ||
        lowerMessage.includes("invalid api key") ||
        lowerMessage.includes("invalid token"));
};
const createTransactionService = async (body, userId) => {
    let nextRecurringDate;
    const currentDate = new Date();
    if (body.isRecurring && body.recurringInterval) {
        const calulatedDate = (0, helper_1.calculateNextOccurrence)(body.date, body.recurringInterval);
        nextRecurringDate =
            calulatedDate < currentDate
                ? (0, helper_1.calculateNextOccurrence)(currentDate, body.recurringInterval)
                : calulatedDate;
    }
    const transaction = await transaction_model_1.default.create({
        ...body,
        userId,
        category: body.category,
        amount: Number(body.amount),
        isRecurring: body.isRecurring || false,
        recurringInterval: body.recurringInterval || null,
        nextRecurringDate,
        lastProcessed: null,
    });
    return transaction;
};
exports.createTransactionService = createTransactionService;
const getAllTransactionService = async (userId, filters, pagination) => {
    const { keyword, type, recurringStatus } = filters;
    const filterConditions = {
        userId,
    };
    if (keyword) {
        filterConditions.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
        ];
    }
    if (type) {
        filterConditions.type = type;
    }
    if (recurringStatus) {
        if (recurringStatus === "RECURRING") {
            filterConditions.isRecurring = true;
        }
        else if (recurringStatus === "NON_RECURRING") {
            filterConditions.isRecurring = false;
        }
    }
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;
    const [transations, totalCount] = await Promise.all([
        transaction_model_1.default.find(filterConditions)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 }),
        transaction_model_1.default.countDocuments(filterConditions),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
        transations,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};
exports.getAllTransactionService = getAllTransactionService;
const fallbackSuggestion = (totalIncome, totalExpenses, topCategory) => {
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const suggestions = [];
    if (totalIncome > 0 && savingsRate < 20) {
        suggestions.push({
            title: "Improve savings rate",
            message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try moving closer to 20% by trimming flexible expenses.`,
            priority: "high",
            action: "Set a weekly spending limit and review progress every Sunday.",
        });
    }
    if (topCategory) {
        suggestions.push({
            title: `Review ${topCategory} spending`,
            message: `${topCategory} is your biggest expense category in this data.`,
            category: topCategory,
            priority: "medium",
            action: "Check the largest transactions in this category and remove one avoidable repeat expense.",
        });
    }
    suggestions.push({
        title: "Track every transaction",
        message: "More complete transaction history helps the AI produce sharper suggestions.",
        priority: "low",
        action: "Upload receipts or import a CSV for missing expenses.",
    });
    return suggestions.slice(0, 4);
};
const parseAiJson = (text) => {
    const cleanedText = text
        ?.replace(/```(?:json)?\n?/g, "")
        .replace(/```/g, "")
        .trim();
    if (!cleanedText)
        return null;
    try {
        return JSON.parse(cleanedText);
    }
    catch (error) {
        console.error("AI suggestions returned invalid JSON:", cleanedText);
        return null;
    }
};
const getAiTransactionSuggestionsService = async (userId) => {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const [summary, categories, monthlyTrend, recentTransactions] = await Promise.all([
        transaction_model_1.default.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: { $gte: since },
                },
            },
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
                    transactionCount: { $sum: 1 },
                },
            },
        ]),
        transaction_model_1.default.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: transaction_model_1.TransactionTypeEnum.EXPENSE,
                    date: { $gte: since },
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: { $abs: "$amount" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
            { $limit: 6 },
        ]),
        transaction_model_1.default.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: { $gte: since },
                },
            },
            {
                $group: {
                    _id: {
                        month: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$date",
                            },
                        },
                        type: "$type",
                    },
                    amount: { $sum: { $abs: "$amount" } },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]),
        transaction_model_1.default.find({
            userId,
            date: { $gte: since },
        })
            .sort({ date: -1 })
            .limit(12)
            .select("title type amount category date paymentMethod")
            .lean({ getters: true }),
    ]);
    const summaryData = summary[0] || {
        totalIncome: 0,
        totalExpenses: 0,
        transactionCount: 0,
    };
    if (summaryData.transactionCount === 0) {
        return {
            generatedAt: new Date().toISOString(),
            basedOn: {
                period: "last 90 days",
                transactionCount: 0,
            },
            suggestions: [
                {
                    title: "Add transaction history",
                    message: "AI suggestions need transaction data. Add expenses manually, scan receipts, or import a CSV first.",
                    priority: "high",
                    action: "Import at least one month of transactions.",
                },
            ],
        };
    }
    const normalizedSummary = {
        totalIncome: (0, format_currency_1.convertToDollarUnit)(summaryData.totalIncome || 0),
        totalExpenses: (0, format_currency_1.convertToDollarUnit)(summaryData.totalExpenses || 0),
        availableBalance: (0, format_currency_1.convertToDollarUnit)((summaryData.totalIncome || 0) - (summaryData.totalExpenses || 0)),
        transactionCount: summaryData.transactionCount || 0,
    };
    const normalizedCategories = categories.map((item) => ({
        category: item._id || "other",
        total: (0, format_currency_1.convertToDollarUnit)(item.total || 0),
        count: item.count || 0,
    }));
    const normalizedMonthlyTrend = monthlyTrend.map((item) => ({
        month: item._id.month,
        type: item._id.type,
        amount: (0, format_currency_1.convertToDollarUnit)(item.amount || 0),
    }));
    const normalizedRecentTransactions = recentTransactions.map((tx) => ({
        title: tx.title,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
    }));
    const prompt = `
You are SpendWise's financial insights assistant.
Use the transaction analytics below to produce practical, specific suggestions.
Do not invent data. If a point is uncertain, say it is based on the available data.

Return only valid JSON in this exact shape:
{
  "summary": "string, max 28 words",
  "suggestions": [
    {
      "title": "string, max 8 words",
      "message": "string, max 28 words",
      "category": "string or empty string",
      "priority": "high | medium | low",
      "action": "string, max 18 words"
    }
  ]
}

Rules:
- Create 3 to 4 suggestions.
- Prefer actionable money-saving advice over generic budgeting tips.
- Mention categories only if present in the data.
- Use plain English.

Data:
${JSON.stringify({
        period: "last 90 days",
        summary: normalizedSummary,
        topExpenseCategories: normalizedCategories,
        monthlyTrend: normalizedMonthlyTrend,
        recentTransactions: normalizedRecentTransactions,
    }, null, 2)}
`;
    try {
        const responseText = await (0, groq_config_1.groqChatCompletion)({
            model: groq_config_1.groqTextModel,
            messages: [
                {
                    role: "system",
                    content: "You are a financial insights assistant. Return only valid JSON.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.35,
            maxCompletionTokens: 1200,
            responseJson: true,
        });
        const parsed = parseAiJson(responseText);
        const suggestions = Array.isArray(parsed?.suggestions)
            ? parsed.suggestions
                .filter((item) => item?.title && item?.message && item?.action)
                .slice(0, 4)
                .map((item) => ({
                title: String(item.title),
                message: String(item.message),
                category: item.category ? String(item.category) : undefined,
                priority: ["high", "medium", "low"].includes(item.priority)
                    ? item.priority
                    : "medium",
                action: String(item.action),
            }))
            : [];
        return {
            generatedAt: new Date().toISOString(),
            basedOn: {
                period: "last 90 days",
                transactionCount: normalizedSummary.transactionCount,
                topCategories: normalizedCategories,
            },
            summary: parsed?.summary || "Suggestions based on your last 90 days.",
            suggestions: suggestions.length > 0
                ? suggestions
                : fallbackSuggestion(normalizedSummary.totalIncome, normalizedSummary.totalExpenses, normalizedCategories[0]?.category),
        };
    }
    catch (error) {
        if (isAiAuthError(error)) {
            throw new app_error_1.ForbiddenException("Groq API key is invalid, missing, or does not have permission.");
        }
        if (isAiRateLimitError(error)) {
            throw new app_error_1.TooManyRequestsException(`Groq quota or rate limit exceeded for ${groq_config_1.groqTextModel}. Try again later.`);
        }
        console.error("AI suggestions failed:", error);
        return {
            generatedAt: new Date().toISOString(),
            basedOn: {
                period: "last 90 days",
                transactionCount: normalizedSummary.transactionCount,
                topCategories: normalizedCategories,
            },
            summary: "Fallback suggestions based on your transaction data.",
            suggestions: fallbackSuggestion(normalizedSummary.totalIncome, normalizedSummary.totalExpenses, normalizedCategories[0]?.category),
        };
    }
};
exports.getAiTransactionSuggestionsService = getAiTransactionSuggestionsService;
const getTransactionByIdService = async (userId, transactionId) => {
    const transaction = await transaction_model_1.default.findOne({
        _id: transactionId,
        userId,
    });
    if (!transaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    return transaction;
};
exports.getTransactionByIdService = getTransactionByIdService;
const duplicateTransactionService = async (userId, transactionId) => {
    const transaction = await transaction_model_1.default.findOne({
        _id: transactionId,
        userId,
    });
    if (!transaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    const duplicated = await transaction_model_1.default.create({
        ...transaction.toObject(),
        _id: undefined,
        title: `Duplicate - ${transaction.title}`,
        description: transaction.description
            ? `${transaction.description} (Duplicate)`
            : "Duplicated transaction",
        isRecurring: false,
        recurringInterval: undefined,
        nextRecurringDate: undefined,
        createdAt: undefined,
        updatedAt: undefined,
    });
    return duplicated;
};
exports.duplicateTransactionService = duplicateTransactionService;
const updateTransactionService = async (userId, transactionId, body) => {
    const existingTransaction = await transaction_model_1.default.findOne({
        _id: transactionId,
        userId,
    });
    if (!existingTransaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    const now = new Date();
    const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;
    const date = body.date !== undefined ? new Date(body.date) : existingTransaction.date;
    const recurringInterval = body.recurringInterval || existingTransaction.recurringInterval;
    let nextRecurringDate;
    if (isRecurring && recurringInterval) {
        const calulatedDate = (0, helper_1.calculateNextOccurrence)(date, recurringInterval);
        nextRecurringDate =
            calulatedDate < now
                ? (0, helper_1.calculateNextOccurrence)(now, recurringInterval)
                : calulatedDate;
    }
    existingTransaction.set({
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.type && { type: body.type }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.amount !== undefined && { amount: Number(body.amount) }),
        date,
        isRecurring,
        recurringInterval,
        nextRecurringDate,
    });
    await existingTransaction.save();
    return;
};
exports.updateTransactionService = updateTransactionService;
const deleteTransactionService = async (userId, transactionId) => {
    const deleted = await transaction_model_1.default.findByIdAndDelete({
        _id: transactionId,
        userId,
    });
    if (!deleted)
        throw new app_error_1.NotFoundException("Transaction not found");
    return;
};
exports.deleteTransactionService = deleteTransactionService;
const bulkDeleteTransactionService = async (userId, transactionIds) => {
    const result = await transaction_model_1.default.deleteMany({
        _id: { $in: transactionIds },
        userId,
    });
    if (result.deletedCount === 0)
        throw new app_error_1.NotFoundException("No transations found");
    return {
        sucess: true,
        deletedCount: result.deletedCount,
    };
};
exports.bulkDeleteTransactionService = bulkDeleteTransactionService;
const bulkTransactionService = async (userId, transactions) => {
    try {
        const bulkOps = transactions.map((tx) => ({
            insertOne: {
                document: {
                    ...tx,
                    userId,
                    isRecurring: false,
                    nextRecurringDate: null,
                    recurringInterval: null,
                    lastProcesses: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        }));
        const result = await transaction_model_1.default.bulkWrite(bulkOps, {
            ordered: true,
        });
        return {
            insertedCount: result.insertedCount,
            success: true,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.bulkTransactionService = bulkTransactionService;
const scanReceiptService = async (file) => {
    if (!file)
        throw new app_error_1.BadRequestException("No file uploaded");
    try {
        let base64String = file.buffer?.toString("base64");
        if (!base64String && file.path) {
            const responseData = await axios_1.default.get(file.path, {
                responseType: "arraybuffer",
            });
            base64String = Buffer.from(responseData.data).toString("base64");
        }
        if (!base64String)
            throw new app_error_1.BadRequestException("Could not process file");
        const responseText = await (0, groq_config_1.groqChatCompletion)({
            model: groq_config_1.groqVisionModel,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt_1.receiptPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${file.mimetype};base64,${base64String}`,
                            },
                        },
                    ],
                },
            ],
            temperature: 0,
            maxCompletionTokens: 900,
            responseJson: true,
        });
        const cleanedText = responseText
            ?.replace(/```(?:json)?\n?/g, "")
            .replace(/```/g, "")
            .trim();
        if (!cleanedText)
            throw new app_error_1.BadRequestException("Could not read receipt content");
        let data;
        try {
            data = JSON.parse(cleanedText);
        }
        catch (parseError) {
            console.error("Receipt scan returned invalid JSON:", cleanedText);
            throw new app_error_1.BadRequestException("Could not read receipt content");
        }
        if (!data.amount || !data.date) {
            throw new app_error_1.BadRequestException("Receipt missing required information");
        }
        return {
            title: data.title || "Receipt",
            amount: Number(data.amount),
            date: data.date,
            description: data.description || "",
            category: data.category || "other",
            paymentMethod: data.paymentMethod || "OTHER",
            type: data.type || transaction_model_1.TransactionTypeEnum.EXPENSE,
            receiptUrl: file.path || "",
        };
    }
    catch (error) {
        if (error instanceof app_error_1.BadRequestException) {
            throw error;
        }
        if (isAiAuthError(error)) {
            throw new app_error_1.ForbiddenException("Groq API key is invalid, missing, or does not have permission.");
        }
        if (isAiRateLimitError(error)) {
            throw new app_error_1.TooManyRequestsException(`Groq quota or rate limit exceeded for ${groq_config_1.groqVisionModel}. Try again later.`);
        }
        console.error("Receipt scanning failed:", error);
        throw new app_error_1.InternalServerException("The API usage limit for today has been exceeded");
    }
};
exports.scanReceiptService = scanReceiptService;
