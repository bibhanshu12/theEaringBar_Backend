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


export const addProductValidate=yup.object({

  name:yup.string().required(),
  description:yup.string().max(30,"should be less then 30 letters ").required(),
  price:yup.number().max(10,"limit is 10!").required(),
  stock:yup.number().required(),
  // image:,
})