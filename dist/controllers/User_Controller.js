"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.Signup = void 0;
const prisma_1 = require("../../generated/prisma");
const apiErrorUtils_1 = require("../utils/apiErrorUtils");
const bcrypt = __importStar(require("bcrypt"));
const generateToken_util_1 = require("../utils/generateToken.util");
const prisma = new prisma_1.PrismaClient();
const Signup = async (req, res, next) => {
    try {
        const { email, firstName, lastName, password } = req.body;
        if (!email || !firstName || !lastName || !password) {
            // throw new ApiError(400, 'All fields required!');
            const error = new apiErrorUtils_1.ApiError(400, 'All fields required!');
            throw error;
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            // throw new ApiError(400, 'User already exists with this email. Please login!');
            const error = new apiErrorUtils_1.ApiError(400, 'User already exist with the email!');
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });
        const token = (0, generateToken_util_1.generateToken)(newUser.id.toString(), res);
        return res.status(201).json({
            msg: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
            token
        });
    }
    catch (err) {
        if (err instanceof apiErrorUtils_1.ApiError) {
            return res.status(err.statusCode).json({ msg: err.message });
        }
        if (err instanceof Error) {
            return res.status(500).json({ msg: 'Error during signup', error: err.message });
        }
        return res.status(500).json({ msg: 'Unknown error during signup' });
    }
};
exports.Signup = Signup;
const getAllUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                email: true,
            },
        });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err });
    }
};
exports.getAllUsers = getAllUsers;
