"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateRange = void 0;
const date_fns_1 = require("date-fns");
const date_range_enum_1 = require("../enums/date-range.enum");
const getDateRange = (preset, customFrom, customTo) => {
    if (customFrom && customTo) {
        return {
            from: customFrom,
            to: customTo,
            value: date_range_enum_1.DateRangeEnum.CUSTOM,
        };
    }
    const now = new Date();
    // const yesterday = subDays(now.setHours(0, 0, 0, 0), 1);
    const today = (0, date_fns_1.endOfDay)(now);
    const last30Days = {
        from: (0, date_fns_1.subDays)(today, 29),
        to: today,
        value: date_range_enum_1.DateRangeEnum.LAST_30_DAYS,
        label: "Last 30 Days",
    };
    console.log(last30Days, "last30");
    switch (preset) {
        case date_range_enum_1.DateRangeEnum.ALL_TIME:
            return {
                from: null,
                to: null,
                value: date_range_enum_1.DateRangeEnum.ALL_TIME,
                label: "All Time",
            };
        case date_range_enum_1.DateRangeEnum.LAST_30_DAYS:
            return last30Days;
        case date_range_enum_1.DateRangeEnum.LAST_MONTH:
            return {
                from: (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1)),
                to: (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1)),
                value: date_range_enum_1.DateRangeEnum.LAST_MONTH,
                label: "Last Month",
            };
        case date_range_enum_1.DateRangeEnum.LAST_3_MONTHS:
            return {
                from: (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 3)),
                to: (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1)),
                value: date_range_enum_1.DateRangeEnum.LAST_3_MONTHS,
                label: "Last 3 Months",
            };
        case date_range_enum_1.DateRangeEnum.LAST_YEAR:
            return {
                from: (0, date_fns_1.startOfYear)((0, date_fns_1.subYears)(now, 1)),
                to: (0, date_fns_1.endOfYear)((0, date_fns_1.subYears)(now, 1)),
                value: date_range_enum_1.DateRangeEnum.LAST_YEAR,
                label: "Last Year",
            };
        case date_range_enum_1.DateRangeEnum.THIS_MONTH:
            return {
                from: (0, date_fns_1.startOfMonth)(now),
                to: (0, date_fns_1.endOfDay)(now),
                value: date_range_enum_1.DateRangeEnum.THIS_MONTH,
                label: "This Month",
            };
        case date_range_enum_1.DateRangeEnum.THIS_YEAR:
            return {
                from: (0, date_fns_1.startOfYear)(now),
                to: (0, date_fns_1.endOfDay)(now),
                value: date_range_enum_1.DateRangeEnum.THIS_YEAR,
                label: "This Year",
            };
        default:
            return last30Days;
    }
};
exports.getDateRange = getDateRange;
