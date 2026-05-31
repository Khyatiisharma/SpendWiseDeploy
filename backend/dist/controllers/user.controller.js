"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserController = exports.getCurrentUserController = void 0;
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const user_service_1 = require("../services/user.service");
const http_config_1 = require("../config/http.config");
const user_validator_1 = require("../validators/user.validator");
exports.getCurrentUserController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const user = await (0, user_service_1.findByIdUserService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User fetched successfully",
        user,
    });
});
exports.updateUserController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = user_validator_1.updateUserSchema.parse(req.body);
    const userId = req.user?._id;
    const profilePic = req.file;
    const user = await (0, user_service_1.updateUserService)(userId, body, profilePic);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User profile updated successfully",
        data: user,
    });
});
