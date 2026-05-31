"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserService = exports.findByIdUserService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const app_error_1 = require("../utils/app-error");
const findByIdUserService = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    return user?.omitPassword();
};
exports.findByIdUserService = findByIdUserService;
const updateUserService = async (userId, body, profilePic) => {
    const user = await user_model_1.default.findById(userId);
    if (!user)
        throw new app_error_1.NotFoundException("User not found");
    if (profilePic) {
        user.profilePicture = profilePic.path;
    }
    user.set({
        name: body.name,
    });
    await user.save();
    return user.omitPassword();
};
exports.updateUserService = updateUserService;
