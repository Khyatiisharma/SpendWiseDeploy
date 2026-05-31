"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanReceiptController = exports.bulkTransactionController = exports.bulkDeleteTransactionController = exports.deleteTransactionController = exports.updateTransactionController = exports.duplicateTransactionController = exports.getTransactionByIdController = exports.getAiTransactionSuggestionsController = exports.getAllTransactionController = exports.createTransactionController = void 0;
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const http_config_1 = require("../config/http.config");
const transaction_validator_1 = require("../validators/transaction.validator");
const transaction_service_1 = require("../services/transaction.service");
exports.createTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = transaction_validator_1.createTransactionSchema.parse(req.body);
    const userId = req.user?._id;
    const transaction = await (0, transaction_service_1.createTransactionService)(body, userId);
    return res.status(http_config_1.HTTPSTATUS.CREATED).json({
        message: "Transacton created successfully",
        transaction,
    });
});
exports.getAllTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const filters = {
        keyword: req.query.keyword,
        type: req.query.type,
        recurringStatus: req.query.recurringStatus,
    };
    const pagination = {
        pageSize: parseInt(req.query.pageSize) || 20,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const result = await (0, transaction_service_1.getAllTransactionService)(userId, filters, pagination);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
        ...result,
    });
});
exports.getAiTransactionSuggestionsController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const data = await (0, transaction_service_1.getAiTransactionSuggestionsService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "AI suggestions generated successfully",
        data,
    });
});
exports.getTransactionByIdController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const transactionId = transaction_validator_1.transactionIdSchema.parse(req.params.id);
    const transaction = await (0, transaction_service_1.getTransactionByIdService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
        transaction,
    });
});
exports.duplicateTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const transactionId = transaction_validator_1.transactionIdSchema.parse(req.params.id);
    const transaction = await (0, transaction_service_1.duplicateTransactionService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction duplicated successfully",
        data: transaction,
    });
});
exports.updateTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const transactionId = transaction_validator_1.transactionIdSchema.parse(req.params.id);
    const body = transaction_validator_1.updateTransactionSchema.parse(req.body);
    await (0, transaction_service_1.updateTransactionService)(userId, transactionId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction updated successfully",
    });
});
exports.deleteTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const transactionId = transaction_validator_1.transactionIdSchema.parse(req.params.id);
    await (0, transaction_service_1.deleteTransactionService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction deleted successfully",
    });
});
exports.bulkDeleteTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { transactionIds } = transaction_validator_1.bulkDeleteTransactionSchema.parse(req.body);
    const result = await (0, transaction_service_1.bulkDeleteTransactionService)(userId, transactionIds);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction deleted successfully",
        ...result,
    });
});
exports.bulkTransactionController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { transactions } = transaction_validator_1.bulkTransactionSchema.parse(req.body);
    const result = await (0, transaction_service_1.bulkTransactionService)(userId, transactions);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Bulk transaction inserted successfully",
        ...result,
    });
});
exports.scanReceiptController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const file = req?.file;
    const result = await (0, transaction_service_1.scanReceiptService)(file);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Receipt scanned successfully",
        data: result,
    });
});
