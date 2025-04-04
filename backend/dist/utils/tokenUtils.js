"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate a JWT token
 * @param id User ID (can be string, ObjectId, or unknown)
 * @returns JWT token string
 */
const generateToken = (id) => {
    // Make sure we're working with a string ID
    const idString = id.toString();
    return jsonwebtoken_1.default.sign({ id: idString }, process.env.JWT_SECRET || 'jwtsecret123', {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
