"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = exports.bulkTransactionSchema = exports.bulkDeleteTransactionSchema = exports.baseTransactionSchema = exports.transactionIdSchema = void 0;
const zod_1 = require("zod");
const transaction_model_1 = require("../models/transaction.model");
exports.transactionIdSchema = zod_1.z.string().trim().min(1);
exports.baseTransactionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum([transaction_model_1.TransactionTypeEnum.INCOME, transaction_model_1.TransactionTypeEnum.EXPENSE], {
        errorMap: () => ({
            message: "Transaction type must either INCOME or EXPENSE",
        }),
    }),
    amount: zod_1.z.number().positive("Amount must be postive").min(1),
    category: zod_1.z.string().min(1, "Category is required"),
    date: zod_1.z
        .union([zod_1.z.string().datetime({ message: "Invalid date string" }), zod_1.z.date()])
        .transform((val) => new Date(val)),
    isRecurring: zod_1.z.boolean().default(false),
    recurringInterval: zod_1.z
        .enum([
        transaction_model_1.RecurringIntervalEnum.DAILY,
        transaction_model_1.RecurringIntervalEnum.WEEKLY,
        transaction_model_1.RecurringIntervalEnum.MONTHLY,
        transaction_model_1.RecurringIntervalEnum.YEARLY,
    ])
        .nullable()
        .optional(),
    receiptUrl: zod_1.z.string().optional(),
    paymentMethod: zod_1.z
        .enum([
        transaction_model_1.PaymentMethodEnum.CARD,
        transaction_model_1.PaymentMethodEnum.BANK_TRANSFER,
        transaction_model_1.PaymentMethodEnum.MOBILE_PAYMENT,
        transaction_model_1.PaymentMethodEnum.AUTO_DEBIT,
        transaction_model_1.PaymentMethodEnum.CASH,
        transaction_model_1.PaymentMethodEnum.OTHER,
    ])
        .default(transaction_model_1.PaymentMethodEnum.CASH),
});
exports.bulkDeleteTransactionSchema = zod_1.z.object({
    transactionIds: zod_1.z
        .array(zod_1.z.string().length(24, "Invalid transaction ID format"))
        .min(1, "At least one transaction ID must be provided"),
});
exports.bulkTransactionSchema = zod_1.z.object({
    transactions: zod_1.z
        .array(exports.baseTransactionSchema)
        .min(1, "At least one transaction is required")
        .max(300, "Must not be more than 300 transactions")
        .refine((txs) => txs.every((tx) => {
        const amount = Number(tx.amount);
        return !isNaN(amount) && amount > 0 && amount <= 1_000_000_000;
    }), {
        message: "Amount must be a postive number",
    }),
});
exports.createTransactionSchema = exports.baseTransactionSchema;
exports.updateTransactionSchema = exports.baseTransactionSchema.partial();
