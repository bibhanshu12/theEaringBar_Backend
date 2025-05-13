import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import type { Asserts } from "yup";
import { addAddressValidate, updateAddressValidate } from "../validation/index";
import { ApiError } from "../utils/apiErrorUtils";

const prisma = new PrismaClient();

type AddAddressValidate = Asserts<typeof addAddressValidate>;
// type UpdateAddressValidate = Asserts<typeof updateAddressValidate>;

export const addAddress = async (
  req: Request<{}, any, AddAddressValidate>,
  res: Response
) => {
  try {
    const { street, zipCode, city, country, label, state } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.user;

    const addNewAddress = await prisma.address.create({
      data: {
        userId: id,
        street,
        zipCode,
        city,
        country,
        label,
        state,
      },
    });

    if (!addNewAddress) {
      throw new ApiError(401, "Failed to add Address");
      // return res.status(401).json({ message: "Failed to add Address" });
    }

    return res.status(200).json({ message: "Address added!", addNewAddress });
  } catch (err: any) {
    return res.status(400).json({
      msg: "Failed to initiate address adding process !",
      err: err.message,
    });
  }
};

export const updateAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  //promise<Response> is same with async both handle the same asynchronous work!
  try {
    const addressId = req.params.addressId;
    const { street, zipCode, city, country, label, state } = req.body;

    if (!addressId) {
      throw new ApiError(400, "addressId not found!");
    }

    const updateAddress = await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        street,
        zipCode,
        city,
        country,
        label,
        state,
      },
    });
    if (!updateAddress) {
      throw new ApiError(400, " failed to updateAddress !");
    }

    return res
      .status(200)
      .json({ msg: "updated successfully! ", updateAddress });
  } catch (err: any) {
    return res.status(400).json({
      msg: "Failed to initiate update to address  !",
      err: err.message,
    });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(400, "authentication error:  get address");
    }

    const allAddress = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!allAddress) {
      throw new ApiError(400, "Error while fetching addresses !");
    }

    return res.status(200).json({ msg: "address fetched!", allAddress });
  } catch (err: any) {
    return res.status(400).json({
      msg: "Failed to initiate update to address  !",
      err: err.message,
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id;

    if (!addressId) {
      throw new ApiError(400, "Failed to fetch addressId ");
    }

    const deletedAddress = await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return res.status(200).json({
      message: "Address deleted successfully",
      deletedAddress,
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ msg: "Failed at delete address", err: err.message });
  }
};
