import type { User } from "../generated/prisma/client.js"; // adjust the path if needed


declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
