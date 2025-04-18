import type { User } from "../../generated/prisma"; // adjust the path if needed

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
