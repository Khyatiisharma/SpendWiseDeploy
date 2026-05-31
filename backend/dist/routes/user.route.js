"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const cloudinary_config_1 = require("../config/cloudinary.config");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/current-user", user_controller_1.getCurrentUserController);
userRoutes.put("/update", cloudinary_config_1.upload.single("profilePicture"), user_controller_1.updateUserController);
exports.default = userRoutes;
