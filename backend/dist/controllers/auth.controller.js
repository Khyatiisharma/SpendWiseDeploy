"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.registerController = void 0;
const http_config_1 = require("../config/http.config");
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
exports.registerController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = auth_validator_1.registerSchema.parse(req.body);
    const result = await (0, auth_service_1.registerService)(body);
    return res.status(http_config_1.HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data: result,
    });
});
exports.loginController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = auth_validator_1.loginSchema.parse({
        ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } = await (0, auth_service_1.loginService)(body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User logged in successfully",
        user,
        accessToken,
        expiresAt,
        reportSetting,
    });
});
