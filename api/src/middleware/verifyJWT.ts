import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { config } from "../config/config";
import { handleError } from "../utils/errorHandler";

declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        role: string;
      };
    }
  }
}

const verifyJwt =
  (roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Authorization header is missing" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Bearer token is missing" });
      }

      jwt.verify(
        token,
        config.jwt.access_token_key as string,
        (error, decoded) => {
          if (error) {
            if (error.name === "TokenExpiredError") {
              return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "Token has expired" });
            }
            return res
              .status(StatusCodes.FORBIDDEN)
              .json({ message: "Invalid token" });
          }

          if (typeof decoded === "object" && decoded.username) {
            req.user = { username: decoded.username, role: decoded.role };

            // check roles
            if (roles.length && !roles.includes(decoded.role)) {
              return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "Insufficient permissions" });
            }

            next();
          } else {
            return res
              .status(StatusCodes.UNAUTHORIZED)
              .json({ message: "Token payload is invalid" });
          }
        }
      );
    } catch (error) {
      return handleError(error, res);
    }
  };

export default { verifyJwt };
