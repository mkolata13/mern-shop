import express, { Router } from "express";
import controller from "../controller/orderStatusController";

const router = Router();

router.get("/", controller.getStatuses);

export default router;
