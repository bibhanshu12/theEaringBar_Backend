import { Response,Request } from "express";
// import { PrismaClient } from "../generated/prisma";
import {PrismaClient} from "@prisma/client";
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

export const updateCategory=async(req:Request,res:Response)=>{

  const {name ,description} = req.body;
  const id=req.params.id;
  if(!name || !description){
      throw new ApiError(400,"name ,description are required !")
  }
  const updated= await prisma.category.update({
    where:{
      id:parseInt(id)
    },
      data:{
          name,
          description
      }
  })
  
  res.json({msg:"category added ",data:updated})
  
  }
  


export const deleteCategory=async(req:Request,res:Response)=>{

  const id= req.params.id;

  const toDelete= await prisma.category.delete({
    where:{
      id:parseInt(id)
    }
  })

  res.json({data:toDelete});
  return;

}

    export const getCategory = async (req: Request, res: Response) => {
      const getall = await prisma.category.findMany({
        select: { id: true, name: true, description: true },
      });
    
      // Optionally pull page & limit from req.query
      const page  = Number(req.query.page)  || 1;
      const limit = Number(req.query.limit) || getall.length;
    
      res.json({
        data:  getall,             // ← put your array under `data`
        total: getall.length,      // ← total count for pagination
        page,                      // ← current page
        // you could also include `limit` if you like
      });
      return;
    };
    
    interface categoryid{
      CategoryId:number;
    }
export const getProductByCategory=async(req:Request,res:Response)=>{

    // const {CategoryId:categoryid}=parseInt(req.params.CategoryId);
   try{
    const categoryId = parseInt(req.params.categoryId);
    
    const products=await prisma.product.findMany({
      where:{
        categories:{
          some:{
            categoryId
          }
        }
      },
     include:{
      images: true,
      categories: { include: { category: true } },
      colors: { include: { color: true } },
     }
      
    });

    if(!products){
      throw new ApiError(400,"No Product Found for this Category!")
    }
    res.json({data:products});

   }catch(error){
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
   }
}



    export const searchCategoriesByName = async (req: Request, res: Response) => {
      // grab whatever the client passed as the search term
      const { q } = req.params;  
      if (!q) {
         res.status(400).json({ error: 'Search term is required' });
         return;
      }
    
      // find all categories whose name contains `q`, case-insensitive
      const matches = await prisma.category.findMany({
        where: {
          name: {
            contains: q,          // partial match
            mode: 'insensitive',  // ignore case
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });
    
      if (matches.length === 0) {
        res.status(404).json({ error: `No categories matching "${q}"` });
        return ;
      }
    
       res.json({ data: matches });
       return;
    };
    