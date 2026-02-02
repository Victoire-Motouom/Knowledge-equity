import "express";
import type { AuthContext } from "../lib/authMiddleware";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthContext;
  }
}
