"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const transaction_job_1 = require("./jobs/transaction.job");
const report_job_1 = require("./jobs/report.job");
const scheduleJob = (name, time, job) => {
    console.log(`Scheduling ${name} at ${time}`);
    return node_cron_1.default.schedule(time, async () => {
        try {
            await job();
            console.log(`${name} completed`);
        }
        catch (error) {
            console.log(`${name} failed`, error);
        }
    }, {
        scheduled: true,
        timezone: "UTC",
    });
};
const startJobs = () => {
    return [
        scheduleJob("Transactions", "5 0 * * *", transaction_job_1.processRecurringTransactions),
        //run 2:30am every first of the month
        scheduleJob("Reports", "30 2 1 * *", report_job_1.processReportJob),
    ];
};
exports.startJobs = startJobs;
