import { Response,Request } from "express";
import { PrismaClient } from "../generated/prisma";
import { ApiError } from "../utils/apiErrorUtils";

const prisma=new PrismaClient();
export const addColor=async(req:Request,res:Response)=>{

   const {name,hexCode}=req.body;


   if(!name || !hexCode){
    throw new ApiError(400,"colorName and hexCode are required !")
 
}

const added= await prisma.color.create({
    data:{
        
        name,
        hexCode
    }

})

res.json({msg:"Colors added ",added})


}


export const getColors=async(req:Request,res:Response)=>{

    const getall= await prisma.color.findMany({
      select:{
        id:true,
        name:true,
        hexCode:true,
      }
    })
    
    res.json({msg:"fetched  Colors ",getall})
    
    }