import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../model/categoryModel";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/errorHandler";

const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find();
    return res.status(StatusCodes.OK).json({ categories });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getCategories };
