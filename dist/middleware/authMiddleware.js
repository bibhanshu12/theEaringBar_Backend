"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isauthenticated = void 0;
const prisma_1 = require("../../generated/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new prisma_1.PrismaClient();
const isauthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(400).json({ message: "Authorization denied!" });
            return;
        }
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ message: "JWT secret is not set in environment" });
            return;
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.id,
            },
        });
        if (!user) {
            res.status(400).json({ message: "User not found!" });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
exports.isauthenticated = isauthenticated;
