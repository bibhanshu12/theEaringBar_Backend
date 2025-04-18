import express from "express";
import * as yup from "yup";

export const validate =
  (schema: yup.AnySchema) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      await schema.validate(req.body, {
        abortEarly: false,
      });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({
          errors: error.errors,
        });
      } else {
        res.status(400).json({
          message: "Invalid input data",
        });
      }
    }
  };
