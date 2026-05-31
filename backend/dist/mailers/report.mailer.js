"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReportEmail = void 0;
const format_currency_1 = require("../utils/format-currency");
const report_template_1 = require("./templates/report.template");
const mailer_1 = require("./mailer");
const sendReportEmail = async (params) => {
    const { email, username, report, frequency } = params;
    const html = (0, report_template_1.getReportEmailTemplate)({
        username,
        ...report,
    }, frequency);
    const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${(0, format_currency_1.formatCurrency)(report.totalIncome)}
    Expenses: ${(0, format_currency_1.formatCurrency)(report.totalExpenses)}
    Balance: ${(0, format_currency_1.formatCurrency)(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;
    console.log(text, "text mail");
    return (0, mailer_1.sendEmail)({
        to: email,
        subject: `${frequency} Financial Report - ${report.period}`,
        text,
        html,
    });
};
exports.sendReportEmail = sendReportEmail;
