import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { cloudinaryUploads } from "../utils/cloudinaryfunc";
import { ApiError } from "../utils/apiErrorUtils";
import fs from "fs-extra";
import path from "path"


interface ColorInput {
  colorId: string;
  stock: number;
}
const prisma = new PrismaClient();

export const addProduct = async (req: Request, res: Response) => {

  console.log("tempath started")
  const tempPaths = (req.files as Express.Multer.File[] || []).map(f => f.path);

  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      colors = [] 
    } = req.body;


    console.log("data storing started")
    const imageUploads = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const cloudinaryResponse = await cloudinaryUploads(file.path);
        imageUploads.push({
          imageUrl: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id,
          isDefault: imageUploads.length === 0 
        });
       
      }
    }

    console.log("product add starts")
    // Create product with optional colors and multiple images
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
         // 1️⃣ Connect to an existing Category (instead of setting categoryId directly)
    Category: {
      connect: { id: parseInt(categoryId, 10) }
    },

    // 2️⃣ Create your ProductImage rows via the `images` relation
    images: {
      create: imageUploads
    },
        ...(colors.length > 0 && {
          colors: {
            create: colors.map((color: ColorInput) => ({
              color: {
                connect: { id: color.colorId }
              },
              stock: color.stock
            }))
          }
        })
      },
      include: {
        Category: true,
        images: true,  
        colors: {
          include: {
            color: true
          }
        }
      }
    });

    console.log("product add ended")

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (error) {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.path) await fs.unlink(file.path);
      }
    }
    if (error instanceof Error) {
      throw new ApiError(500, error.message);
    }
    throw new ApiError(500, "Error creating product");
  }finally {
    // cleanup all temp files once (if they exist)
    await Promise.all(tempPaths.map(async p => {
      if (await fs.pathExists(p)) {
        await fs.unlink(p);
      }
    }));
  }
};
