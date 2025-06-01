import { Response,Request, response } from "express";
// import { PrismaClient } from "../generated/prisma";
import {PrismaClient} from "@prisma/client";
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
    
      // Optionally pull page & limit from req.query
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || getall.length;
  
    res.json({msg:"fetched  Colors ",data:getall,total:getall.length,page})
    
    }


    
    export const getColorById = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ success: false, message: 'Color ID is required' });
        }

        const getColor = await prisma.color.findFirst({
          where: {
            id: id,
          },
        });

        if (!getColor) {
          return res.status(404).json({ success: false, message: 'Color not found' });
        }
            return res.status(200).json({ success: true, data: getColor });
    
      } catch (error) {
        console.error('Error fetching color:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    };