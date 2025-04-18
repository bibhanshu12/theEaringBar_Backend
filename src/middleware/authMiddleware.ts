import { PrismaClient } from "../generated/prisma/client.js";
import type { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface jwtInterface {
  id: string;
  iat: number;
  exp: number;
}

const prisma = new PrismaClient();

export const isauthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwtInterface;

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
