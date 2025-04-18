import { PrismaClient } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiErrorUtils.ts";
import type {NextFunction, Request,Response} from "express";
import { signUpInput,signInInput } from "../validation/index.ts";
import * as bcrypt from "bcrypt"
import type { Asserts } from 'yup'
import { generateToken } from "../utils/generateToken.util.ts";

const prisma = new PrismaClient();

interface SignUpInput extends Asserts<typeof signUpInput> {}

export const Signup = async (req: Request, res: Response,next:NextFunction):Promise<Response> => {
  try {
    const { email, firstName, lastName, password } = req.body as SignUpInput;

    if (!email || !firstName || !lastName || !password) {
      // throw new ApiError(400, 'All fields required!');
      const error = new ApiError(400, 'All fields required!');
throw error;

    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // throw new ApiError(400, 'User already exists with this email. Please login!');
      const error = new ApiError(400, 'User already exist with the email!');
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
    
    const token=generateToken(newUser.id.toString(),res);

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
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ msg: err.message });
    }
    if (err instanceof Error) {
      return res.status(500).json({ msg: 'Error during signup', error: err.message });
    }
    return res.status(500).json({ msg: 'Unknown error during signup' });
  }
};


export const getAllUsers=async(req:Request,res:Response)=>{

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        email: true,
        // Exclude password or other sensitive info
      },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
}