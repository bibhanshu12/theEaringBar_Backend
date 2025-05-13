import { Response, Request,NextFunction } from "express";
import { ApiError } from "../utils/apiErrorUtils";
import { PrismaClient, Prisma } from "@prisma/client";
// import { PrismaClient, Prisma } from "../generated/prisma";


const prisma = new PrismaClient();

export const addCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "unable to find ids");
      }
    const { productId, colorId, quantity } = req.body as {
      productId: string;
      colorId: string;
      quantity: number;
    };
  
    const stockData = await prisma.productColor.findFirst({
        where: { colorId ,productId},
        select: {
            stock:true
        },
      });
    

      if (!stockData) {
        throw new ApiError(404, "Color not found for this product");
      }

      if(stockData){

        if(quantity>stockData?.stock){
            res.status(400).json({msg:`Only ${stockData?.stock} left for this color. Can't order above stock`,stock:stockData.stock})
            return;
        }

      }
      
    
    
    let cartCheck = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isOrdered:false
      },
    });

    // console.log(cartCheck)

    if (!cartCheck) {
      cartCheck = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    console.log(cartCheck);

    let whereUnique: Prisma.CartItemWhereUniqueInput;

    if (colorId) {
      whereUnique = {
        cartId_productId_colorId: {
          cartId: cartCheck.id,
          productId,
          colorId,
        },
      };
    } else {
      whereUnique = {
        cartId_productId: {
          cartId: cartCheck.id,
          productId,
        },
      };
    }

    const cartItem = await prisma.cartItem.upsert({
      where: whereUnique,
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cartCheck.id,
        productId,
        colorId, //will be not in use if undefined
        quantity,
      },
    });

    res.status(200).json({ msg: "Item added to Cart !", cartItem });
  return;
  } catch (err: any) {
    res.status(400).json({ msg: "Failed to Add to cart!" });
    return;
  }
};

export const showCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const getcart = await prisma.cart.findFirst({
      where: { userId ,isOrdered:false },
    });
    if (!getcart) {
      throw new ApiError(400, "Cannot fetch cartId");
    }
    const getCartItems = await prisma.cartItem.findMany({
      where: {
        cartId: getcart.id,
      },
    });

    res.status(200).json({ status: "success", getCartItems });
  } catch (err: any) {
    res.status(400).json({ msg: "failed to show cart", err: err.message });
  }
};



//call this to remove cartItem
export const deletecartItem = async (req: Request, res: Response) => {
  try {
    const { productId, colorId, cartItemId, cartId } = req.body;

    if (cartItemId) {
      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });
    } else if (cartId && productId) {
      // Delete using composite key
      if (colorId) {
        await prisma.cartItem.delete({
          where: {
            cartId_productId_colorId: {
              cartId,
              productId,
              colorId,
            },
          },
        });
      } else {
        await prisma.cartItem.delete({
          where: {
            cartId_productId: {
              cartId,
              productId,
            },
          },
        });
      }
    }
    res.json({ msg: "Successfully Deleted Cart Item" });
  } catch (err: any) {
    res.status(400).json({ msg: "Failed to deleteCart Item !", err: err.message });
  }
};



export const applyCartOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user.id;

  try {
    // 1) fetch the open cart with items & product-offers
    const cart = await prisma.cart.findFirst({
      where: { userId, isOrdered: false },
      include: {
        cartItems: {
          include: { product: { include: { offers: true } } },
        },
      },
    });
    if (!cart) throw new ApiError(404, "No active cart");

    let bestOfferId: string | null = null;
    let totalDiscount = 0;

    // 2) scan items
    for (const item of cart.cartItems) {
      if (item.quantity >= 2) {
        // find first ACTIVE offer on this product
        const offer = item.product.offers.find(o =>
          o.status === "ACTIVE" &&
          o.startDate <= new Date() &&
          o.endDate >= new Date() &&
          (o.usageLimit === null || o.useCount < o.usageLimit)
        );
        if (offer) {
          // compute discount
          let discount = 0;
          const lineTotal = item.product.price * item.quantity;

          if (offer.discountType === "FIXED") {
            discount = offer.discountValue;
          } else {
            // PERCENTAGE
            discount = (lineTotal * offer.discountValue) / 100;
            if (offer.maxDiscount) {
              discount = Math.min(discount, offer.maxDiscount);
            }
          }

          totalDiscount += discount;
          bestOfferId = offer.id;
          break; // remove if you want to apply multiple offers
        }
      }
    }

    // 3) update cart
    const updated = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        appliedOffer: bestOfferId ? { connect: { id: bestOfferId } } : undefined,
        discountAmount: totalDiscount,
      },
    });

    res.status(200).json({ success: true, cart: updated });
  } catch (err) {
    return next(err);
  }
};
