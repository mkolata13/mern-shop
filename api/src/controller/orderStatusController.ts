import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import OrderStatus from "../model/orderStatusModel";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/errorHandler";

const getStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = await OrderStatus.find();
    return res.status(StatusCodes.OK).json({ statuses });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getStatuses };
