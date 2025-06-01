import { Response, Request,NextFunction } from "express";
import { ApiError } from "../utils/apiErrorUtils";
import { PrismaClient, Prisma } from "@prisma/client";
// import { PrismaClient, Prisma } from "../generated/prisma";


const prisma = new PrismaClient();

export const addCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(400, "Unable to find user");
    }

    const { productId, colorId, quantity } = req.body as {
      productId: string;
      colorId?: string;
      quantity: number;
    };

    // First get or create cart
    let cartCheck = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isOrdered: false
      },
    });

    if (!cartCheck) {
      cartCheck = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Check if item exists - handle both with and without color cases
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        AND: [
          { cartId: cartCheck.id },
          { productId: productId },
          colorId 
            ? { colorId: colorId }
            : { colorId: null }
        ]
      }
    });

    let cartItem;

    if (existingItem) {
      // Update quantity of existing item
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: true,
          color: true
        }
      });
    } else {
      // Validate stock before creating
      if (colorId) {
        const stockData = await prisma.productColor.findFirst({
          where: { colorId, productId },
          select: { stock: true },
        });

        if (!stockData) {
          throw new ApiError(404, "Color not found for this product");
        }

        if (quantity > stockData.stock) {
          return res.status(400).json({
            success: false,
            msg: `Only ${stockData.stock} items left for this color`,
            stock: stockData.stock
          });
        }
      }

      // Create new item
      try {
        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cartCheck.id,
            productId,
            colorId: colorId || null,
            quantity
          },
          include: {
            product: true,
            color: true
          }
        });
      } catch (createError: any) {
        if (createError.code === 'P2002') {
          // Handle unique constraint violation
          return res.status(400).json({
            success: false,
            msg: "This item already exists in your cart"
          });
        }
        throw createError;
      }
    }

    return res.status(200).json({
      success: true,
      msg: "Item added to cart",
      cartItem
    });

  } catch (err: any) {
    // console.error('Cart Error:', err);
    return res.status(400).json({
      success: false,
      msg: "Failed to add to cart",
      err: err.message
    });
  }
};

export const showCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const getcart = await prisma.cart.findFirst({
      where: { userId ,isOrdered:false },
    });
    if (!getcart) {
      throw new ApiError(400, "No Cart found, Cart is Empty");
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
