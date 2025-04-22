  import type { User } from "../generated/prisma/client"; // adjust the path if needed


  declare global {
    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }
