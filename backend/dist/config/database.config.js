"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("./env.config");
const connctDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_config_1.Env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log("Connected to MongoDB database");
    }
    catch (error) {
        console.error("Error connecting to MongoDB database:", error);
        process.exit(1);
    }
};
exports.default = connctDatabase;
