"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const http_config_1 = require("../config/http.config");
const app_error_1 = require("../utils/app-error");
const error_code_enum_1 = require("../enums/error-code.enum");
const multer_1 = require("multer");
const formatZodError = (res, error) => {
    const errors = error?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));
    return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors: errors,
        errorCode: error_code_enum_1.ErrorCodeEnum.VALIDATION_ERROR,
    });
};
const handleMulterError = (error) => {
    const messages = {
        LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'receipt'",
        LIMIT_FILE_SIZE: "File size exceeds the limit",
        LIMIT_FILE_COUNT: "Too many files uploaded",
        default: "File upload error",
    };
    return {
        status: http_config_1.HTTPSTATUS.BAD_REQUEST,
        message: messages[error.code] || messages.default,
        error: error.message,
    };
};
const errorHandler = (error, req, res, next) => {
    console.log("Error occurred on PATH:", req.path, "Error:", error);
    if (error instanceof zod_1.ZodError) {
        return formatZodError(res, error);
    }
    if (error instanceof multer_1.MulterError) {
        const { status, message, error: err } = handleMulterError(error);
        return res.status(status).json({
            message,
            error: err,
            errorCode: error_code_enum_1.ErrorCodeEnum.FILE_UPLOAD_ERROR,
        });
    }
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error?.message || "Unknow error occurred",
    });
};
exports.errorHandler = errorHandler;
