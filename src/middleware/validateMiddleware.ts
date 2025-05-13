import express from "express";
import * as yup from "yup";

export const validate = (schema: yup.AnySchema) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    try {
      // Parse JSON strings from form-data
      const data = { ...req.body };
      
      // Try to parse known JSON fields
      ['categoryIds', 'colors'].forEach(field => {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (e) {
            console.warn(`Failed to parse ${field}`);
          }
        }
      });

      await schema.validate(data, {
        abortEarly: false,
      });
      
      // Update req.body with parsed data
      req.body = data;
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
