// types.d.ts - Create this file in your project
declare namespace Express {
  export interface Request {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      // Add other user properties as needed
    };
  }
}

// authMiddleware.ts
import { PrismaClient } from '../generated/prisma';
import type { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from '../utils/apiErrorUtils';

interface jwtInterface {
  userId: string;
  iat: number;
  exp: number;
}

const prisma = new PrismaClient();

export const isauthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: "Authorization denied!" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "JWT secret is not set in environment" });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwtInterface;

    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken.userId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }

    req.user = user;

    next();

  } catch (err: any) {

    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // No need for async here since we're not doing any async operations
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Access denied: Admin only" });
      return;
    }
    
    next();
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const isVendor = (req: Request, res: Response, next: NextFunction): void => {
  // No need for async here since we're not doing any async operations
  try {
    if (!req.user || (req.user.role !== "VENDOR" && req.user.role !== "ADMIN")) {
      res.status(403).json({ message: "Access denied: only Admin or Vendor can have access !" });
      throw new ApiError(403,"Access denied: only Admin or Vendor can have access !");
    }
    
    next();
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
