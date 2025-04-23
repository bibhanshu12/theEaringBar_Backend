import { Response,Request } from "express";
import { PrismaClient } from "../generated/prisma";
import { ApiError } from "../utils/apiErrorUtils";


const prisma=new PrismaClient();

export const addCategory=async(req:Request,res:Response)=>{

const {name ,description} = req.body;

if(!name || !description){
    throw new ApiError(400,"name ,description are required !")
}
const added= await prisma.category.create({
    data:{
        name,
        description
    }
})

res.json({msg:"category added ",added})

}

export const getCategory=async(req:Request,res:Response)=>{

 

    const getall= await prisma.category.findMany({
      select:{
        id:true,
        name:true,
        description:true,
      }
    })
    
    res.json({msg:"category added ",getall})
    
    }