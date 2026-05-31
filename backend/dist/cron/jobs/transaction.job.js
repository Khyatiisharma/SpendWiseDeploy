"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRecurringTransactions = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const helper_1 = require("../../utils/helper");
const processRecurringTransactions = async () => {
    const now = new Date();
    let processedCount = 0;
    let failedCount = 0;
    try {
        const transactionCursor = transaction_model_1.default.find({
            isRecurring: true,
            nextRecurringDate: { $lte: now },
        }).cursor();
        console.log("Starting recurring proccess");
        for await (const tx of transactionCursor) {
            const nextDate = (0, helper_1.calculateNextOccurrence)(tx.nextRecurringDate, tx.recurringInterval);
            const session = await mongoose_1.default.startSession();
            try {
                await session.withTransaction(async () => {
                    // console.log(tx, "transaction");
                    await transaction_model_1.default.create([
                        {
                            ...tx.toObject(),
                            _id: new mongoose_1.default.Types.ObjectId(),
                            title: `Recurring - ${tx.title}`,
                            date: tx.nextRecurringDate,
                            isRecurring: false,
                            nextRecurringDate: null,
                            recurringInterval: null,
                            lastProcessed: null,
                            createdAt: undefined,
                            updatedAt: undefined,
                        },
                    ], { session });
                    await transaction_model_1.default.updateOne({ _id: tx._id }, {
                        $set: {
                            nextRecurringDate: nextDate,
                            lastProcessed: now,
                        },
                    }, { session });
                }, {
                    maxCommitTimeMS: 20000,
                });
                processedCount++;
            }
            catch (error) {
                failedCount++;
                console.log(`Failed reccurring tx: ${tx._id}`, error);
            }
            finally {
                await session.endSession();
            }
        }
        console.log(`✅Processed: ${processedCount} transaction`);
        console.log(`❌ Failed: ${failedCount} transaction`);
        return {
            success: true,
            processedCount,
            failedCount,
        };
    }
    catch (error) {
        console.error("Error occur processing transaction", error);
        return {
            success: false,
            error: error?.message,
        };
    }
};
exports.processRecurringTransactions = processRecurringTransactions;
