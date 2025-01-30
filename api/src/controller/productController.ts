import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import Product from "../model/productModel";
import Category from "../model/categoryModel";
import { config } from "../config/config";
import Logging from "../library/logging";
import { handleError } from "../utils/errorHandler";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().populate("category");
    return res.status(StatusCodes.OK).json({ products });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Product with ID: ${req.params.id} not found in database.`,
      });
    }
    return res.status(StatusCodes.OK).json(product);
  } catch (error: any) {
    return handleError(error, res);
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, weight, category } = req.body;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid category ID" });
      return;
    }

    const product = new Product({
      name,
      description,
      price,
      weight,
      category: categoryExists,
    });

    const newProduct = await product.save();

    res.status(StatusCodes.CREATED).json(newProduct);
  } catch (error: any) {
    return handleError(error, res);
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid product ID" });
    }
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(StatusCodes.ACCEPTED).json(updatedProduct);
  } catch (error: any) {
    return handleError(error, res);
  }
};

//** AI GENERATED DESCRIPTION PART */

// watch out for updates of models on https://console.groq.com/docs/models
const GROQ_MODEL_NAME = "llama-3.3-70b-versatile";

const generateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      Logging.warn("Product not found for generating description.");
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product not found." });
    }

    const prompt = `Create an SEO-friendly description for the following product: Put only the description, nothing else. Product details: ${JSON.stringify(product)}`;

    const response = await axios({
      method: "POST",
      url: config.groq.groq_url as string,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.groq.groq_api_key}`,
      },
      data: {
        model: GROQ_MODEL_NAME,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
    });

    const descHtml = response.data.choices[0]?.message?.content;
    if (!descHtml) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to generate AI description." });
    }

    res.setHeader("Content-Type", "text/html");
    return res.status(StatusCodes.OK).send(descHtml);
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  generateDescription,
};
