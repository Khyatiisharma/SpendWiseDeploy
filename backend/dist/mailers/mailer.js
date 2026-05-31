"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const env_config_1 = require("../config/env.config");
const resend_config_1 = require("../config/resend.config");
const mailer_sender = `Spendwise AI <${env_config_1.Env.RESEND_MAILER_SENDER}>`;
const sendEmail = async ({ to, from = mailer_sender, subject, text, html, }) => {
    return await resend_config_1.resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        text,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
