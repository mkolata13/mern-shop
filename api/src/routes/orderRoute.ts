import express, { Router } from "express";
import controller from "../controller/orderController";
import auth from "../middleware/verifyJWT";

const router = Router();

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);

router.patch("/:id", auth.verifyJwt(["EMPLOYEE"]), controller.updateOrder);
router.get("/status/:id", controller.getOrdersWithStatus);

router.post("/:id/opinions", auth.verifyJwt(["CLIENT"]), controller.addOpinion);

export default router;
