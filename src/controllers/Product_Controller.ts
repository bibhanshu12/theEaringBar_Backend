import { Request, Response, NextFunction } from "express";
// import { PrismaClient } from "../generated/prisma";
import {PrismaClient} from "@prisma/client";
import { cloudinaryUploads } from "../utils/cloudinaryfunc";
import { ApiError } from "../utils/apiErrorUtils";
import fs from "fs-extra";
import { addProductSchema, updateProductSchema, createOfferSchema } from "../validation";
import * as yup from 'yup';
import { ValidationError } from 'yup';
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


// export const addProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // 1) gather paths for cleanup
//   const tempPaths = (req.files as Express.Multer.File[] || []).map(
//     (f) => f.path
//   );

//   // DEBUG: what came in?
//   console.log("BODY:", req.body);
//   console.log("FILES:", req.files);

//   try {
//     // 2) parse JSON strings if needed
//     let { name, description, price, categoryIds, colors, stock } = req.body;
//     if (typeof categoryIds === "string") {
//       categoryIds = JSON.parse(categoryIds);
//     }
//     if (typeof colors === "string") {
//       colors = JSON.parse(colors);
//     }

//     // 3) validate
//     await addProductSchema.validate(
//       { name, description, price, categoryIds, colors, stock },
//       { abortEarly: false }
//     );

//     // 4) normalize
//     categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
//     colors = Array.isArray(colors) ? colors : [];

//     // 5) resolve colors → IDs + stocks
//     const colorsWithIds = await Promise.all(
//       (colors as ColorInput[]).map(async (c) => {
//         const found = await prisma.color.findUnique({
//           where: { name: c.name },
//         });
//         if (!found) throw new ApiError(400, `Color ${c.name} not found`);
//         return { colorId: found.id, stock: c.stock };
//       })
//     );

//     // 6) compute total stock
//     const totalStock =
//       colorsWithIds.length > 0
//         ? colorsWithIds.reduce((sum, c) => sum + c.stock, 0)
//         : Number(stock) || 0;

//     // 7) upload images to Cloudinary
//     const imageCreates: Array<{
//       imageUrl: string;
//       publicId: string;
//       isDefault: boolean;
//     }> = [];

//     for (const file of req.files as Express.Multer.File[]) {
//       const { path: fp } = file;
//       const { secure_url, public_id } = await cloudinaryUploads(fp);
//       imageCreates.push({
//         imageUrl: secure_url,
//         publicId: public_id,
//         isDefault: imageCreates.length === 0,
//       });
//       await fs.unlink(fp);
//     }

//     // 8) create product
//     const product = await prisma.product.create({
//       data: {
//         name,
//         description,
//         price: parseFloat(price),
//         stock: totalStock,
//         categories: {
//           create: (categoryIds as string[]).map((cid) => ({
//             category: { connect: { id: parseInt(cid, 10) } },
//           })),
//         },
//         images: { create: imageCreates },
//         colors: {
//           create: colorsWithIds.map((c) => ({
//             color: { connect: { id: c.colorId } },
//             stock: c.stock,
//           })),
//         },
//       },
//       include: {
//         categories: { include: { category: true } },
//         images: true,
//         colors: { include: { color: true } },
//       },
//     });

//     return res.status(201).json({ success: true, product });
//   } catch (err: any) {
//     // cleanup on error
//     await Promise.all(
//       tempPaths.map(async (p) => fs.existsSync(p) && fs.unlink(p))
//     );

//     if (err instanceof yup.ValidationError) {
//       return res.status(400).json({ errors: err.errors });
//     }
//     return next(err);
//   }
// };



export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // DEBUG: what came in?
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  // Check if req.files exists and is iterable
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ 
      success: false, 
      message: "No files uploaded or files not in expected format" 
    });
  }

  // 1) gather paths for cleanup
  const tempPaths = (req.files as Express.Multer.File[]).map(
    (f) => f.path
  );

  try {
    // 2) parse JSON strings if needed
    let { name, description, price, categoryIds, colors, stock } = req.body;
    
    if (typeof categoryIds === "string") {
      try {
        categoryIds = JSON.parse(categoryIds);
      } catch (e) {
        throw new ApiError(400, "Invalid categoryIds format");
      }
    }
    
    if (typeof colors === "string") {
      try {
        colors = JSON.parse(colors);
      } catch (e) {
        throw new ApiError(400, "Invalid colors format");
      }
    }
    
    // 3) validate
    await addProductSchema.validate(
      { name, description, price, categoryIds, colors, stock },
      { abortEarly: false }
    );
    
    // 4) normalize
    categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    colors = Array.isArray(colors) ? colors : [];
    
    // 5) resolve colors → IDs + stocks
    const colorsWithIds = await Promise.all(
      (colors as ColorInput[]).map(async (c) => {
        const found = await prisma.color.findUnique({
          where: { name: c.name },
        });
        if (!found) throw new ApiError(400, `Color ${c.name} not found`);
        return { colorId: found.id, stock: c.stock };
      })
    );
    
    // 6) compute total stock
    const totalStock =
      colorsWithIds.length > 0
        ? colorsWithIds.reduce((sum, c) => sum + c.stock, 0)
        : Number(stock) || 0;
    
    // 7) upload images to Cloudinary
    const imageCreates: Array<{
      imageUrl: string;
      publicId: string;
      isDefault: boolean;
    }> = [];
    
    for (const file of req.files as Express.Multer.File[]) {
      const { path: fp } = file;
      const { secure_url, public_id } = await cloudinaryUploads(fp);
      imageCreates.push({
        imageUrl: secure_url,
        publicId: public_id,
        isDefault: imageCreates.length === 0,
      });
      await fs.unlink(fp);
    }
    
    // 8) create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: totalStock,
        categories: {
          create: (categoryIds as string[]).map((cid) => ({
            category: { connect: { id: parseInt(cid, 10) } },
          })),
        },
        images: { create: imageCreates },
        colors: {
          create: colorsWithIds.map((c) => ({
            color: { connect: { id: c.colorId } },
            stock: c.stock,
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        images: true,
        colors: { include: { color: true } },
      },
    });
    
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    // cleanup on error
    await Promise.all(
      tempPaths.map(async (p) => fs.existsSync(p) && fs.unlink(p))
    );
    
    if (err instanceof yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    
    return next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // collect temp file paths for cleanup
  const tempPaths = (req.files as Express.Multer.File[] || []).map(f => f.path);

  try {
    const { productId } = req.params;
    if (!productId) throw new ApiError(400, 'Product ID is required');

    // 1. Parse JSON-encoded fields if needed
    let { name, description, price, categoryIds, colors } = req.body;
    if (typeof categoryIds === 'string') {
      try { categoryIds = JSON.parse(categoryIds); }
      catch { throw new ApiError(400, 'Invalid JSON for categoryIds'); }
    }
    if (typeof colors === 'string') {
      try { colors = JSON.parse(colors); }
      catch { throw new ApiError(400, 'Invalid JSON for colors'); }
    }

    // 2. Validate with Yup
    await updateProductSchema.validate(
      { name, description, price, categoryIds, colors },
      { abortEarly: false }
    );

    // 3. Normalize arrays
    categoryIds = Array.isArray(categoryIds)
      ? (categoryIds as any[]).map(id => {
          const n = Number(id);
          if (isNaN(n)) throw new ApiError(400, `Invalid category ID: ${id}`);
          return n;
        })
      : undefined;

    colors = Array.isArray(colors) ? colors : undefined;

    // 4. Ensure product exists
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new ApiError(404, 'Product not found');

    const updateData: any = {};

    // 5. IMAGES: replace if new files
    if ((req.files as Express.Multer.File[]).length > 0) {
      const oldImgs = await prisma.productImage.findMany({ where: { productId } });
      await Promise.all(oldImgs.map(img =>
        img.publicId
          ? cloudinaryDestroy(img.publicId).catch(() => null)
          : Promise.resolve()
      ));
      await prisma.productImage.deleteMany({ where: { productId } });

      await Promise.all(
        (req.files as Express.Multer.File[]).map(async (file, idx) => {
          const { secure_url, public_id } = await cloudinaryUploads(file.path);
          await prisma.productImage.create({
            data: {
              imageUrl: secure_url,
              publicId: public_id,
              isDefault: idx === 0,
              productId,
            }
          });
          await fs.remove(file.path);
        })
      );
    }

    // 6. CATEGORIES: replace all if provided
    if (categoryIds !== undefined) {
      await prisma.productCategory.deleteMany({ where: { productId } });

      if (categoryIds.length > 0) {
        await prisma.productCategory.createMany({
          data: categoryIds.map((catId: number) => ({
            productId,
            categoryId: catId,
          }))
        });
      }
    }

    // 7. COLORS: replace and compute stock
    if (colors !== undefined) {
      await prisma.productColor.deleteMany({ where: { productId } });

      const links = await Promise.all(
        (colors as Array<{ name: string; stock: number }>).map(async c => {
          const found = await prisma.color.findUnique({ where: { name: c.name } });
          if (!found) throw new ApiError(400, `Color "${c.name}" not found`);
          return {
            productId,
            colorId: found.id,
            stock: c.stock,
          };
        })
      );

      if (links.length > 0) {
        await prisma.productColor.createMany({ data: links });
        updateData.stock = links.reduce((sum, l) => sum + l.stock, 0);
      }
    }

    // 8. CORE FIELDS
    if (name        !== undefined) updateData.name        = name;
    if (description !== undefined) updateData.description = description;
    if (price       !== undefined) updateData.price       = parseFloat(price);

    // 9. Final update + return
    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        images:     true,
        categories: { include: { category: true } },
        colors:     { include: { color: true } },
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    // cleanup temp files
    await Promise.all(tempPaths.map(async p => {
      if (await fs.pathExists(p)) await fs.unlink(p);
    }));

    // 1) Yup errors
    if (err instanceof ValidationError || err?.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    // 2) custom ApiError
    if (err instanceof ApiError) {
      return res.status(400).json({ error: err.message });
    }
    // 3) fallback
    console.error('updateProduct error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



export const allProducts = async (req: Request, res: Response) => {
  try {
    const allproducts = await prisma.product.findMany({
      include:{
        images:true,
        categories:true,
        offers:true,
        colors:{
          include:{
            color:true
          }
        },
      }
    });
    if (!allProducts) {
      throw new ApiError(400, "No any post found !");
    }

    // Optionally pull page & limit from req.query
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || allProducts.length;

    res.json({ msg: "Product fetchedv!", data: allproducts, total: allproducts.length, page });

    return;
  } catch (err: any) {
    res.json({ msg: "unsuccessfull", err: err.message });
    throw new ApiError(400, "Error while fetching allpost!");
  }
};

export const getProductsColorById = async (req: Request, res: Response) => {
  try {
    const productid = req.params.id;

    if (!productid) {
      throw new ApiError(400, "Product ID is required");
    }

    const product = await prisma.product.findFirst({
      where: { id: productid },
      select: { colors: true },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.json({
      msg: "Fetched product colors successfully!",
      data: product.colors,
    });
  } catch (err: any) {
    console.error("Error fetching product colors:", err);
    const message = err.message || "Internal Server Error";

    res.status(400).json({ error: message });
  }
};

export const getProductsById=async(req:Request,res:Response)=>{
  
  try{
    const productId= req.params.id;
    if (!productId) {
      throw new ApiError(400, "Product Id required !");
    }
     
    const fetchProduct=await prisma.product.findFirst({
      where:{
        id:productId
      },
      include:{
        images:true,
        categories:true,
        offers:true,
        colors:true
      }
    })

    res.json({msg:"Product fetch Successfully!",data:fetchProduct})
  }catch(err:any){
    throw new ApiError(400,"Failed to fetch a Product !")
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  // console.log(productId);

  if (!productId) {
    throw new ApiError(400, "No ProductId found !");
  }

  const delProductImg = await prisma.productImage.findMany({
    where: {
      productId,
    },
    select: {
      publicId: true,
    },
  });

  const publicIds = delProductImg.map(e => e.publicId);

  await prisma.productCategory.deleteMany({
    where: {
      productId,
    },
  });
  await prisma.productColor.deleteMany({
    where: {
      productId,
    },
  });

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  publicIds.map(e => cloudinaryDestroy(e));

  res.json({ msg: "Successfully Deleted!" });
};

/*
  if want extra features then can add follow routes 


  /products/:productId/colors/:colorId	PATCH	Update stock for a specific color (e.g., increment/decrement stock without full update)
/products/:productId/categories/:categoryId	DELETE	Remove a specific category from a product
/products/:productId/images/:imageId	DELETE	Remove a specific image
/products/:productId/default-image	PATCH	Set a specific image as default

  */

//Offer sections

/**
 * Admin-only: define a new Offer
 * Body JSON:
 * {
 *   code: string,
 *   title: string,
 *   description?: string,
 *   discountType: "FIXED" | "PERCENTAGE",
 *   discountValue: number,
 *   minOrder?: number,
 *   maxDiscount?: number,
 *   startDate: string,   // ISO date
 *   endDate: string,     // ISO date
 *   usageLimit?: number,
 *   visibility?: "PUBLIC" | "PRIVATE" | "ROLE_BASED"
 * }
 */
export const createOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) validate input (optional but highly recommended)
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      visibility,
    } = await createOfferSchema.validate(req.body, { abortEarly: false });

    // 2) ensure code is unique
    const existing = await prisma.offer.findUnique({ where: { code } });
    if (existing) {
      throw new ApiError(409, `Offer code "${code}" already exists`);
    }

    // 3) create the Offer
    const offer = await prisma.offer.create({
      data: {
        code,
        title,
        description,
        discountType,
        discountValue,
        minOrder,
        maxDiscount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
        visibility: visibility ?? "PUBLIC",
        // leave all the M-N relations empty for now
      },
    });

    res.status(201).json({ success: true, offer });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      res.status(400).json({ errors: err.errors });
      return;
    }
    return next(err);
  }
};
 
export const getAllOffer = async (req: Request, res: Response) => {
  const getOffers = await prisma.offer.findMany({
    include:{
      products:true
    }
  });
  
const page=Number(req.query.page) || 1;
const limit =Number(req.query.limit) || getOffers.length;
  if (!getOffers) {
    throw new ApiError(400, "not Found any offers ");
  }

  res.json({msg:"offer fetched !",data:getOffers,total:getOffers.length});
  return;
};

export const getAllLinkedProductByOfferId = async (req: Request, res: Response) => {
  const offerId=req.params.id;
  const getOffers = await prisma.offer.findMany({
    where:{
      id:offerId
    },
    include:{
      products:true
    }
  });
  
const page=Number(req.query.page) || 1;
const limit =Number(req.query.limit) || getOffers.length;
  if (!getOffers) {
    throw new ApiError(400, "not Found any offers ");
  }

  res.json({msg:"offer fetched !",data:getOffers,total:getOffers.length});
  return;
};



export const assignOfferToProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { productId, offerId } = req.body;

  if (!productId || !offerId) {
    throw new ApiError(400, "productId and offerId are required");
  }

  try {
    // Ensure both exist
    const [product, offer] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.offer.findUnique({ where: { id: offerId } }),
    ]);
    if (!product) throw new ApiError(404, "Product not found");
    if (!offer) throw new ApiError(404, "Offer not found");

    // Connect them
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: {
        products: { connect: { id: productId } },
      },
      include: { products: true },
    });

    res.status(200).json({
      success: true,
      message: `Offer ${offer.code} attached to product ${product.name}`,
      offer: updated,
    });
  } catch (err) {
    return next(err);
  }
};


export const deleteOffer = async (req: Request, res: Response) => {
  const id = req.params.id;

  // Step 1: Check if the offer exists
  const toDelete = await prisma.offer.findFirst({
    where: { id },
  });

  if (!toDelete) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  

  // Step 2: Delete the offer
  await prisma.offer.delete({
    where: { id },
  });

  // Step 3: Send response
  res.json({
    msg: "Deleted successfully!",
    data: toDelete,
  });
};

export const updateOffer = async (req: Request, res: Response) => {
  const offerId= req.params.id;
  const {code, title, discountType, discountValue, endDate, status
  } = req.body;

  const Offer = await prisma.offer.findFirst({
    where: { id:offerId },
  });

  if (!Offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  
  const updatedOffer=await prisma.offer.update({
    where: { id:offerId },
    data:{
      code,
      title,
      discountType,
      discountValue,
      endDate,
      status
    },
  });

  res.json({
    msg: "Updated successfully!",
    data: updatedOffer,
  });
};





// export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
//   const { productId } = req.params;
//   const tempPaths = ((req.files as Express.Multer.File[]) || []).map(f => f.path);

//   try {
//     if (!productId) throw new ApiError(400, "Product ID is required");

//     let { name, description, price, categoryIds, colors, stocks } = req.body;

//     // Parse JSON strings for form-data
//     if (typeof categoryIds === "string") {
//       try {
//         categoryIds = JSON.parse(categoryIds);
//       } catch {
//         throw new ApiError(400, "Invalid JSON format for categoryIds");
//       }
//     }
//     if (typeof colors === "string") {
//       try {
//         colors = JSON.parse(colors);
//       } catch {
//         throw new ApiError(400, "Invalid JSON format for colors");
//       }
//     }

//     // Validate fields
//     await updateProductSchema.validate(
//       { name, description, price, categoryIds, colors },
//       { abortEarly: false }
//     );

//     categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
//     colors = Array.isArray(colors) ? colors : [];

//     const colorsWithIds: ColorStockUpdate[] = await Promise.all(
//       (colors as ColorInput[]).map(async color => {
//         const existing = await prisma.color.findUnique({ where: { name: color.name } });
//         if (!existing) throw new ApiError(400, `Color ${color.name} not found`);
//         return { colorId: existing.id, stock: color.stock };
//       })
//     );

//     const totalStock = colorsWithIds.length
//       ? colorsWithIds.reduce((sum, c) => sum + c.stock, 0)
//       : parseInt(req.body.stock, 10) || 0;

//     const imageUploads: Array<{ imageUrl: string; publicId: string; isDefault: boolean }> = [];
//     if (req.files && Array.isArray(req.files)) {
//       for (const [i, file] of (req.files as Express.Multer.File[]).entries()) {
//         const { secure_url, public_id } = await cloudinaryUploads(file.path);
//         imageUploads.push({ imageUrl: secure_url, publicId: public_id, isDefault: i === 0 });
//         await fs.remove(file.path);
//       }
//     }

//     const existingColors = await prisma.productColor.findMany({
//       where: { productId },
//       select: { colorId: true },
//     });
//     const existingColorIds = new Set(existingColors.map(c => c.colorId));

//     const toCreate: ColorStockCreate[] = [];
//     const toUpdate: ReturnType<typeof prisma.productColor.update>[] = [];

//     colorsWithIds.forEach(c => {
//       if (existingColorIds.has(c.colorId)) {
//         toUpdate.push(
//           prisma.productColor.update({
//             where: {
//               productId_colorId: {
//                 productId,
//                 colorId: c.colorId,
//               },
//             },
//             data: { stock: c.stock },
//           })
//         );
//       } else {
//         toCreate.push({
//           color: { connect: { id: c.colorId } },
//           stock: c.stock,
//         });
//       }
//     });

//     await Promise.all(toUpdate);

//     const updated = await prisma.product.update({
//       where: { id: productId },
//       data: {
//         name,
//         description,
//         price: price ? parseFloat(price) : undefined,
//         stock: totalStock || stocks,
//         categories: {
//           create: (categoryIds as string[]).map(id => ({
//             category: { connect: { id: parseInt(id, 10) } },
//           })),
//         },
//         colors: {
//           create: toCreate,
//         },
//         images: {
//           create: imageUploads,
//         },
//       },
//       include: {
//         categories: { include: { category: true } },
//         colors: { include: { color: true } },
//         images: true,
//       },
//     });

//     res
//       .status(200)
//       .json({
//         success: true,
//         data: updated,
//         message: "Updated successfully! Appended new data or updated existing stocks.",
//       });
//   } catch (err: any) {
//     await Promise.all(tempPaths.map(async p => fs.existsSync(p) && fs.unlink(p)));
//     if (err instanceof yup.ValidationError) {
//       res.status(400).json({ errors: err.errors });
//       return;
//     }
//     return next(err);
//   }
// };
