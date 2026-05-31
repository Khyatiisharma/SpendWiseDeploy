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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodEnum = exports.TransactionTypeEnum = exports.RecurringIntervalEnum = exports.TransactionStatusEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const format_currency_1 = require("../utils/format-currency");
var TransactionStatusEnum;
(function (TransactionStatusEnum) {
    TransactionStatusEnum["PENDING"] = "PENDING";
    TransactionStatusEnum["COMPLETED"] = "COMPLETED";
    TransactionStatusEnum["FAILED"] = "FAILED";
})(TransactionStatusEnum || (exports.TransactionStatusEnum = TransactionStatusEnum = {}));
var RecurringIntervalEnum;
(function (RecurringIntervalEnum) {
    RecurringIntervalEnum["DAILY"] = "DAILY";
    RecurringIntervalEnum["WEEKLY"] = "WEEKLY";
    RecurringIntervalEnum["MONTHLY"] = "MONTHLY";
    RecurringIntervalEnum["YEARLY"] = "YEARLY";
})(RecurringIntervalEnum || (exports.RecurringIntervalEnum = RecurringIntervalEnum = {}));
var TransactionTypeEnum;
(function (TransactionTypeEnum) {
    TransactionTypeEnum["INCOME"] = "INCOME";
    TransactionTypeEnum["EXPENSE"] = "EXPENSE";
})(TransactionTypeEnum || (exports.TransactionTypeEnum = TransactionTypeEnum = {}));
var PaymentMethodEnum;
(function (PaymentMethodEnum) {
    PaymentMethodEnum["CARD"] = "CARD";
    PaymentMethodEnum["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodEnum["MOBILE_PAYMENT"] = "MOBILE_PAYMENT";
    PaymentMethodEnum["AUTO_DEBIT"] = "AUTO_DEBIT";
    PaymentMethodEnum["CASH"] = "CASH";
    PaymentMethodEnum["OTHER"] = "OTHER";
})(PaymentMethodEnum || (exports.PaymentMethodEnum = PaymentMethodEnum = {}));
const transactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(TransactionTypeEnum),
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        set: (value) => (0, format_currency_1.convertToCents)(value),
        get: (value) => (0, format_currency_1.convertToDollarUnit)(value),
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    receiptUrl: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurringInterval: {
        type: String,
        enum: Object.values(RecurringIntervalEnum),
        default: null,
    },
    nextRecurringDate: {
        type: Date,
        default: null,
    },
    lastProcessed: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: Object.values(TransactionStatusEnum),
        default: TransactionStatusEnum.COMPLETED,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethodEnum),
        default: PaymentMethodEnum.CASH,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
});
const TransactionModel = mongoose_1.default.model("Transaction", transactionSchema);
exports.default = TransactionModel;
