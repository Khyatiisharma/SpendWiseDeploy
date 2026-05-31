"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCrons = void 0;
const scheduler_1 = require("./scheduler");
const initializeCrons = async () => {
    try {
        const jobs = (0, scheduler_1.startJobs)();
        console.log(`⏰ ${jobs.length} cron jobs intialized`);
        return jobs;
    }
    catch (error) {
        console.error("CRON INIT ERROR:", error);
        return [];
    }
};
exports.initializeCrons = initializeCrons;
