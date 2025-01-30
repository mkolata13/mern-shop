import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import OrderStatu, { OrderStatus } from "../model/orderStatusModel";
import Order from "../model/orderModel";
import Product from "../model/productModel";
import { StatusCodes } from "http-status-codes";
import Logging from "../library/logging";
import { handleError } from "../utils/errorHandler";
import { logger } from "@typegoose/typegoose/lib/logSettings";

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate("status items.product");
    return res.status(StatusCodes.OK).json({ orders });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getOrdersWithStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ OrderStatus: req.params.statusId }).populate(
      "status items.product"
    );
    if (!orders) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No orders found for submitted category." });
    }
    return res.status(StatusCodes.OK).json({ orders });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, phoneNumber, items, status } = req.body;

    const productIds = items.map((item: { product: string }) => item.product);
    const foundProducts = await Product.find({ _id: { $in: productIds } });

    if (foundProducts.length !== productIds.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "One or more products do not exist in the database.",
      });
    }

    const orderItems = items.map(
      (item: { product: string; amount: number }) => {
        const product = foundProducts.find(
          (p) => p._id.toString() === item.product
        );
        if (!product) throw new Error("Product not found in database");

        return {
          product: product._id,
          amount: item.amount,
          price: product.price,
        };
      }
    );

    const newOrder = new Order({
      username,
      email,
      phoneNumber,
      items: orderItems,
      status,
      confirmationDate: null,
    });

    const savedOrder = await newOrder.save();

    return res.status(StatusCodes.CREATED).json({ savedOrder });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const statusTransitions: {
  [key in "UNAPPROVED" | "APPROVED" | "COMPLETED" | "CANCELLED"]: string[];
} = {
  UNAPPROVED: ["APPROVED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;

    // Sprawdzenie, czy zamówienie istnieje
    const order = await Order.findById(orderId).populate("status").exec();
    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Order not found." });
    }

    // Sprawdzanie, czy status jest dozwolony
    const currentStatus = order.status as OrderStatus;
    if (!statusTransitions[currentStatus.name]?.includes(updateData.status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Cannot change order status back or to an invalid state. ${updateData.status}`,
      });
    }

    // Jeśli status to "COMPLETED", ustawiamy date
    if (updateData.status === "COMPLETED") {
      updateData.confirmationDate = new Date();
    }

    // Zmiana statusu na ObjectId odpowiedniego statusu
    const newStatus = await OrderStatu.findOne({
      name: updateData.status,
    }).exec();
    if (newStatus) {
      updateData.status = newStatus._id; // Przypisanie ObjectId
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid status name provided.",
      });
    }

    // Zaktualizowanie zamówienia
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
    if (!updatedOrder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Order update failed." });
    }

    return res.status(StatusCodes.OK).json({ updatedOrder });
  } catch (error: any) {
    return handleError(error, res);
  }
};

//** Adding opinion */

const addOpinion = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params; // ID zamówienia
  const { rating, content } = req.body; // Dane opinii

  try {
    // Walidacja użytkownika (czy jest zalogowany)
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not authenticated.",
      });
    }

    // Znalezienie zamówienia
    const order = await Order.findById(id).populate("status").exec();

    if (!order) {
      Logging.warn(`Order with ID ${id} not found.`);
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found.",
      });
    }

    // Sprawdzenie, czy użytkownik może dodać opinię do tego zamówienia
    if (order.username !== req.user.username) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not authorized to add an opinion to this order.",
      });
    }

    // Sprawdzenie statusu zamówienia
    const validStatuses = ["COMPLETED", "CANCELLED"];
    const statusName = (order.status as any)?.name;

    if (!validStatuses.includes(statusName)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Opinion can only be added to completed or cancelled orders.",
      });
    }

    // Walidacja danych opinii
    if (!rating || rating < 1 || rating > 5) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Dodanie opinii do zamówienia
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { opinion: { rating, content } },
      { new: true }
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Opinion added successfully.",
      opinion: updatedOrder?.opinion,
    });
  } catch (error: any) {
    Logging.error(`Error while adding opionion message: ${error.message}`);
    return handleError(error, res);
  }
};

export default {
  getOrders,
  getOrdersWithStatus,
  createOrder,
  updateOrder,
  addOpinion,
};
