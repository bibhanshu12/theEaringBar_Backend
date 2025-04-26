import { Request, Response,NextFunction } from "express";
import { PrismaClient } from "../generated/prisma";
import { cloudinaryUploads } from "../utils/cloudinaryfunc";
import { ApiError } from "../utils/apiErrorUtils";
import fs from "fs-extra";
import { addProductSchema,updateProductSchema } from "../validation";
import yup from "yup";
import { cloudinaryDestroy } from "../utils/cloudinaryDestroy";

interface ColorInput {
  name: string;  
  stock: number;
}
interface ColorStockUpdate {
  colorId: string;
  stock: number;
}

interface ColorStockCreate {
  color: { connect: { id: string } };
  stock: number;
}

const prisma = new PrismaClient();

export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tempPaths = (req.files as Express.Multer.File[] || []).map(f => f.path);

  try {
    
    let { name, description, price, categoryIds, colors } = req.body;
    
    if (typeof categoryIds === "string") {
      try {
        categoryIds = JSON.parse(categoryIds);
      } catch {
        throw new ApiError(400, "Invalid JSON format for categoryIds");
      }
    }
    if (typeof colors === "string") {
      try {
        colors = JSON.parse(colors);
      } catch {
        throw new ApiError(400, "Invalid JSON format for colors");
      }
    }
   
    await addProductSchema.validate(
      { name, description, price, categoryIds, colors },
      { abortEarly: false }
    );

   //validating arrays
    categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    colors = Array.isArray(colors) ? colors : [];

  
    const colorsWithIds = await Promise.all(
      (colors as ColorInput[]).map(async (color) => {
        const existing = await prisma.color.findUnique({ where: { name: color.name } });
        if (!existing) throw new ApiError(400, `Color ${color.name} not found`);
        return { colorId: existing.id, stock: color.stock };
      })
    );

    // Calculate total stock
    const totalStock = colorsWithIds.length
      ? colorsWithIds.reduce((sum, c) => sum + c.stock, 0)
      : parseInt(req.body.stock, 10) || 0;

    // Upload images
    const imageUploads = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const resp = await cloudinaryUploads(file.path);
        imageUploads.push({
          imageUrl: resp.secure_url,
          publicId: resp.public_id,
          isDefault: imageUploads.length === 0
        });
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: totalStock,
        categories: {
          create: (categoryIds as string[]).map(id => ({
            category: { connect: { id: parseInt(id, 10) } }
          }))
        },
        images: { create: imageUploads },
        colors: {
          create: colorsWithIds.map(c => ({
            color: { connect: { id: c.colorId } },
            stock: c.stock
          }))
        }
      },
      include: {
        categories: { include: { category: true } },
        images: true,
        colors: { include: { color: true } }
      }
    });

    res.status(201).json({ success: true, product });
  } catch (err: any) {
    
    await Promise.all(tempPaths.map(async p => fs.existsSync(p) && fs.unlink(p)));

    if (err instanceof yup.ValidationError) {
       res.status(400).json({ errors: err.errors });
       return
    }

    return next(err);

  }finally{
     await Promise.all(tempPaths.map(async p => {
      try {
        if (await fs.pathExists(p)) {
          await fs.unlink(p);
        }
      } catch (e) {
        console.error("Cleanup failed for", p, e);
      }
    }));
  }
};


export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const tempPaths = (req.files as Express.Multer.File[] || []).map(f => f.path);

  try {
    if (!productId) throw new ApiError(400, "Product ID is required");

    let { name, description, price, categoryIds, colors, stocks } = req.body;

    // Parse JSON strings for form-data
    if (typeof categoryIds === "string") {
      try { categoryIds = JSON.parse(categoryIds); } 
      catch { throw new ApiError(400, "Invalid JSON format for categoryIds"); }
    }
    if (typeof colors === "string") {
      try { colors = JSON.parse(colors); }
      catch { throw new ApiError(400, "Invalid JSON format for colors"); }
    }

    // Validate fields
    await updateProductSchema.validate(
      { name, description, price, categoryIds, colors },
      { abortEarly: false }
    );

    categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    colors = Array.isArray(colors) ? colors : [];

    const colorsWithIds: ColorStockUpdate[] = await Promise.all(
      (colors as ColorInput[]).map(async (color) => {
        const existing = await prisma.color.findUnique({ where: { name: color.name } });
        if (!existing) throw new ApiError(400, `Color ${color.name} not found`);
        return { colorId: existing.id, stock: color.stock };
      })
    );

    const totalStock = colorsWithIds.length
      ? colorsWithIds.reduce((sum, c) => sum + c.stock, 0)
      : parseInt(req.body.stock, 10) || 0;

    const imageUploads: Array<{ imageUrl: string; publicId: string; isDefault: boolean }> = [];
    if (req.files && Array.isArray(req.files)) {
      for (const [i, file] of (req.files as Express.Multer.File[]).entries()) {
        const { secure_url, public_id } = await cloudinaryUploads(file.path);
        imageUploads.push({ imageUrl: secure_url, publicId: public_id, isDefault: i === 0 });
        await fs.remove(file.path);
      }
    }

    const existingColors = await prisma.productColor.findMany({
      where: { productId },
      select: { colorId: true }
    });
    const existingColorIds = new Set(existingColors.map(c => c.colorId));

    const toCreate: ColorStockCreate[] = [];
    const toUpdate: ReturnType<typeof prisma.productColor.update>[] = [];

    colorsWithIds.forEach(c => {
      if (existingColorIds.has(c.colorId)) {
        toUpdate.push(
          prisma.productColor.update({
            where: {
              productId_colorId: {
                productId,
                colorId: c.colorId
              }
            },
            data: { stock: c.stock }
          })
        );
      } else {
        toCreate.push({
          color: { connect: { id: c.colorId } },
          stock: c.stock
        });
      }
    });

    await Promise.all(toUpdate);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: totalStock || stocks,
        categories: {
          create: (categoryIds as string[]).map(id => ({ category: { connect: { id: parseInt(id, 10) } } }))
        },
        colors: {
          create: toCreate
        },
        images: {
          create: imageUploads
        }
      },
      include: {
        categories: { include: { category: true } },
        colors: { include: { color: true } },
        images: true
      }
    });

    res.status(200).json({ success: true, data: updated, message: "Updated successfully! Appended new data or updated existing stocks." });
  } catch (err: any) {
    await Promise.all(tempPaths.map(async p => fs.existsSync(p) && fs.unlink(p)));
    if (err instanceof yup.ValidationError) {
       res.status(400).json({ errors: err.errors });
       return
    }
    return next(err);
  }
};


export const  allProducts=async(req:Request,res:Response)=>{

  try{

    const allproducts= await prisma.product.findMany();
    if(!allProducts){
      throw new ApiError(400,"No any post found !")
    }

    res.json({msg:"Product fetchedv!",allproducts})


  }catch(err:any){
    res.json({msg:"unsuccessfull",err:err.message})
    throw new ApiError(400,"Error while fetching allpost!")

  }
}

export const deleteProduct =async(req:Request,res:Response)=>{
    const {productId}=req.params;
   
    // console.log(productId);
  
    if(!productId){
      throw new ApiError(400,"No ProductId found !");
  
    }
 
   const delProductImg= await prisma.productImage.findMany({
      where:{
        productId
      },
      select:{
        publicId:true,
      }
    })

    const publicIds= delProductImg.map((e)=>e.publicId);
    
    await prisma.productCategory.deleteMany({
      where:{
          productId
      }
    })
    await prisma.productColor.deleteMany({
      where:{
        productId
      }
    })
    
    await prisma.product.delete({
      where:{
        id:productId
      }
    })

    publicIds.map((e)=>cloudinaryDestroy(e));



    res.json({msg:"Successfully Deleted!"});

  };



  /*
  if want extra features then can add follow routes 


  /products/:productId/colors/:colorId	PATCH	Update stock for a specific color (e.g., increment/decrement stock without full update)
/products/:productId/categories/:categoryId	DELETE	Remove a specific category from a product
/products/:productId/images/:imageId	DELETE	Remove a specific image
/products/:productId/default-image	PATCH	Set a specific image as default

  */ 