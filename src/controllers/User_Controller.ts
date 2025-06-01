// import { PrismaClient } from '../generated/prisma';
import { PrismaClient} from "@prisma/client";
import { ApiError } from "../utils/apiErrorUtils";
import type {NextFunction, Request,Response} from "express";
import { signUpInput,signInInput } from "../validation/index";
import * as bcrypt from "bcrypt"
import type { Asserts } from 'yup'
import { generateToken } from "../utils/generateToken.util";
import { doMail } from "../utils/transportEmail";
import { PasswordReset, signupMail } from "../seeds/mailSeeds";

const prisma = new PrismaClient();

interface SignUpInput extends Asserts<typeof signUpInput> {}
interface SignInInput extends Asserts<typeof signInInput> {}

export const signUp = async (req: Request, res: Response,next:NextFunction):Promise<Response> => {
  try {
    const { email, firstName, lastName, password ,role} = req.body as SignUpInput;

    if (!email || !firstName || !lastName || !password) {

      throw new ApiError(400, 'Incorrect Credentials');
      
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // throw new ApiError(400, 'User already exists with this email. Please login!');
      res.status(400).json(
        {msg:"User already exist with this email! "}
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role:role || "CUSTOMER"
      },
    });

     try{
          doMail(signupMail(newUser.email))
          console.log("Mail sent successfully");
    
        }catch(err){
          console.error("Failed to send email", err);
        }
       



    const token=generateToken(newUser.id.toString(),res);

    return res.status(201).json({
      msg: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      token,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return res.json({ msg: err.message });
    }
    if (err instanceof Error) {
      return res.status(500).json({ msg: 'Error during signup', error: err.message });
    }
    return res.status(500).json({ msg: 'Unknown error during signup' });
  }
};

export const signIn=async(req:Request,res:Response)=>{
  try{
    const {email,password}=req.body as  SignInInput;

    const existUser=  await prisma.user.findFirst({
      where:{
        email
      }
    })

    if(!existUser){
        throw new ApiError(400,"User Not found! SignUp first")
    }

    const matchpassword= await bcrypt.compare(password,existUser.password);

     if(!matchpassword){
        throw new ApiError(400,"Password didn't match !")
    }
   
    


    // const token = jwt.sign({ userId: existUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // res
    //   .cookie("jwt", token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "lax",
    //     maxAge: 24 * 60 * 60 * 1000,
    //   })
    //   .status(200)
    //   .json({
    //     msg: "LoggedIn Successful!",
    //     user: { /*…*/ },
    //   });
    


    const token=generateToken(existUser.id.toString(),res);
    
     if(!token){
        return new ApiError(400,"Failed to generate Token !")
    }
    return res.status(200).json({
      msg: "LoggedIn Successful!",
      user: {
        id: existUser.id,
        email: existUser.email,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        role: existUser.role
      },
      token
    });

  }catch(err){
  
    if(err instanceof ApiError ){
      return  res.status(401).json({msg:"Error during login !",err:err.message});
  
    }
    if(err instanceof Error){
      return res.status(500).json({ msg: 'Error during signup', error: err.message });
    }
    return res.status(500).json({ msg: 'Unknown error during signup'});
  }
  
  }

  export const signOut=(req:Request,res:Response)=>{

    try{
      // console.log('logout Attempted!');
      // res.clearCookie("jwt", {
      //   httpOnly: true,
      //   // secure: process.env.NODE_ENV === "production", // optional, good for security
      //   sameSite: "strict",
      // });
      res.clearCookie('jwt');
      // console.log("logout successfull! cleared cookies !");

      return res.status(200).json({ msg: "Logged out successfully!" });

    }catch(err){
      return new ApiError(400, "Got error logging out !")
    }
}

export const updateProfile=async(req:Request,res:Response)=>{

  

}
  
export const forgetPassword=async(req:Request,res:Response)=>{
  //take old password ?
  //if matched then proceed!
  // take new password 
  //double check password
  //if correct then hassed it and set it to update the password

  const {password,newPassword}=req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const { email } = req.user;

  const existUser= await prisma.user.findFirst({
    where:{
      email
    }
  })
  if(!existUser){
    return res.status(401).json({ message: "no UserFound" });
  }

  const matchpassword= bcrypt.compare(password,existUser.password);
  
  if(!matchpassword){
    return res.status(401).json({ message: "Wrong password!" });
  }

  const hashedPassword= await bcrypt.hash(newPassword,10);
  if(!hashedPassword){
    return res.status(401).json({ message: " failed while Hashing !" });
  }
  const updatedUser= await prisma.user.update({
    where:{
      id:existUser.id
    },
    data:{
      password:hashedPassword
    }
    
  })

  return res.status(200).json({ message: "Password updated successfully!", updatedUser });




}

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
        addresses:true,
        role:true,
      },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};


function 
generateRandomCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

export const mailCode=async(req:Request,res:Response)=>{
  const {getmail}= req.body;
  const user= await prisma.user.findFirst(
  {
    where:{
      email:getmail,
      NOT:{
        role:"ADMIN"
      }
    }
  }
  )
  if(!user){
    res.json({msg:"No user Found !. please Signup first. "});
    return ;
  }

  const autoPw= generateRandomCode();
  // console.log(autoPw);
  await prisma.user.update({
    where:{
      email:getmail,
    },
    data:{

      resetCode:autoPw
    }
  })

  doMail(PasswordReset(getmail,autoPw));
  
  res.status(200).json({
    msg:"Code has been send to your email!"
  })


}

export const verifyCode=async(req:Request,res:Response)=>{

  const {email,code,newPassword}= req.body;

  const user= await prisma.user.findFirst({
    where:{
      email
    }
  })
  if(!user){
    throw new ApiError(400, "User not Found")
  }

  if(user.resetCode!=code){
    throw new ApiError(400, "Code didn't match with send code ")
  }
  const hashedPassword= await bcrypt.hash(newPassword,10);

  await  prisma.user.update({
    where:{
      email
    },data:{
      password:hashedPassword
    }
  })
  await prisma.user.update({
    where:{
      email
    },
    data:{
      resetCode:null
    }
  })
  

  res.status(200).json({msg:"Password Changed!!"})

}