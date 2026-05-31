"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", auth_controller_1.registerController);
authRoutes.post("/login", auth_controller_1.loginController);
exports.default = authRoutes;
