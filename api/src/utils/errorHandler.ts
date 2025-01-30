import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const handleError = (error: any, res: Response): Response => {
  if (error.name === "ValidationError") {
    // Obsługa błędów walidacji Mongoose
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errors.join(", ") });
  }

  if (error.name === "CastError" && error.kind === "ObjectId") {
    // Obsługa błędów związanych z ObjectId
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid ID format" });
  }

  // Domyślna obsługa błędów
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ name: error.name,
            message: error.message });
};
