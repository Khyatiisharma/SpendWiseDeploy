"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./config/passport.config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const env_config_1 = require("./config/env.config");
const http_config_1 = require("./config/http.config");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const app_error_1 = require("./utils/app-error");
const asyncHandler_middlerware_1 = require("./middlewares/asyncHandler.middlerware");
const database_config_1 = __importDefault(require("./config/database.config"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const passport_config_1 = require("./config/passport.config");
const user_route_1 = __importDefault(require("./routes/user.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const cron_1 = require("./cron");
const report_route_1 = __importDefault(require("./routes/report.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const app = (0, express_1.default)();
const BASE_PATH = env_config_1.Env.BASE_PATH;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: env_config_1.Env.FRONTEND_ORIGIN,
    credentials: true,
}));
app.get("/", (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res, next) => {
    throw new app_error_1.BadRequestException("This is a test error");
    res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Hello Subcribe to the channel",
    });
}));
app.use(`${BASE_PATH}/auth`, auth_route_1.default);
app.use(`${BASE_PATH}/user`, passport_config_1.passportAuthenticateJwt, user_route_1.default);
app.use(`${BASE_PATH}/transaction`, passport_config_1.passportAuthenticateJwt, transaction_route_1.default);
app.use(`${BASE_PATH}/report`, passport_config_1.passportAuthenticateJwt, report_route_1.default);
app.use(`${BASE_PATH}/analytics`, passport_config_1.passportAuthenticateJwt, analytics_route_1.default);
app.use(errorHandler_middleware_1.errorHandler);
app.listen(env_config_1.Env.PORT, async () => {
    await (0, database_config_1.default)();
    if (env_config_1.Env.NODE_ENV === "development") {
        await (0, cron_1.initializeCrons)();
    }
    console.log(`Server is running on port ${env_config_1.Env.PORT} in ${env_config_1.Env.NODE_ENV} mode`);
});
