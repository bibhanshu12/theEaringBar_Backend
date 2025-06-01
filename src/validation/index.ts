import * as yup from "yup";

export const signUpInput = yup.object({
  firstName: yup
    .string()
    .required("First name is required.")
    .max(50, "First name should be less than 50 characters."),
  lastName: yup.string().required("Last name is required."),
  email: yup.string().email("Email must be a valid email.").required("Email is required."),
  password: yup.string().min(6, "Password must be atleast 6 characters long."),
  role: yup
    .string()
    .oneOf(["ADMIN", "CUSTOMER"], "Role must be either ADMIN or USER.")
    .optional(),
});

export const signInInput = yup.object({
  email: yup.string().required(),
  password: yup.string().required(),
});


export const addAddressValidate = yup.object({
  street: yup.string().required(),
  zipCode: yup.string().max(10, "can have only upto 10 digits").required(),
  city: yup.string().required(),
  country: yup
    .string()
    .max(15)
    .matches(/^[A-Za-z\s]+$/, "Country must contain only letters")
    .required(),

  label: yup.string().optional(),
  state: yup.string().required(),
});


export const updateAddressValidate = yup.object({
  street: yup.string().optional(),
  zipCode: yup.string().max(10, "can have only upto 10 digits").required(),
  city: yup.string().optional(),
  country: yup
    .string()
    .max(15)
    .matches(/^[A-Za-z\s]+$/, "Country must contain only letters")
    .optional(),

  label: yup.string().optional(),
  state: yup.string().optional(),
});


export const addProductSchema = yup.object({
  name: yup.string().required("Product name is required"),
  description: yup.string().optional(),
  price: yup.string()
    .required("Price is required")
    .test("is-decimal", "Price must be a number", val => !isNaN(Number(val))),
  categoryIds: yup.mixed()
    .transform(value => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    })
    .test("is-array", "Categories must be an array", value => Array.isArray(value))
    .required("At least one category is required"),
  colors: yup.mixed()
    .transform(value => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return value;
    })
    .test("is-array", "Colors must be an array", value => Array.isArray(value))
    .optional()
});

export const updateProductSchema = yup.object({
  name: yup.string().optional(),
  description: yup.string().optional(),
  price: yup
    .string()
    .optional()
    .test("is-decimal", "Price must be a number", (val) => val === undefined || !isNaN(Number(val))),
  categoryIds: yup
    .array()
    .transform((value, original) => {
      if (typeof original === 'string') {
        try {
          return JSON.parse(original);
        } catch {
          return [];
        }
      }
      return value;
    })
    .of(yup.string())
    .optional(),
  colors: yup
    .array()
    .transform((value, original) => {
      if (typeof original === 'string') {
        try {
          return JSON.parse(original);
        } catch {
          return [];
        }
      }
      return value;
    })
    .of(
      yup.object({
        name: yup.string().required("Color name is required"),
        stock: yup.number().integer().min(0).required("Stock per color is required"),
      })
    )
    .optional(),
});

export const createOfferSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(/^[A-Z0-9_-]+$/, "Code may only contain uppercase letters, numbers, hyphens or underscores")
    .required("Offer code is required"),

  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .required("Title is required"),

  description: yup
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .notRequired(),

  discountType: yup
    .mixed<"FIXED" | "PERCENTAGE">()
    .oneOf(["FIXED", "PERCENTAGE"], "Invalid discount type")
    .required("Discount type is required"),

  discountValue: yup
    .number()
    .positive("Discount value must be positive")
    .required("Discount value is required"),

  minOrder: yup
    .number()
    .min(0, "minOrder must be at least 0")
    .notRequired(),

  maxDiscount: yup
    .number()
    .min(0, "maxDiscount must be at least 0")
    .notRequired(),

  startDate: yup
    .date()
    .min(new Date(), "startDate cannot be in the past")
    .required("Start date is required"),

  endDate: yup
    .date()
    .min(
      yup.ref("startDate"),
      "End date must be the same or after the start date"
    )
    .required("End date is required"),

  usageLimit: yup
    .number()
    .integer("usageLimit must be an integer")
    .min(1, "usageLimit must be at least 1")
    .notRequired(),

  visibility: yup
    .mixed<"PUBLIC" | "PRIVATE" | "ROLE_BASED">()
    .oneOf(["PUBLIC", "PRIVATE", "ROLE_BASED"], "Invalid visibility option")
    .default("PUBLIC"),

  // if you want to bulk-connect products at creation time:
  productIds: yup
    .array()
    .of(yup.string().uuid("Each productId must be a valid UUID"))
    .notRequired(),
});