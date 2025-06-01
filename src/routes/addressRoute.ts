import { Router } from "express";
import { isauthenticated } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/catchAsync";
import {
    addAddress,
    deleteAddress,
    getAddresses,
    updateAddress,
} from "../controllers/Address_Controller";
import { addAddressValidate, updateAddressValidate } from "../validation/index";
import { validate } from "../middleware/validateMiddleware";

export const router = Router();

router.post(
    "/address/add",
    isauthenticated,
    validate(addAddressValidate),
    catchAsync(addAddress)
);
router.put(
    "/address/update/:addressId",
    isauthenticated,
    validate(updateAddressValidate),
    catchAsync(updateAddress)
);

router.get(
    "/address/getUseraddress",
    isauthenticated,
    catchAsync(getAddresses)
);
router.delete(
    "/address/delete/:id",
    isauthenticated,
    catchAsync(deleteAddress)
);
