import jwt from "jsonwebtoken";
import type { Response } from "express";

export const generateToken = (userId: string, res: Response) => {

  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    // secure: true,
    path: "/",
  });

  return token;
};
