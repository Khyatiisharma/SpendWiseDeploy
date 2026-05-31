"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calulateNextReportDate = calulateNextReportDate;
exports.calculateNextOccurrence = calculateNextOccurrence;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const date_fns_1 = require("date-fns");
const transaction_model_1 = require("../models/transaction.model");
function calulateNextReportDate(lastSentDate) {
    const now = new Date();
    const lastSent = lastSentDate || now;
    const nextDate = (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(lastSent, 1));
    nextDate.setHours(0, 0, 0, 0);
    console.log(nextDate, "nextDate");
    return nextDate;
}
function calculateNextOccurrence(date, recurringInterval) {
    const base = new Date(date);
    base.setHours(0, 0, 0, 0);
    switch (recurringInterval) {
        case transaction_model_1.RecurringIntervalEnum.DAILY:
            return (0, date_fns_1.addDays)(base, 1);
        case transaction_model_1.RecurringIntervalEnum.WEEKLY:
            return (0, date_fns_1.addWeeks)(base, 1);
        case transaction_model_1.RecurringIntervalEnum.MONTHLY:
            return (0, date_fns_1.addMonths)(base, 1);
        case transaction_model_1.RecurringIntervalEnum.YEARLY:
            return (0, date_fns_1.addYears)(base, 1);
        default:
            return base;
    }
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
