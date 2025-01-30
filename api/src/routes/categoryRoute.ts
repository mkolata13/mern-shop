import express, { Router } from "express";
import controller from "../controller/categoryController";

const router = Router();

router.get("/", controller.getCategories);

export default router;
