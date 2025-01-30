import express, { Router } from "express";
import controller from "../controller/productController";

const router = Router();

router.get("/", controller.getProducts);
router.post("/", controller.createProduct);

router.get("/:id", controller.getProductById);
router.put("/:id", controller.updateProduct);
router.get("/:id/ai-description", controller.generateDescription);

export default router;
