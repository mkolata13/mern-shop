import { Request, Response } from "express";
import Product from "../model/productModel";
import Category from "../model/categoryModel";
import csvParser from "csv-parser";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Logging from "../library/logging";

// Define the ProductData type
interface ProductData {
  name: string;
  description: string;
  price: number;
  weight: number;
  category: string;
}

const initProductDb = async (req: Request, res: Response) => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Database already initialized." });
    }

    const contentType = req.headers["content-type"];
    if (!contentType) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Content-Type header is required." });
    }

    let productsData: ProductData[] = [];

    if (contentType.includes("application/json")) {
      if (!Array.isArray(req.body)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "JSON data must be an array of products." });
      }
      productsData = req.body;
    } else if (contentType.includes("multipart/form-data")) {
      if (!req.file) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "CSV file is required." });
      }
      productsData = await parseCsvFile(req.file.path);
      fs.unlinkSync(req.file.path);
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Unsupported Content-Type. Use JSON or CSV." });
    }

    await addProductsToDatabase(productsData, res);
  } catch (error) {
    Logging.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error initializing database." });
  }
};

function parseCsvFile(filePath: string): Promise<ProductData[]> {
  return new Promise((resolve, reject) => {
    const products: ProductData[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        try {
          products.push({
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            weight: parseFloat(row.weight),
            category: row.category,
          });
        } catch (error) {
          Logging.error(`Error parsing row: ${JSON.stringify(row)}`);
        }
      })
      .on("end", () => resolve(products))
      .on("error", (error) => reject(error));
  });
}

const addProductsToDatabase = async (
  productsData: ProductData[],
  res: Response
) => {
  try {
    const products: any[] = [];
    for (const product of productsData) {
      const category = await Category.findOne({ name: product.category });
      if (!category) {
        Logging.warn(`Category not found: ${product.category}`);
        continue;
      }

      products.push({
        name: product.name,
        description: product.description,
        price: product.price,
        weight: product.weight,
        category: category,
      });
    }

    if (products.length > 0) {
      await Product.insertMany(products);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Database initialized successfully." });
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No valid products to add." });
    }
  } catch (error) {
    Logging.error("Error while adding products:");
    Logging.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error initializing database." });
  }
};

export default { initProductDb };
