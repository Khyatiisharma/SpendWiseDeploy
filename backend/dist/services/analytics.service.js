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
exports.expensePieChartBreakdownService = exports.chartAnalyticsService = exports.summaryAnalyticsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const date_range_enum_1 = require("../enums/date-range.enum");
const transaction_model_1 = __importStar(require("../models/transaction.model"));
const date_1 = require("../utils/date");
const date_fns_1 = require("date-fns");
const format_currency_1 = require("../utils/format-currency");
const summaryAnalyticsService = async (userId, dateRangePreset, customFrom, customTo) => {
    const range = (0, date_1.getDateRange)(dateRangePreset, customFrom, customTo);
    const { from, to, value: rangeValue } = range;
    const currentPeriodPipeline = [
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                ...(from &&
                    to && {
                    date: {
                        $gte: from,
                        $lte: to,
                    },
                }),
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
        {
            $project: {
                _id: 0,
                totalIncome: 1,
                totalExpenses: 1,
                transactionCount: 1,
                availableBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
                savingData: {
                    $let: {
                        vars: {
                            income: { $ifNull: ["$totalIncome", 0] },
                            expenses: { $ifNull: ["$totalExpenses", 0] },
                        },
                        in: {
                            // ((income - expenses) / income) * 100;
                            savingsPercentage: {
                                $cond: [
                                    { $lte: ["$$income", 0] },
                                    0,
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$$income", "$$expenses"] },
                                                    "$$income",
                                                ],
                                            },
                                            100,
                                        ],
                                    },
                                ],
                            },
                            //Expense Ratio = (expenses / income) * 100
                            expenseRatio: {
                                $cond: [
                                    { $lte: ["$$income", 0] },
                                    0,
                                    {
                                        $multiply: [
                                            {
                                                $divide: ["$$expenses", "$$income"],
                                            },
                                            100,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ];
    const [current] = await transaction_model_1.default.aggregate(currentPeriodPipeline);
    const { totalIncome = 0, totalExpenses = 0, availableBalance = 0, transactionCount = 0, savingData = {
        expenseRatio: 0,
        savingsPercentage: 0,
    }, } = current || {};
    console.log(current, "current");
    let percentageChange = {
        income: 0,
        expenses: 0,
        balance: 0,
        prevPeriodFrom: null,
        prevPeriodTo: null,
        previousValues: {
            incomeAmount: 0,
            expenseAmount: 0,
            balanceAmount: 0,
        },
    };
    if (from && to && rangeValue !== date_range_enum_1.DateRangeEnum.ALL_TIME) {
        //last 30 days  previous las 30 days,
        const period = (0, date_fns_1.differenceInDays)(to, from) + 1;
        console.log(`${(0, date_fns_1.differenceInDays)(to, from)}`, period, "period");
        const isYearly = [
            date_range_enum_1.DateRangeEnum.LAST_YEAR,
            date_range_enum_1.DateRangeEnum.THIS_YEAR,
        ].includes(rangeValue);
        const prevPeriodFrom = isYearly ? (0, date_fns_1.subYears)(from, 1) : (0, date_fns_1.subDays)(from, period);
        const prevPeriodTo = isYearly ? (0, date_fns_1.subYears)(to, 1) : (0, date_fns_1.subDays)(to, period);
        console.log(prevPeriodFrom, prevPeriodTo, "Prev date");
        const prevPeriodPipeline = [
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    date: {
                        $gte: prevPeriodFrom,
                        $lte: prevPeriodTo,
                    },
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
                },
            },
        ];
        const [previous] = await transaction_model_1.default.aggregate(prevPeriodPipeline);
        console.log(previous, "Prvious Data");
        if (previous) {
            const prevIncome = previous.totalIncome || 0;
            const prevExpenses = previous.totalExpenses || 0;
            const prevBalance = prevIncome - prevExpenses;
            const currentIncome = totalIncome;
            const currentExpenses = totalExpenses;
            const currentBalance = availableBalance;
            percentageChange = {
                income: calaulatePercentageChange(prevIncome, currentIncome),
                expenses: calaulatePercentageChange(prevExpenses, currentExpenses),
                balance: calaulatePercentageChange(prevBalance, currentBalance),
                prevPeriodFrom: prevPeriodFrom,
                prevPeriodTo: prevPeriodTo,
                previousValues: {
                    incomeAmount: prevIncome,
                    expenseAmount: prevExpenses,
                    balanceAmount: prevBalance,
                },
            };
        }
    }
    return {
        availableBalance: (0, format_currency_1.convertToDollarUnit)(availableBalance),
        totalIncome: (0, format_currency_1.convertToDollarUnit)(totalIncome),
        totalExpenses: (0, format_currency_1.convertToDollarUnit)(totalExpenses),
        savingRate: {
            percentage: parseFloat(savingData.savingsPercentage.toFixed(2)),
            expenseRatio: parseFloat(savingData.expenseRatio.toFixed(2)),
        },
        transactionCount,
        percentageChange: {
            ...percentageChange,
            previousValues: {
                incomeAmount: (0, format_currency_1.convertToDollarUnit)(percentageChange.previousValues.incomeAmount),
                expenseAmount: (0, format_currency_1.convertToDollarUnit)(percentageChange.previousValues.expenseAmount),
                balanceAmount: (0, format_currency_1.convertToDollarUnit)(percentageChange.previousValues.balanceAmount),
            },
        },
        preset: {
            ...range,
            value: rangeValue || date_range_enum_1.DateRangeEnum.ALL_TIME,
            label: range?.label || "All Time",
        },
    };
};
exports.summaryAnalyticsService = summaryAnalyticsService;
const chartAnalyticsService = async (userId, dateRangePreset, customFrom, customTo) => {
    const range = (0, date_1.getDateRange)(dateRangePreset, customFrom, customTo);
    const { from, to, value: rangeValue } = range;
    const filter = {
        userId: new mongoose_1.default.Types.ObjectId(userId),
        ...(from &&
            to && {
            date: {
                $gte: from,
                $lte: to,
            },
        }),
    };
    const result = await transaction_model_1.default.aggregate([
        { $match: filter },
        //Group the transaction by date (YYYY-MM-DD)
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$date",
                    },
                },
                income: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", transaction_model_1.TransactionTypeEnum.INCOME] },
                            { $abs: "$amount" },
                            0,
                        ],
                    },
                },
                expenses: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", transaction_model_1.TransactionTypeEnum.EXPENSE] },
                            { $abs: "$amount" },
                            0,
                        ],
                    },
                },
                incomeCount: {
                    $sum: {
                        $cond: [{ $eq: ["$type", transaction_model_1.TransactionTypeEnum.INCOME] }, 1, 0],
                    },
                },
                expenseCount: {
                    $sum: {
                        $cond: [{ $eq: ["$type", transaction_model_1.TransactionTypeEnum.EXPENSE] }, 1, 0],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                income: 1,
                expenses: 1,
                incomeCount: 1,
                expenseCount: 1,
            },
        },
        {
            $group: {
                _id: null,
                chartData: { $push: "$$ROOT" },
                totalIncomeCount: { $sum: "$incomeCount" },
                totalExpenseCount: { $sum: "$expenseCount" },
            },
        },
        {
            $project: {
                _id: 0,
                chartData: 1,
                totalIncomeCount: 1,
                totalExpenseCount: 1,
            },
        },
    ]);
    const resultData = result[0] || {};
    const transaformedData = (resultData?.chartData || []).map((item) => ({
        date: item.date,
        income: (0, format_currency_1.convertToDollarUnit)(item.income),
        expenses: (0, format_currency_1.convertToDollarUnit)(item.expenses),
    }));
    return {
        chartData: transaformedData,
        totalIncomeCount: resultData.totalIncomeCount,
        totalExpenseCount: resultData.totalExpenseCount,
        preset: {
            ...range,
            value: rangeValue || date_range_enum_1.DateRangeEnum.ALL_TIME,
            label: range?.label || "All Time",
        },
    };
};
exports.chartAnalyticsService = chartAnalyticsService;
const expensePieChartBreakdownService = async (userId, dateRangePreset, customFrom, customTo) => {
    const range = (0, date_1.getDateRange)(dateRangePreset, customFrom, customTo);
    const { from, to, value: rangeValue } = range;
    const filter = {
        userId: new mongoose_1.default.Types.ObjectId(userId),
        type: transaction_model_1.TransactionTypeEnum.EXPENSE,
        ...(from &&
            to && {
            date: {
                $gte: from,
                $lte: to,
            },
        }),
    };
    const pipleline = [
        {
            $match: filter,
        },
        {
            $group: {
                _id: "$category",
                value: { $sum: { $abs: "$amount" } },
            },
        },
        { $sort: { value: -1 } }, //
        {
            $facet: {
                topThree: [{ $limit: 3 }],
                others: [
                    { $skip: 3 },
                    {
                        $group: {
                            _id: "others",
                            value: { $sum: "$value" },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                categories: {
                    $concatArrays: ["$topThree", "$others"],
                },
            },
        },
        { $unwind: "$categories" },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: "$categories.value" },
                breakdown: { $push: "$categories" },
            },
        },
        {
            $project: {
                _id: 0,
                totalSpent: 1,
                breakdown: {
                    // .map((cat: any)=> )
                    $map: {
                        input: "$breakdown",
                        as: "cat",
                        in: {
                            name: "$$cat._id",
                            value: "$$cat.value",
                            percentage: {
                                $cond: [
                                    { $eq: ["$totalSpent", 0] },
                                    0,
                                    {
                                        $round: [
                                            {
                                                $multiply: [
                                                    { $divide: ["$$cat.value", "$totalSpent"] },
                                                    100,
                                                ],
                                            },
                                            0,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ];
    const result = await transaction_model_1.default.aggregate(pipleline);
    const data = result[0] || {
        totalSpent: 0,
        breakdown: [],
    };
    const transformedData = {
        totalSpent: (0, format_currency_1.convertToDollarUnit)(data.totalSpent),
        breakdown: data.breakdown.map((item) => ({
            ...item,
            value: (0, format_currency_1.convertToDollarUnit)(item.value),
        })),
    };
    return {
        ...transformedData,
        preset: {
            ...range,
            value: rangeValue || date_range_enum_1.DateRangeEnum.ALL_TIME,
            label: range?.label || "All Time",
        },
    };
};
exports.expensePieChartBreakdownService = expensePieChartBreakdownService;
function calaulatePercentageChange(previous, current) {
    if (previous === 0)
        return current === 0 ? 0 : 100;
    const changes = ((current - previous) / Math.abs(previous)) * 100;
    const cappedChange = Math.min(Math.max(changes, -100), 100);
    return parseFloat(cappedChange.toFixed(2));
}
