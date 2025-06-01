import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
    service: "Gmail",
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
